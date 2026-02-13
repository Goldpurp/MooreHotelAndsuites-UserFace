import { api } from "@/services/api";
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
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
        const response = await api.verifyEmail(userId, token);

        setStatus("success");
        setTimeout(() => navigate("/auth"), 3000);
      } catch (err) {
        setStatus("error");
      }
    };

    triggerVerification();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-center p-6">
      <div className="max-w-md space-y-6">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-sm flex items-center justify-center text-black font-black text-2xl md:text-3xl shadow-[0_0_60px_rgba(234,179,8,0.5)] animate-luxury-logo">
          <img
            src="https://res.cloudinary.com/diovckpyb/image/upload/v1770752301/d6qqrpcxf1cqnkm9mzm5.jpg"
            alt="Moore Hotels & Suites"
            loading="lazy"
          />
        </div>
        {status === "loading" && (
          <p className="text-white text-xl italic serif-font">
            Syncing with the Moore Registry...
          </p>
        )}
        {status === "success" && (
          <div className="space-y-4">
            <h2 className="text-white text-3xl serif-font italic">
              Identity Confirmed
            </h2>
            <p className="text-gray-400 uppercase tracking-widest text-sm">
              Your sanctuary is now ready. Redirecting to access...
            </p>
          </div>
        )}
        {status === "error" && (
          <div className="space-y-4">
            <h2 className="text-red-500 text-3xl serif-font italic">
              Security Failure
            </h2>
            <p className="text-gray-400 text-sm">
              This link is invalid or has expired.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="text-primary border border-primary px-8 py-3 mt-6 hover:bg-primary hover:text-black transition-all"
            >
              RETURN TO REGISTRY
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
