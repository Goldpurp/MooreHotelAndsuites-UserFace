import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { ApplicationUser, Booking } from "../types";
import NotificationModal from "../components/NotificationModal";
interface ProfileProps {
  user: ApplicationUser;
  onLogout: () => void;
}

type Tab = "vault" | "archive" | "security";

const Profile: React.FC<ProfileProps> = ({ user: initialUser, onLogout }) => {
  const [user, setUser] = useState<ApplicationUser>(initialUser);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("vault");
  const [updating, setUpdating] = useState(false);
  const [cancelModal, setCancelModal] = useState<{
    open: boolean;
    booking?: Booking;
  }>({ open: false });

  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [securityData, setSecurityData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const capitalize = (str: string) =>
    str
      ? str
          .split(" ")
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(" ")
      : "";

  const getLastName = (name: string) => {
    if (!name) return "";
    const lastName = name.trim().split(/\s+/);
    const last = lastName[lastName.length - 1];
    return last.charAt(0).toUpperCase() + last.slice(1).toLowerCase();
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const me = await api.getMe();
        setUser(me);
      } catch {
        onLogout();
      }
    };
    fetchProfile();
  }, [onLogout]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await api.getMyBookings();
        setBookings(history);
      } catch {
        setBookings([]);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const triggerNotification = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    setNotification({ show: true, title, message, type });
  };

  const validateSecurity = () => {
    const errors: Record<string, string> = {};
    if (!securityData.oldPassword)
      errors.oldPassword = "Current key is required.";
    if (!securityData.newPassword) errors.newPassword = "New key is required.";
    else if (securityData.newPassword.length < 6)
      errors.newPassword = "Key must be at least 6 characters.";
    if (securityData.newPassword !== securityData.confirmNewPassword)
      errors.confirmNewPassword = "Keys do not match.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRotateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSecurity()) return;
    setUpdating(true);
    try {
      await api.rotateSecurity(securityData);
      triggerNotification(
        "Security Update",
        "Your access keys have been successfully rotated. Please use your new key for future logins.",
      );
      setSecurityData({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setFieldErrors({});
    } catch (err: any) {
      triggerNotification(
        "Update Failed",
        err.message || "Failed to rotate security credentials.",
        "error",
      );
    } finally {
      setUpdating(false);
    }
  };

  //Cancelation logic

  const confirmCancelBooking = async () => {
    if (!cancelModal.booking || !cancelReason.trim()) return;

    setCancelling(true);
    try {
      await api.cancelBookingAsGuest({
        bookingCode: cancelModal.booking.bookingCode,
        email: user.email,
        reason: cancelReason,
      });

      triggerNotification(
        "Booking Cancelled",
        "Your booking has been cancelled.",
        "success",
      );

      const updated = await api.getMyBookings();
      setBookings(updated);

      setCancelModal({ open: false });
      setCancelReason("");
    } catch (err: any) {
      triggerNotification(
        "Cancellation Failed",
        err.message || "Could not cancel booking.",
        "error",
      );
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-24 px-4 md:px-12 min-h-screen bg-background-dark relative overflow-hidden">
      {notification && (
        <NotificationModal
          isOpen={notification.show}
          onClose={() => setNotification(null)}
          title={notification.title}
          message={notification.message}
          type={notification.type}
        />
      )}

      {cancelModal.open && cancelModal.booking && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-surface-dark border border-white/5 p-8 md:p-10 w-full max-w-lg space-y-6">
            <h3 className="serif-font text-2xl md:text-3xl text-white">
              Cancel Booking {cancelModal.booking.bookingCode}
            </h3>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={4}
              className="w-full bg-white/[0.02] border border-white/10 p-4 text-white outline-none focus:border-primary transition-all resize-none"
              placeholder="Write cancellation reason..."
            />

            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setCancelModal({ open: false });
                  setCancelReason("");
                }}
                className="text-gray-500 text-xs uppercase font-black tracking-widest"
              >
                Abort
              </button>

              <button
                onClick={confirmCancelBooking}
                disabled={cancelling}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase px-5 py-2 rounded-sm shadow transition-all disabled:opacity-50"
              >
                {cancelling ? "Processing..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <header className="mb-16 md:mb-20 text-center space-y-6 animate-in fade-in duration-1000">
          <p className="text-primary text-[10px] sm:text-[11px] uppercase tracking-[0.8em] font-black">
            Private Registry
          </p>
          <h1 className="serif-font text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white">
            Welcome, {getLastName(user.name)}
          </h1>

          <div className="flex flex-wrap justify-center items-center gap-1 bg-white/[0.03] backdrop-blur-md border border-white/5 p-1 rounded-sm w-fit mx-auto">
            {(["vault", "archive", "security"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 sm:px-8 py-2 sm:py-3 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] transition-all rounded-sm ${
                  activeTab === tab
                    ? "bg-primary text-black"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                {tab === "vault"
                  ? "Registry"
                  : tab === "archive"
                    ? "History"
                    : "Security"}
              </button>
            ))}
          </div>
        </header>

        {/* Content */}
        <main className="relative z-10 space-y-12">
          {/* Vault Tab */}
          {activeTab === "vault" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="bg-surface-dark border border-white/5 p-8 md:p-12 hover:border-primary/20 transition-all group relative overflow-hidden">
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-[0.5em] text-gray-600 font-black">
                    Profile Name
                  </p>
                  <p className="text-2xl md:text-3xl text-white group-hover:text-primary transition-colors">
                    {" "}
                    {capitalize(user.name)}
                  </p>
                </div>
              </div>

              <div className="bg-surface-dark border border-white/5 p-8 md:p-12 hover:border-primary/20 transition-all group relative overflow-hidden">
                {/* <div className="absolute top-0 right-0 p-10 text-white/[0.02] font-black text-6xl md:text-7xl select-none group-hover:text-primary/[0.02] transition-colors">@</div> */}
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-[0.5em] text-gray-600 font-black">
                    Email Identity
                  </p>
                  <p className="text-2xl md:text-3xl text-white group-hover:text-primary transition-colors">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="bg-surface-dark border border-white/5 px-8 py-4 md:px-12 md:py-8 hover:border-primary/20 transition-all group relative overflow-hidden">
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-[0.5em] text-gray-600 font-black">
                    Joined On
                  </p>
                  <p className="text-sm md:text-xl text-white group-hover:text-primary transition-colors">
                    {user.createdAt ? formatDate(user.createdAt) : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Archive Tab */}
          {activeTab === "archive" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {bookings.length > 0 ? (
                bookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-surface-dark border border-white/5 p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 group hover:border-primary/20 transition-all"
                  >
                    <div className="space-y-1">
                      <p className="text-[9px] text-primary uppercase tracking-[0.5em] font-black">
                        Stay Record
                      </p>
                      <h4 className="serif-font text-2xl md:text-3xl text-white group-hover:text-primary transition-colors">
                        {b.bookingCode}
                      </h4>
                    </div>

                    <div className="flex flex-wrap gap-6 md:gap-12">
                      <div className="space-y-1">
                        <p className="text-[8px] text-gray-600 uppercase tracking-widest font-black">
                          Check-in
                        </p>
                        <p className="text-white text-base md:text-lg font-bold">
                          {b.checkIn
                            ? new Date(b.checkIn).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] text-gray-600 uppercase tracking-widest font-black">
                          Check-out
                        </p>
                        <p className="text-white text-base md:text-lg font-bold">
                          {b.checkOut
                            ? new Date(b.checkOut).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] text-gray-600 uppercase tracking-widest font-black">
                          Status
                        </p>
                        <p className="text-primary text-[12px] font-black uppercase tracking-widest">
                          {b.status}
                        </p>
                      </div>
                      <div
                        className="space-y-1"
                        style={{
                          display:
                            b.status?.toLowerCase() === "cancelled" &&
                            ["paid", "refundpending", "refunded"].includes(
                              b.paymentStatus?.toLowerCase(),
                            )
                              ? "block"
                              : "none",
                        }}
                      >
                        <p className="text-[8px] text-gray-600 uppercase tracking-widest font-black">
                          Dispute
                        </p>
                        <p className="text-primary text-[12px] font-black uppercase tracking-widest">
                          {b.paymentStatus}
                        </p>
                      </div>
                    </div>

                    <button
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase px-5 py-2 rounded-sm shadow transition-all disabled:opacity-50"
                      onClick={() => setCancelModal({ open: true, booking: b })}
                      disabled={b.status?.toLowerCase() === "cancelled"}
                    >
                      Cancel Booking
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-32 md:py-40 text-center border border-white/5 border-dashed rounded-sm bg-white/[0.01]">
                  <p className="serif-font text-2xl md:text-3xl text-gray-700">
                    No historical records found in registry.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-2xl mx-auto">
              <form
                onSubmit={handleRotateSecurity}
                className="bg-surface-dark border border-white/5 p-8 md:p-16 space-y-8 md:space-y-10 shadow-2xl relative overflow-hidden"
              >
                <div className="space-y-2">
                  <h3 className="serif-font text-3xl md:text-4xl text-white">
                    Rotate Security Key
                  </h3>
                  <p className="text-gray-500 text-[9px] sm:text-[10px] uppercase tracking-widest font-black opacity-60">
                    Maintain vault integrity through regular rotation.
                  </p>
                </div>

                <div className="space-y-4 md:space-y-6">
                  {["oldPassword", "newPassword", "confirmNewPassword"].map(
                    (field, idx) => (
                      <div key={idx} className="space-y-1">
                        <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em] ml-1">
                          {field === "oldPassword"
                            ? "Current Key"
                            : field === "newPassword"
                              ? "New Key"
                              : "Confirm New Key"}
                        </label>
                        <input
                          required
                          type="password"
                          value={
                            securityData[field as keyof typeof securityData]
                          }
                          onChange={(e) =>
                            setSecurityData({
                              ...securityData,
                              [field]: e.target.value,
                            })
                          }
                          placeholder="••••••••"
                          className={`w-full bg-white/[0.02] border ${fieldErrors[field] ? "border-red-500/50" : "border-white/10"} p-4 md:p-5 text-white outline-none focus:border-primary transition-all font-light placeholder:text-gray-800`}
                        />
                        {fieldErrors[field] && (
                          <p className="text-red-500 text-[8px] uppercase font-black tracking-widest ml-1">
                            {fieldErrors[field]}
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full bg-primary text-black font-black text-[10px] uppercase tracking-[0.5em] py-4 md:py-5 rounded-sm disabled:opacity-50 hover:bg-[#B04110] transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-3"
                >
                  {updating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
                      <span>Encrypting...</span>
                    </>
                  ) : (
                    "Authorize Rotation"
                  )}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;
