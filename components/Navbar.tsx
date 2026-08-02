import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ApplicationUser, UserRole } from "../types";
import Dialog from "./ui/Dialog";

interface NavbarProps {
  user: ApplicationUser | null;
  onLogout: () => void;
}

const navLinks = [
  { name: "Rooms", path: "/rooms" },
  { name: "Experience", path: "/dining" },
  { name: "Services", path: "/services" },
  { name: "Our story", path: "/about" },
];

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const logoutCancelRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setMobileMenuOpen(false), [location.pathname]);

  const handleLogoClick = () => {
    if (location.pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    setLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    setLogoutLoading(true);
    setLogoutConfirmOpen(false);
    onLogout();
  };

  const isAdmin = user && (user.role === UserRole.Admin || user.role === UserRole.Manager);
  const displayName = user?.name?.trim().split(/\s+/).at(-1) || "Guest login";
  const isActive = (path: string) => location.pathname === path || (path === "/rooms" && location.pathname.startsWith("/rooms/"));

  return (
    <>
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[120] -translate-y-20 rounded bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-black transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      <nav
        aria-label="Primary navigation"
        className={`fixed inset-x-0 top-0 z-[70] border-b transition-all duration-500 ${
          isScrolled
            ? "border-white/10 bg-black/90 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.32)] backdrop-blur-xl"
            : "border-transparent bg-gradient-to-b from-black/65 to-transparent py-5"
        }`}
      >
        <div className="ui-container-wide flex items-center justify-between gap-5">
          <Link to="/" onClick={handleLogoClick} className="group flex min-h-11 items-center gap-3" aria-label="Moore Hotels & Suites home">
            <span className="grid size-11 place-items-center overflow-hidden rounded-[4px] bg-[#e4e6e8] shadow-[0_8px_28px_rgba(201,74,17,0.16)] transition-transform duration-300 group-hover:-translate-y-0.5">
              <img
                src="https://res.cloudinary.com/dxryndnhl/image/upload/v1777386017/slazzer-preview-w1yad_jizukz.png"
                alt=""
                className="h-full w-full object-contain"
              />
            </span>
            <span className="flex flex-col">
              <span className="text-[0.92rem] font-bold leading-none tracking-[0.26em] text-white">MOORE</span>
              <span className="mt-1.5 text-[0.62rem] font-semibold uppercase leading-none tracking-[0.14em] text-gray-400">Hotels &amp; Suites</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                aria-current={isActive(link.path) ? "page" : undefined}
                className={`relative flex min-h-11 items-center text-[0.72rem] font-semibold uppercase tracking-[0.13em] transition-colors ${
                  isActive(link.path) ? "text-primary" : "text-gray-300 hover:text-white"
                }`}
              >
                {link.name}
                <span className={`absolute inset-x-0 bottom-1 h-px origin-left bg-primary transition-transform duration-300 ${isActive(link.path) ? "scale-x-100" : "scale-x-0"}`} />
              </Link>
            ))}
            {isAdmin && (
              <a
                href="https://admin.moorehotelandsuites.com"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center text-[0.72rem] font-semibold uppercase tracking-[0.13em] text-primary/80 transition-colors hover:text-primary"
              >
                Admin
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/rooms" className="ui-button ui-button-primary hidden sm:inline-flex lg:hidden">Reserve</Link>
            <Link
              to={user ? "/profile" : "/auth"}
              className="ui-button ui-button-secondary hidden lg:inline-flex"
            >
              <span className="material-symbols-outlined" aria-hidden="true">person</span>
              <span className="max-w-28 truncate">{displayName}</span>
            </Link>
            {user && (
              <button onClick={handleLogout} disabled={logoutLoading} className="ui-icon-button hidden lg:inline-grid" aria-label="Sign out">
                <span className={`material-symbols-outlined ${logoutLoading ? "animate-spin" : ""}`} aria-hidden="true">{logoutLoading ? "progress_activity" : "logout"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="ui-icon-button lg:hidden"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <span className="material-symbols-outlined" aria-hidden="true">menu</span>
            </button>
          </div>
        </div>
      </nav>

      <Dialog
        id="mobile-navigation"
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        ariaLabel="Navigation menu"
        variant="drawer"
        initialFocusRef={closeButtonRef}
        panelClassName="flex w-full max-w-md flex-col border-l border-white/10 bg-[#0d0d0d] p-6 shadow-2xl sm:p-10"
      >
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <span className="ui-eyebrow">Navigation</span>
            <button ref={closeButtonRef} type="button" onClick={() => setMobileMenuOpen(false)} className="ui-icon-button" aria-label="Close navigation menu">
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-2 py-8">
            {navLinks.map((link, index) => (
              <Link
                key={link.path}
                to={link.path}
                tabIndex={mobileMenuOpen ? 0 : -1}
                className={`font-display flex min-h-14 items-center border-b border-white/[0.07] text-[clamp(1.9rem,9vw,2.75rem)] italic transition-colors ${isActive(link.path) ? "text-primary" : "text-white hover:text-primary"}`}
                style={{ transitionDelay: mobileMenuOpen ? `${80 + index * 45}ms` : "0ms" }}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="grid gap-3 border-t border-white/10 pt-6">
            <Link to={user ? "/profile" : "/auth"} tabIndex={mobileMenuOpen ? 0 : -1} className="ui-button ui-button-secondary w-full">
              <span className="material-symbols-outlined" aria-hidden="true">person</span>
              {user ? "Guest dashboard" : "Guest login"}
            </Link>
            <Link to="/rooms" tabIndex={mobileMenuOpen ? 0 : -1} className="ui-button ui-button-primary w-full">Reserve a room</Link>
            {user && <button onClick={handleLogout} disabled={logoutLoading} tabIndex={mobileMenuOpen ? 0 : -1} className="min-h-11 text-sm font-semibold text-red-400 hover:text-red-300">Sign out securely</button>}
          </div>
      </Dialog>

      <Dialog
        isOpen={logoutConfirmOpen}
        onClose={() => !logoutLoading && setLogoutConfirmOpen(false)}
        labelledBy="guest-logout-title"
        describedBy="guest-logout-description"
        role="alertdialog"
        initialFocusRef={logoutCancelRef}
        closeOnBackdrop={!logoutLoading}
        closeOnEscape={!logoutLoading}
        panelClassName="ui-card w-full max-w-md p-6 shadow-2xl sm:p-8"
        zIndex={320}
      >
        <p className="ui-eyebrow text-red-300">Account security</p>
        <h2 id="guest-logout-title" className="ui-card-title mt-2 italic text-white">Sign out of your guest account?</h2>
        <p id="guest-logout-description" className="ui-copy mt-4 text-sm">You will need to enter your email and password again to view personal details and booking history.</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button ref={logoutCancelRef} type="button" onClick={() => setLogoutConfirmOpen(false)} disabled={logoutLoading} className="ui-button ui-button-secondary">Stay signed in</button>
          <button type="button" onClick={confirmLogout} disabled={logoutLoading} className="ui-button border-red-500/30 bg-red-600 text-white hover:bg-red-500">{logoutLoading ? "Signing out" : "Sign out"}</button>
        </div>
      </Dialog>
    </>
  );
};

export default Navbar;
