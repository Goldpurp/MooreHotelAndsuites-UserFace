import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { ApplicationUser, Room, PaymentMethod } from "../types";

interface CheckoutProps {
  user: ApplicationUser | null;
}

const Checkout: React.FC<CheckoutProps> = ({ user }) => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
      try {
        const data = await api.getRoomById(roomId!);
        setRoom(data);
      } catch (err) {
        navigate("/rooms");
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

  const totalAmount = room ? room.pricePerNight * nights : 0;

  // Bank transfer details
  const bankDetails = {
    bankName: "Zenith Bank",
    accountName: "Moore Hotels Ltd",
    accountNumber: "1234567890",
    note: "Booking will be confirmed immediately after payment is confirmed",
  };

  // Verify availability before booking
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

  const getNamesFromUser = () => {
    const fullName = user?.name || "";
    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ") || firstName;
    return { firstName, lastName };
  };

  const handleBooking = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!selectedMethod) {
      alert("Select a payment instrument.");
      return;
    }

    if (!isAvailable) {
      alert(
        availabilityMessage || "Room is unavailable for the selected dates.",
      );
      return;
    }

    const { firstName, lastName } = getNamesFromUser();

    // If user chooses direct transfer, show bank modal
    if (selectedMethod === PaymentMethod.DirectTransfer) {
      setShowModal(true);
      return;
    }

    // Paystack flow
    setProcessing(true);
    setLoading(true);

    try {
      const booking = await api.createBooking({
        roomId: roomId!,
        guestFirstName: firstName,
        guestLastName: lastName,
        guestEmail: user.email,
        guestPhone: user.phone || "+2340000000000",
        checkIn,
        checkOut,
        paymentMethod: PaymentMethod.Paystack,
        notes: "Authorized via Member Portal",
      });

      // Redirect to payment URL from backend
      if (booking.paymentUrl) {
        // This is the dynamic return URL
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
      alert(err.message || "Transaction failed.");
      setProcessing(false);
      setLoading(false);
    }
  };

  const handleDirectPaymentSent = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!isAvailable) {
      alert(
        availabilityMessage || "Room is unavailable for the selected dates.",
      );
      return;
    }

    const { firstName, lastName } = getNamesFromUser();

    setProcessing(true);
    setLoading(true);

    try {
      const booking = await api.createBooking({
        roomId: roomId!,
        guestFirstName: firstName,
        guestLastName: lastName,
        guestEmail: user.email,
        guestPhone: user.phone || "+2340000000000",
        checkIn,
        checkOut,
        paymentMethod: PaymentMethod.DirectTransfer,
        notes: "User claims payment sent. Awaiting admin verification.",
      });

      setShowModal(false);
      navigate(`/booking-confirmation/${booking.bookingCode}`, {
        state: { booking },
      });
    } catch (err: any) {
      alert(err.message || "Transaction failed.");
      setProcessing(false);
      setLoading(false);
    }
  };

  if (!room) return null;

  return (
    <div className="pt-28 min-h-screen bg-background-dark pb-24 px-4 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        {processing && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 border-2 border-primary border-t-transparent rounded-full animate-spin mb-8"></div>
            <h2 className="serif-font text-3xl text-white italic">
              Securing Gateway
            </h2>
            <p className="text-primary text-[10px] mt-4 uppercase tracking-[0.5em] animate-pulse">
              Establishing Secure Handshake...
            </p>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6">
            <div className="bg-surface-dark border border-white/10 rounded-sm p-8 w-full max-w-lg">
              <h2 className="serif-font text-3xl text-white italic">
                Direct Transfer Details
              </h2>
              <p className="text-gray-400 mt-2 text-sm">
                Please make a transfer and click "Payment Sent".
              </p>

              <div className="mt-6 space-y-4">
                <div className="bg-white/5 p-4 rounded-sm">
                  <p className="text-gray-400 text-[10px] uppercase tracking-widest">
                    Bank Name
                  </p>
                  <p className="text-white font-bold">{bankDetails.bankName}</p>
                </div>

                <div className="bg-white/5 p-4 rounded-sm">
                  <p className="text-gray-400 text-[10px] uppercase tracking-widest">
                    Account Name
                  </p>
                  <p className="text-white font-bold">
                    {bankDetails.accountName}
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-sm">
                  <p className="text-gray-400 text-[10px] uppercase tracking-widest">
                    Account Number
                  </p>
                  <p className="text-white font-bold">
                    {bankDetails.accountNumber}
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-sm">
                  <p className="text-gray-400 text-[10px] uppercase tracking-widest">
                    Note
                  </p>
                  <p className="text-white font-bold">{bankDetails.note}</p>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-white/5 border border-white/10 py-4 uppercase text-[10px] font-black tracking-widest"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDirectPaymentSent}
                  className="w-full bg-primary text-black py-4 uppercase text-[10px] font-black tracking-widest"
                >
                  Payment Sent
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <header className="space-y-4">
              <h1 className="serif-font text-5xl md:text-7xl text-white italic">
                Authorise <span className="text-primary">Stay</span>
              </h1>
              <p className="text-[10px] text-gray-600 uppercase tracking-[0.5em] font-black">
                Step 02: Payment Security
              </p>
            </header>

            <section className="bg-surface-dark border border-white/5 p-8 md:p-12 space-y-10">
              <h3 className="serif-font text-2xl text-white italic">
                Payment Instrument
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedMethod(PaymentMethod.Paystack)}
                  className={`p-8 border transition text-left space-y-4 rounded-sm ${
                    selectedMethod === PaymentMethod.Paystack
                      ? "bg-primary/5 border-primary shadow-[0_0_20px_rgba(234,179,8,0.1)]"
                      : "bg-white/5 border-white/5 hover:border-white/20"
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl text-primary">
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
                  onClick={() =>
                    setSelectedMethod(PaymentMethod.DirectTransfer)
                  }
                  className={`p-8 border transition text-left space-y-4 rounded-sm ${
                    selectedMethod === PaymentMethod.DirectTransfer
                      ? "bg-primary/5 border-primary shadow-[0_0_20px_rgba(234,179,8,0.1)]"
                      : "bg-white/5 border-white/5 hover:border-white/20"
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl text-primary">
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
                  className="w-full bg-primary hover:bg-yellow-500 text-black py-5 uppercase text-[10px] font-black tracking-[0.4em] transition active:scale-95 disabled:opacity-50 shadow-2xl shadow-primary/20"
                >
                  {loading ? "Securing..." : "Authorise Reservation"}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
