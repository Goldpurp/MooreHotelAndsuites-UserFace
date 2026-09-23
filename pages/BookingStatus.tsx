import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AestheticLoader from "../components/AestheticLoader";

const BookingStatus: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");
  const accessToken = new URLSearchParams(window.location.hash.slice(1)).get("accessToken");

  useEffect(() => {
    if (code && accessToken) {
      navigate("/manage-booking", {
        replace: true,
        state: { lookupCode: code.trim().toUpperCase(), guestAccessToken: accessToken },
      });
    } else if (code) {
      // A code without a token can't be auto-verified; just prefill the form.
      navigate("/manage-booking", {
        replace: true,
        state: { prefillCode: code.trim().toUpperCase() },
      });
    } else {
      navigate("/manage-booking", { replace: true });
    }
  }, [code, accessToken, navigate]);

  return (
    <AestheticLoader
      message="Opening your booking"
      subtext="Verifying the reference"
    />
  );
};

export default BookingStatus;
