export enum RoomCategory {
  Standard = "Standard",
  Business = "Business",
  Executive = "Executive",
  Suite = "Suite",
}

export enum PropertyFloor {
  GroundFloor = "GroundFloor",
  FirstFloor = "FirstFloor",
  SecondFloor = "SecondFloor",
  ThirdFloor = "ThirdFloor",
  Penthouse = "Penthouse",
}

export enum RoomStatus {
  Available = "Available",
  Occupied = "Occupied",
  Cleaning = "Cleaning",
  Maintenance = "Maintenance",
  Reserved = "Reserved",
}

export enum BookingStatus {
  Pending = "Pending",
  Confirmed = "Confirmed",
  CheckedIn = "CheckedIn",
  CheckedOut = "CheckedOut",
  Cancelled = "Cancelled",
}

export enum PaymentStatus {
  Paid = "Paid",
  Unpaid = "Unpaid",
  Partial = "Partial",
  AwaitingVerification = "AwaitingVerification",
}

export enum PaymentMethod {
  Paystack = "Paystack",
  DirectTransfer = "DirectTransfer",
}

export enum UserRole {
  Admin = "Admin",
  Manager = "Manager",
  Staff = "Staff",
  Client = "Client",
}

export enum ProfileStatus {
  Active = "Active",
  Suspended = "Suspended",
}

export interface ApplicationUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  status: ProfileStatus;
  name: string;
  avatarUrl?: string | null;
  emailVerified?: boolean;
  createdAt?: string;
  emailConfirmed?: boolean;
}

export interface Room {
  id: string;
  roomNumber: string;
  name: string;
  category: RoomCategory;
  pricePerNight: number;
  status: RoomStatus;
  amenities: string[];
  images: string[];
  isOnline: boolean;
  floor?: PropertyFloor;
  capacity?: number;
  size?: string;
  description?: string;
}

export interface Booking {
  id: string;
  bookingCode: string;
  roomId: string;
  guestId: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionReference?: string | null;
  notes?: string;
  createdAt: string;
  paymentUrl?: string | null;
  paymentInstruction?: string | null;
}

export interface AuthResponse {
  token: string;
  user: ApplicationUser;
}
