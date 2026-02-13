import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../services/api";
import { ApplicationUser } from "../types";
import NotificationModal from "../components/NotificationModal";

interface AuthProps {
  onLogin: (user: ApplicationUser, token: string) => void;
}

type AuthMode = "login" | "register" | "forgot";

type FormData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
};

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({
    show: false,
    title: "",
    message: "",
    type: "info",
  });

  const navigate = useNavigate();
  const location = useLocation();

  const validate = () => {
    const errors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.email) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Enter a valid email.";

    if (mode !== "forgot") {
      if (!formData.password) errors.password = "Access key is required.";
      else if (formData.password.length < 6)
        errors.password = "Key must be at least 6 characters.";
    }

    if (mode === "register") {
      if (!formData.firstName) errors.firstName = "First name is required.";
      if (!formData.lastName) errors.lastName = "Last name is required.";
      if (!formData.phone) errors.phone = "Phone number is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;

    setLoading(true);

    try {
      if (mode === "forgot") {
        await api.resetPasswordRequest(formData.email);
        setModal({
          show: true,
          title: "Recovery Initiated",
          message: "Instructions to reset your access key have been sent to your email.",
          type: "success",
        });
        return;
      }

      if (mode === "register") {
        await api.register(formData);
        setModal({
          show: true,
          title: "Verification Required",
          message:
            "A confirmation link has been sent to your email. Please verify before signing in.",
          type: "info",
        });
        setMode("login");
        setFormData({ ...formData, password: "" });
        return;
      }

      // login
      const res = await api.login({
        email: formData.email,
        password: formData.password,
      });
      if (res?.token) {
        api.setToken(res.token);
        const user = await api.getMe();
        onLogin(user, res.token);
        navigate("/profile");
      }
    } catch (err: any) {
      setModal({
        show: true,
        title: "Authentication Failed",
        message: err.message || "Credential verification failed.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) {
      if (mode === "register") return "ESTABLISHING IDENTITY...";
      if (mode === "forgot") return "INITIATING RECOVERY...";
      return "VERIFYING ACCESS...";
    }
    if (mode === "register") return "ESTABLISH IDENTITY";
    if (mode === "forgot") return "INITIATE RECOVERY";
    return "VERIFY ACCESS";
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background-dark">
      <NotificationModal
        isOpen={modal.show}
        onClose={() => setModal({ ...modal, show: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

      {/* Cinematic Image Panel */}
      <div className="hidden lg:block w-1/2 relative">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <img
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1920"
          className="w-full h-full object-cover grayscale brightness-50"
          alt="Luxury Interior"
          loading="lazy"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-[clamp(2rem,5vw,6rem)] text-center space-y-[clamp(1.5rem,3vw,3rem)] animate-reveal">
          <div className="w-16 h-16 md:w-20 md:h-20 ">
            <img
              src="https://res.cloudinary.com/diovckpyb/image/upload/v1770752301/d6qqrpcxf1cqnkm9mzm5.jpg"
              alt="Moore Hotels & Suites"
              loading="lazy"
            />
          </div>
          <div className="space-y-[clamp(0.5rem,1vw,1.5rem)]">
            <h2 className="serif-font text-[clamp(2rem,4vw,5rem)] text-white italic">
              Sanctuary Awaits
            </h2>
            <p className="text-gray-400 text-[clamp(0.6rem,1vw,0.9rem)] uppercase tracking-[0.4em] font-light max-w-sm mx-auto leading-loose">
              Exclusive access to Lagos' most prestigious private collection of suites and services.
            </p>
          </div>
        </div>
      </div>

      {/* Auth Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-[clamp(1rem,4vw,3rem)] lg:p-[clamp(3rem,6vw,6rem)] relative z-30">
        <div className="w-full max-w-md space-y-[clamp(2rem,5vw,3rem)] animate-reveal">
          {/* Mobile Branding */}
          <div className="lg:hidden flex flex-col items-center space-y-[clamp(1rem,2vw,2rem)] mb-[clamp(2rem,4vw,3rem)]">
             <div className="w-16 h-16 md:w-20 md:h-20 ">
            <img
              src="https://res.cloudinary.com/diovckpyb/image/upload/v1770752301/d6qqrpcxf1cqnkm9mzm5.jpg"
              alt="Moore Hotels & Suites"
              loading="lazy"
            />
          </div>
            <h1 className="serif-font text-[clamp(2rem,5vw,3rem)] text-white italic">
              {mode === "register"
                ? "Join Circle"
                : mode === "forgot"
                  ? "Reset Access"
                  : "Welcome Back"}
            </h1>
          </div>

          <div className="space-y-4">
            <h2 className="serif-font text-[clamp(2rem,5vw,3rem)] text-white italic hidden lg:block">
              {mode === "register"
                ? "Begin Your Story"
                : mode === "forgot"
                  ? "Recover Identity"
                  : "Verify Identity"}
            </h2>
            <p className="text-gray-500 text-[clamp(0.6rem,1vw,0.8rem)] uppercase tracking-[0.5em] font-black italic">
              {mode === "register"
                ? "Identify yourself for a tailored residency"
                : mode === "forgot"
                  ? "Provide your registry email to initiate recovery"
                  : "Provide your credentials to access the vault"}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-[clamp(1rem,2vw,2rem)]" onSubmit={handleSubmit}>
            {mode === "register" && (
              <>
                {(["firstName", "lastName"] as (keyof FormData)[]).map((key) => (
                  <div key={key} className="space-y-2">
                    <label className="text-[clamp(0.6rem,0.9vw,0.7rem)] uppercase tracking-[0.3em] font-black text-gray-600 ml-1">
                      {key === "firstName" ? "First Name" : "Last Name"}
                    </label>
                    <input
                      required
                      disabled={loading}
                      placeholder={key === "firstName" ? "First" : "Last"}
                      className={`w-full bg-white/[0.03] border ${
                        fieldErrors[key] ? "border-red-500/50" : "border-white/10"
                      } rounded-sm px-5 py-4 text-sm text-white focus:border-primary outline-none transition-all placeholder:text-gray-800 font-light italic disabled:opacity-50`}
                      type="text"
                      value={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    />
                    {fieldErrors[key] && (
                      <p className="text-red-500 text-[8px] uppercase font-black tracking-widest ml-1">
                        {fieldErrors[key]}
                      </p>
                    )}
                  </div>
                ))}

                <div className="space-y-2">
                  <label className="text-[clamp(0.6rem,0.9vw,0.7rem)] uppercase tracking-[0.3em] font-black text-gray-600 ml-1">
                    Phone
                  </label>
                  <input
                    required
                    disabled={loading}
                    placeholder="+234 ..."
                    className={`w-full bg-white/[0.03] border ${
                      fieldErrors.phone ? "border-red-500/50" : "border-white/10"
                    } rounded-sm px-5 py-4 text-sm text-white focus:border-primary outline-none transition-all placeholder:text-gray-800 font-light italic disabled:opacity-50`}
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  {fieldErrors.phone && (
                    <p className="text-red-500 text-[8px] uppercase font-black tracking-widest ml-1">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-[clamp(0.6rem,0.9vw,0.7rem)] uppercase tracking-[0.3em] font-black text-gray-600 ml-1">
                Email
              </label>
              <input
                required
                disabled={loading}
                placeholder="concierge@moore.com"
                className={`w-full bg-white/[0.03] border ${
                  fieldErrors.email ? "border-red-500/50" : "border-white/10"
                } rounded-sm px-5 py-4 text-sm text-white focus:border-primary outline-none transition-all placeholder:text-gray-800 font-light italic disabled:opacity-50`}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-[8px] uppercase font-black tracking-widest ml-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {mode !== "forgot" && (
              <div className="space-y-2">
                <label className="text-[clamp(0.6rem,0.9vw,0.7rem)] uppercase tracking-[0.3em] font-black text-gray-600 ml-1">
                  Access Key
                </label>
                <input
                  required
                  disabled={loading}
                  placeholder="••••••••"
                  className={`w-full bg-white/[0.03] border ${
                    fieldErrors.password ? "border-red-500/50" : "border-white/10"
                  } rounded-sm px-5 py-4 text-sm text-white focus:border-primary outline-none transition-all placeholder:text-gray-800 font-light italic disabled:opacity-50`}
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                {fieldErrors.password && (
                  <p className="text-red-500 text-[8px] uppercase font-black tracking-widest ml-1">
                    {fieldErrors.password}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-[#B04110] text-black font-black py-4.5 rounded-sm transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-4 group disabled:opacity-70 disabled:cursor-not-allowed active:scale-95 h-[clamp(3.5rem,6vw,4rem)] mt-4"
            >
              {loading && <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>}
              <span className="text-[clamp(0.7rem,1vw,0.8rem)] uppercase tracking-[0.4em]">{getButtonText()}</span>
              {!loading && <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-2">arrow_right_alt</span>}
            </button>
          </form>

          {/* Footer */}
          <div className="pt-6 text-center text-[clamp(0.6rem,1vw,0.7rem)] uppercase tracking-[0.2em] font-black border-t border-white/5 space-y-4">
            <div>
              <span className="text-gray-700">{mode === "register" ? "EXISTING MEMBER?" : "NEW TO ANTHOLOGY?"}</span>
              <button
                disabled={loading}
                onClick={() => setMode(mode === "register" ? "login" : "register")}
                className="text-primary hover:text-white ml-3 transition-colors border-b border-primary/20 pb-0.5 italic disabled:opacity-50"
              >
                {mode === "register" ? "SIGN IN" : "JOIN CIRCLE"}
              </button>
            </div>
            {mode === "forgot" && (
              <div>
                <button
                  disabled={loading}
                  onClick={() => setMode("login")}
                  className="text-gray-500 hover:text-white transition-colors border-b border-white/10 pb-0.5 italic disabled:opacity-50"
                >
                  RETURN TO SIGN IN
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
