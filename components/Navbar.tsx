import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ApplicationUser } from "../types";

interface NavbarProps {
  user: ApplicationUser | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: "ROOMS", path: "/rooms" },
    { name: "DINING", path: "/dining" },
    { name: "AMENITIES", path: "/amenities" },
    { name: "ABOUT", path: "/about" },
  ];

  const getDisplayName = () => {
    if (!user) return "MEMBERS PORTAL";
    return (user.firstName || user.name || "MEMBER").toUpperCase();
  };

  return (
    <>
      <nav
        className={`fixed w-full z-[70] transition-all duration-700 ${
          isScrolled
            ? "bg-black/98 backdrop-blur-2xl py-3 border-b border-white/10 shadow-2xl"
            : "bg-transparent py-8 md:py-10"
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-10 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-primary rounded flex items-center justify-center text-black font-black text-xl md:text-2xl shadow-2xl shadow-primary/20 transition-all animate-luxury-logo group-hover:animate-luxury-spin group-hover:scale-110">
              M
            </div>
            <span className="accent-font tracking-[0.4em] text-xl md:text-2xl font-bold text-white group-hover:text-primary transition-colors hidden md:inline">
              MOORE
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-12">
            <div className="flex gap-10 text-[10px] font-black tracking-[0.4em] uppercase">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`hover:text-primary transition-all relative py-1 ${
                    location.pathname === link.path
                      ? "text-primary"
                      : "text-gray-400"
                  }`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <span className="absolute -bottom-1 left-0 w-full h-px bg-primary/40"></span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-12">
            <Link
              to={user ? "/profile" : "/auth"}
              className="text-[9px] font-black tracking-[0.5em] uppercase text-gray-400 hover:text-white transition-colors flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-sm">lock</span>
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
              className="bg-primary text-black px-4 py-2 rounded-sm text-[9px] font-black tracking-[0.1em] uppercase shadow-lg hover:bg-yellow-500 transition-all active:scale-95"
            >
              Reserve
            </Link>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex flex-col gap-1.5 p-2 group"
            >
              <div className="w-5 h-[1px] bg-white group-hover:bg-primary transition-colors"></div>
              <div className="w-3 h-[1px] bg-white group-hover:bg-primary transition-colors self-end"></div>
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-[100] transition-all duration-700 ease-in-out ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/98 backdrop-blur-3xl transform transition-transform duration-700 cubic-bezier(0.85, 0, 0.15, 1) ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col p-8 md:p-12 pt-32">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-10 right-10 text-primary group"
            >
              <span className="material-symbols-outlined text-4xl md:text-5xl transition-transform group-hover:rotate-90">
                close
              </span>
            </button>

            <div className="flex flex-col gap-6 md:gap-10 mt-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="serif-font text-5xl md:text-8xl text-white italic hover:text-primary transition-all leading-tight"
                >
                  {link.name.toLowerCase()}
                </Link>
              ))}

              <div className="h-px w-16 bg-primary/20 my-6 md:my-10"></div>

              <Link
                to={user ? "/profile" : "/auth"}
                className="text-xl md:text-3xl font-light text-gray-500 hover:text-white transition-colors"
              >
                {user ? "Personal Dashboard" : "Members Portal Login"}
              </Link>

              {user && (
                <button
                  onClick={onLogout}
                  className="text-left text-red-500/60 text-lg uppercase tracking-widest font-black pt-2"
                >
                  Logout
                </button>
              )}
            </div>

            <div className="mt-auto pt-8 border-t border-white/5 space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[7px] uppercase tracking-widest text-gray-600 font-black">
                    Concierge
                  </p>
                  <p className="text-[10px] text-white">+234 123 456 7890</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[7px] uppercase tracking-widest text-gray-600 font-black">
                    Location
                  </p>
                  <p className="text-[10px] text-white">Lagos, VI</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
