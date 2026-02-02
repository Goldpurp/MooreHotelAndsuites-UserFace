import { Room, Booking, ApplicationUser, PaymentMethod } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  "https://api.moorehotelandsuites.com";

const STORAGE_KEYS = {
  TOKEN: "mhs_auth_token",
};

class ApiService {
  private token: string | null = localStorage.getItem(STORAGE_KEYS.TOKEN);

  // =========================
  // Token handling
  // =========================

  setToken(token: string | null) {
    this.token = token;

    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  }

  // =========================
  // Core request handler
  // =========================

  private async request<T>(
    path: string,
    options: RequestInit = {},
    requiresAuth = false,
  ): Promise<T> {
    const headers = new Headers(options.headers);

    headers.set("Content-Type", "application/json");

    if (requiresAuth && this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.setToken(null);
      throw new Error("Unauthorized. Please login again.");
    }

    if (!response.ok) {
      let errorMessage = `Error ${response.status}`;

      try {
        const error = await response.json();

        if (error?.errors) {
          errorMessage = Object.values(error.errors)
            .flat()
            .join(" | ");
        } else if (error?.message) {
          errorMessage = error.message;
        }
      } catch {
        // ignore json parsing errors
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  // =========================
  // Authentication
  // =========================

  register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
  }) {
    return this.request<{ token: string; user: ApplicationUser }>(
      "/Auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  login(credentials: { email: string; password: string }) {
    return this.request<{ token: string; user: ApplicationUser }>(
      "/Auth/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      },
    );
  }

  resetPasswordRequest(email: string) {
    return this.request<{ message: string }>("/Auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  // =========================
  // Rooms (PUBLIC endpoints)
  // =========================
  // IMPORTANT: Routes are case-sensitive in production

  getRooms(): Promise<Room[]> {
    return this.request<Room[]>("/Rooms");
  }

  searchRooms(params: {
    checkIn: string;
    checkOut: string;
    category?: string;
    roomNumber?: string;
    amenity?: string;
  }): Promise<Room[]> {
    const queryParams = new URLSearchParams();

    queryParams.append(
      "checkIn",
      new Date(params.checkIn).toISOString(),
    );
    queryParams.append(
      "checkOut",
      new Date(params.checkOut).toISOString(),
    );

    if (params.category && params.category !== "All") {
      queryParams.append("category", params.category);
    }

    if (params.roomNumber) {
      queryParams.append("roomNumber", params.roomNumber);
    }

    if (params.amenity) {
      queryParams.append("amenity", params.amenity);
    }

    return this.request<Room[]>(
      `/Rooms/search?${queryParams.toString()}`,
    );
  }

  getRoomById(id: string): Promise<Room> {
    return this.request<Room>(`/Rooms/${id}`);
  }

  checkAvailability(
    roomId: string,
    checkIn: string,
    checkOut: string,
  ): Promise<{ available: boolean; message?: string }> {
    return this.request<{ available: boolean; message?: string }>(
      `/Rooms/${roomId}/availability?checkIn=${encodeURIComponent(
        new Date(checkIn).toISOString(),
      )}&checkOut=${encodeURIComponent(
        new Date(checkOut).toISOString(),
      )}`,
    );
  }

  // =========================
  // Bookings (PROTECTED)
  // =========================

  createBooking(data: {
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
    const payload = {
      ...data,
      checkIn: new Date(data.checkIn).toISOString(),
      checkOut: new Date(data.checkOut).toISOString(),
    };

    return this.request<Booking>(
      "/Bookings",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      true,
    );
  }

  getBookingByCode(code: string): Promise<Booking> {
    return this.request<Booking>(`/Bookings/code/${code}`);
  }

  // =========================
  // Profile (PROTECTED)
  // =========================

  getMe(): Promise<ApplicationUser> {
    return this.request<ApplicationUser>("/Profile/me", {}, true);
  }

  getMyBookings(): Promise<Booking[]> {
    return this.request<Booking[]>("/Profile/bookings", {}, true);
  }

  rotateSecurity(data: {
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) {
    return this.request<{ message: string }>(
      "/Profile/rotate-security",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    );
  }

  updateMe(data: {
    name?: string;
    password?: string;
  }): Promise<ApplicationUser> {
    return this.request<ApplicationUser>(
      "/Profile/me",
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      true,
    );
  }
}

export const api = new ApiService();
