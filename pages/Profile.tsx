import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { ApplicationUser, Booking } from "../types";
import { Link } from "react-router-dom";

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
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [securityData, setSecurityData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

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

  const triggerToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleRotateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmNewPassword) {
      triggerToast("New Access Keys do not match.", "error");
      return;
    }
    setUpdating(true);
    try {
      await api.rotateSecurity({
        oldPassword: securityData.oldPassword,
        newPassword: securityData.newPassword,
        confirmNewPassword: securityData.confirmNewPassword,
      });

      triggerToast("Security Credentials Rotated Successfully.");

      setSecurityData({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err: any) {
      triggerToast(err.message || "Credential rotation failed.", "error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="pt-32 md:pt-48 pb-32 px-4 md:px-12 min-h-screen bg-background-dark relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      {/* Cinematic Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 right-4 md:right-10 z-[100] animate-reveal">
          <div
            className={`flex items-center gap-4 bg-surface-dark border ${toast.type === "success" ? "border-primary/40" : "border-red-500/40"} p-6 rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden group`}
          >
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 ${toast.type === "success" ? "bg-primary" : "bg-red-500"}`}
            ></div>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${toast.type === "success" ? "bg-primary/10 text-primary" : "bg-red-500/10 text-red-500"}`}
            >
              <span className="material-symbols-outlined">
                {toast.type === "success" ? "shield_lock" : "error"}
              </span>
            </div>
            <div className="space-y-1 pr-4">
              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40">
                Security Protocol
              </p>
              <p className="text-white text-sm italic font-medium">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-gray-600 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto">
        <header className="mb-16 md:mb-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-[1px] bg-primary/60"></span>
              <p className="text-primary text-[10px] uppercase tracking-[0.5em] font-black">
                Member Registry
              </p>
            </div>
            <h1 className="serif-font text-6xl md:text-8xl text-white italic leading-none">
              The <span className="text-primary">Vault</span>
            </h1>
          </div>

          <div className="flex bg-white/[0.03] backdrop-blur-md border border-white/5 p-1 rounded-sm overflow-x-auto scrollbar-hide w-full md:w-auto">
            {(["vault", "archive", "security"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 whitespace-nowrap text-[9px] font-black uppercase tracking-[0.3em] transition-all rounded-sm ${
                  activeTab === tab
                    ? "bg-primary text-black shadow-lg"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                {tab === "vault"
                  ? "Personal"
                  : tab === "archive"
                    ? "History"
                    : "Security"}
              </button>
            ))}
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-8 md:gap-16">
          {/* Sidebar / Identity Summary */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-primary/5 border border-primary/10 p-10 space-y-6 relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <span className="material-symbols-outlined text-[160px]">
                  concierge
                </span>
              </div>
              <h4 className="text-primary text-[10px] font-black uppercase tracking-[0.5em]">
                Concierge Access
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed font-light opacity-80 italic">
                As a {user.role} member, your dedicated lifestyle manager is
                available 24/7 for bespoke arrangements.
              </p>

              <Link
                to="/help"
                className="text-white text-[9px] font-black uppercase tracking-[0.3em] border-b border-white/10 pb-1 hover:text-primary hover:border-primary transition-all"
              >
                Request Assistance
              </Link>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-8">
            {activeTab === "vault" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-700">
                <div className="bg-surface-dark border border-white/5 p-10 md:p-12 hover:border-primary/20 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 text-white/[0.02] font-black text-6xl select-none group-hover:text-primary/[0.02] transition-colors italic">
                    EMAIL
                  </div>
                  <p className="text-[9px] uppercase tracking-[0.4em] text-gray-600 font-black mb-4">
                    Registry Contact
                  </p>
                  <p className="text-2xl text-white italic group-hover:text-primary transition-colors relative z-10">
                    {user.email}
                  </p>
                  <p className="text-[10px] text-gray-700 mt-6 font-light uppercase tracking-widest">
                    Primary Identity Record
                  </p>
                </div>

                <div className="bg-surface-dark border border-white/5 p-10 md:p-12 hover:border-primary/20 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 text-white/[0.02] font-black text-6xl select-none group-hover:text-primary/[0.02] transition-colors italic">
                    PHONE
                  </div>
                  <p className="text-[9px] uppercase tracking-[0.4em] text-gray-600 font-black mb-4">
                    Registry Name
                  </p>
                  <p className="text-2xl text-white italic group-hover:text-primary transition-colors relative z-10">
                    {user.name}
                  </p>
                </div>

                <div className="md:col-span-2 bg-surface-dark border border-white/5 p-10 md:p-12 space-y-6">
                  <p className="text-[9px] uppercase tracking-[0.4em] text-gray-600 font-black">
                    Account Integrity
                  </p>
                  <div className="flex flex-col md:flex-row justify-between gap-6 md:items-center">
                    <div className="space-y-1">
                      <p className="text-white text-lg font-bold italic">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                        Profile Status:{" "}
                        <span className="text-primary">{user.status}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "archive" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                {bookings.length > 0 ? (
                  bookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-surface-dark border border-white/5 overflow-hidden shadow-2xl flex flex-col md:flex-row group hover:border-primary/20 transition-all"
                    >
                      <div className="md:w-1/3 bg-black/40 p-10 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-white/5 text-center space-y-2">
                        <p className="text-[8px] text-primary uppercase tracking-[0.5em] font-black">
                          Booking ID
                        </p>
                        <h4 className="serif-font text-3xl text-white italic group-hover:text-primary transition-colors">
                          {b.bookingCode}
                        </h4>
                      </div>
                      <div className="md:w-2/3 p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-1">
                          <p className="text-[8px] text-gray-600 uppercase tracking-widest font-black">
                            Authorized Arrival
                          </p>
                          <p className="text-white text-xl font-bold italic">
                            {b.checkIn
                              ? new Date(b.checkIn).toLocaleDateString(
                                  undefined,
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : "—"}
                          </p>
                        </div>
                        <div className="space-y-1 md:text-right">
                          <p className="text-[8px] text-gray-600 uppercase tracking-widest font-black">
                            Gateway Status
                          </p>
                          <p className="text-primary text-[10px] font-black uppercase tracking-widest italic">
                            {b.status}
                          </p>
                        </div>
                        <div className="flex justify-end">
                          <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-600 hover:text-white hover:border-primary transition-all">
                            <span className="material-symbols-outlined text-sm">
                              visibility
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-32 md:py-48 text-center border border-white/5 border-dashed rounded-sm bg-white/[0.01]">
                    <span className="material-symbols-outlined text-gray-800 text-6xl mb-6">
                      history_edu
                    </span>
                    <p className="serif-font text-3xl text-gray-700 italic">
                      The stay archive is currently empty.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "security" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-700">
                <form
                  onSubmit={handleRotateSecurity}
                  className="bg-surface-dark border border-white/5 p-10 md:p-16 lg:p-20 space-y-12 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                    <span className="material-symbols-outlined text-[200px]">
                      lock_reset
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h3 className="serif-font text-4xl text-white italic">
                      Credential Rotation
                    </h3>
                    <p className="text-gray-500 text-xs font-light max-w-md italic">
                      Maintain your sanctuary access security by regularly
                      rotating your entry keys.
                    </p>
                  </div>

                  <div className="space-y-8 relative z-10">
                    <div className="space-y-3">
                      <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.4em] ml-1">
                        Current Access Key
                      </label>
                      <input
                        required
                        type="password"
                        value={securityData.oldPassword}
                        onChange={(e) =>
                          setSecurityData({
                            ...securityData,
                            oldPassword: e.target.value,
                          })
                        }
                        placeholder="••••••••"
                        className="w-full bg-white/[0.03] border border-white/10 p-5 text-white outline-none focus:border-primary transition-all font-light placeholder:text-gray-800"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.4em] ml-1">
                          New Access Key
                        </label>
                        <input
                          required
                          type="password"
                          value={securityData.newPassword}
                          onChange={(e) =>
                            setSecurityData({
                              ...securityData,
                              newPassword: e.target.value,
                            })
                          }
                          placeholder="••••••••"
                          className="w-full bg-white/[0.03] border border-white/10 p-5 text-white outline-none focus:border-primary transition-all font-light placeholder:text-gray-800"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.4em] ml-1">
                          Confirm New Key
                        </label>
                        <input
                          required
                          type="password"
                          value={securityData.confirmNewPassword}
                          onChange={(e) =>
                            setSecurityData({
                              ...securityData,
                              confirmNewPassword: e.target.value,
                            })
                          }
                          placeholder="••••••••"
                          className="w-full bg-white/[0.03] border border-white/10 p-5 text-white outline-none focus:border-primary transition-all font-light placeholder:text-gray-800"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full md:w-auto px-16 py-6 bg-primary text-black font-black text-[10px] uppercase tracking-[0.5em] rounded-sm disabled:opacity-50 hover:bg-yellow-500 transition-all shadow-2xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-4"
                  >
                    {updating ? (
                      <>
                        <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
                        <span>Encrypting...</span>
                      </>
                    ) : (
                      "Rotate Credentials"
                    )}
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
