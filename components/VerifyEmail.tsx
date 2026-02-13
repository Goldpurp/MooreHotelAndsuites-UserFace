import { api } from "@/services/api";
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AestheticLoader from "@/components/AestheticLoader";

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

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
          setTimeout(() => navigate("/auth?verified=1"), 4000);
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


  if (status === "loading") {
    return (
      <AestheticLoader
        message="Verifying Identity"
        subtext="Consulting the Moore Registry..."
        isFullPage
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full">
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-10 shadow-2xl flex flex-col items-center text-center">

          <div className="mb-10 w-20 h-20 overflow-hidden border border-amber-500/30">
            <img
              src="https://res.cloudinary.com/diovckpyb/image/upload/v1770752301/d6qqrpcxf1cqnkm9mzm5.jpg"
              alt="Moore Hotels"
              className="w-full h-full object-cover"
            />
          </div>

          {status === "success" && (
            <div className="animate-in fade-in zoom-in duration-700">
              <h2 className="text-[#354c9d] text-4xl font-serif italic mb-2">
                Identity Confirmed
              </h2>
              <div className="h-px w-12 bg-[#31458E] mx-auto my-4" />
              <p className="text-primary uppercase tracking-[0.2em] text-[10px] leading-relaxed">
                Your sanctuary is being prepared. Access granted shortly.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-rose-400 text-3xl font-serif italic mb-2">
                Verification Failed
              </h2>
              <p className="text-zinc-500 text-sm font-light mb-8">
                This verification link is invalid or has expired.
              </p>
              <button
                onClick={() => navigate("/auth")}
                className="group relative px-10 py-3 overflow-hidden border border-amber-500/30 text-amber-500 text-[10px] tracking-[0.3em] transition-all hover:text-black"
              >
                <span className="absolute inset-0 w-0 bg-amber-500 transition-all duration-300 group-hover:w-full" />
                <span className="relative z-10 uppercase">Return to Portal</span>
              </button>
            </div>
          )}
        </div>

        <p className="mt-8 text-[9px] text-zinc-700 tracking-[0.5em] uppercase text-center">
          © Moore Hotels & Suites • Private Access
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
