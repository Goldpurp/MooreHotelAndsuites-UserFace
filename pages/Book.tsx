import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AestheticLoader from "../components/AestheticLoader";
import { api } from "../services/api";

const Book: React.FC = () => {
  const navigate = useNavigate();
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get(
      "bookingVerificationToken",
    );
    window.history.replaceState(null, "", "/book");

    if (!token || token.length < 40 || token.length > 128) {
      setInvalid(true);
      return;
    }

    api.rememberBookingVerificationToken(token);
    const pending = api.getPendingBookingVerification();
    if (pending) {
      const query = new URLSearchParams({
        checkIn: pending.checkIn,
        checkOut: pending.checkOut,
        emailVerified: "1",
      });
      navigate(`/checkout/${encodeURIComponent(pending.roomId)}?${query.toString()}`, { replace: true });
    } else {
      navigate("/rooms?emailVerified=1", { replace: true });
    }
  }, [navigate]);

  if (!invalid) {
    return (
      <AestheticLoader
        message="Email confirmed"
        subtext="Choose your room to complete the booking"
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-dark px-4 py-32">
      <div className="ui-card max-w-md p-8 text-center">
        <h1 className="ui-card-title text-white">Verification link unavailable</h1>
        <p className="ui-copy mt-3">This booking email link is invalid or has expired. Start checkout again to request a fresh link.</p>
        <button type="button" onClick={() => navigate("/rooms")} className="ui-button ui-button-primary mt-6">View rooms</button>
      </div>
    </div>
  );
};

export default Book;
