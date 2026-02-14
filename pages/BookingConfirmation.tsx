import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { api } from "../services/api";
import { Booking, Room, BookingStatus } from "../types";
import AestheticLoader from "../components/AestheticLoader";
import jsPDF from "jspdf";

const BookingConfirmation: React.FC = () => {
  const { code } = useParams();
  const location = useLocation();
  const stateBooking = location.state?.booking as Booking | null;

  const [booking, setBooking] = useState<Booking | null>(stateBooking);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        } catch {
          setError("Reservation not found.");
          setLoading(false);
          return;
        }
      }

      if (!currentBooking) {
        setError("No active reservation detected.");
        setLoading(false);
        return;
      }

      try {
        const roomData = await api.getRoomById(currentBooking.roomId);
        setRoom(roomData);
      } catch {
        setError("Unable to retrieve room details.");
      }

      setLoading(false);
    };

    init();

    const interval = setInterval(() => {
      if (booking?.status === BookingStatus.Pending) refreshBooking();
    }, 5000);

    return () => clearInterval(interval);
  }, [code, booking?.status]);

  const downloadPDF = () => {
    if (!booking || !room) return;

    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Header
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.setTextColor("#EAB308");
    pdf.text("Booking Confirmation", pageWidth / 2, 50, { align: "center" });

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor("#666");
    pdf.text("Moore Hotels & Suites • Guest Registry", pageWidth / 2, 70, { align: "center" });

    pdf.setDrawColor(234, 179, 8);
    pdf.setLineWidth(1);
    pdf.line(50, 80, pageWidth - 50, 80);

    let y = 110;

    const addField = (label: string, value: string) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor("#666");
      pdf.text(label, 60, y);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor("#000");
      pdf.text(value, 200, y);
      y += 20;
    };

    addField("Reference Code:", booking.bookingCode);
    addField("Guest Name:", `${booking.guestFirstName} ${booking.guestLastName}`);
    addField("Email:", booking.guestEmail);
    addField("Phone:", booking.guestPhone);
    addField("Room:", `${room.roomNumber} (${room.category})`);

    const nights = booking.checkIn && booking.checkOut
      ? Math.max(1, Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 86400000))
      : 1;

    addField("Stay Duration:", `${nights} night(s)`);
    addField("Check-In:", booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : "—");
    addField("Check-Out:", booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : "—");
    addField("Amount Paid:", `₦${booking.amount?.toLocaleString() || '—'}`);

    y += 20;
    pdf.setFontSize(8);
    pdf.setTextColor("#999");
    pdf.text(
      "Thank you for booking with Moore Hotels & Suites. We look forward to hosting you!",
      pageWidth / 2,
      y,
      { align: "center" }
    );

    pdf.save(`Booking-${booking.bookingCode}.pdf`);
  };

  if (loading) return <AestheticLoader message="Syncing Reservation..." subtext="Verifying details..." />;

  if (error)
    return (
      <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center px-6 text-center">
        <span className="material-symbols-outlined text-red-500 text-6xl">error_outline</span>
        <h1 className="serif-font text-2xl md:text-3xl text-white italic mt-4">Access Denied</h1>
        <p className="text-gray-400 text-sm mt-2">{error}</p>
        <Link
          to="/"
          className="mt-6 px-6 py-3 text-xs uppercase font-black tracking-widest bg-primary text-black rounded shadow hover:bg-[#B04110] transition-all"
        >
          Return Home
        </Link>
      </div>
    );

  const isPending = booking?.status === BookingStatus.Pending;

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center p-4">
      <div className="bg-surface-dark w-full max-w-sm rounded-lg shadow-2xl p-6 md:p-8 space-y-6">
        
        {/* Status Header */}
        <div className="flex flex-col items-center space-y-2">
          <div
            className={`w-14 h-14 flex items-center justify-center rounded-full border-2 ${
              isPending ? 'border-primary bg-primary/10 text-primary animate-pulse' : 'border-green-500 bg-green-500/10 text-green-500'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">
              {isPending ? 'hourglass_top' : 'check_circle'}
            </span>
          </div>
          <h2 className="serif-font text-2xl md:text-3xl text-white italic">
            {isPending ? 'Pending' : 'Confirmed'}
          </h2>
          <p className="text-gray-400 text-[10px] uppercase tracking-widest">Guest Registry</p>
        </div>

        {/* Booking Summary */}
        <div className="bg-black/30 p-4 rounded space-y-4">
          <div className="text-center">
            <p className="text-gray-400 text-[8px] uppercase tracking-[0.2em]">Reference Code</p>
            <p className="text-xl md:text-2xl text-white font-mono font-bold tracking-[0.2em]">{booking?.bookingCode}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-[10px] text-gray-400">
            <div className="space-y-1">
              <p className="uppercase font-black tracking-widest">Room</p>
              <p className="text-white font-bold">{room?.roomNumber || '—'}</p>
              <p className="text-primary text-[9px] opacity-80">{room?.category}</p>
            </div>
            <div className="space-y-1">
              <p className="uppercase font-black tracking-widest">Nights</p>
              <p className="text-white font-bold">
                {booking?.checkIn && booking?.checkOut
                  ? `${Math.max(1, Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 86400000))}`
                  : '—'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="uppercase font-black tracking-widest">Check-In</p>
              <p className="text-white">{booking?.checkIn ? new Date(booking.checkIn).toLocaleDateString() : '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="uppercase font-black tracking-widest">Check-Out</p>
              <p className="text-white">{booking?.checkOut ? new Date(booking.checkOut).toLocaleDateString() : '—'}</p>
            </div>
          </div>

          <div className="text-center mt-2">
            <p className="uppercase text-gray-400 text-[9px] tracking-widest font-black">Amount</p>
            <p className="text-primary text-2xl md:text-3xl font-bold serif-font">₦{booking?.amount?.toLocaleString()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={downloadPDF}
            className="w-full bg-primary text-black py-3 rounded font-black text-xs uppercase tracking-widest hover:bg-[#B04110] transition-all"
          >
            Download PDF
          </button>
          <Link
            to="/profile"
            className="w-full bg-primary text-black py-3 rounded font-black text-xs uppercase tracking-widest hover:bg-[#B04110] transition-all text-center"
          >
            View My Reservation
          </Link>
          <Link
            to="/"
            className="w-full border border-white/10 text-gray-400 py-3 rounded font-black text-xs uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all text-center"
          >
            Return Home
          </Link>
        </div>

        {/* Pending Notice */}
        {isPending && (
          <p className="text-[9px] text-gray-500 italic text-center mt-2">
            * Your room is held temporarily. Updates occur automatically once payment is confirmed.
          </p>
        )}
      </div>
    </div>
  );
};

export default BookingConfirmation;
