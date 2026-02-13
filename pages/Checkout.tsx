import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { ApplicationUser, Room, PaymentMethod } from "../types";
import NotificationModal from "../components/NotificationModal";
import AestheticLoader from "../components/AestheticLoader";

interface CheckoutProps {
  user: ApplicationUser | null;
}

const Checkout: React.FC<CheckoutProps> = ({ user }) => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [toast, setToast] = useState(false);

  // Refs for auto-scrolling on validation error
  const formRef = useRef<HTMLDivElement>(null);

  const [room, setRoom] = useState<Room | null>(null);
  const [fetchingRoom, setFetchingRoom] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [notification, setNotification] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({
    show: false,
    title: "",
    message: "",
    type: "info",
  });

  // Guest Information state
  const [guestInfo, setGuestInfo] = useState({
    firstName: user?.firstName || (user?.name ? user.name.split(" ")[0] : ""),
    lastName:
      user?.lastName ||
      (user?.name ? user.name.split(" ").slice(1).join(" ") : ""),
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // Sync guest info if user logs in/out while on page
  useEffect(() => {
    if (user) {
      setGuestInfo({
        firstName: user.firstName || (user.name ? user.name.split(" ")[0] : ""),
        lastName:
          user.lastName ||
          (user.name ? user.name.split(" ").slice(1).join(" ") : ""),
        email: user.email,
        phone: user.phone || "",
      });
    }
  }, [user]);

  // Availability state
  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(
    null,
  );

  const checkIn =
    searchParams.get("checkIn") || new Date().toISOString().split("T")[0];
  const checkOut =
    searchParams.get("checkOut") ||
    new Date(Date.now() + 86400000).toISOString().split("T")[0];

  useEffect(() => {
    const fetchRoom = async () => {
      setFetchingRoom(true);
      try {
        const data = await api.getRoomById(roomId!);
        setRoom(data);
      } catch (err) {
        navigate("/rooms");
      } finally {
        setTimeout(() => setFetchingRoom(false), 500);
      }
    };
    fetchRoom();
  }, [roomId, navigate]);

  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
        (1000 * 3600 * 24),
    ),
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(bankDetails.accountNumber);
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  const totalAmount = room ? room.pricePerNight * nights : 0;

  const bankDetails = {
    bankName: "Moniepoint",
    accountName: "Yakubu Omobolanle Or Moore Hotel",
    accountNumber: "5452508008",
    note: "Booking will be confirmed immediately after payment is confirmed",
  };

  useEffect(() => {
    const verify = async () => {
      if (!roomId) return;

      try {
        const res = await api.checkAvailability(roomId, checkIn, checkOut);
        setIsAvailable(res.available);
        setAvailabilityMessage(
          res.available
            ? null
            : res.message || "Room is unavailable for the selected dates.",
        );
      } catch (err) {
        setIsAvailable(true);
        setAvailabilityMessage(null);
      }
    };

    verify();
  }, [roomId, checkIn, checkOut]);

  const validateGuestInfo = () => {
    const errors: Record<string, string> = {};
    const { firstName, lastName, email, phone } = guestInfo;

    if (!firstName) errors.firstName = "First name is required.";
    if (!lastName) errors.lastName = "Last name is required.";
    if (!email) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email))
      errors.email = "Invalid email format.";
    if (!phone) errors.phone = "Phone number is required.";

    setFieldErrors(errors);

    const isValid = Object.keys(errors).length === 0;
    if (!isValid) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    return isValid;
  };

  const handleBooking = async () => {
    if (loading || processing) return;
    if (!validateGuestInfo()) return;

    if (!selectedMethod) {
      setNotification({
        show: true,
        title: "Payment Instrument",
        message:
          "Please select a payment instrument to proceed with the reservation.",
        type: "info",
      });
      document
        .getElementById("payment-section")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!isAvailable) {
      setNotification({
        show: true,
        title: "Sanctuary Unavailable",
        message:
          availabilityMessage || "Room is unavailable for the selected dates.",
        type: "error",
      });
      return;
    }

    if (selectedMethod === PaymentMethod.DirectTransfer) {
      setShowModal(true);
      return;
    }

    setProcessing(true);
    setLoading(true);

    try {
      const booking = await api.createBooking({
        roomId: roomId!,
        guestFirstName: guestInfo.firstName,
        guestLastName: guestInfo.lastName,
        guestEmail: guestInfo.email,
        guestPhone: guestInfo.phone,
        checkIn,
        checkOut,
        paymentMethod: PaymentMethod.Paystack,
        notes: user ? "Authorized via Member Portal" : "Guest Booking",
      });

      if (booking.paymentUrl) {
        const returnUrl = `${window.location.origin}/#/booking-confirmation/${booking.bookingCode}`;
        const paymentUrl =
          booking.paymentUrl + `&returnUrl=${encodeURIComponent(returnUrl)}`;
        window.location.href = paymentUrl;
        return;
      }

      navigate(`/booking-confirmation/${booking.bookingCode}`, {
        state: { booking },
      });
    } catch (err: any) {
      setNotification({
        show: true,
        title: "Transaction Failed",
        message:
          err.message ||
          "We encountered an error while securing your reservation.",
        type: "error",
      });
      setProcessing(false);
      setLoading(false);
    }
  };

  const handleDirectPaymentSent = async () => {
    if (loading || processing) return;
    if (!validateGuestInfo()) return;

    if (!isAvailable) {
      setNotification({
        show: true,
        title: "Availability Conflict",
        message:
          availabilityMessage || "Room is unavailable for the selected dates.",
        type: "error",
      });
      return;
    }

    setProcessing(true);
    setLoading(true);

    try {
      const booking = await api.createBooking({
        roomId: roomId!,
        guestFirstName: guestInfo.firstName,
        guestLastName: guestInfo.lastName,
        guestEmail: guestInfo.email,
        guestPhone: guestInfo.phone,
        checkIn,
        checkOut,
        paymentMethod: PaymentMethod.DirectTransfer,
        notes: user
          ? "Member claims payment sent."
          : "Guest claims payment sent.",
      });

      setShowModal(false);
      navigate(`/booking-confirmation/${booking.bookingCode}`, {
        state: { booking },
      });
    } catch (err: any) {
      setNotification({
        show: true,
        title: "Transaction Error",
        message: err.message || "Failed to log the transaction registry.",
        type: "error",
      });
      setProcessing(false);
      setLoading(false);
    }
  };

  if (fetchingRoom || !room) {
    return (
      <AestheticLoader
        message="Fetching Registry"
        subtext="Locating Sanctuary Records..."
      />
    );
  }

  return (
    <div className="pt-28 min-h-screen bg-background-dark pb-24 px-4 md:px-10">
      <NotificationModal
        isOpen={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <div className="max-w-[1400px] mx-auto">
        {(processing || loading) && (
          <AestheticLoader
            message="Validating Registry"
            subtext="Securing High-Security Handshake..."
          />
        )}

        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/80 animate-in fade-in duration-300">
            <div className="bg-surface-dark border border-white/10 rounded-lg w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-500">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30 p-6 text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    account_balance
                  </span>
                </div>
                <h2 className="serif-font text-2xl text-white italic">
                  Registry <span className="text-primary">Transfer</span>
                </h2>
                <p className="text-[9px] uppercase tracking-widest text-gray-400 font-black mt-1">
                  Secure Bank Settlement Protocol
                </p>
              </div>

              {/* Bank Details */}
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <p className="text-[8px] uppercase tracking-widest text-gray-500 font-black">
                    Bank Name
                  </p>
                  <p className="text-white font-bold text-lg italic">
                    {bankDetails.bankName}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-[8px] uppercase tracking-widest text-gray-500 font-black">
                    Account Name
                  </p>
                  <p className="text-white font-bold text-lg italic">
                    {bankDetails.accountName}
                  </p>
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[8px] uppercase tracking-widest text-gray-500 font-black">
                      Account Number
                    </p>
                    {toast && (
                      <span className="absolute top-0 right-0 text-green-500 text-[7px] font-black uppercase animate-in fade-in px-2 py-1 bg-black/50 rounded">
                        COPIED
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-between w-full text-left bg-white/5 border border-white/10 p-3 rounded transition hover:bg-primary/10"
                  >
                    <p className="font-mono font-bold text-white tracking-widest">
                      {bankDetails.accountNumber}
                    </p>
                    <span className="material-symbols-outlined text-gray-400 hover:text-primary transition-all">
                      content_copy
                    </span>
                  </button>
                </div>

                <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 p-3 rounded">
                  <span className="material-symbols-outlined text-primary text-lg">
                    info
                  </span>
                  <p className="text-[9px] text-gray-400 font-light leading-relaxed">
                    Confirming your transfer initiates verification. Access will
                    be granted once funds are confirmed.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 p-6 border-t border-white/10">
                <button
                  disabled={loading}
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-[10px] uppercase font-black tracking-widest text-gray-400 border border-white/10 rounded hover:text-white hover:bg-white/5 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={loading}
                  onClick={handleDirectPaymentSent}
                  className="flex-1 py-3 text-[10px] uppercase font-black tracking-widest text-black bg-primary rounded hover:bg-[#B04110] transition shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  ) : (
                    "Confirm Payment"
                  )}
                </button>
              </div>

              {/* Footer */}
              <p className="text-[7px] text-center text-gray-600 uppercase tracking-widest font-black italic py-2">
                End-to-End Encryption Enabled
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <header className="space-y-4">
              <h1 className="serif-font text-5xl md:text-7xl text-white italic">
                Authorise <span className="text-primary">Stay</span>
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="w-8 h-px bg-gray-600"></span>
                <p className="text-[10px] uppercase tracking-[0.5em] font-black">
                  Step 02: Verification & Payment
                </p>
              </div>
            </header>

            {/* GUEST INFO FORM */}
            <section
              ref={formRef}
              className="bg-surface-dark border border-white/5 p-8 md:p-12 space-y-10 scroll-mt-32"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <h3 className="serif-font text-2xl text-white italic">
                  Contact Information
                </h3>
                {!user && (
                  <p className="text-[9px] uppercase tracking-widest text-primary font-black animate-pulse">
                    Booking as Guest
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-600 ml-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    disabled={loading}
                    placeholder="Guest First Name"
                    value={guestInfo.firstName}
                    onChange={(e) =>
                      setGuestInfo({ ...guestInfo, firstName: e.target.value })
                    }
                    className={`w-full bg-white/[0.03] border ${fieldErrors.firstName ? "border-red-500/50" : "border-white/10"} p-5 text-white outline-none focus:border-primary transition-all font-light italic placeholder:text-gray-800 disabled:opacity-50`}
                  />
                  {fieldErrors.firstName && (
                    <p className="text-red-500 text-[8px] uppercase font-black tracking-widest ml-1">
                      {fieldErrors.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-600 ml-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    disabled={loading}
                    placeholder="Guest Last Name"
                    value={guestInfo.lastName}
                    onChange={(e) =>
                      setGuestInfo({ ...guestInfo, lastName: e.target.value })
                    }
                    className={`w-full bg-white/[0.03] border ${fieldErrors.lastName ? "border-red-500/50" : "border-white/10"} p-5 text-white outline-none focus:border-primary transition-all font-light italic placeholder:text-gray-800 disabled:opacity-50`}
                  />
                  {fieldErrors.lastName && (
                    <p className="text-red-500 text-[8px] uppercase font-black tracking-widest ml-1">
                      {fieldErrors.lastName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-600 ml-1">
                    Email Registry
                  </label>
                  <input
                    type="email"
                    disabled={loading}
                    placeholder="email@example.com"
                    value={guestInfo.email}
                    onChange={(e) =>
                      setGuestInfo({ ...guestInfo, email: e.target.value })
                    }
                    className={`w-full bg-white/[0.03] border ${fieldErrors.email ? "border-red-500/50" : "border-white/10"} p-5 text-white outline-none focus:border-primary transition-all font-light italic placeholder:text-gray-800 disabled:opacity-50`}
                  />
                  {fieldErrors.email && (
                    <p className="text-red-500 text-[8px] uppercase font-black tracking-widest ml-1">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-600 ml-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    disabled={loading}
                    placeholder="+234 ..."
                    value={guestInfo.phone}
                    onChange={(e) =>
                      setGuestInfo({ ...guestInfo, phone: e.target.value })
                    }
                    className={`w-full bg-white/[0.03] border ${fieldErrors.phone ? "border-red-500/50" : "border-white/10"} p-5 text-white outline-none focus:border-primary transition-all font-light italic placeholder:text-gray-800 disabled:opacity-50`}
                  />
                  {fieldErrors.phone && (
                    <p className="text-red-500 text-[8px] uppercase font-black tracking-widest ml-1">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              {!user && (
                <p className="text-[9px] text-gray-600 uppercase tracking-widest italic pt-4">
                  * Note: Creating an account later will allow you to track this
                  stay in your private vault.
                </p>
              )}
            </section>

            <section
              id="payment-section"
              className="bg-surface-dark border border-white/5 p-8 md:p-12 space-y-10 scroll-mt-32"
            >
              <h3 className="serif-font text-2xl text-white italic">
                Payment Instrument
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  disabled={loading}
                  onClick={() => setSelectedMethod(PaymentMethod.Paystack)}
                  className={`p-8 border transition text-left space-y-4 rounded-sm group ${
                    selectedMethod === PaymentMethod.Paystack
                      ? "bg-primary/5 border-primary shadow-[0_0_20px_rgba(234,179,8,0.1)]"
                      : "bg-white/5 border-white/5 hover:border-white/20"
                  } disabled:opacity-50`}
                >
                  <span
                    className={`material-symbols-outlined text-3xl ${selectedMethod === PaymentMethod.Paystack ? "text-primary" : "text-gray-500 group-hover:text-primary transition-colors"}`}
                  >
                    credit_card
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-lg">
                      Paystack Flow (Test)
                    </h4>
                    <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">
                      Instant Activation • Secure Link
                    </p>
                  </div>
                </button>

                <button
                  disabled={loading}
                  onClick={() =>
                    setSelectedMethod(PaymentMethod.DirectTransfer)
                  }
                  className={`p-8 border transition text-left space-y-4 rounded-sm group ${
                    selectedMethod === PaymentMethod.DirectTransfer
                      ? "bg-primary/5 border-primary shadow-[0_0_20px_rgba(234,179,8,0.1)]"
                      : "bg-white/5 border-white/5 hover:border-white/20"
                  } disabled:opacity-50`}
                >
                  <span
                    className={`material-symbols-outlined text-3xl ${selectedMethod === PaymentMethod.DirectTransfer ? "text-primary" : "text-gray-500 group-hover:text-primary transition-colors"}`}
                  >
                    account_balance
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-lg">
                      Direct Transfer
                    </h4>
                    <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">
                      Manual Verification • Bank Details
                    </p>
                  </div>
                </button>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4">
            <div className="bg-surface-dark border border-white/10 rounded-sm overflow-hidden shadow-2xl sticky top-32">
              <div className="h-40 bg-gray-800 relative">
                <img
                  src={room.images?.[0]}
                  className="w-full h-full object-cover grayscale-[0.5]"
                  alt=""
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black p-6 flex flex-col justify-end">
                  <p className="text-primary text-[8px] uppercase font-black tracking-widest">
                    {room.category}
                  </p>
                  <h4 className="serif-font text-2xl text-white italic">
                    Suite {room.roomNumber}
                  </h4>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest font-black">
                    <span>Stay Duration</span>
                    <span className="text-white">{nights} Nights</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest font-black">
                    <span>Check-in</span>
                    <span className="text-primary italic">
                      {new Date(checkIn).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest font-black">
                    <span>Check-out</span>
                    <span className="text-primary italic">
                      {new Date(checkOut).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 text-right space-y-1">
                  <p className="text-[9px] uppercase font-black text-gray-600 tracking-widest">
                    Total Authorised Investment
                  </p>
                  <p className="serif-font text-4xl text-primary font-bold italic drop-shadow-lg">
                    ₦{totalAmount.toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={handleBooking}
                  disabled={loading || !selectedMethod || !isAvailable}
                  className="w-full bg-primary hover:bg-[#B04110] text-black py-5 uppercase text-[10px] font-black tracking-[0.4em] transition active:scale-95 disabled:opacity-50 shadow-2xl shadow-primary/20 flex items-center justify-center gap-3"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  )}
                  {loading ? "SECURING..." : "Authorise Reservation"}
                </button>

                <p className="text-[8px] text-center text-gray-700 uppercase tracking-[0.3em] font-black italic">
                  Encrypted Handshake Link Active
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
