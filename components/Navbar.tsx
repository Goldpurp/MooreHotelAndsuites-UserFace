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
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: "ROOMS", path: "/rooms" },
    { name: "DINING", path: "/dining" },
    { name: "SERVICES", path: "/services" },
    { name: "HISTORY", path: "/about" },
  ];

const isAdmin = user && (user.role === UserRole.Admin || user.role === UserRole.Manager);
const getDisplayName = () => {
  if (!user || !user.name) return "GUEST LOGIN";
  const nameParts = user.name.trim().split(/\s+/);
  const lastName = nameParts[nameParts.length - 1];
  return lastName.toUpperCase();
};


  return (
    <>
      <nav
        className={`fixed w-full z-[70] transition-all duration-500 ease-out ${
          isScrolled
            ? "bg-black/90 backdrop-blur-xl py-[clamp(0.75rem,1vw,1.25rem)] border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            : "bg-transparent py-[clamp(1.25rem,2vw,2.5rem)]"
        }`}
      >
        <div className="container-luxury flex justify-between items-center">

          <Link to="/" className="flex items-center gap-[clamp(0.5rem,1vw,1rem)] group">
            <div className="logo-box relative">
              <div className="w-[clamp(2.5rem,3vw,3rem)] h-[clamp(2.5rem,3vw,3rem)] bg-primary rounded-sm flex items-center justify-center text-black font-black text-[clamp(1.1rem,1vw+0.8rem,1.6rem)] shadow-2xl shadow-primary/20 transition-all duration-500 animate-luxury-logo group-hover:scale-105">
                M
              </div>
            </div>

            <div className="flex flex-col">
              <span className="accent-font tracking-[0.5em] text-[clamp(0.9rem,0.8vw+0.6rem,1.25rem)] font-bold text-white group-hover:text-primary transition-colors">
                MOORE
              </span>
              <span className="tracking-[0.3em] text-gray-500 uppercase font-black -mt-1 block text-[clamp(0.45rem,0.3vw+0.35rem,0.6rem)]">
                Hotels & Suites
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-[clamp(2rem,4vw,4rem)]">
            <div className="flex gap-[clamp(1.5rem,3vw,3rem)] uppercase font-black tracking-[0.45em] text-[clamp(0.55rem,0.4vw+0.4rem,0.75rem)]">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`hover:text-primary transition-all relative py-2 ${
                    location.pathname === link.path ? "text-primary" : "text-gray-400"
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute bottom-0 left-0 h-px bg-primary transition-all duration-500 ease-out ${
                      location.pathname === link.path ? "w-full opacity-100" : "w-0 opacity-0"
                    }`}
                  />
                </Link>
              ))}

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`hover:text-primary transition-all relative py-2 ${
                    location.pathname === "/admin" ? "text-primary font-black" : "text-primary/60 font-black"
                  }`}
                >
                  ADMIN
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-[clamp(1rem,2vw,2.5rem)]">

            <div className="hidden lg:flex items-center gap-[clamp(1.5rem,2vw,2.5rem)]">
              <Link
                to={user ? "/profile" : "/auth"}
                className="text-[clamp(0.55rem,0.4vw+0.4rem,0.7rem)] font-black tracking-[0.5em] uppercase text-gray-400 hover:text-white transition-all flex items-center gap-3 bg-white/5 px-[clamp(1rem,1.5vw,1.5rem)] py-[clamp(0.5rem,0.7vw,0.8rem)] rounded-sm border border-white/5 hover:border-white/10"
              >
                <span className="material-symbols-outlined text-sm">lock_open</span>
                {getDisplayName()}
              </Link>

              {user && (
                <button
                  onClick={onLogout}
                  className="text-[clamp(0.55rem,0.4vw+0.4rem,0.7rem)] font-black tracking-[0.4em] uppercase text-red-500/60 hover:text-red-500 transition-colors"
                >
                  LOGOUT
                </button>
              )}
            </div>

            <div className="flex lg:hidden items-center gap-4">
              <Link
                to="/rooms"
                className="bg-primary text-black px-[clamp(1rem,3vw,1.5rem)] py-[clamp(0.5rem,1vw,0.75rem)] rounded-sm text-[clamp(0.6rem,0.4vw+0.45rem,0.75rem)] font-black tracking-[0.2em] uppercase shadow-xl active:scale-95 transition-all"
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
          <div className="h-full flex flex-col p-[clamp(1.5rem,5vw,4rem)] pt-[clamp(6rem,10vh,10rem)] relative z-10">
            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-10 right-10 text-primary active:scale-90 transition-all">
              <span className="material-symbols-outlined text-5xl">close</span>
            </button>

            <div className="flex flex-col gap-[clamp(1.5rem,4vh,3rem)] mt-8">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.path} className="serif-font text-[clamp(2.5rem,5vw,4rem)] text-white italic hover:text-primary transition-all leading-tight">
                  {link.name.toLowerCase()}
                </Link>
              ))}

              <div className="h-px w-24 bg-primary/20 my-10"></div>

              <div className="space-y-8">
                <Link to={user ? "/profile" : "/auth"} className="block text-[clamp(1.2rem,2vw,1.6rem)] font-light text-gray-400 hover:text-white transition-all">
                  {user ? "Guest Dashboard" : "Guest Login"}
                </Link>

                {user && (
                  <button onClick={onLogout} className="text-left text-red-500/60 text-[clamp(0.9rem,1vw,1.1rem)] uppercase tracking-widest font-black pt-4">
                    Secure Exit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
