import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

type DialogVariant = "modal" | "drawer";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  labelledBy?: string;
  describedBy?: string;
  ariaLabel?: string;
  id?: string;
  variant?: DialogVariant;
  panelClassName?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  zIndex?: number;
  role?: "dialog" | "alertdialog";
}

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const dialogStack: string[] = [];
let pageLockCount = 0;
let previousBodyOverflow = "";
let rootWasInert = false;

function lockPage() {
  if (pageLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const root = document.getElementById("root");
    if (root) {
      rootWasInert = root.inert;
      root.inert = true;
    }
  }
  pageLockCount += 1;
}

function unlockPage() {
  pageLockCount = Math.max(0, pageLockCount - 1);
  if (pageLockCount !== 0) return;

  document.body.style.overflow = previousBodyOverflow;
  const root = document.getElementById("root");
  if (root) root.inert = rootWasInert;
}

const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  children,
  labelledBy,
  describedBy,
  ariaLabel,
  id,
  variant = "modal",
  panelClassName = "",
  closeOnBackdrop = true,
  closeOnEscape = true,
  initialFocusRef,
  zIndex = 300,
  role = "dialog",
}) => {
  const instanceId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogStack.push(instanceId);
    lockPage();

    const focusTimer = window.setTimeout(() => {
      const preferred = initialFocusRef?.current;
      const firstFocusable = panelRef.current?.querySelector<HTMLElement>(focusableSelector);
      (preferred || firstFocusable || panelRef.current)?.focus({ preventScroll: true });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (dialogStack.at(-1) !== instanceId) return;

      if (event.key === "Escape" && closeOnEscape) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => !element.hidden && element.getClientRects().length > 0);

      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      const stackIndex = dialogStack.lastIndexOf(instanceId);
      if (stackIndex >= 0) dialogStack.splice(stackIndex, 1);
      unlockPage();
      if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true });
    };
  }, [closeOnEscape, initialFocusRef, instanceId, isOpen]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`ui-dialog-layer ${variant === "drawer" ? "ui-dialog-layer-drawer" : "ui-dialog-layer-modal"}`}
      style={{ zIndex }}
      onMouseDown={(event) => {
        if (closeOnBackdrop && !panelRef.current?.contains(event.target as Node)) onClose();
      }}
    >
      <div className="ui-dialog-backdrop" aria-hidden="true" />
      <div
        ref={panelRef}
        id={id}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-label={ariaLabel}
        tabIndex={-1}
        className={`${variant === "drawer" ? "ui-dialog-drawer" : "ui-dialog-panel"} ${panelClassName}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default Dialog;
