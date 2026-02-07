import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ApplicationUser, UserRole } from "../types";

interface NavbarProps {
  user: ApplicationUser | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: "ROOMS", path: "/rooms" },
    { name: "DINING", path: "/dining" },
    { name: "SERVICES", path: "/amenities" },
    { name: "HISTORY", path: "/about" },
  ];

  const isAdmin = user && (user.role === UserRole.Admin || user.role === UserRole.Manager);

  const getDisplayName = () => {
    if (!user) return "GUEST LOGIN";
    return (user.firstName || user.name || "GUEST").toUpperCase();
  };

  return (
    <>
      <nav
        className={`fixed w-full z-[70] transition-all duration-500 ease-out ${
          isScrolled
            ? "bg-black/90 backdrop-blur-xl py-4 border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            : "bg-transparent py-8 md:py-10"
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-10 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="logo-box relative">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-sm flex items-center justify-center text-black font-black text-xl md:text-2xl shadow-2xl shadow-primary/20 transition-all duration-500 animate-luxury-logo group-hover:scale-105">
                M
              </div>
            </div>
            <div className="flex flex-col">
              <span className="accent-font tracking-[0.5em] text-lg md:text-xl font-bold text-white group-hover:text-primary transition-colors">
                MOORE
              </span>
              <span className="text-[7px] tracking-[0.8em] text-gray-500 uppercase font-black -mt-1 hidden md:block">
                Hotels & Suites
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-14">
            <div className="flex gap-12 text-[10px] font-black tracking-[0.45em] uppercase">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`hover:text-primary transition-all relative py-2 ${
                    location.pathname === link.path ? "text-primary" : "text-gray-400"
                  }`}
                >
                  {link.name}
                  <span className={`absolute bottom-0 left-0 h-px bg-primary transition-all duration-500 ease-out ${location.pathname === link.path ? "w-full opacity-100" : "w-0 opacity-0"}`} />
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`hover:text-primary transition-all relative py-2 ${location.pathname === "/admin" ? "text-primary font-black" : "text-primary/60 font-black"}`}
                >
                  ADMIN
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 md:gap-10">
            <div className="hidden lg:flex items-center gap-10">
              <Link
                to={user ? "/profile" : "/auth"}
                className="text-[9px] font-black tracking-[0.5em] uppercase text-gray-400 hover:text-white transition-all flex items-center gap-3 bg-white/5 px-6 py-3 rounded-sm border border-white/5 hover:border-white/10"
              >
                <span className="material-symbols-outlined text-sm">lock_open</span>
                {getDisplayName()}
              </Link>
              {user && (
                <button
                  onClick={onLogout}
                  className="text-[10px] font-black tracking-[0.4em] uppercase text-red-500/60 hover:text-red-500 transition-colors"
                >
                  LOGOUT
                </button>
              )}
            </div>

            <div className="flex lg:hidden items-center gap-4">
              <Link
                to="/rooms"
                className="bg-primary text-black px-5 py-2.5 rounded-sm text-[9px] font-black tracking-[0.2em] uppercase shadow-xl active:scale-95 transition-all"
              >
                Reserve
              </Link>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex flex-col gap-1.5 p-3 group bg-white/5 rounded-sm active:scale-90 transition-all border border-white/5"
              >
                <div className="w-5 h-[1.5px] bg-white group-hover:bg-primary transition-colors"></div>
                <div className="w-5 h-[1.5px] bg-white group-hover:bg-primary transition-colors"></div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 z-[100] transition-all duration-700 ease-in-out ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-black/98 backdrop-blur-3xl transform transition-transform duration-700 ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="h-full flex flex-col p-8 md:p-16 pt-32 relative z-10">
            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-10 right-10 text-primary active:scale-90 transition-all">
              <span className="material-symbols-outlined text-5xl">close</span>
            </button>
            <div className="flex flex-col gap-6 md:gap-10 mt-8">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.path} className="serif-font text-5xl text-white italic hover:text-primary transition-all leading-tight">
                  {link.name.toLowerCase()}
                </Link>
              ))}
              <div className="h-px w-24 bg-primary/20 my-10"></div>
              <div className="space-y-8">
                <Link to={user ? "/profile" : "/auth"} className="block text-2xl font-light text-gray-400 hover:text-white transition-all">
                  {user ? "Guest Dashboard" : "Guest Login"}
                </Link>
                {user && <button onClick={onLogout} className="text-left text-red-500/60 text-lg uppercase tracking-widest font-black pt-4">Secure Exit</button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;