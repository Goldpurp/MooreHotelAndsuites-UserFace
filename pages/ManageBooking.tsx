import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Booking, Room } from "../types";
import BookingStatusModal from "../components/BookingStatusModal";

const ManageBooking: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingCode, setBookingCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [statusBooking, setStatusBooking] = useState<Booking | null>(null);
  const [statusRoom, setStatusRoom] = useState<Room | null>(null);

  const showBookingStatus = async (
    code: string,
    lookupEmail: string,
    guestAccessToken: string,
  ) => {
    const booking = await api.lookupBooking(code, lookupEmail, guestAccessToken);
    api.rememberBookingLookup(code, booking.guestEmail || lookupEmail, guestAccessToken);
    setStatusBooking(booking);
    setStatusRoom(null);
    if (booking.roomId && booking.roomId !== "undefined") {
      try {
        setStatusRoom(await api.getRoomById(booking.roomId));
      } catch {
        // Room details are optional in the status modal.
      }
    }
  };

  // A guest who followed the emailed secure link lands here with the code
  // and access token handed off in router state (see BookingStatus.tsx) —
  // show the result immediately instead of asking them to fill the form again.
  useEffect(() => {
    const state = location.state as
      | { lookupCode?: string; guestAccessToken?: string; prefillCode?: string }
      | null;
    if (!state?.lookupCode && !state?.prefillCode) return;

    navigate(location.pathname, { replace: true, state: null });

    if (state.lookupCode && state.guestAccessToken) {
      const code = state.lookupCode.trim().toUpperCase();
      setBookingCode(code);
      setLoading(true);
      setError("");
      showBookingStatus(code, api.getRememberedBookingEmail(code), state.guestAccessToken)
        .catch((statusError) => {
          setError(
            statusError instanceof Error
              ? statusError.message
              : "This secure link is invalid or has expired.",
          );
        })
        .finally(() => setLoading(false));
    } else if (state.prefillCode) {
      setBookingCode(state.prefillCode.trim().toUpperCase());
    }
    // Runs once on mount to consume the one-time hand-off from BookingStatus.tsx.
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedCode = bookingCode.trim().toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[A-Z0-9-]{4,32}$/.test(normalizedCode)) {
      setError("Enter a valid booking reference.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter the email address used for the booking.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");
    try {
      // A previously verified guest already holds a secure access token for
      // this reference — reuse it to show the status instantly rather than
      // sending another email.
      const remembered = api.getRememberedBookingAccess(normalizedCode);
      if (remembered.guestAccessToken && remembered.email === normalizedEmail) {
        try {
          await showBookingStatus(normalizedCode, normalizedEmail, remembered.guestAccessToken);
          return;
        } catch {
          // The remembered token may have expired; fall back to emailing a new link.
        }
      }

      await api.requestBookingAccessLink(normalizedCode, normalizedEmail);
      setNotice("If those details match, a secure booking link is on its way. Check your inbox and spam folder.");
    } catch (lookupError) {
      setError(
        lookupError instanceof Error
          ? lookupError.message
          : "The secure link could not be requested.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-dark px-4 py-32 sm:px-6">
      <form
        onSubmit={handleSubmit}
        className="ui-card w-full max-w-lg p-7 shadow-2xl sm:p-10"
      >
        <div className="text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full border border-primary/25 bg-primary/10 text-primary"><span className="material-symbols-outlined text-3xl" aria-hidden="true">travel_explore</span></span>
          <p className="ui-eyebrow mt-5">Secure lookup</p>
          <h1 className="ui-card-title mt-2 italic text-white">Manage your booking</h1>
          <p className="ui-copy mt-3 text-sm">
            Use your reference and booking email to view the latest verified status.
          </p>
        </div>

        <label className="mt-7 block">
          <span className="ui-label">Booking reference</span>
          <input
            required
            autoCapitalize="characters"
            autoComplete="off"
            maxLength={32}
            value={bookingCode}
            onChange={(event) => setBookingCode(event.target.value)}
            placeholder="MHS00343"
            className="ui-input font-mono uppercase"
          />
        </label>

        <label className="mt-5 block">
          <span className="ui-label">Booking email</span>
          <input
            required
            type="email"
            autoComplete="email"
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="email@example.com"
            className="ui-input"
          />
        </label>

        {error && (
          <p role="alert" className="mt-4 text-center text-sm text-red-400">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="mt-4 text-center text-sm text-emerald-300">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="ui-button ui-button-primary mt-6 w-full"
        >
          {loading && <span className="material-symbols-outlined animate-spin" aria-hidden="true">progress_activity</span>}
          {loading ? "Checking" : "Check booking status"}
        </button>
      </form>

      <BookingStatusModal
        isOpen={Boolean(statusBooking)}
        onClose={() => setStatusBooking(null)}
        booking={statusBooking}
        room={statusRoom}
      />
    </div>
  );
};

export default ManageBooking;
