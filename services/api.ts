import { Room, Booking, ApplicationUser, PaymentMethod } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  "https://api.moorehotelandsuites.com/api";

const STORAGE_KEYS = {
  TOKEN: "mhs_auth_token",
};

class ApiService {
  private token: string | null = localStorage.getItem(STORAGE_KEYS.TOKEN);

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");

    if (this.token) {
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
      const error = await response.json().catch(() => null);

      if (error && error.errors) {
        const messages = Object.values(error.errors).flat().join(" | ");
        throw new Error(messages);
      }

      throw new Error(error?.message || `Error ${response.status}`);
    }

    return response.json();
  }

  // =========================
  // Authentication
  // =========================

  register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
  }) => {
    // Standardizing keys for ASP.NET backend
    return this.request<{ token: string; user: ApplicationUser }>(
      "/Auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  };

  login = async (credentials: { email: string; password: string }) => {
    return this.request<{ token: string; user: ApplicationUser }>(
      "/Auth/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      },
    );
  };

  resetPasswordRequest = async (email: string) => {
    return this.request<{ message: string }>("/Auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  };

  // =========================
  // Email Confirmation
  // =========================

  async verifyEmail(userId: string, token: string): Promise<{ message: string }> {
    const queryParams = new URLSearchParams();
    queryParams.append("userId", userId);
    queryParams.append("token", token);

    return this.request<{ message: string }>(`/Auth/verify-email?${queryParams.toString()}`);
  }

  // =========================
  // Rooms (Guest Portal)
  // =========================

  async getRooms(p0: string): Promise<Room[]> {
    return this.request<Room[]>("/rooms");
  }

  async searchRooms(params: {
    checkIn: string;
    checkOut: string;
    category?: string;
    roomNumber?: string;
    amenity?: string;
  }): Promise<Room[]> {
    const queryParams = new URLSearchParams();

    if (params.checkIn)
      queryParams.append("checkIn", new Date(params.checkIn).toISOString());
    if (params.checkOut)
      queryParams.append("checkOut", new Date(params.checkOut).toISOString());
    if (params.category && params.category !== "All")
      queryParams.append("category", params.category);
    if (params.roomNumber) queryParams.append("roomNumber", params.roomNumber);
    if (params.amenity) queryParams.append("amenity", params.amenity);

    return this.request<Room[]>(`/rooms/search?${queryParams.toString()}`);
  }

  async getRoomById(id: string): Promise<Room> {
    return this.request<Room>(`/rooms/${id}`);
  }

  async checkAvailability(
    roomId: string,
    checkIn: string,
    checkOut: string,
  ): Promise<{ available: boolean; message?: string }> {
    const res = await this.request<{ available: boolean; message?: string }>(
      `/rooms/${roomId}/availability?checkIn=${encodeURIComponent(
        new Date(checkIn).toISOString(),
      )}&checkOut=${encodeURIComponent(new Date(checkOut).toISOString())}`,
    );

    return res;
  }

  // =========================
  // Bookings (Guest Portal)
  // =========================

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
    const payload = {
      ...data,
      checkIn: new Date(data.checkIn).toISOString(),
      checkOut: new Date(data.checkOut).toISOString(),
    };

    return this.request<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // =========================
  // Profile (Guest)
  // =========================

  getMe = async (): Promise<ApplicationUser> => {
    return this.request<ApplicationUser>("/profile/me");
  };

  async getMyBookings(): Promise<Booking[]> {
    return this.request<Booking[]>("/profile/bookings");
  }

  async getBookingByCode(code: string): Promise<Booking> {
    return this.request<Booking>(`/bookings/code/${code}`);
  }

  rotateSecurity = async (data: {
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => {
    return this.request<{ message: string }>("/Profile/rotate-security", {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  async updateMe(data: {
    name?: string;
    password?: string;
  }): Promise<ApplicationUser> {
    return this.request<ApplicationUser>("/profile/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiService();
