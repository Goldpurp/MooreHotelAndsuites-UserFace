import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api, getTrustedPaymentUrl } from "../services/api";
import { ApplicationUser, Booking, PaymentMethod, Room } from "../types";
import NotificationModal from "../components/NotificationModal";
import AestheticLoader from "../components/AestheticLoader";
import Dialog from "../components/ui/Dialog";
import { addDaysToInput, differenceInNights, todayInputValue } from "../utils/dates";
import FormField from "../components/ui/FormField";
import { appConfig } from "../config/environment";

interface CheckoutProps {
  user: ApplicationUser | null;
}

type GuestInfo = { firstName: string; lastName: string; email: string; phone: string };
type CheckoutStep = 2 | 3;

const Checkout: React.FC<CheckoutProps> = ({ user }) => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const formRef = useRef<HTMLElement>(null);
  const transferCloseRef = useRef<HTMLButtonElement>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [fetchingRoom, setFetchingRoom] = useState(true);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(2);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [directTransferBooking, setDirectTransferBooking] = useState<Booking | null>(null);
  const [copied, setCopied] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isAvailable, setIsAvailable] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ show: boolean; title: string; message: string; type: "success" | "error" | "info" }>({ show: false, title: "", message: "", type: "info" });
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    firstName: user?.firstName || user?.name?.split(" ")[0] || "",
    lastName: user?.lastName || user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const checkIn = searchParams.get("checkIn") || todayInputValue();
  const checkOut = searchParams.get("checkOut") || addDaysToInput(checkIn, 1);

  useEffect(() => {
    if (!user) return;
    setGuestInfo({
      firstName: user.firstName || user.name?.split(" ")[0] || "",
      lastName: user.lastName || user.name?.split(" ").slice(1).join(" ") || "",
      email: user.email,
      phone: user.phone || "",
    });
  }, [user]);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId) {
        navigate("/rooms", { replace: true });
        return;
      }
      try {
        setRoom(await api.getRoomById(roomId));
      } catch {
        navigate("/rooms", { replace: true });
      } finally {
        setFetchingRoom(false);
      }
    };
    fetchRoom();
  }, [roomId, navigate]);

  useEffect(() => {
    const verify = async () => {
      if (!roomId || !checkIn || !checkOut || checkOut <= checkIn) {
        setIsAvailable(false);
        setAvailabilityMessage("Check-out must be after check-in.");
        setAvailabilityLoading(false);
        return;
      }
      setAvailabilityLoading(true);
      try {
        const result = await api.checkAvailability(roomId, checkIn, checkOut);
        setIsAvailable(result.available);
        setAvailabilityMessage(result.available ? null : result.message || "This room is unavailable for the selected dates.");
      } catch {
        setIsAvailable(false);
        setAvailabilityMessage("Availability could not be verified. Please try again.");
      } finally {
        setAvailabilityLoading(false);
      }
    };
    verify();
  }, [roomId, checkIn, checkOut]);

  const nights = Math.max(1, differenceInNights(checkIn, checkOut));
  const totalAmount = room ? room.pricePerNight * nights : 0;

  const updateGuestField = (field: keyof GuestInfo, value: string) => {
    setGuestInfo((current) => ({ ...current, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((current) => ({ ...current, [field]: "" }));
  };

  const validateGuestInfo = () => {
    const errors: Record<string, string> = {};
    if (!guestInfo.firstName.trim()) errors.firstName = "First name is required.";
    else if (guestInfo.firstName.trim().length > 80) errors.firstName = "First name is too long.";
    if (!guestInfo.lastName.trim()) errors.lastName = "Last name is required.";
    else if (guestInfo.lastName.trim().length > 80) errors.lastName = "Last name is too long.";
    if (!guestInfo.email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestInfo.email.trim())) errors.email = "Enter a valid email address.";
    if (!/^\+?[0-9 ()-]{7,30}$/.test(guestInfo.phone.trim())) errors.phone = "Enter a valid phone number.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    return Object.keys(errors).length === 0;
  };

  const handleCopy = async () => {
    const instructions = directTransferBooking?.paymentInstruction;
    if (!instructions) {
      setNotification({ show: true, title: "Instructions unavailable", message: "Contact Guest Relations and quote your booking reference.", type: "info" });
      return;
    }
    try {
      await navigator.clipboard.writeText(instructions);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setNotification({ show: true, title: "Could not copy", message: "Select and copy the transfer details manually.", type: "info" });
    }
  };

  const createBooking = (paymentMethod: PaymentMethod) => api.createBooking({
    roomId: roomId!,
    guestFirstName: guestInfo.firstName.trim(),
    guestLastName: guestInfo.lastName.trim(),
    guestEmail: guestInfo.email.trim().toLowerCase(),
    guestPhone: guestInfo.phone.trim(),
    checkIn,
    checkOut,
    paymentMethod,
    notes: user ? `Member selected ${paymentMethod}.` : `Guest selected ${paymentMethod}.`,
  });

  const returnToRoom = () => {
    const suffix = searchParams.toString();
    navigate(`/rooms/${roomId}${suffix ? `?${suffix}` : ""}`);
  };

  const continueToPayment = () => {
    if (!validateGuestInfo()) return;
    if (availabilityLoading || !isAvailable) {
      setNotification({ show: true, title: "Room unavailable", message: availabilityMessage || "This room is unavailable for the selected dates.", type: "error" });
      return;
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    if (processing || directTransferBooking) return;
    if (currentStep === 3) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    returnToRoom();
  };

  const handleBooking = async () => {
    if (processing || !validateGuestInfo()) return;
    if (!selectedMethod) {
      setNotification({ show: true, title: "Choose a payment method", message: "Select online payment or direct bank transfer to continue.", type: "info" });
      document.getElementById("payment-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (availabilityLoading || !isAvailable) {
      setNotification({ show: true, title: "Room unavailable", message: availabilityMessage || "This room is unavailable for the selected dates.", type: "error" });
      return;
    }
    if (selectedMethod === PaymentMethod.DirectTransfer && directTransferBooking) {
      setShowTransferModal(true);
      return;
    }

    setProcessing(true);
    try {
      const booking = await createBooking(selectedMethod);
      api.rememberBookingLookup(booking.bookingCode, guestInfo.email);
      if (selectedMethod === PaymentMethod.DirectTransfer) {
        setDirectTransferBooking(booking);
        setShowTransferModal(true);
        return;
      }
      if (booking.paymentUrl) {
        const trustedPaymentUrl = getTrustedPaymentUrl(booking.paymentUrl);
        if (!trustedPaymentUrl) throw new Error("The payment provider returned an invalid checkout address.");
        window.location.assign(trustedPaymentUrl);
        return;
      }
      navigate(`/booking-confirmation/${booking.bookingCode}`, { state: { booking } });
    } catch (error: unknown) {
      setNotification({ show: true, title: "Booking not completed", message: error instanceof Error ? error.message : "We could not process your booking. Please try again.", type: "error" });
    } finally {
      setProcessing(false);
    }
  };

  const viewTransferBooking = () => {
    if (!directTransferBooking) return;
    setShowTransferModal(false);
    navigate(`/booking-confirmation/${directTransferBooking.bookingCode}`, { state: { booking: directTransferBooking } });
  };

  if (fetchingRoom || !room) return <AestheticLoader message="Preparing your booking" subtext="Loading stay details" />;

  return (
    <div className="min-h-screen bg-background-dark px-4 pb-24 pt-32 sm:px-6">
      <NotificationModal isOpen={notification.show} onClose={() => setNotification((current) => ({ ...current, show: false }))} title={notification.title} message={notification.message} type={notification.type} />
      {processing && <AestheticLoader message="Securing your booking" subtext="Please keep this page open" />}

      <Dialog
        isOpen={showTransferModal}
        onClose={viewTransferBooking}
        labelledBy="transfer-title"
        initialFocusRef={transferCloseRef}
        closeOnBackdrop={false}
        closeOnEscape={false}
        panelClassName="ui-card w-full max-w-lg p-6 shadow-[0_30px_100px_rgba(0,0,0,.75)] sm:p-8"
      >
            <div className="flex items-start justify-between gap-5">
              <div><span className="grid size-12 place-items-center rounded-full border border-primary/25 bg-primary/10 text-primary"><span className="material-symbols-outlined" aria-hidden="true">account_balance</span></span><p className="ui-eyebrow mt-5">Direct transfer</p><h2 id="transfer-title" className="ui-card-title mt-2 italic text-white">Payment instructions</h2></div>
              <button ref={transferCloseRef} type="button" onClick={viewTransferBooking} className="ui-icon-button" aria-label="Continue to booking status"><span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span></button>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 rounded border border-white/10 bg-black/25 p-4">
              <div><dt className="ui-label">Booking reference</dt><dd className="break-all font-mono text-base font-bold text-primary">{directTransferBooking?.bookingCode}</dd></div>
              <div><dt className="ui-label">Amount due</dt><dd className="text-lg font-semibold text-white">₦{directTransferBooking?.amount.toLocaleString()}</dd></div>
            </dl>
            <div className="mt-6">
              <div className="flex items-center justify-between"><span className="ui-label">Transfer details</span><span className="text-xs text-emerald-400" aria-live="polite">{copied ? "Copied" : ""}</span></div>
              <button type="button" onClick={handleCopy} className="mt-2 flex w-full items-start justify-between gap-4 rounded border border-white/10 bg-white/[0.035] p-4 text-left transition-colors hover:border-primary/30 hover:bg-primary/5">
                <span className="whitespace-pre-wrap text-sm leading-7 text-gray-200">{directTransferBooking?.paymentInstruction || "Transfer instructions are temporarily unavailable. Contact Guest Relations and quote the booking reference above."}</span>
                <span className="material-symbols-outlined text-primary" aria-hidden="true">content_copy</span>
              </button>
            </div>
            <p className="mt-5 flex items-start gap-3 rounded border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-gray-400"><span className="material-symbols-outlined mt-0.5 text-primary" aria-hidden="true">info</span><span>Use the booking reference above. Your reservation is confirmed after the hotel verifies receipt of funds.</span></p>
            {directTransferBooking?.notificationMessage && <p className="mt-4 text-sm leading-6 text-gray-400">{directTransferBooking.notificationMessage}</p>}
            <div className="mt-6 grid gap-3 sm:grid-cols-2"><button type="button" onClick={handleCopy} className="ui-button ui-button-secondary">Copy details</button><button type="button" onClick={viewTransferBooking} className="ui-button ui-button-primary">View booking status</button></div>
      </Dialog>

      <div className="ui-container-wide">
        <header className="mb-10">
          <p className="ui-eyebrow">Step {currentStep} of 3</p>
          <h1 className="ui-page-title mt-3 italic text-white">Complete your <span className="text-primary">booking.</span></h1>
          <p className="ui-copy mt-4 max-w-2xl">Your room and dates stay intact while you review guest details and payment.</p>
          <CheckoutProgress currentStep={currentStep} onStay={returnToRoom} onGuest={() => currentStep === 3 && setCurrentStep(2)} />
        </header>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            {currentStep === 2 ? (
              <section ref={formRef} className="ui-card scroll-mt-32 p-6 sm:p-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="ui-eyebrow">Lead guest</p><h2 className="ui-card-title mt-2 italic text-white">Contact information</h2></div>{!user && <p className="text-sm text-gray-500">Booking as a guest</p>}</div>
                <p className="mt-3 text-sm leading-6 text-gray-500">We use these details for your reservation confirmation and important stay updates.</p>
                <div className="mt-7 grid gap-5 md:grid-cols-2">
                  <FormField label="First name" error={fieldErrors.firstName}><input type="text" autoComplete="given-name" maxLength={80} disabled={processing} value={guestInfo.firstName} onChange={(event) => updateGuestField("firstName", event.target.value)} className={`ui-input ${fieldErrors.firstName ? "border-red-500/50" : ""}`} aria-invalid={Boolean(fieldErrors.firstName)} /></FormField>
                  <FormField label="Last name" error={fieldErrors.lastName}><input type="text" autoComplete="family-name" maxLength={80} disabled={processing} value={guestInfo.lastName} onChange={(event) => updateGuestField("lastName", event.target.value)} className={`ui-input ${fieldErrors.lastName ? "border-red-500/50" : ""}`} aria-invalid={Boolean(fieldErrors.lastName)} /></FormField>
                  <FormField label="Email address" error={fieldErrors.email}><input type="email" autoComplete="email" maxLength={254} disabled={processing} value={guestInfo.email} onChange={(event) => updateGuestField("email", event.target.value)} className={`ui-input ${fieldErrors.email ? "border-red-500/50" : ""}`} aria-invalid={Boolean(fieldErrors.email)} /></FormField>
                  <FormField label="Contact phone" error={fieldErrors.phone}><input type="tel" autoComplete="tel" maxLength={30} placeholder="+234 …" disabled={processing} value={guestInfo.phone} onChange={(event) => updateGuestField("phone", event.target.value)} className={`ui-input ${fieldErrors.phone ? "border-red-500/50" : ""}`} aria-invalid={Boolean(fieldErrors.phone)} /></FormField>
                </div>
                {!user && <p className="mt-6 text-sm leading-6 text-gray-500">You can create an account later to keep future bookings together.</p>}
                <button type="button" onClick={goBack} className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-white"><span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_back</span> Back to room and dates</button>
              </section>
            ) : (
              <section id="payment-section" className="ui-card scroll-mt-32 p-6 sm:p-8">
                <p className="ui-eyebrow">Payment</p><h2 className="ui-card-title mt-2 italic text-white">Choose how to pay</h2>
                <p className="mt-3 text-sm leading-6 text-gray-500">
                  {appConfig.monnifyEnabled
                    ? "No card details are collected by Moore Hotels. Online payments continue through Monnify’s secure checkout."
                    : "Direct bank transfer is currently available. Your reservation is confirmed only after the hotel verifies receipt."}
                </p>
                <div className={`mt-7 grid gap-4 ${appConfig.monnifyEnabled ? "md:grid-cols-2" : ""}`}>
                  {appConfig.monnifyEnabled && (
                    <PaymentChoice icon="credit_card" title="Pay online with Monnify" description="Use card, bank transfer, or USSD on the secure provider page." selected={selectedMethod === PaymentMethod.Monnify} disabled={processing} onClick={() => setSelectedMethod(PaymentMethod.Monnify)} />
                  )}
                  <PaymentChoice icon="account_balance" title="Direct bank transfer" description="Receive hotel transfer instructions, then await verification." selected={selectedMethod === PaymentMethod.DirectTransfer} disabled={processing} onClick={() => setSelectedMethod(PaymentMethod.DirectTransfer)} />
                </div>
                <div className="mt-7 rounded border border-white/10 bg-black/20 p-4 text-sm">
                  <p className="ui-label">Booking contact</p>
                  <p className="font-medium text-white">{guestInfo.firstName} {guestInfo.lastName}</p>
                  <p className="mt-1 break-all text-gray-500">{guestInfo.email}</p>
                </div>
                <button type="button" onClick={goBack} className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-white"><span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_back</span> Back to guest details</button>
              </section>
            )}
          </div>

          <aside className="lg:col-span-4">
            <div className="ui-card sticky top-28 overflow-hidden shadow-2xl">
              <div className="relative h-48 bg-gray-800"><img src={room.images?.[0]} className="image-luxury h-full w-full object-cover" alt={room.name} loading="lazy" /><div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/20 to-transparent p-6"><p className="ui-eyebrow">{room.category}</p><h2 className="ui-card-title mt-2 italic text-white">{room.name}</h2></div></div>
              <div className="space-y-6 p-6 sm:p-8">
                <dl className="space-y-4 text-sm"><SummaryRow label="Stay duration" value={`${nights} ${nights === 1 ? "night" : "nights"}`} /><SummaryRow label="Check-in" value={new Date(checkIn).toLocaleDateString()} /><SummaryRow label="Check-out" value={new Date(checkOut).toLocaleDateString()} /><SummaryRow label="Room capacity" value={`Up to ${room.capacity} ${room.capacity === 1 ? "guest" : "guests"}`} /></dl>
                <div className="border-t border-white/10 pt-5"><span className="ui-label">Stay total</span><p className="font-display text-3xl font-semibold italic text-primary">₦{totalAmount.toLocaleString()}</p><p className="mt-1 text-xs text-gray-500">{nights} × ₦{room.pricePerNight.toLocaleString()}</p></div>
                <button
                  type="button"
                  onClick={currentStep === 2 ? continueToPayment : handleBooking}
                  disabled={processing || availabilityLoading || !isAvailable || (currentStep === 3 && !selectedMethod)}
                  className="ui-button ui-button-primary w-full"
                >
                  {(processing || availabilityLoading) && <span className="material-symbols-outlined animate-spin" aria-hidden="true">progress_activity</span>}
                  {availabilityLoading ? "Verifying" : processing ? "Processing" : currentStep === 2 ? "Continue to payment" : "Confirm & continue"}
                  {!processing && !availabilityLoading && <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>}
                </button>
                {availabilityMessage && <p className="rounded border border-red-500/20 bg-red-500/5 p-3 text-center text-sm text-red-300" aria-live="polite">{availabilityMessage}</p>}
                <p className="flex items-center justify-center gap-2 text-center text-xs text-gray-500"><span className="material-symbols-outlined text-base" aria-hidden="true">lock</span> Secure booking and payment handoff</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const CheckoutProgress = ({ currentStep, onStay, onGuest }: { currentStep: CheckoutStep; onStay: () => void; onGuest: () => void }) => {
  const steps = [
    { number: 1, label: "Stay", action: onStay },
    { number: 2, label: "Guest", action: onGuest },
    { number: 3, label: "Payment", action: undefined },
  ];

  return (
    <nav className="mt-8 max-w-xl" aria-label="Booking progress">
      <ol className="grid grid-cols-3">
        {steps.map((step, index) => {
          const complete = step.number < currentStep;
          const active = step.number === currentStep;
          const enabled = complete && Boolean(step.action);
          return (
            <li key={step.number} className="relative">
              {index > 0 && <span className={`absolute left-0 right-1/2 top-4 h-px ${complete || active ? "bg-primary/70" : "bg-white/10"}`} aria-hidden="true" />}
              {index < steps.length - 1 && <span className={`absolute left-1/2 right-0 top-4 h-px ${complete ? "bg-primary/70" : "bg-white/10"}`} aria-hidden="true" />}
              <button type="button" onClick={step.action} disabled={!enabled} aria-current={active ? "step" : undefined} className={`relative z-10 flex w-full flex-col items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] ${active ? "text-white" : complete ? "text-primary" : "text-gray-600"}`}>
                <span className={`grid size-8 place-items-center rounded-full border text-xs transition-colors ${active ? "border-primary bg-primary text-black" : complete ? "border-primary bg-background-dark text-primary" : "border-white/10 bg-background-dark text-gray-600"}`}>{complete ? <span className="material-symbols-outlined text-base" aria-hidden="true">check</span> : step.number}</span>
                {step.label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const PaymentChoice = ({ icon, title, description, selected, disabled, onClick }: { icon: string; title: string; description: string; selected: boolean; disabled: boolean; onClick: () => void }) => (
  <button type="button" disabled={disabled} onClick={onClick} aria-pressed={selected} className={`group min-h-36 rounded border p-5 text-left transition duration-200 ${selected ? "border-primary bg-primary/10 shadow-[0_12px_30px_rgba(201,74,17,.08)]" : "border-white/10 bg-white/[0.025] hover:-translate-y-0.5 hover:border-white/25"}`}><span className={`material-symbols-outlined text-2xl ${selected ? "text-primary" : "text-gray-500 group-hover:text-primary"}`} aria-hidden="true">{icon}</span><h3 className="mt-3 text-base font-semibold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-gray-500">{description}</p></button>
);

const SummaryRow = ({ label, value }: { label: string; value: string }) => <div className="flex justify-between gap-4"><dt className="text-gray-500">{label}</dt><dd className="font-semibold text-white">{value}</dd></div>;

export default Checkout;
