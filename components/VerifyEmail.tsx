import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const navigate = useNavigate();

  useEffect(() => {
    const triggerVerification = async () => {
      const userId = searchParams.get("userId");
      const token = searchParams.get("token");

      if (!userId || !token) {
        setStatus("error");
        return;
      }

      try {
        // CALL THE BACKEND API
        const response = await fetch(
          `https://api.moorehotelandsuites.com{userId}&token=${token}`
        );

        if (response.ok) {
          setStatus("success");
          // Give the user 3 seconds to see the success message, then go to Login
          setTimeout(() => navigate("/auth"), 3000);
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
      }
    };

    triggerVerification();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-center p-6">
      <div className="max-w-md space-y-6">
        <div className="text-primary text-6xl font-black mb-8 animate-pulse">M</div>
        {status === "loading" && (
          <p className="text-white text-xl italic serif-font">Syncing with the Moore Registry...</p>
        )}
        {status === "success" && (
          <div className="space-y-4">
            <h2 className="text-white text-3xl serif-font italic">Identity Confirmed</h2>
            <p className="text-gray-400 uppercase tracking-widest text-sm">Your sanctuary is now ready. Redirecting to access...</p>
          </div>
        )}
        {status === "error" && (
          <div className="space-y-4">
            <h2 className="text-red-500 text-3xl serif-font italic">Security Failure</h2>
            <p className="text-gray-400 text-sm">This link is invalid or has expired.</p>
            <button onClick={() => navigate("/auth")} className="text-primary border border-primary px-8 py-3 mt-6 hover:bg-primary hover:text-black transition-all">
              RETURN TO REGISTRY
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
