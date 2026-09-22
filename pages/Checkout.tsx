import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { ApplicationUser, Booking, PaymentMethod, PricingQuote, PrivacyPolicy, Room } from "../types";
import NotificationModal from "../components/NotificationModal";
import AestheticLoader from "../components/AestheticLoader";
import Dialog from "../components/ui/Dialog";
import { addDaysToInput, differenceInNights, todayInputValue } from "../utils/dates";
import FormField from "../components/ui/FormField";
import { cloudinaryImage } from "../utils/cloudinary";

interface CheckoutProps {
  user: ApplicationUser | null;
}

type GuestInfo = { firstName: string; lastName: string; email: string; phone: string };
type CheckoutStep = 2 | 3;

const HOTEL_BANK_DETAILS = {
  bankName: "Moniepoint Microfinance Bank",
  accountName: "Yakubu Omobolanle",
  accountNumber: "5452508008",
};

const Checkout: React.FC<CheckoutProps> = ({ user }) => {
  const { roomId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const formRef = useRef<HTMLElement>(null);
  const transferCloseRef = useRef<HTMLButtonElement>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [fetchingRoom, setFetchingRoom] = useState(true);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(2);
  const [processing, setProcessing] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [directTransferBooking, setDirectTransferBooking] = useState<Booking | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
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
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [policies, setPolicies] = useState<PrivacyPolicy | null>(null);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [pricingQuote, setPricingQuote] = useState<PricingQuote | null>(null);

  const [checkIn, setCheckIn] = useState<string>(() => searchParams.get("checkIn") || todayInputValue());
  const [checkOut, setCheckOut] = useState<string>(() => searchParams.get("checkOut") || addDaysToInput(searchParams.get("checkIn") || todayInputValue(), 1));

  const handleCheckInChange = (newCheckIn: string) => {
    setCheckIn(newCheckIn);
    let newCheckOut = checkOut;
    if (!newCheckOut || newCheckOut <= newCheckIn) {
      newCheckOut = addDaysToInput(newCheckIn, 1);
      setCheckOut(newCheckOut);
    }
    setSearchParams({ checkIn: newCheckIn, checkOut: newCheckOut }, { replace: true });
  };

  const handleCheckOutChange = (newCheckOut: string) => {
    setCheckOut(newCheckOut);
    setSearchParams({ checkIn, checkOut: newCheckOut }, { replace: true });
  };

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
    let active = true;
    api.getCurrentPolicies()
      .then((value) => { if (active) setPolicies(value); })
      .catch(() => {
        if (active) {
          setNotification({
            show: true,
            title: "Booking setup unavailable",
            message: "The current privacy and booking terms could not be loaded. Please try again.",
            type: "error",
          });
        }
      });
    return () => { active = false; };
  }, []);

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

  useEffect(() => {
    setPricingQuote(null);
  }, [roomId, checkIn, checkOut, adultCount, childCount]);

  const nights = Math.max(1, differenceInNights(checkIn, checkOut));
  const estimatedTotal = room ? room.pricePerNight * nights : 0;

  const formatMoney = (amount: number, currency = "NGN") =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);

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

  const handleCopyCode = async () => {
    const code = directTransferBooking?.bookingCode;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(HOTEL_BANK_DETAILS.accountNumber);
      setCopiedAccount(true);
      window.setTimeout(() => setCopiedAccount(false), 2000);
    } catch {
      // fallback
    }
  };

  const requestPricingQuote = () => api.createPricingQuote({
    roomId: roomId!,
    checkIn,
    checkOut,
    adultCount,
    childCount,
    roomQuantity: 1,
  });

  const createBooking = (quote: PricingQuote) => api.createBooking({
    roomId: roomId!,
    guestFirstName: guestInfo.firstName.trim(),
    guestLastName: guestInfo.lastName.trim(),
    guestEmail: guestInfo.email.trim().toLowerCase(),
    guestPhone: guestInfo.phone.trim(),
    checkIn,
    checkOut,
    paymentMethod: PaymentMethod.DirectTransfer,
    notes: user ? "Member selected direct bank transfer." : "Guest selected direct bank transfer.",
    adultCount,
    childCount,
    acceptPrivacyPolicy: acceptedPolicies,
    privacyPolicyVersion: policies?.privacyPolicyVersion || "",
    acceptBookingTerms: acceptedPolicies,
    bookingTermsVersion: policies?.bookingTermsVersion || "",
    quoteId: quote.quoteId,
    quoteToken: quote.quoteToken,
    roomQuantity: quote.roomQuantity,
  });

  const returnToRoom = () => {
    const suffix = searchParams.toString();
    navigate(`/rooms/${roomId}${suffix ? `?${suffix}` : ""}`);
  };

  const continueToPayment = async () => {
    if (!validateGuestInfo()) return;
    if (!room || adultCount < 1 || childCount < 0 || adultCount + childCount > room.capacity) {
      setNotification({ show: true, title: "Occupancy unavailable", message: `This room allows up to ${room?.capacity || 1} guests.`, type: "error" });
      return;
    }
    if (!policies) {
      setNotification({ show: true, title: "Booking setup unavailable", message: "The current legal terms are still loading. Please try again.", type: "error" });
      return;
    }
    if (!acceptedPolicies) {
      setNotification({ show: true, title: "Acceptance required", message: "Accept the Privacy Notice and Booking Terms to continue.", type: "info" });
      return;
    }
    if (availabilityLoading || !isAvailable) {
      setNotification({ show: true, title: "Room unavailable", message: availabilityMessage || "This room is unavailable for the selected dates.", type: "error" });
      return;
    }
    setProcessing(true);
    try {
      const quote = await requestPricingQuote();
      setPricingQuote(quote);
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Current pricing could not be loaded. Please try again.";
      setNotification({ show: true, title: "Pricing unavailable", message, type: "error" });
    } finally {
      setProcessing(false);
    }
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
    if (availabilityLoading || !isAvailable) {
      setNotification({ show: true, title: "Room unavailable", message: availabilityMessage || "This room is unavailable for the selected dates.", type: "error" });
      return;
    }
    if (directTransferBooking) {
      setShowTransferModal(true);
      return;
    }

    setProcessing(true);
    try {
      let quote = pricingQuote;
      if (!quote || new Date(quote.expiresAtUtc).getTime() <= Date.now() + 30_000) {
        const refreshedQuote = await requestPricingQuote();
        setPricingQuote(refreshedQuote);
        if (quote && (
          quote.currency !== refreshedQuote.currency ||
          quote.totalAmount !== refreshedQuote.totalAmount
        )) {
          setNotification({
            show: true,
            title: "Price updated",
            message: "The stay price changed while you were checking out. Review the new total, then confirm again.",
            type: "info",
          });
          return;
        }
        quote = refreshedQuote;
      }
      const booking = await createBooking(quote);
      api.rememberBookingLookup(booking.bookingCode, guestInfo.email, booking.guestAccessToken);
      setDirectTransferBooking(booking);
      setShowTransferModal(true);
      return;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "We could not process your booking. Please try again.";
      if (/pricing quote|after pricing|new quote/i.test(message)) setPricingQuote(null);
      setNotification({ show: true, title: "Booking not completed", message, type: "error" });
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

  const currentTotalAmount = pricingQuote ? pricingQuote.totalAmount : estimatedTotal;

  return (
    <div className="min-h-screen bg-background-dark px-4 pb-24 pt-32 sm:px-6">
      <NotificationModal isOpen={notification.show} onClose={() => setNotification((current) => ({ ...current, show: false }))} title={notification.title} message={notification.message} type={notification.type} />
      {processing && <AestheticLoader message="Securing your booking" subtext="Please keep this page open" />}

      {/* Celebratory Booking Successful Dialog */}
      <Dialog
        isOpen={showTransferModal}
        onClose={viewTransferBooking}
        labelledBy="booking-success-title"
        initialFocusRef={transferCloseRef}
        closeOnBackdrop={false}
        closeOnEscape={false}
        panelClassName="ui-card w-full max-w-lg p-6 shadow-[0_30px_100px_rgba(0,0,0,.75)] sm:p-8"
      >
        <div className="text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <span className="material-symbols-outlined text-4xl" aria-hidden="true">check_circle</span>
          </span>
          <p className="ui-eyebrow mt-4 text-emerald-400">Reservation Received</p>
          <h2 id="booking-success-title" className="ui-card-title mt-1 italic text-white">Booking Successful!</h2>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
            <span className="size-2 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
            Pending Verification
          </div>
          <p className="mt-3 text-sm leading-6 text-gray-300">
            Thank you, <span className="font-semibold text-white">{guestInfo.firstName}</span>! Your booking request has been submitted.
          </p>
        </div>

        <div className="mt-6 rounded border border-white/10 bg-black/30 p-4">
          <div className="flex items-center justify-between">
            <span className="ui-label">Booking Reference</span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 text-xs text-primary transition-colors hover:text-white"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">content_copy</span>
              {copiedCode ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-1 break-all font-mono text-2xl font-bold tracking-wider text-primary">
            {directTransferBooking?.bookingCode}
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-gray-400">
            <span>Total Amount:</span>
            <span className="text-sm font-semibold text-white">₦{directTransferBooking?.amount.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-5 rounded border border-primary/20 bg-primary/5 p-4 text-left text-xs leading-6 text-gray-300">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined shrink-0 text-primary" aria-hidden="true">mail</span>
            <div>
              <p className="font-semibold text-white">Confirmation & Ticket Validation</p>
              <p className="mt-0.5 text-gray-400">
                A confirmation email with your booking code has been dispatched to <strong className="text-gray-200">{guestInfo.email}</strong>.
                Your ticket validation and payment receipt will be updated to your email once verified by hotel reception.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            ref={transferCloseRef}
            type="button"
            onClick={viewTransferBooking}
            className="ui-button ui-button-primary"
          >
            View Booking Details
          </button>
          <button
            type="button"
            onClick={() => { setShowTransferModal(false); navigate("/"); }}
            className="ui-button ui-button-secondary"
          >
            Return Home
          </button>
        </div>
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
                  <FormField label="Adults"><input type="number" min={1} max={Math.min(20, room.capacity)} disabled={processing} value={adultCount} onChange={(event) => setAdultCount(Math.max(1, Number(event.target.value) || 1))} className="ui-input" /></FormField>
                  <FormField label="Children"><input type="number" min={0} max={Math.min(20, room.capacity - 1)} disabled={processing} value={childCount} onChange={(event) => setChildCount(Math.max(0, Number(event.target.value) || 0))} className="ui-input" /></FormField>
                </div>
                <label className="mt-6 flex cursor-pointer items-start gap-3 rounded border border-white/10 bg-white/[0.025] p-4 text-sm text-gray-400">
                  <input type="checkbox" checked={acceptedPolicies} onChange={(event) => setAcceptedPolicies(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-primary" />
                  <span>I agree to the <a href={policies?.privacyPolicyUrl || "/privacy"} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-white">Privacy Notice</a> and <a href={policies?.bookingTermsUrl || "/terms"} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-white">Booking Terms</a>.</span>
                </label>
                {adultCount + childCount > room.capacity && <p className="mt-3 text-sm text-red-400" role="alert">This room allows up to {room.capacity} guests.</p>}
                {!user && <p className="mt-6 text-sm leading-6 text-gray-500">You can create an account later to keep future bookings together.</p>}
                <button type="button" onClick={goBack} className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-white"><span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_back</span> Back to room</button>
              </section>
            ) : (
              <section id="payment-section" className="ui-card scroll-mt-32 p-6 sm:p-8">
                <p className="ui-eyebrow">Step 3 of 3</p>
                <h2 className="ui-card-title mt-2 italic text-white">Direct Bank Transfer</h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">
                  Please transfer the total stay amount directly to our hotel bank account below. Once transferred, click the button to acknowledge payment. Your booking reference will be generated and ticket validation will be updated to your email upon reception verification.
                </p>

                {/* Bank Account Details Card */}
                <div className="mt-6 overflow-hidden rounded-lg border border-primary/30 bg-primary/5 p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                      <span className="material-symbols-outlined text-lg" aria-hidden="true">account_balance</span>
                      Hotel Official Bank Account
                    </span>
                    <span className="text-xs text-emerald-400" aria-live="polite">
                      {copiedAccount ? "Copied!" : ""}
                    </span>
                  </div>

                  <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded border border-white/10 bg-black/40 p-3.5">
                      <dt className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Bank Name</dt>
                      <dd className="mt-1 font-semibold text-white text-base">{HOTEL_BANK_DETAILS.bankName}</dd>
                    </div>
                    <div className="rounded border border-white/10 bg-black/40 p-3.5">
                      <dt className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Account Name</dt>
                      <dd className="mt-1 font-semibold text-white text-base">{HOTEL_BANK_DETAILS.accountName}</dd>
                    </div>
                    <div className="rounded border border-white/10 bg-black/40 p-3.5 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <dt className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Account Number</dt>
                        <button
                          type="button"
                          onClick={handleCopyAccount}
                          className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:text-white"
                        >
                          <span className="material-symbols-outlined text-sm" aria-hidden="true">content_copy</span>
                          {copiedAccount ? "Copied" : "Copy Account"}
                        </button>
                      </div>
                      <dd className="mt-1 font-mono text-2xl font-bold tracking-widest text-primary">
                        {HOTEL_BANK_DETAILS.accountNumber}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex items-center justify-between rounded border border-white/10 bg-black/30 p-3.5 text-sm">
                    <span className="text-gray-400">Total Amount to Pay:</span>
                    <span className="font-display text-xl font-bold text-white">
                      ₦{currentTotalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-6 rounded border border-white/10 bg-black/20 p-4 text-sm">
                  <p className="ui-label">Booking contact</p>
                  <p className="font-medium text-white">{guestInfo.firstName} {guestInfo.lastName}</p>
                  <p className="mt-1 break-all text-gray-500">{guestInfo.email}</p>
                </div>

                {pricingQuote && (
                  <div className="mt-5 rounded border border-white/10 bg-black/20 p-4 text-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div><p className="ui-label">Current hotel quote</p><p className="mt-1 text-gray-500">{pricingQuote.ratePlanName}</p></div>
                      <p className="font-semibold text-primary">{formatMoney(pricingQuote.totalAmount, pricingQuote.currency)}</p>
                    </div>
                    <details className="mt-4 border-t border-white/10 pt-3">
                      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-gray-400">Price details</summary>
                      <dl className="mt-3 space-y-2 text-xs text-gray-400">
                        {pricingQuote.lines.map((line, index) => (
                          <div key={`${line.code}-${line.stayDate || index}`} className="flex justify-between gap-4"><dt>{line.description}</dt><dd className="shrink-0 text-gray-200">{formatMoney(line.amount, pricingQuote.currency)}</dd></div>
                        ))}
                      </dl>
                    </details>
                    <p className="mt-3 text-xs text-gray-500">Price held until {new Date(pricingQuote.expiresAtUtc).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.</p>
                  </div>
                )}

                <button type="button" onClick={goBack} className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-white"><span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_back</span> Back to guest details</button>
              </section>
            )}
          </div>

          <aside className="lg:col-span-4">
            <div className="ui-card sticky top-28 overflow-hidden shadow-2xl">
              <div className="relative h-48 bg-gray-800"><img src={cloudinaryImage(room.images?.[0], 720)} className="image-luxury h-full w-full object-cover" alt={room.name} loading="lazy" decoding="async" /><div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/20 to-transparent p-6"><p className="ui-eyebrow">{room.category}</p><h2 className="ui-card-title mt-2 italic text-white">{room.name}</h2></div></div>
              <div className="space-y-6 p-6 sm:p-8">
                
                {/* Stay Dates with Direct Change Support */}
                <div className="rounded border border-white/10 bg-black/25 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="ui-label">Stay dates</span>
                    <span className="text-xs font-semibold text-primary">{nights} {nights === 1 ? "night" : "nights"}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="checkout-checkin" className="block text-xs text-gray-400 mb-1">Check-in</label>
                      <input
                        id="checkout-checkin"
                        type="date"
                        min={todayInputValue()}
                        value={checkIn}
                        disabled={processing}
                        onChange={(event) => handleCheckInChange(event.target.value)}
                        className="ui-input py-1.5 px-2 text-xs"
                      />
                    </div>
                    <div>
                      <label htmlFor="checkout-checkout" className="block text-xs text-gray-400 mb-1">Check-out</label>
                      <input
                        id="checkout-checkout"
                        type="date"
                        min={addDaysToInput(checkIn, 1)}
                        value={checkOut}
                        disabled={processing}
                        onChange={(event) => handleCheckOutChange(event.target.value)}
                        className="ui-input py-1.5 px-2 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <dl className="space-y-4 text-sm">
                  <SummaryRow label="Room capacity" value={`Up to ${room.capacity} ${room.capacity === 1 ? "guest" : "guests"}`} />
                </dl>
                <div className="border-t border-white/10 pt-5"><span className="ui-label">Stay total</span><p className="font-display text-3xl font-semibold italic text-primary">{pricingQuote ? formatMoney(pricingQuote.totalAmount, pricingQuote.currency) : formatMoney(estimatedTotal)}</p><p className="mt-1 text-xs text-gray-500">{pricingQuote ? "Hotel-confirmed price" : `${nights} × ${formatMoney(room.pricePerNight)}`}</p></div>
                <button
                  type="button"
                  onClick={currentStep === 2 ? () => void continueToPayment() : handleBooking}
                  disabled={processing || availabilityLoading || !isAvailable || !policies}
                  className="ui-button ui-button-primary w-full"
                >
                  {(processing || availabilityLoading) && <span className="material-symbols-outlined animate-spin" aria-hidden="true">progress_activity</span>}
                  {availabilityLoading ? "Verifying" : processing ? "Processing" : currentStep === 2 ? "Review payment" : "I have made this transfer"}
                  {!processing && !availabilityLoading && <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>}
                </button>
                {availabilityMessage && <p className="rounded border border-red-500/20 bg-red-500/5 p-3 text-center text-sm text-red-300" aria-live="polite">{availabilityMessage}</p>}
                <p className="flex items-center justify-center gap-2 text-center text-xs text-gray-500"><span className="material-symbols-outlined text-base" aria-hidden="true">lock</span> Secure booking and transfer instructions</p>
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

const SummaryRow = ({ label, value }: { label: string; value: string }) => <div className="flex justify-between gap-4"><dt className="text-gray-500">{label}</dt><dd className="font-semibold text-white">{value}</dd></div>;

export default Checkout;
