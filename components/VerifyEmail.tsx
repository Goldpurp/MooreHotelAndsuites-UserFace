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
    let redirectTimer: number | undefined;

    const triggerVerification = async () => {
      const userId = searchParams.get("userId");
      const token = searchParams.get("token");

      // Remove the one-time token from browser history before any third-party
      // image or font request can inherit the page URL as a referrer.
      window.history.replaceState(null, "", "/verify-email");

      if (!userId || !token) {
        if (isMounted) setStatus("error");
        return;
      }

      try {
        await api.verifyEmail(userId, token);

        if (isMounted) {
          setStatus("success");
          redirectTimer = window.setTimeout(() => navigate("/auth?verified=1"), 4000);
        }
      } catch {
        if (isMounted) setStatus("error");
      }
    };

    triggerVerification();
    return () => {
      isMounted = false;
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, [searchParams, navigate]);


  if (status === "loading") {
    return (
      <AestheticLoader
        message="Verifying Email"
        subtext="Checking our records..."
        isFullPage
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-6 pt-28">
      <div className="w-full max-w-md">
        <div className="ui-card flex flex-col items-center p-8 text-center shadow-2xl sm:p-10">

          <div className="mb-8 size-16 overflow-hidden rounded border border-primary/30 bg-[#e4e6e8]">
            <img
              src="https://res.cloudinary.com/dxryndnhl/image/upload/v1777386017/slazzer-preview-w1yad_jizukz.png"
              alt="Moore Hotels"
              className="h-full w-full object-cover"
            />
          </div>

          {status === "success" && (
            <div className="route-transition">
              <h1 className="ui-card-title mb-2 italic text-primary">
                Email Verified
              </h1>
              <div className="mx-auto my-4 h-px w-12 bg-primary/50" />
              <p className="ui-copy text-sm">
                Your account is ready. You can sign in shortly.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="route-transition">
              <h1 className="ui-card-title mb-2 italic text-rose-400">
                Verification Failed
              </h1>
              <p className="ui-copy mb-8 text-sm">
                This verification link is invalid or has expired.
              </p>
              <button
                onClick={() => navigate("/auth")}
                className="ui-button ui-button-primary"
              >
                Return to sign in
              </button>
            </div>
          )}
        </div>

        <p className="mt-7 text-center text-xs text-zinc-600">Secure guest access · Moore Hotels &amp; Suites</p>
      </div>
    </div>
  );
};

export default VerifyEmail;
