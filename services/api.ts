import {
  Room,
  Booking,
  ApplicationUser,
  PaymentMethod,
  RoomCategory,
  BookingStatus,
  PaymentStatus,
  ProfileStatus,
  UserRole,
} from "../types";
import { appConfig } from "../config/environment";

const STORAGE_KEYS = {
  TOKEN: "mhs_auth_token",
  BOOKING_LOOKUP_PREFIX: "mhs_booking_lookup_",
} as const;

function normalizeEnum<T extends string>(
  value: unknown,
  values: readonly T[],
  fallback: T = values[0],
): T {
  const match = values.find(
    (candidate) => candidate.toLowerCase() === String(value ?? "").toLowerCase(),
  );
  return match ?? fallback;
}

function normalizeOptionalEnum<T extends string>(
  value: unknown,
  values: readonly T[],
): T | null {
  if (value === null || value === undefined || value === "") return null;
  return (
    values.find(
      (candidate) => candidate.toLowerCase() === String(value).toLowerCase(),
    ) ?? null
  );
}

function normalizeRoom(room: Room): Room {
  return {
    ...room,
    category: normalizeEnum(room.category, Object.values(RoomCategory)),
  };
}

function normalizeBooking(booking: Booking): Booking {
  return {
    ...booking,
    status: normalizeEnum(
      booking.status,
      Object.values(BookingStatus),
      BookingStatus.Pending,
    ),
    paymentStatus: normalizeEnum(
      booking.paymentStatus,
      Object.values(PaymentStatus),
      PaymentStatus.Unpaid,
    ),
    paymentMethod: normalizeOptionalEnum(
      booking.paymentMethod,
      Object.values(PaymentMethod),
    ),
  };
}

function normalizeUser(user: ApplicationUser): ApplicationUser {
  const name = user.name?.trim() || "";
  const [derivedFirstName = "", ...remainingNames] = name.split(/\s+/).filter(Boolean);

  return {
    ...user,
    name,
    firstName: user.firstName?.trim() || derivedFirstName,
    lastName: user.lastName?.trim() || remainingNames.join(" "),
    role: normalizeEnum(user.role, Object.values(UserRole), UserRole.Client),
    status: normalizeEnum(
      user.status,
      Object.values(ProfileStatus),
      ProfileStatus.Suspended,
    ),
    emailVerified: user.emailVerified ?? user.emailConfirmed ?? false,
  };
}

function toApiDate(value: string, fieldName: string): string {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} is invalid.`);
  }
  return date.toISOString();
}

function extractErrorMessage(error: unknown, status: number): string {
  if (status >= 500) {
    return "The hotel service is temporarily unavailable. Please try again shortly.";
  }
  if (status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }

  if (typeof error === "string" && error.trim()) return error.trim();
  if (!error || typeof error !== "object") return `Request failed (${status}).`;

  const payload = error as {
    message?: unknown;
    detail?: unknown;
    title?: unknown;
    errors?: unknown;
  };

  if (payload.errors && typeof payload.errors === "object") {
    const messages = Object.values(payload.errors)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter((value): value is string => typeof value === "string");
    if (messages.length > 0) return messages.join(" | ");
  }

  for (const candidate of [payload.message, payload.detail, payload.title]) {
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }

  return `Request failed (${status}).`;
}

export function getTrustedPaymentUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    const isMonnifyHost =
      url.hostname === "monnify.com" || url.hostname.endsWith(".monnify.com");
    const isLocalDevelopment =
      appConfig.isLocal &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1");

    if (url.protocol !== "https:" && !isLocalDevelopment) return null;
    if (!isMonnifyHost && !isLocalDevelopment) return null;

    return url.toString();
  } catch {
    return null;
  }
}

class ApiService {
  private token: string | null = this.loadToken();

  private loadToken(): string | null {
    try {
      const sessionToken = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
      if (sessionToken) return sessionToken;

      // Migrate older persistent sessions into tab-scoped storage, then remove
      // the browser-persistent copy to reduce the exposure window.
      const legacyToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (legacyToken) {
        sessionStorage.setItem(STORAGE_KEYS.TOKEN, legacyToken);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
      }
      return legacyToken;
    } catch {
      return null;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      if (token) sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
      else {
        sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
        Object.keys(sessionStorage)
          .filter((key) => key.startsWith(STORAGE_KEYS.BOOKING_LOOKUP_PREFIX))
          .forEach((key) => sessionStorage.removeItem(key));
      }
    } catch {
      // The in-memory session still works when browser storage is unavailable.
    }
  }

  hasToken() {
    return Boolean(this.token);
  }

  rememberBookingLookup(bookingCode: string, email: string) {
    try {
      const key = `${STORAGE_KEYS.BOOKING_LOOKUP_PREFIX}${bookingCode.trim().toUpperCase()}`;
      sessionStorage.setItem(key, email.trim().toLowerCase());
    } catch {
      // Lookup can still be completed manually if storage is unavailable.
    }
  }

  getRememberedBookingEmail(bookingCode: string): string {
    try {
      const key = `${STORAGE_KEYS.BOOKING_LOOKUP_PREFIX}${bookingCode.trim().toUpperCase()}`;
      return sessionStorage.getItem(key) || "";
    } catch {
      return "";
    }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      appConfig.requestTimeoutMs,
    );

    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");
    headers.set("X-Moore-App-Environment", appConfig.environment);
    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;
    if (options.body && !isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (this.token) headers.set("Authorization", `Bearer ${this.token}`);

    try {
      const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
        cache: this.token ? "no-store" : options.cache,
        credentials: "omit",
        redirect: "error",
        referrerPolicy: "no-referrer",
      });

      const apiEnvironment = response.headers
        .get("X-Moore-API-Environment")
        ?.trim()
        .toLowerCase();
      if (apiEnvironment && apiEnvironment !== appConfig.environment) {
        throw new Error(
          `Environment mismatch: this ${appConfig.environment} app reached the ${apiEnvironment} API.`,
        );
      }

      if (response.status === 401) {
        const hadSession = Boolean(this.token);
        const error = await response.json().catch(() => null);
        this.setToken(null);
        throw new Error(
          hadSession
            ? "Your session has expired. Please sign in again."
            : extractErrorMessage(error, response.status),
        );
      }

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        const errorCode =
          error && typeof error === "object"
            ? String((error as Record<string, unknown>).errorCode ?? "")
            : "";

        if (
          response.status === 403 &&
          (errorCode === "SESSION_REVOKED" || errorCode === "ACCOUNT_SUSPENDED")
        ) {
          this.setToken(null);
          throw new Error(
            errorCode === "ACCOUNT_SUSPENDED"
              ? "Your account has been suspended. Please contact the hotel."
              : "Your session is no longer valid. Please sign in again.",
          );
        }

        throw new Error(extractErrorMessage(error, response.status));
      }

      if (response.status === 204) return undefined as T;
      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("The request timed out. Please check your connection and try again.");
      }
      if (error instanceof Error) throw error;
      throw new Error("The request could not be completed.");
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
  }) =>
    this.request<{ message: string }>("/Auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

  login = async (credentials: { email: string; password: string }) =>
    this.request<{ token: string; user?: ApplicationUser }>("/Auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

  resetPasswordRequest = async (email: string) =>
    this.request<{ message: string }>("/Auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

  resendVerification = async (email: string) =>
    this.request<{ message: string }>("/Auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

  resetPassword = async (data: {
    email: string;
    token: string;
    newPassword: string;
    confirmNewPassword: string;
  }) =>
    this.request<{ message: string; signInUrl?: string }>("/Auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });

  verifyEmail = async (userId: string, token: string) => {
    const queryParams = new URLSearchParams({ userId, token });
    return this.request<{ message: string }>(`/Auth/verify-email?${queryParams.toString()}`);
  };

  async getRooms(): Promise<Room[]> {
    const rooms = await this.request<Room[]>("/rooms");
    return rooms.map(normalizeRoom);
  }

  async searchRooms(params: {
    checkIn?: string;
    checkOut?: string;
    category?: string;
    amenity?: string;
    guest?: number;
  }): Promise<Room[]> {
    const queryParams = new URLSearchParams();
    if (params.checkIn) queryParams.set("checkIn", toApiDate(params.checkIn, "Check-in date"));
    if (params.checkOut) queryParams.set("checkOut", toApiDate(params.checkOut, "Check-out date"));
    if (params.category && params.category !== "All") queryParams.set("category", params.category);
    if (params.amenity) queryParams.set("amenity", params.amenity);
    if (params.guest) queryParams.set("guest", String(params.guest));

    const suffix = queryParams.toString();
    const rooms = await this.request<Room[]>(
      `/rooms/search${suffix ? `?${suffix}` : ""}`,
    );
    return rooms.map(normalizeRoom);
  }

  async getRoomById(id: string): Promise<Room> {
    return normalizeRoom(
      await this.request<Room>(`/rooms/${encodeURIComponent(id)}`),
    );
  }

  async checkAvailability(roomId: string, checkIn: string, checkOut: string) {
    const queryParams = new URLSearchParams({
      checkIn: toApiDate(checkIn, "Check-in date"),
      checkOut: toApiDate(checkOut, "Check-out date"),
    });
    return this.request<{ available: boolean; message?: string }>(
      `/rooms/${encodeURIComponent(roomId)}/availability?${queryParams.toString()}`,
    );
  }

  async createBooking(data: {
    roomId: string;
    guestFirstName: string;
    guestLastName: string;
    guestEmail: string;
    guestPhone: string;
    checkIn: string;
    checkOut: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }): Promise<Booking> {
    const booking = await this.request<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        checkIn: toApiDate(data.checkIn, "Check-in date"),
        checkOut: toApiDate(data.checkOut, "Check-out date"),
      }),
    });
    return normalizeBooking(booking);
  }

  async lookupBooking(bookingCode: string, email: string): Promise<Booking> {
    const queryParams = new URLSearchParams({
      code: bookingCode.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
    });
    return normalizeBooking(
      await this.request<Booking>(`/bookings/lookup?${queryParams.toString()}`),
    );
  }

  async cancelBookingAsGuest(data: {
    bookingCode: string;
    email: string;
    reason: string;
  }): Promise<{ message: string }> {
    return this.request<{ message: string }>("/bookings/guest/cancel", {
      method: "POST",
      body: JSON.stringify({
        bookingCode: data.bookingCode.trim().toUpperCase(),
        email: data.email.trim().toLowerCase(),
        reason: data.reason.trim(),
      }),
    });
  }

  getMe = async (): Promise<ApplicationUser> =>
    normalizeUser(await this.request<ApplicationUser>("/profile/me"));

  getMyBookings = async (): Promise<Booking[]> => {
    const bookings = await this.request<Booking[]>("/profile/bookings");
    return bookings.map(normalizeBooking);
  };

  rotateSecurity = async (data: {
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) =>
    this.request<{ message: string }>("/profile/rotate-security", {
      method: "POST",
      body: JSON.stringify(data),
    });

  updateMe = async (data: {
    fullName?: string;
    email?: string;
    phone?: string;
  }): Promise<{ message: string; data: ApplicationUser }> => {
    const response = await this.request<{
      message: string;
      data: ApplicationUser;
    }>("/profile/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });

    return {
      ...response,
      data: normalizeUser(response.data),
    };
  };

  uploadAvatar = async (
    file: File,
  ): Promise<{
    message: string;
    data: { avatarUrl: string; updatedAtUtc: string };
  }> => {
    const form = new FormData();
    form.append("file", file);
    return this.request("/profile/me/avatar", {
      method: "PUT",
      body: form,
    });
  };
}

export const api = new ApiService();
