import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AestheticLoader from "../components/AestheticLoader";

const BookingStatus: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");
  const accessToken = new URLSearchParams(window.location.hash.slice(1)).get("accessToken");

  useEffect(() => {
    if (code) {
      navigate(`/booking-confirmation/${encodeURIComponent(code.trim().toUpperCase())}`, {
        replace: true,
        state: { guestAccessToken: accessToken || "" },
      });
    }
    else navigate("/manage-booking", { replace: true });
  }, [code, accessToken, navigate]);

  return (
    <AestheticLoader
      message="Opening your booking"
      subtext="Verifying the reference"
    />
  );
};

export default BookingStatus;
