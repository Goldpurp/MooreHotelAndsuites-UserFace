import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { ApplicationUser, Booking } from "../types";
import NotificationModal from "../components/NotificationModal";
import Dialog from "../components/ui/Dialog";
import FormField from "../components/ui/FormField";

interface ProfileProps {
  user: ApplicationUser;
  onLogout: () => void;
  onUserChange: (user: ApplicationUser) => void;
}

type Tab = "profile" | "bookings" | "security";

const Profile: React.FC<ProfileProps> = ({ user: initialUser, onLogout, onUserChange }) => {
  const [user, setUser] = useState(initialUser);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: initialUser.name || "",
    email: initialUser.email || "",
    phone: initialUser.phone || "",
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [logoutAfterNotice, setLogoutAfterNotice] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [cancelModal, setCancelModal] = useState<{ open: boolean; booking?: Booking }>({ open: false });
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [notification, setNotification] = useState<{ show: boolean; title: string; message: string; type: "success" | "error" | "info" } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [securityData, setSecurityData] = useState({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
  const cancelCloseRef = useRef<HTMLButtonElement>(null);
  const profileCloseRef = useRef<HTMLButtonElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getMe()
      .then((profile) => {
        setUser(profile);
        onUserChange(profile);
      })
      .catch(onLogout);
  }, [onLogout, onUserChange]);

  useEffect(() => {
    api.getMyBookings().then(setBookings).catch(() => setBookings([]));
  }, []);

  const notify = (title: string, message: string, type: "success" | "error" | "info" = "success") => setNotification({ show: true, title, message, type });
  const closeCancelModal = () => { setCancelModal({ open: false }); setCancelReason(""); };
  const applyUser = (nextUser: ApplicationUser) => {
    setUser(nextUser);
    onUserChange(nextUser);
  };
  const openProfileEditor = () => {
    setProfileData({
      fullName: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    });
    setProfileErrors({});
    setProfileModalOpen(true);
  };
  const closeProfileEditor = () => {
    if (savingProfile || uploadingAvatar) return;
    setProfileModalOpen(false);
    setProfileErrors({});
  };

  const validateProfile = () => {
    const errors: Record<string, string> = {};
    const fullName = profileData.fullName.trim();
    const email = profileData.email.trim();
    const phone = profileData.phone.trim();
    if (!fullName) errors.fullName = "Your full name is required.";
    else if (fullName.length > 160) errors.fullName = "Your name is too long.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
    if (phone && !/^\+?[0-9 ()-]{7,30}$/.test(phone)) errors.phone = "Enter a valid phone number.";
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateProfile()) return;
    const email = profileData.email.trim().toLowerCase();
    const emailChanged = email !== user.email.trim().toLowerCase();
    setSavingProfile(true);
    try {
      const response = await api.updateMe({
        fullName: profileData.fullName.trim(),
        email,
        phone: profileData.phone.trim(),
      });
      applyUser(response.data);
      setProfileModalOpen(false);
      setProfileErrors({});
      if (emailChanged && !response.data.emailVerified) {
        setLogoutAfterNotice(true);
        notify(
          "Verify your new email",
          "Your profile was updated. Check the new email address for an activation link, then sign in again.",
          "info",
        );
      } else {
        notify("Profile updated", "Your guest details are now up to date.");
      }
    } catch (error: unknown) {
      setProfileErrors((current) => ({
        ...current,
        form: error instanceof Error ? error.message : "We could not update your profile.",
      }));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
    if (!allowedTypes.has(file.type)) {
      setProfileErrors((current) => ({ ...current, avatar: "Choose a JPEG, PNG, WebP, or AVIF image." }));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setProfileErrors((current) => ({ ...current, avatar: "The profile photo must be 8 MB or smaller." }));
      return;
    }

    setProfileErrors((current) => ({ ...current, avatar: "" }));
    setUploadingAvatar(true);
    try {
      const response = await api.uploadAvatar(file);
      applyUser({ ...user, avatarUrl: response.data.avatarUrl });
      setProfileModalOpen(false);
      notify("Profile photo updated", "Your new guest profile photo is now in place.");
    } catch (error: unknown) {
      setProfileErrors((current) => ({
        ...current,
        avatar: error instanceof Error ? error.message : "We could not upload that profile photo.",
      }));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const validateSecurity = () => {
    const errors: Record<string, string> = {};
    if (!securityData.oldPassword) errors.oldPassword = "Current password is required.";
    if (!securityData.newPassword) errors.newPassword = "New password is required.";
    else if (securityData.newPassword.length < 8 || !/[a-z]/.test(securityData.newPassword) || !/[A-Z]/.test(securityData.newPassword) || !/\d/.test(securityData.newPassword) || !/[^A-Za-z0-9]/.test(securityData.newPassword)) errors.newPassword = "Use 8+ characters with upper and lowercase, a number, and a symbol.";
    if (securityData.newPassword !== securityData.confirmNewPassword) errors.confirmNewPassword = "Passwords do not match.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateSecurity()) return;
    setUpdating(true);
    try {
      await api.rotateSecurity(securityData);
      api.setToken(null);
      notify("Password updated", "Your other sessions were closed. Sign in again with your new password.");
      setSecurityData({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
      setFieldErrors({});
    } catch (error: unknown) {
      notify("Password not updated", error instanceof Error ? error.message : "We could not update your password.", "error");
    } finally {
      setUpdating(false);
    }
  };

  const confirmCancellation = async () => {
    const booking = cancelModal.booking;
    if (!booking || !cancelReason.trim()) return;
    if (["checkedin", "checkedout", "cancelled"].includes(booking.status?.toLowerCase() || "")) {
      notify("Cancellation unavailable", "This booking is active, completed, or already cancelled.", "error");
      return;
    }
    setCancelling(true);
    try {
      await api.cancelBookingAsGuest({ bookingCode: booking.bookingCode, email: user.email, reason: cancelReason.trim() });
      setBookings(await api.getMyBookings());
      closeCancelModal();
      notify("Booking cancelled", "The booking status has been updated.");
    } catch (error: unknown) {
      notify("Cancellation failed", error instanceof Error ? error.message : "We could not cancel this booking.", "error");
    } finally {
      setCancelling(false);
    }
  };

  const displayName = user.name?.trim() || [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  const lastName = displayName.split(/\s+/).at(-1) || "Guest";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background-dark px-4 pb-24 pt-32 sm:px-6">
      {notification && <NotificationModal isOpen={notification.show} onClose={() => { const shouldLogout = notification.title === "Password updated" || logoutAfterNotice; setNotification(null); setLogoutAfterNotice(false); if (shouldLogout) onLogout(); }} title={notification.title} message={notification.message} type={notification.type} />}

      <Dialog
        isOpen={profileModalOpen}
        onClose={closeProfileEditor}
        labelledBy="profile-edit-title"
        initialFocusRef={profileCloseRef}
        panelClassName="ui-card w-full max-w-xl p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div><p className="ui-eyebrow">Guest details</p><h2 id="profile-edit-title" className="ui-card-title mt-2 italic text-white">Edit your profile</h2></div>
          <button ref={profileCloseRef} type="button" onClick={closeProfileEditor} disabled={savingProfile || uploadingAvatar} className="ui-icon-button" aria-label="Close profile editor"><span className="material-symbols-outlined" aria-hidden="true">close</span></button>
        </div>

        <div className="mt-6 flex flex-col gap-5 rounded border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center">
          <ProfileAvatar user={user} size="large" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white">Profile photo</p>
            <p className="mt-1 text-xs leading-5 text-gray-500">JPEG, PNG, WebP, or AVIF. Maximum 8 MB.</p>
          </div>
          <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={handleAvatarChange} className="sr-only" />
          <button type="button" onClick={() => avatarInputRef.current?.click()} disabled={savingProfile || uploadingAvatar} className="ui-button ui-button-secondary flex-none">{uploadingAvatar ? "Uploading" : "Change photo"}</button>
        </div>
        {profileErrors.avatar && <p className="mt-3 text-sm text-red-400" role="alert">{profileErrors.avatar}</p>}

        <form onSubmit={handleProfileUpdate} noValidate className="mt-6 space-y-5">
          <FormField htmlFor="profile-full-name" label="Full name" error={profileErrors.fullName}><input id="profile-full-name" type="text" autoComplete="name" maxLength={160} disabled={savingProfile || uploadingAvatar} value={profileData.fullName} onChange={(event) => { setProfileData((current) => ({ ...current, fullName: event.target.value })); setProfileErrors((current) => ({ ...current, fullName: "" })); }} className="ui-input" aria-invalid={Boolean(profileErrors.fullName)} /></FormField>
          <FormField htmlFor="profile-email" label="Email address" error={profileErrors.email} hint="Changing your email requires verification and a fresh sign-in."><input id="profile-email" type="email" autoComplete="email" maxLength={254} disabled={savingProfile || uploadingAvatar} value={profileData.email} onChange={(event) => { setProfileData((current) => ({ ...current, email: event.target.value })); setProfileErrors((current) => ({ ...current, email: "" })); }} className="ui-input" aria-invalid={Boolean(profileErrors.email)} /></FormField>
          <FormField htmlFor="profile-phone" label="Phone number" error={profileErrors.phone}><input id="profile-phone" type="tel" autoComplete="tel" maxLength={30} disabled={savingProfile || uploadingAvatar} value={profileData.phone} onChange={(event) => { setProfileData((current) => ({ ...current, phone: event.target.value })); setProfileErrors((current) => ({ ...current, phone: "" })); }} className="ui-input" aria-invalid={Boolean(profileErrors.phone)} placeholder="+234 …" /></FormField>
          {profileErrors.form && <p className="rounded border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-300" role="alert">{profileErrors.form}</p>}
          <div className="grid gap-3 pt-2 sm:grid-cols-2"><button type="button" onClick={closeProfileEditor} disabled={savingProfile || uploadingAvatar} className="ui-button ui-button-secondary">Cancel</button><button type="submit" disabled={savingProfile || uploadingAvatar} className="ui-button ui-button-primary">{savingProfile ? "Saving changes" : "Save profile"}</button></div>
        </form>
      </Dialog>

      <Dialog
        isOpen={cancelModal.open && Boolean(cancelModal.booking)}
        onClose={closeCancelModal}
        labelledBy="cancel-title"
        initialFocusRef={cancelCloseRef}
        panelClassName="ui-card w-full max-w-lg p-6 shadow-2xl sm:p-8"
      >
        {cancelModal.booking && (
          <>
            <div className="flex items-start justify-between gap-4"><div><p className="ui-eyebrow text-red-400">Cancellation request</p><h2 id="cancel-title" className="ui-card-title mt-2 italic text-white">Cancel {cancelModal.booking.bookingCode}?</h2></div><button ref={cancelCloseRef} type="button" onClick={closeCancelModal} className="ui-icon-button" aria-label="Close cancellation dialog"><span className="material-symbols-outlined" aria-hidden="true">close</span></button></div>
            <p className="ui-copy mt-4 text-sm">Tell the hotel why you need to cancel. Any payment or refund remains subject to the booking terms and verification.</p>
            <label className="mt-6 block"><span className="ui-label">Reason for cancellation</span><textarea value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} maxLength={500} rows={4} className="ui-input min-h-32 resize-y" placeholder="Add a short reason…" /></label>
            <div className="mt-6 grid gap-3 sm:grid-cols-2"><button type="button" onClick={closeCancelModal} className="ui-button ui-button-secondary">Keep booking</button><button type="button" onClick={confirmCancellation} disabled={cancelling || !cancelReason.trim()} className="ui-button border-red-500/30 bg-red-600 text-white hover:bg-red-500">{cancelling ? "Cancelling" : "Confirm cancellation"}</button></div>
          </>
        )}
      </Dialog>

      <div className="pointer-events-none absolute left-0 top-0 size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[130px]" />
      <div className="ui-container relative z-10 max-w-6xl">
        <header className="mb-10 text-center"><p className="ui-eyebrow">Guest account</p><h1 className="ui-page-title mt-3 text-white">Welcome, {lastName}</h1><p className="ui-copy mx-auto mt-4 max-w-xl">View your details, follow each stay, and keep your account secure.</p></header>

        <div className="mx-auto mb-10 flex w-fit max-w-full gap-1 overflow-x-auto rounded border border-white/10 bg-white/[0.025] p-1 scrollbar-hide" role="tablist" aria-label="Guest account sections">
          {(["profile", "bookings", "security"] as Tab[]).map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`min-h-11 whitespace-nowrap rounded px-5 text-xs font-semibold uppercase tracking-[0.1em] transition-colors sm:px-7 ${activeTab === tab ? "bg-primary text-black" : "text-gray-500 hover:text-white"}`}>{tab}</button>)}
        </div>

        <div>
          {activeTab === "profile" && (
            <div role="tabpanel" className="route-transition grid gap-5 md:grid-cols-2">
              <section className="ui-card flex flex-col gap-6 p-6 md:col-span-2 sm:flex-row sm:items-center sm:p-8">
                <ProfileAvatar user={user} size="large" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="ui-card-title break-words text-white">{displayName || "Guest"}</h2>
                    <span className={`rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] ${user.emailVerified ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" : "border-amber-400/25 bg-amber-400/10 text-amber-300"}`}>{user.emailVerified ? "Email verified" : "Verification required"}</span>
                  </div>
                  <p className="mt-2 break-all text-sm text-gray-400">{user.email}</p>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">Keep these details current so confirmations and important stay updates reach you.</p>
                </div>
                <button type="button" onClick={openProfileEditor} className="ui-button ui-button-secondary flex-none"><span className="material-symbols-outlined text-lg" aria-hidden="true">edit</span>Edit profile</button>
              </section>
              <ProfileCard icon="phone" label="Phone number" value={user.phone || "Not added"} />
              <ProfileCard icon="calendar_month" label="Member since" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "—"} />
              <ProfileCard icon="verified_user" label="Account status" value={user.status || "Active"} />
              <ProfileCard icon="luggage" label="Bookings on account" value={`${bookings.length} ${bookings.length === 1 ? "booking" : "bookings"}`} />
            </div>
          )}

          {activeTab === "bookings" && (
            <div role="tabpanel" className="route-transition space-y-5">
              {bookings.length ? bookings.map((booking) => {
                const canCancel = !["cancelled", "checkedin", "checkedout"].includes(booking.status?.toLowerCase() || "");
                const canShowCheckIn = booking.status === "CheckedIn" || (booking.status === "Confirmed" && new Date(booking.checkIn).toDateString() === new Date().toDateString() && new Date().getHours() >= 14);
                return (
                  <article key={booking.id} className="ui-card p-5 sm:p-7">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                      <div><span className="ui-label">Booking reference</span><h2 className="font-display text-2xl italic text-white">{booking.bookingCode}</h2><p className="mt-2 text-sm text-gray-500">Payment: {booking.paymentStatus}</p></div>
                      <dl className="grid grid-cols-2 gap-x-10 gap-y-4 text-sm sm:grid-cols-3"><BookingDatum label="Check-in" value={new Date(booking.checkIn).toLocaleDateString()} /><BookingDatum label="Check-out" value={new Date(booking.checkOut).toLocaleDateString()} /><BookingDatum label="Status" value={booking.status} highlight /></dl>
                      <div className="flex flex-wrap gap-3">
                        <Link to={`/booking-confirmation/${encodeURIComponent(booking.bookingCode)}`} state={{ booking }} className="ui-button ui-button-secondary">View details</Link>
                        {canShowCheckIn && <button type="button" onClick={() => notify("Front desk check-in", "Present this booking reference and a valid means of identification. Hotel staff will complete check-in.", "info")} className="ui-button ui-button-secondary">{booking.status === "CheckedIn" ? "Checked in" : "Check-in info"}</button>}
                        <button type="button" onClick={() => setCancelModal({ open: true, booking })} disabled={!canCancel} className="ui-button border-red-500/25 bg-red-500/5 text-red-300 hover:bg-red-500/10">Cancel</button>
                      </div>
                    </div>
                    {booking.notificationMessage && <p className="mt-5 flex items-start gap-2 rounded border border-primary/20 bg-primary/5 p-3 text-sm text-gray-400"><span className="material-symbols-outlined text-primary" aria-hidden="true">info</span>{booking.notificationMessage}</p>}
                  </article>
                );
              }) : <div className="ui-card border-dashed py-20 text-center"><span className="material-symbols-outlined text-4xl text-primary/60" aria-hidden="true">luggage</span><h2 className="ui-card-title mt-4 italic text-white">No bookings yet</h2><p className="ui-copy mt-3">Your future stays will appear here.</p><Link to="/rooms" className="ui-button ui-button-primary mt-6">Explore rooms</Link></div>}
            </div>
          )}

          {activeTab === "security" && (
            <div role="tabpanel" className="route-transition mx-auto max-w-2xl">
              <form onSubmit={handlePasswordUpdate} className="ui-card p-6 shadow-2xl sm:p-9">
                <p className="ui-eyebrow">Account security</p><h2 className="ui-card-title mt-2 italic text-white">Change your password</h2><p className="ui-copy mt-3 text-sm">Choose a unique password you do not use on another service.</p>
                <div className="mt-7 space-y-5"><SecurityField field="oldPassword" label="Current password" autoComplete="current-password" value={securityData.oldPassword} error={fieldErrors.oldPassword} onChange={(value) => setSecurityData({ ...securityData, oldPassword: value })} /><SecurityField field="newPassword" label="New password" autoComplete="new-password" value={securityData.newPassword} error={fieldErrors.newPassword} onChange={(value) => setSecurityData({ ...securityData, newPassword: value })} /><SecurityField field="confirmNewPassword" label="Confirm new password" autoComplete="new-password" value={securityData.confirmNewPassword} error={fieldErrors.confirmNewPassword} onChange={(value) => setSecurityData({ ...securityData, confirmNewPassword: value })} /></div>
                <button type="submit" disabled={updating} className="ui-button ui-button-primary mt-7 w-full">{updating && <span className="material-symbols-outlined animate-spin" aria-hidden="true">progress_activity</span>}{updating ? "Updating" : "Update password"}</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfileCard = ({ icon, label, value }: { icon: string; label: string; value: string }) => <article className="ui-card flex min-h-40 items-start gap-4 p-6 sm:p-7"><span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary"><span className="material-symbols-outlined" aria-hidden="true">{icon}</span></span><div className="min-w-0"><p className="ui-label">{label}</p><p className="break-words text-lg font-semibold text-white sm:text-xl">{value}</p></div></article>;
const ProfileAvatar = ({ user, size = "default" }: { user: ApplicationUser; size?: "default" | "large" }) => {
  const displayName = user.name?.trim() || [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "Guest";
  const initials = displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const sizeClass = size === "large" ? "size-20 text-xl" : "size-12 text-base";
  return (
    <div className={`${sizeClass} grid flex-none place-items-center overflow-hidden rounded-full border border-primary/25 bg-primary/10 font-semibold tracking-[0.08em] text-primary`}>
      {user.avatarUrl ? <img src={user.avatarUrl} alt={`${displayName} profile`} className="h-full w-full object-cover" /> : <span aria-hidden="true">{initials}</span>}
    </div>
  );
};
const BookingDatum = ({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) => <div><dt className="ui-label">{label}</dt><dd className={`font-semibold ${highlight ? "text-primary" : "text-white"}`}>{value}</dd></div>;
const SecurityField = ({ field, label, autoComplete, value, error, onChange }: { field: string; label: string; autoComplete: string; value: string; error?: string; onChange: (value: string) => void }) => <FormField htmlFor={field} label={label} error={error}><input id={field} required type="password" autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} className={`ui-input ${error ? "border-red-500/50" : ""}`} aria-invalid={Boolean(error)} /></FormField>;

export default Profile;
