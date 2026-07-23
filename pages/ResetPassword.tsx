import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationModal from "../components/NotificationModal";
import { api } from "../services/api";
import { appConfig } from "../config/environment";

function trustedSignInUrl(value: string | undefined): string {
  if (!value) return "/auth";
  try {
    const url = new URL(value, window.location.origin);
    const isCurrentApp = url.origin === window.location.origin;
    const isStaffPortal =
      url.protocol === "https:" &&
      ["admin.moorehotelandsuites.com", "admin-development.moorehotelandsuites.com"].includes(url.hostname);
    const isLocalPortal =
      !appConfig.isProduction &&
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(url.hostname);
    return isCurrentApp || isStaffPortal || isLocalPortal ? url.toString() : "/auth";
  } catch {
    return "/auth";
  }
}

function readResetParameters() {
  const params = new URLSearchParams(window.location.search);
  return {
    email: params.get("email")?.trim().toLowerCase() ?? "",
    token: params.get("token") ?? "",
  };
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [resetParameters] = useState(readResetParameters);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [signInUrl, setSignInUrl] = useState("/auth");
  const [modal, setModal] = useState({
    show: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
  });

  useEffect(() => {
    // Keep password-reset credentials out of browser history and referrer data.
    window.history.replaceState(null, "", "/reset-password");
  }, []);

  const validate = () => {
    if (!resetParameters.email || !resetParameters.token) {
      return "This password-reset link is incomplete or expired. Request a new one.";
    }
    if (
      newPassword.length < 8 ||
      !/[a-z]/.test(newPassword) ||
      !/[A-Z]/.test(newPassword) ||
      !/\d/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      return "Use 8+ characters with upper/lowercase, a number, and a symbol.";
    }
    if (newPassword !== confirmNewPassword) return "The passwords do not match.";
    return "";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    const validationError = validate();
    setError(validationError);
    if (validationError) return;

    setLoading(true);
    try {
      const response = await api.resetPassword({
        email: resetParameters.email,
        token: resetParameters.token,
        newPassword,
        confirmNewPassword,
      });
      setCompleted(true);
      setSignInUrl(trustedSignInUrl(response.signInUrl));
      setNewPassword("");
      setConfirmNewPassword("");
      setModal({
        show: true,
        title: "Password Updated",
        message: "Your password has been changed. Sign in again with your new password.",
        type: "success",
      });
    } catch (caught: unknown) {
      setModal({
        show: true,
        title: "Reset Failed",
        message: caught instanceof Error ? caught.message : "The reset link is invalid or expired.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModal((current) => ({ ...current, show: false }));
    if (completed) {
      if (signInUrl.startsWith("/")) navigate(signInUrl, { replace: true });
      else window.location.assign(signInUrl);
    }
  };

  return (
    <div className="flex min-h-screen items-center bg-background-dark px-4 py-32 text-white sm:px-6">
      <NotificationModal
        isOpen={modal.show}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

      <section className="ui-card mx-auto w-full max-w-xl p-7 shadow-2xl sm:p-10">
        <div className="mb-8 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full border border-primary/25 bg-primary/10 text-primary"><span className="material-symbols-outlined text-3xl" aria-hidden="true">lock_reset</span></span>
          <p className="ui-eyebrow mt-5">Account security</p>
          <h1 className="ui-card-title mt-2 italic">Choose a new password</h1>
          <p className="ui-copy mt-3 text-sm">
            Enter a strong password for {resetParameters.email || "your Moore account"}.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="ui-label">New password</span>
            <input
              required
              type="password"
              autoComplete="new-password"
              maxLength={128}
              disabled={loading || completed}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="ui-input"
            />
          </label>

          <label className="block">
            <span className="ui-label">Confirm new password</span>
            <input
              required
              type="password"
              autoComplete="new-password"
              maxLength={128}
              disabled={loading || completed}
              value={confirmNewPassword}
              onChange={(event) => setConfirmNewPassword(event.target.value)}
              className="ui-input"
            />
          </label>

          {error && <p className="text-sm text-red-400" role="alert">{error}</p>}

          <button
            type="submit"
            disabled={loading || completed}
            className="ui-button ui-button-primary w-full"
          >
            {loading && <span className="material-symbols-outlined animate-spin" aria-hidden="true">progress_activity</span>}
            {loading ? "Updating password" : "Update password"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-500">
          Need a new link? <Link to="/auth" className="text-primary hover:text-white">Return to sign in</Link>
        </p>
      </section>
    </div>
  );
};

export default ResetPassword;
