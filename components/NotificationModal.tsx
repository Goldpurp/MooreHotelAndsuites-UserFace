import React, { useId, useRef } from "react";
import Dialog from "./ui/Dialog";

export type NotificationType = "success" | "error" | "info";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: NotificationType;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, title, message, type }) => {
  const titleId = useId();
  const messageId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const icon = { success: "verified", error: "error", info: "info" }[type];
  const color = {
    success: "border-primary/30 bg-primary/10 text-primary",
    error: "border-red-500/30 bg-red-500/10 text-red-400",
    info: "border-blue-400/30 bg-blue-400/10 text-blue-300",
  }[type];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      labelledBy={titleId}
      describedBy={messageId}
      initialFocusRef={buttonRef}
      zIndex={400}
      panelClassName="ui-card w-full max-w-md p-7 text-center shadow-[0_30px_100px_rgba(0,0,0,.72)] sm:p-10"
    >
        <div className={`mx-auto grid size-16 place-items-center rounded-full border ${color}`}>
          <span className="material-symbols-outlined text-[1.8rem]" aria-hidden="true">{icon}</span>
        </div>
        <h2 id={titleId} className="ui-card-title mt-6 italic text-white">{title}</h2>
        <p id={messageId} className="ui-copy mt-3 text-[0.95rem]">{message}</p>
        <button ref={buttonRef} onClick={onClose} className="ui-button ui-button-primary mt-7 w-full">Continue</button>
    </Dialog>
  );
};

export default NotificationModal;
