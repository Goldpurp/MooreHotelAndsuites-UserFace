export enum RoomCategory {
  Standard = "Standard",
  Deluxe = "Deluxe",
  Executive = "Executive",
  PresidentialSuite = "PresidentialSuite",
}

export enum PropertyFloor {
  GroundFloor = "GroundFloor",
  FirstFloor = "FirstFloor",
  SecondFloor = "SecondFloor",
  Bungalow = "Bungalow",
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
  NoShow = "NoShow",
}

export enum PaymentStatus
{
    Paid = "Paid",
    Unpaid = "Unpaid",
    AwaitingVerification = "AwaitingVerification",
    RefundPending = "RefundPending",
    Refunded = "Refunded"
}

export enum PaymentMethod {
  Monnify = "Monnify",
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
  firstName?: string;
  lastName?: string;
  phone?: string;
  status: ProfileStatus;
  name: string;
  avatarUrl?: string | null;
  emailVerified?: boolean;
  createdAt?: string;
  emailConfirmed?: boolean;
  guestId?: string | null;
  department?: string | null;
}

export interface Room {
  id: string;
  name: string;
  category: RoomCategory;
  pricePerNight: number;
  amenities: string[];
  images: string[];
  capacity: number;
  size: string;
  description: string;
}

export interface Booking {
  id: string;
  bookingCode: string;
  roomId: string;
  guestId?: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  transactionReference?: string | null;
  notes?: string;
  createdAt: string;
  paymentUrl?: string | null;
  paymentInstruction?: string | null;
  notificationMessage?: string | null;
  paymentExpiresAtUtc?: string | null;
}

export interface AuthResponse {
  token: string;
  user: ApplicationUser;
}
