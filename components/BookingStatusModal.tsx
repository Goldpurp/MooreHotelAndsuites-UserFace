import React, { useId, useRef } from "react";
import { Link } from "react-router-dom";
import Dialog from "./ui/Dialog";
import { Booking, Room, BookingStatus } from "../types";

const formatStatus = (value: string | null | undefined) =>
  value ? value.replace(/([a-z])([A-Z])/g, "$1 $2") : "Not selected";

interface BookingStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  room?: Room | null;
}

const BookingStatusModal: React.FC<BookingStatusModalProps> = ({ isOpen, onClose, booking, room }) => {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  if (!booking) return null;

  const isPending = booking.status === BookingStatus.Pending;
  const isCancelled = [BookingStatus.Cancelled, BookingStatus.NoShow].includes(booking.status);
  const statusLabel =
    booking.status === BookingStatus.CheckedOut
      ? "Completed"
      : booking.status === BookingStatus.CheckedIn
        ? "Checked In"
        : booking.status;
  const statusColor = isPending
    ? "border-primary bg-primary/10 text-primary"
    : isCancelled
      ? "border-red-500 bg-red-500/10 text-red-500"
      : "border-emerald-500 bg-emerald-500/10 text-emerald-500";

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      labelledBy={titleId}
      initialFocusRef={closeButtonRef}
      zIndex={400}
      panelClassName="ui-card w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 shadow-[0_30px_100px_rgba(0,0,0,.72)] sm:p-10"
    >
      <div className="flex flex-col items-center text-center">
        <div className={`grid size-14 place-items-center rounded-full border ${statusColor}`}>
          <span className="material-symbols-outlined text-2xl" aria-hidden="true">
            {isPending ? "hourglass_top" : isCancelled ? "cancel" : "check_circle"}
          </span>
        </div>
        <p className="ui-eyebrow mt-5">Verified booking record</p>
        <h2 id={titleId} className="ui-card-title mt-2 italic text-white">{statusLabel}</h2>
        <p className="mt-3 text-sm text-gray-400">{booking.guestFirstName} {booking.guestLastName}</p>
      </div>

      <div className="mt-7 rounded border border-white/10 bg-black/25 p-5 sm:p-6">
        <div className="text-center">
          <p className="ui-label">Reference code</p>
          <p className="break-all font-mono text-xl font-bold tracking-[0.08em] text-white sm:text-2xl">
            {booking.bookingCode}
          </p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-5 border-t border-white/10 pt-6 text-sm sm:grid-cols-4">
          <ModalField label="Room" value={booking.roomTypeName || room?.name || "Standard Room"} detail={room?.category || booking.roomTypeCode || ""} />
          <ModalField
            label="Nights"
            value={String(
              Math.max(
                1,
                Math.ceil(
                  (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 86_400_000,
                ),
              ),
            )}
          />
          <ModalField label="Check-In" value={new Date(booking.checkIn).toLocaleDateString()} />
          <ModalField label="Check-Out" value={new Date(booking.checkOut).toLocaleDateString()} />
        </div>
        <div className="mt-6 border-t border-white/10 pt-6 text-center">
          <p className="ui-label">Amount</p>
          <p className="font-display text-3xl font-semibold text-primary sm:text-4xl">
            ₦{booking.amount.toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Payment: {formatStatus(booking.paymentStatus)}
            {booking.paymentMethod ? ` · ${formatStatus(booking.paymentMethod)}` : ""}
          </p>
        </div>
      </div>

      {booking.notificationMessage && (
        <p className="mt-5 rounded border border-primary/20 bg-primary/5 p-4 text-center text-sm leading-6 text-gray-300">
          {booking.notificationMessage}
        </p>
      )}

      {booking.status === BookingStatus.Pending && booking.paymentExpiresAtUtc && (
        <p className="mt-5 rounded border border-amber-400/30 bg-amber-400/10 p-4 text-center text-sm leading-6 text-amber-100">
          Payment must be confirmed by{" "}
          <strong>{new Date(booking.paymentExpiresAtUtc).toLocaleString()}</strong>.
          {" "}If it is not confirmed within one hour, this booking is cancelled automatically so the room becomes available again.
        </p>
      )}

      {booking.paymentInstruction && (
        <section className="mt-5 rounded border border-white/10 bg-black/20 p-5" aria-label="Payment instructions">
          <p className="ui-label">Direct transfer</p>
          <h3 className="text-base font-semibold text-white">Payment instructions</h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-300">{booking.paymentInstruction}</p>
        </section>
      )}

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <Link
          to={`/booking-confirmation/${encodeURIComponent(booking.bookingCode)}`}
          state={{ booking, guestAccessToken: booking.guestAccessToken }}
          className="ui-button ui-button-secondary w-full"
        >
          <span className="material-symbols-outlined" aria-hidden="true">print</span> View full page / print
        </Link>
        <button ref={closeButtonRef} onClick={onClose} className="ui-button ui-button-primary w-full">
          Close
        </button>
      </div>

      {isPending && (
        <p className="mt-5 text-center text-sm italic text-gray-500">
          Your room is held temporarily while payment is verified.
        </p>
      )}
    </Dialog>
  );
};

const ModalField = ({ label, value, detail }: { label: string; value: string; detail?: string }) => (
  <div>
    <p className="ui-label">{label}</p>
    <p className="font-semibold text-white">{value}</p>
    {detail && <p className="mt-1 text-xs text-primary">{detail}</p>}
  </div>
);

export default BookingStatusModal;
