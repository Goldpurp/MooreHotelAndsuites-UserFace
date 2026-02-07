import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { api } from "../services/api";
import { Booking, Room, BookingStatus } from "../types";
import AestheticLoader from "../components/AestheticLoader";

const BookingConfirmation: React.FC = () => {
  const { code } = useParams();
  const location = useLocation();
  const stateBooking = location.state?.booking as Booking | null;

  const [booking, setBooking] = useState<Booking | null>(stateBooking);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync latest status from the registry
  const refreshBooking = async () => {
    if (!code) return;
    try {
      const updatedBooking = await api.getBookingByCode(code);
      setBooking(updatedBooking);
      return updatedBooking;
    } catch (err) {
      console.error("Registry sync failed", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      let currentBooking = booking;

      if (!currentBooking && code) {
        try {
          currentBooking = await api.getBookingByCode(code);
          setBooking(currentBooking);
        } catch (err) {
          setError("Registry record not found. Please verify your reference code.");
          setLoading(false);
          return;
        }
      }

      if (!currentBooking) {
        setError("No active session detected.");
        setLoading(false);
        return;
      }

      try {
        const roomData = await api.getRoomById(currentBooking.roomId);
        setRoom(roomData);
      } catch {
        setError("Unable to retrieve room specifications.");
      }

      setLoading(false);
    };

    init();

    // Poll for confirmation if status is pending
    const interval = setInterval(() => {
      if (booking?.status === BookingStatus.Pending) {
        refreshBooking();
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [code, booking?.status]);

  if (loading) {
    return (
      <AestheticLoader 
        message="Syncing Registry" 
        subtext="Authenticating Secure Handshake..." 
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-8 text-center space-y-8">
        <span className="material-symbols-outlined text-red-500 text-5xl">lock_open</span>
        <h1 className="serif-font text-3xl text-white italic">Access Denied</h1>
        <p className="text-gray-500 text-[10px] uppercase tracking-widest font-black max-w-xs">{error}</p>
        <Link to="/" className="bg-white/5 border border-white/10 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-primary hover:text-black transition-all">Return Home</Link>
      </div>
    );
  }

  const isPending = booking?.status === BookingStatus.Pending;

  return (
    <div className="min-h-screen bg-background-dark pt-28 pb-20 px-4 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Cinematic Header */}
        <header className="text-center space-y-3">
          <div className={`w-12 h-12 rounded-full border flex items-center justify-center mx-auto mb-4 ${isPending ? 'border-primary/30 bg-primary/5 text-primary' : 'border-green-500/30 bg-green-500/5 text-green-500'}`}>
            <span className={`material-symbols-outlined text-xl ${isPending ? 'animate-pulse' : ''}`}>
              {isPending ? 'hourglass_top' : 'check_circle'}
            </span>
          </div>
          <h1 className="serif-font text-3xl text-white italic">
            Stay <span className="text-primary">{isPending ? 'Pending' : 'Confirmed'}</span>
          </h1>
          <p className="text-gray-600 text-[8px] uppercase tracking-[0.4em] font-black">
            Official Moore Registry Entry
          </p>
        </header>

        {/* Compact Summary Card */}
        <div className="bg-surface-dark border border-white/10 rounded-sm overflow-hidden shadow-2xl">
          <div className={`py-2 text-center text-[8px] font-black uppercase tracking-widest ${isPending ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-500'}`}>
            {isPending ? 'Awaiting Payment Verification' : 'Verified Secure Access'}
          </div>

          <div className="p-8 space-y-8">
            {/* High-End Booking Code Display */}
            <div className="text-center space-y-2 py-4 bg-black/40 border-y border-white/5 relative group">
              <div className="absolute top-0 right-0 p-2 text-white/[0.03] text-4xl font-black italic select-none">M</div>
              <p className="text-[7px] uppercase tracking-[0.3em] text-gray-700 font-black">Reference Code</p>
              <p className="text-3xl text-white font-bold tracking-[0.4em] font-mono group-hover:text-primary transition-colors">
                {booking?.bookingCode}
              </p>
            </div>

            {/* Room Specs */}
            <div className="grid grid-cols-2 gap-8 border-b border-white/5 pb-8">
              <div className="space-y-1">
                <p className="text-gray-600 text-[7px] uppercase tracking-widest font-black">Designated Room</p>
                <p className="text-white text-base font-bold italic">Room {room?.roomNumber || '—'}</p>
                <p className="text-primary text-[7px] uppercase tracking-widest font-black opacity-40">{room?.category}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-600 text-[7px] uppercase tracking-widest font-black">Stay Record</p>
                <p className="text-white text-base font-bold italic">
                  {booking?.checkIn && booking?.checkOut ? 
                    `${Math.max(1, Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 86400000))} Nights` 
                    : '—'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-600 text-[7px] uppercase tracking-widest font-black">Arrival</p>
                <p className="text-white text-xs font-medium">
                  {booking?.checkIn ? new Date(booking.checkIn).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-600 text-[7px] uppercase tracking-widest font-black">Departure</p>
                <p className="text-white text-xs font-medium">
                  {booking?.checkOut ? new Date(booking.checkOut).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </p>
              </div>
            </div>

            {/* Price Display */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-[7px] uppercase tracking-[0.3em] text-gray-700 font-black">Settlement Amount</p>
              <div className="flex justify-center">
                <span className="serif-font text-5xl text-primary italic font-bold">
                  ₦{booking?.amount?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4">
              <Link
                to="/profile"
                className="w-full bg-primary text-black py-4 rounded-sm text-[10px] font-black uppercase tracking-[0.4em] text-center hover:bg-yellow-500 transition-all shadow-lg active:scale-95"
              >
                Access My Vault
              </Link>
              <Link
                to="/"
                className="w-full bg-transparent border border-white/10 text-gray-500 py-4 rounded-sm text-[10px] font-black uppercase tracking-[0.4em] text-center hover:text-white hover:bg-white/5 transition-all"
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>

        {/* Polling Notice */}
        {isPending && (
          <div className="text-center p-4 bg-white/[0.02] border border-dashed border-white/10 rounded-sm">
            <p className="text-[9px] text-gray-500 italic font-light leading-relaxed">
              * Note: Your room is provisionally held. The registry will update automatically as soon as payment is confirmed by the central bank.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingConfirmation;