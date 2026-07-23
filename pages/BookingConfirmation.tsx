import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { api, getTrustedPaymentUrl } from "../services/api";
import { Booking, Room, BookingStatus } from "../types";
import AestheticLoader from "../components/AestheticLoader";

const formatStatus = (value: string | null | undefined) =>
  value ? value.replace(/([a-z])([A-Z])/g, "$1 $2") : "Not selected";

const BookingConfirmation: React.FC = () => {
  const { code: routeCode } = useParams();
  const code = routeCode?.trim().toUpperCase() || "";
  const location = useLocation();
  const stateBooking = location.state?.booking as Booking | null;
  const rememberedEmail = code ? api.getRememberedBookingEmail(code) : "";

  const [booking, setBooking] = useState<Booking | null>(
    stateBooking?.bookingCode?.toUpperCase() === code ? stateBooking : null,
  );
  const [room, setRoom] = useState<Room | null>(null);
  const [lookupEmail, setLookupEmail] = useState(rememberedEmail);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      if (!code) {
        if (active) {
          setError("A booking reference is required.");
          setLoading(false);
        }
        return;
      }

      let currentBooking =
        stateBooking?.bookingCode?.toUpperCase() === code ? stateBooking : null;

      if (!currentBooking && rememberedEmail) {
        try {
          currentBooking = await api.lookupBooking(code, rememberedEmail);
          if (active) setBooking(currentBooking);
        } catch {
          if (active) {
            setError("Enter the booking email to securely retrieve this reservation.");
          }
        }
      }

      if (currentBooking) {
        try {
          const roomData = await api.getRoomById(currentBooking.roomId);
          if (active) setRoom(roomData);
        } catch {
          if (active) setError("The booking was found, but its room details are unavailable.");
        }
      } else if (!rememberedEmail && active) {
        setError("Enter the booking email to securely retrieve this reservation.");
      }

      if (active) setLoading(false);
    };

    initialize();
    return () => {
      active = false;
    };
  }, [code]);

  useEffect(() => {
    if (!booking || booking.status !== BookingStatus.Pending || !code) return;

    const email = booking.guestEmail || api.getRememberedBookingEmail(code);
    if (!email) return;

    const interval = window.setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const updatedBooking = await api.lookupBooking(code, email);
        setBooking(updatedBooking);
      } catch {
        // Keep the last verified record and retry while the payment is pending.
      }
    }, 10_000);

    return () => window.clearInterval(interval);
  }, [booking?.status, booking?.guestEmail, code]);

  const handleLookup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!code || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lookupEmail.trim())) {
      setError("Enter the valid email address used for this booking.");
      return;
    }

    setVerifying(true);
    setError(null);
    try {
      const verifiedBooking = await api.lookupBooking(code, lookupEmail);
      const roomData = await api.getRoomById(verifiedBooking.roomId);
      api.rememberBookingLookup(code, lookupEmail);
      setBooking(verifiedBooking);
      setRoom(roomData);
    } catch (lookupError) {
      setError(
        lookupError instanceof Error
          ? lookupError.message
          : "The booking could not be verified.",
      );
    } finally {
      setVerifying(false);
    }
  };

  const printBooking = () => window.print();

  if (loading) {
    return <AestheticLoader message="Retrieving your booking" subtext="Verifying details" />;
  }

  if (!booking || !room) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark px-4 py-32 sm:px-6">
        <form
          onSubmit={handleLookup}
          className="ui-card w-full max-w-md p-7 text-center shadow-2xl sm:p-9"
        >
          <span className="mx-auto grid size-14 place-items-center rounded-full border border-primary/25 bg-primary/10 text-primary"><span className="material-symbols-outlined text-3xl" aria-hidden="true">shield_lock</span></span>
          <div className="mt-6">
            <p className="ui-eyebrow">Secure lookup</p>
            <h1 className="ui-card-title mt-2 italic text-white">Verify your booking</h1>
            <p className="mt-3 text-sm text-gray-400">
              Reference <span className="font-mono text-white">{code || "—"}</span>
            </p>
          </div>
          <label className="mt-7 block text-left">
            <span className="ui-label">Booking email</span>
            <input
              type="email"
              required
              autoComplete="email"
              maxLength={254}
              value={lookupEmail}
              onChange={(event) => setLookupEmail(event.target.value)}
              className="ui-input"
              placeholder="email@example.com"
            />
          </label>
          {error && <p className="mt-4 text-sm text-red-400" role="alert">{error}</p>}
          <button
            type="submit"
            disabled={verifying || !code}
            className="ui-button ui-button-primary mt-6 w-full"
          >
            {verifying && <span className="material-symbols-outlined animate-spin" aria-hidden="true">progress_activity</span>}
            {verifying ? "Verifying" : "Retrieve booking"}
          </button>
          <Link to="/manage-booking" className="mt-3 inline-flex min-h-11 items-center text-sm text-gray-500 hover:text-white">
            Use another reference
          </Link>
        </form>
      </div>
    );
  }

  const isPending = booking.status === BookingStatus.Pending;
  const isCancelled = [BookingStatus.Cancelled, BookingStatus.NoShow].includes(
    booking.status,
  );
  const statusLabel =
    booking.status === BookingStatus.CheckedOut
      ? "Completed"
      : booking.status === BookingStatus.CheckedIn
        ? "Checked In"
        : booking.status;
  const statusColor = isPending
    ? "border-primary bg-primary/10 text-primary"
    : isCancelled
      ? "border-red-500 bg-red-500/10 text-red-500"
      : "border-green-500 bg-green-500/10 text-green-500";
  const trustedPaymentUrl = isPending
    ? getTrustedPaymentUrl(booking.paymentUrl)
    : null;

  return (
    <div className="booking-print-page flex min-h-screen items-center justify-center bg-background-dark px-4 py-32 sm:px-6">
      <div className="booking-print-card ui-card w-full max-w-2xl p-6 shadow-2xl sm:p-10">
        <div className="flex flex-col items-center text-center">
          <div className={`grid size-14 place-items-center rounded-full border ${statusColor}`}>
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">
              {isPending ? "hourglass_top" : isCancelled ? "cancel" : "check_circle"}
            </span>
          </div>
          <p className="ui-eyebrow mt-5">Verified booking record</p>
          <h1 className="ui-card-title mt-2 italic text-white">{statusLabel}</h1>
          <p className="mt-3 text-sm text-gray-400">{booking.guestFirstName} {booking.guestLastName}</p>
        </div>

        <div className="mt-7 rounded border border-white/10 bg-black/25 p-5 sm:p-6">
          <div className="text-center">
            <p className="ui-label">Reference code</p>
            <p className="break-all font-mono text-xl font-bold tracking-[0.08em] text-white sm:text-2xl">
              {booking.bookingCode}
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-5 border-t border-white/10 pt-6 text-sm sm:grid-cols-4">
            <BookingField label="Room" value={room.name} detail={room.category} />
            <BookingField
              label="Nights"
              value={String(
                Math.max(
                  1,
                  Math.ceil(
                    (new Date(booking.checkOut).getTime() -
                      new Date(booking.checkIn).getTime()) /
                      86_400_000,
                  ),
                ),
              )}
            />
            <BookingField label="Check-In" value={new Date(booking.checkIn).toLocaleDateString()} />
            <BookingField label="Check-Out" value={new Date(booking.checkOut).toLocaleDateString()} />
          </div>
          <div className="mt-6 border-t border-white/10 pt-6 text-center">
            <p className="ui-label">Amount</p>
            <p className="font-display text-3xl font-semibold text-primary sm:text-4xl">
              ₦{booking.amount.toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Payment: {formatStatus(booking.paymentStatus)}
              {booking.paymentMethod ? ` · ${formatStatus(booking.paymentMethod)}` : ""}
            </p>
          </div>
        </div>

        {booking.notificationMessage && (
          <p className="mt-5 rounded border border-primary/20 bg-primary/5 p-4 text-center text-sm leading-6 text-gray-300">
            {booking.notificationMessage}
          </p>
        )}

        {booking.status === BookingStatus.Pending && booking.paymentExpiresAtUtc && (
          <p className="mt-5 rounded border border-amber-400/30 bg-amber-400/10 p-4 text-center text-sm leading-6 text-amber-100">
            Payment must be confirmed by{' '}
            <strong>{new Date(booking.paymentExpiresAtUtc).toLocaleString()}</strong>.
            {' '}If it is not confirmed within one hour, this booking is cancelled automatically so the room becomes available again.
          </p>
        )}

        {booking.paymentInstruction && (
          <section className="mt-5 rounded border border-white/10 bg-black/20 p-5" aria-labelledby="transfer-instructions-title">
            <p className="ui-label">Direct transfer</p>
            <h2 id="transfer-instructions-title" className="text-base font-semibold text-white">Payment instructions</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-300">{booking.paymentInstruction}</p>
          </section>
        )}

        {trustedPaymentUrl && (
          <a
            href={trustedPaymentUrl}
            rel="noopener noreferrer"
            className="print-hidden ui-button ui-button-primary mt-7 w-full"
          >
            <span className="material-symbols-outlined" aria-hidden="true">payments</span>
            Continue secure Monnify payment
          </a>
        )}

        <div className={`print-hidden grid gap-3 sm:grid-cols-3 ${trustedPaymentUrl ? "mt-3" : "mt-7"}`}>
          <button
            onClick={printBooking}
            className="ui-button ui-button-primary w-full"
          >
            <span className="material-symbols-outlined" aria-hidden="true">print</span> Print or save PDF
          </button>
          <Link
            to="/manage-booking"
            className="ui-button ui-button-secondary w-full"
          >
            Another booking
          </Link>
          <Link
            to="/"
            className="ui-button ui-button-secondary w-full"
          >
            Return Home
          </Link>
        </div>

        {isPending && (
          <p className="mt-5 text-center text-sm italic text-gray-500">
            Your room is held temporarily while payment is verified.
          </p>
        )}
      </div>
    </div>
  );
};

const BookingField = ({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) => (
  <div>
    <p className="ui-label">{label}</p>
    <p className="font-semibold text-white">{value}</p>
    {detail && <p className="mt-1 text-xs text-primary">{detail}</p>}
  </div>
);

export default BookingConfirmation;
