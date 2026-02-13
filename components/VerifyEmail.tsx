import { api } from "@/services/api";
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true; // prevent state updates if unmounted

    const triggerVerification = async () => {
      const userId = searchParams.get("userId");
      const token = searchParams.get("token");

      if (!userId || !token) {
        if (isMounted) setStatus("error");
        return;
      }

      try {
        await api.verifyEmail(userId, token);

        if (isMounted) {
          setStatus("success");
          setTimeout(() => navigate("/auth?verified=1"), 2500);
        }
      } catch {
        if (isMounted) setStatus("error");
      }
    };

    triggerVerification();

    return () => {
      isMounted = false;
    };
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-center p-6">
      <div className="max-w-md space-y-6">
          <div className="w-16 h-16 md:w-20 md:h-20 ">
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
