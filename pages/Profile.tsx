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
  const [notification, setNotification] = useState<{ show: boolean; title: string; message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  const triggerNotification = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ show: true, title, message, type });
  };

  const validateSecurity = () => {
    const errors: Record<string, string> = {};
    if (!securityData.oldPassword) errors.oldPassword = "Current key is required.";
    if (!securityData.newPassword) errors.newPassword = "New key is required.";
    else if (securityData.newPassword.length < 6) errors.newPassword = "Key must be at least 6 characters.";
    
    if (securityData.newPassword !== securityData.confirmNewPassword) {
      errors.confirmNewPassword = "Keys do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRotateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSecurity()) return;

    setUpdating(true);
    try {
      await api.rotateSecurity({
        oldPassword: securityData.oldPassword,
        newPassword: securityData.newPassword,
        confirmNewPassword: securityData.confirmNewPassword,
      });
      
      triggerNotification("Security Update", "Your access keys have been successfully rotated. Please use your new key for future logins.");
      
      setSecurityData({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setFieldErrors({});
    } catch (err: any) {
      triggerNotification("Update Failed", err.message || "Failed to rotate security credentials.", 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="pt-32 md:pt-48 pb-32 px-4 md:px-12 min-h-screen bg-background-dark relative overflow-hidden">
      {notification && (
        <NotificationModal 
          isOpen={notification.show}
          onClose={() => setNotification(null)}
          title={notification.title}
          message={notification.message}
          type={notification.type}
        />
      )}

      {/* Dynamic Background Accents */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

      <div className="max-w-[1200px] mx-auto">
        {/* Header Section */}
        <header className="mb-20 text-center space-y-8 animate-in fade-in duration-1000">
          <div className="space-y-4">
            <p className="text-primary text-[10px] uppercase tracking-[0.8em] font-black">Private Registry</p>
            <h1 className="serif-font text-6xl md:text-8xl text-white italic leading-none">
              Welcome, {user.firstName}
            </h1>
          </div>
          
          <div className="flex justify-center items-center gap-1 bg-white/[0.03] backdrop-blur-md border border-white/5 p-1 rounded-sm w-fit mx-auto">
             {(["vault", "archive", "security"] as Tab[]).map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`px-8 py-3 text-[9px] font-black uppercase tracking-[0.3em] transition-all rounded-sm ${
                   activeTab === tab ? "bg-primary text-black" : "text-gray-500 hover:text-white"
                 }`}
               >
                 {tab === "vault" ? "Registry" : tab === "archive" ? "History" : "Security"}
               </button>
             ))}
             <div className="w-px h-6 bg-white/10 mx-2"></div>
             <button onClick={onLogout} className="px-6 py-3 text-[9px] font-black uppercase tracking-[0.3em] text-red-500/60 hover:text-red-500 transition-all rounded-sm">Logout</button>
          </div>
        </header>

        {/* Content Section */}
        <main className="relative z-10">
          {activeTab === "vault" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="bg-surface-dark border border-white/5 p-12 hover:border-primary/20 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 text-white/[0.02] font-black text-7xl select-none group-hover:text-primary/[0.02] transition-colors italic">@</div>
                <div className="space-y-6">
                  <p className="text-[10px] uppercase tracking-[0.5em] text-gray-600 font-black">Email Identity</p>
                  <p className="text-3xl text-white italic group-hover:text-primary transition-colors">{user.email}</p>
                </div>
              </div>
              
              <div className="bg-surface-dark border border-white/5 p-12 hover:border-primary/20 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 text-white/[0.02] font-black text-7xl select-none group-hover:text-primary/[0.02] transition-colors italic">#</div>
                <div className="space-y-6">
                  <p className="text-[10px] uppercase tracking-[0.5em] text-gray-600 font-black">Mobile Record</p>
                  <p className="text-3xl text-white italic group-hover:text-primary transition-colors">{user.phone || "Not Registry Provided"}</p>
                </div>
              </div>

              <div className="md:col-span-2 bg-surface-dark border border-white/5 p-12 flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="space-y-2 text-center md:text-left">
                  <p className="text-[9px] uppercase tracking-[0.4em] text-gray-600 font-black">Account Integrity</p>
                  <h4 className="serif-font text-2xl text-white italic">Your registry is fully secured.</h4>
                </div>
                <button className="bg-white/5 border border-white/10 px-10 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-white hover:bg-primary hover:text-black transition-all rounded-sm">
                  Request Data Export
                </button>
              </div>
            </div>
          )}

          {activeTab === "archive" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {bookings.length > 0 ? (
                bookings.map((b) => (
                  <div key={b.id} className="bg-surface-dark border border-white/5 p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-primary/20 transition-all">
                    <div className="space-y-2">
                      <p className="text-[9px] text-primary uppercase tracking-[0.5em] font-black">Stay Record</p>
                      <h4 className="serif-font text-3xl text-white italic group-hover:text-primary transition-colors">{b.bookingCode}</h4>
                    </div>
                    
                    <div className="flex flex-wrap gap-12">
                      <div className="space-y-1">
                        <p className="text-[8px] text-gray-600 uppercase tracking-widest font-black">Check-in</p>
                        <p className="text-white text-lg font-bold italic">{b.checkIn ? new Date(b.checkIn).toLocaleDateString() : "—"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] text-gray-600 uppercase tracking-widest font-black">Status</p>
                        <p className="text-primary text-[10px] font-black uppercase tracking-widest italic">{b.status}</p>
                      </div>
                    </div>

                    <button className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-600 hover:text-primary hover:bg-primary/10 transition-all">
                      <span className="material-symbols-outlined text-xl">east</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-40 text-center border border-white/5 border-dashed rounded-sm bg-white/[0.01]">
                  <p className="serif-font text-3xl text-gray-700 italic">No historical records found in registry.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "security" && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-2xl mx-auto">
              <form onSubmit={handleRotateSecurity} className="bg-surface-dark border border-white/5 p-10 md:p-16 space-y-10 shadow-2xl relative overflow-hidden">
                <div className="space-y-2">
                  <h3 className="serif-font text-4xl text-white italic">Rotate Security Key</h3>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest font-black opacity-60 italic">Maintain vault integrity through regular rotation.</p>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em] ml-1">Current Key</label>
                    <input
                      required
                      type="password"
                      value={securityData.oldPassword}
                      onChange={(e) => setSecurityData({ ...securityData, oldPassword: e.target.value })}
                      placeholder="••••••••"
                      className={`w-full bg-white/[0.02] border ${fieldErrors.oldPassword ? 'border-red-500/50' : 'border-white/10'} p-5 text-white outline-none focus:border-primary transition-all font-light placeholder:text-gray-800`}
                    />
                    {fieldErrors.oldPassword && <p className="text-red-500 text-[8px] uppercase font-black tracking-widest ml-1">{fieldErrors.oldPassword}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em] ml-1">New Key</label>
                    <input
                      required
                      type="password"
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                      placeholder="••••••••"
                      className={`w-full bg-white/[0.02] border ${fieldErrors.newPassword ? 'border-red-500/50' : 'border-white/10'} p-5 text-white outline-none focus:border-primary transition-all font-light placeholder:text-gray-800`}
                    />
                    {fieldErrors.newPassword && <p className="text-red-500 text-[8px] uppercase font-black tracking-widest ml-1">{fieldErrors.newPassword}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em] ml-1">Confirm New Key</label>
                    <input
                      required
                      type="password"
                      value={securityData.confirmNewPassword}
                      onChange={(e) => setSecurityData({ ...securityData, confirmNewPassword: e.target.value })}
                      placeholder="••••••••"
                      className={`w-full bg-white/[0.02] border ${fieldErrors.confirmNewPassword ? 'border-red-500/50' : 'border-white/10'} p-5 text-white outline-none focus:border-primary transition-all font-light placeholder:text-gray-800`}
                    />
                    {fieldErrors.confirmNewPassword && <p className="text-red-500 text-[8px] uppercase font-black tracking-widest ml-1">{fieldErrors.confirmNewPassword}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full bg-primary text-black font-black text-[10px] uppercase tracking-[0.5em] py-5 rounded-sm disabled:opacity-50 hover:bg-yellow-500 transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-3"
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