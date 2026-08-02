import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { ApplicationUser } from "../types";
import NotificationModal from "../components/NotificationModal";
import FormField from "../components/ui/FormField";

interface AuthProps {
  onLogin: (user: ApplicationUser, token: string) => void;
}

type AuthMode = "login" | "register" | "forgot" | "verify";
type FormData = { email: string; password: string; firstName: string; lastName: string; phone: string };
type FormField = keyof FormData;

const blankForm: FormData = { email: "", password: "", firstName: "", lastName: "", phone: "" };

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [formData, setFormData] = useState<FormData>(blankForm);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormField, string>>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modal, setModal] = useState<{ show: boolean; title: string; message: string; type: "success" | "error" | "info" }>({ show: false, title: "", message: "", type: "info" });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (new URLSearchParams(location.search).get("verified") === "1") {
      setModal({ show: true, title: "Email verified", message: "Your account is ready. Sign in to continue.", type: "success" });
      navigate("/auth", { replace: true });
    }
  }, [location.search, navigate]);

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setFieldErrors({});
    setShowPassword(false);
  };

  const updateField = (field: FormField, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const errors: Partial<Record<FormField, string>> = {};
    const email = formData.email.trim();
    if (!email) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";

    if ((mode === "login" || mode === "register") && !formData.password) {
      errors.password = "Password is required.";
    }
    if (mode === "register") {
      if (!formData.firstName.trim()) errors.firstName = "First name is required.";
      else if (formData.firstName.trim().length > 80) errors.firstName = "First name is too long.";
      if (!formData.lastName.trim()) errors.lastName = "Last name is required.";
      else if (formData.lastName.trim().length > 80) errors.lastName = "Last name is too long.";
      if (!/^\+?[0-9 ()-]{7,20}$/.test(formData.phone.trim())) errors.phone = "Enter a valid phone number.";
      if (formData.password.length < 8 || !/[a-z]/.test(formData.password) || !/[A-Z]/.test(formData.password) || !/\d/.test(formData.password) || !/[^A-Za-z0-9]/.test(formData.password)) {
        errors.password = "Use 8+ characters with upper and lowercase, a number, and a symbol.";
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading || !validate()) return;
    setLoading(true);
    try {
      if (mode === "forgot") {
        await api.resetPasswordRequest(formData.email.trim().toLowerCase());
        setModal({ show: true, title: "Check your email", message: "If an account matches that address, reset instructions are on the way.", type: "success" });
        return;
      }
      if (mode === "verify") {
        await api.resendVerification(formData.email.trim().toLowerCase());
        setModal({ show: true, title: "Verification email requested", message: "If the account still needs verification, a fresh activation link is on the way.", type: "success" });
        return;
      }
      if (mode === "register") {
        const response = await api.register({
          ...formData,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
        });
        setModal({ show: true, title: "Account created", message: response.message, type: "success" });
        setMode("login");
        setFormData((current) => ({ ...current, password: "" }));
        return;
      }
      const response = await api.login({ email: formData.email.trim().toLowerCase(), password: formData.password });
      if (response?.token) {
        api.setToken(response.token);
        const user = await api.getMe();
        onLogin(user, response.token);
        navigate("/profile");
      }
    } catch (error: unknown) {
      if (mode === "login") api.setToken(null);
      setModal({
        show: true,
        title: mode === "register" ? "Account not created" : mode === "forgot" || mode === "verify" ? "Request not completed" : "Sign-in failed",
        message: error instanceof Error ? error.message : "The request could not be completed. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const heading =
    mode === "register"
      ? "Create your account"
      : mode === "forgot"
        ? "Reset your password"
        : mode === "verify"
          ? "Verify your email"
          : "Welcome back";
  const intro =
    mode === "register"
      ? "Save your details and keep track of your stays."
      : mode === "forgot"
        ? "Enter your account email and we’ll send reset instructions."
        : mode === "verify"
          ? "Request a fresh activation link for an account that is not yet verified."
          : "Sign in to view and manage your bookings.";
  const submitLabel = loading
    ? mode === "register"
      ? "Creating account"
      : mode === "forgot" || mode === "verify"
        ? "Sending link"
        : "Signing in"
    : mode === "register"
      ? "Create account"
      : mode === "forgot"
        ? "Send reset link"
        : mode === "verify"
          ? "Send verification link"
          : "Sign in";

  return (
    <div className="grid min-h-screen bg-background-dark pt-24 lg:grid-cols-2 lg:pt-0">
      <NotificationModal isOpen={modal.show} onClose={() => setModal((current) => ({ ...current, show: false }))} title={modal.title} message={modal.message} type={modal.type} />

      <div className="relative hidden min-h-screen overflow-hidden lg:block">
        <img src="https://res.cloudinary.com/dxryndnhl/image/upload/v1779385274/Screenshot_2026-05-20_at_6.27.21_pm_dtspvl.png" alt="A serene Moore guest suite" className="absolute inset-0 h-full w-full object-cover opacity-60 image-luxury" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-background-dark" />
        <div className="absolute inset-0 flex items-end p-12 xl:p-16">
          <div className="max-w-xl"><p className="ui-eyebrow">Guest account</p><h2 className="ui-section-title mt-4 italic text-white">Your stay, kept close.</h2><p className="ui-copy mt-5 text-gray-300">Review bookings, manage your profile, and keep important stay information in one place.</p></div>
        </div>
      </div>

      <section className="flex items-center justify-center px-4 py-14 sm:px-8 lg:min-h-screen lg:px-12 lg:pb-16 lg:pt-32">
        <div className="w-full max-w-md">
          <div className="mb-8"><p className="ui-eyebrow">Secure guest access</p><h1 className="ui-page-title mt-3 italic text-white">{heading}</h1><p className="ui-copy mt-4">{intro}</p></div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {mode === "register" && (
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField htmlFor="firstName" label="First name" error={fieldErrors.firstName}><input id="firstName" type="text" autoComplete="given-name" maxLength={80} disabled={loading} value={formData.firstName} onChange={(event) => updateField("firstName", event.target.value)} className="ui-input" aria-invalid={Boolean(fieldErrors.firstName)} /></FormField>
                <FormField htmlFor="lastName" label="Last name" error={fieldErrors.lastName}><input id="lastName" type="text" autoComplete="family-name" maxLength={80} disabled={loading} value={formData.lastName} onChange={(event) => updateField("lastName", event.target.value)} className="ui-input" aria-invalid={Boolean(fieldErrors.lastName)} /></FormField>
              </div>
            )}

            {mode === "register" && <FormField htmlFor="phone" label="Phone number" error={fieldErrors.phone}><input id="phone" type="tel" autoComplete="tel" maxLength={20} placeholder="+234 …" disabled={loading} value={formData.phone} onChange={(event) => updateField("phone", event.target.value)} className="ui-input" aria-invalid={Boolean(fieldErrors.phone)} /></FormField>}

            <FormField htmlFor="email" label="Email address" error={fieldErrors.email}><input id="email" type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" disabled={loading} value={formData.email} onChange={(event) => updateField("email", event.target.value)} className="ui-input" aria-invalid={Boolean(fieldErrors.email)} /></FormField>

            {(mode === "login" || mode === "register") && (
              <FormField htmlFor="password" label="Password" error={fieldErrors.password} hint={mode === "register" ? "8+ characters with upper/lowercase, a number, and a symbol." : undefined}>
                <div className="relative">
                  <input id="password" type={showPassword ? "text" : "password"} autoComplete={mode === "register" ? "new-password" : "current-password"} disabled={loading} value={formData.password} onChange={(event) => updateField("password", event.target.value)} className="ui-input pr-14" aria-invalid={Boolean(fieldErrors.password)} />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute inset-y-0 right-1 grid w-12 place-items-center text-gray-500 hover:text-white" aria-label={showPassword ? "Hide password" : "Show password"}>
                    <span className="material-symbols-outlined" aria-hidden="true">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </FormField>
            )}

            {mode === "login" && (
              <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1">
                <button type="button" disabled={loading} onClick={() => changeMode("verify")} className="min-h-11 text-sm font-semibold text-gray-400 hover:text-white">Resend verification</button>
                <button type="button" disabled={loading} onClick={() => changeMode("forgot")} className="min-h-11 text-sm font-semibold text-primary hover:text-white">Forgot password?</button>
              </div>
            )}

            <button type="submit" disabled={loading} className="ui-button ui-button-primary w-full">
              {loading && <span className="material-symbols-outlined animate-spin" aria-hidden="true">progress_activity</span>}
              {submitLabel}
              {!loading && <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>}
            </button>
          </form>

          <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-gray-500">
            {mode === "forgot" || mode === "verify" ? (
              <button type="button" disabled={loading} onClick={() => changeMode("login")} className="min-h-11 font-semibold text-primary hover:text-white">Back to sign in</button>
            ) : (
              <p>{mode === "register" ? "Already have an account?" : "New to Moore?"} <button type="button" disabled={loading} onClick={() => changeMode(mode === "register" ? "login" : "register")} className="min-h-11 font-semibold text-primary hover:text-white">{mode === "register" ? "Sign in" : "Create an account"}</button></p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Auth;
