import React, { useState, useEffect, useLayoutEffect, useCallback, Suspense, lazy } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AestheticLoader from './components/AestheticLoader';
import { ApplicationUser } from "./types";
import { api } from "./services/api";

// Lazy load all pages
const Home = lazy(() => import("./pages/Home"));
const Rooms = lazy(() => import("./pages/Rooms"));
const RoomDetail = lazy(() => import("./pages/RoomDetail"));
const Dining = lazy(() => import("./pages/Dining"));
const Services = lazy(() => import("./pages/Services"));
const About = lazy(() => import("./pages/About"));
const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const BookingConfirmation = lazy(() => import("./pages/BookingConfirmation"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const BookingStatus = lazy(() => import("./pages/BookingStatus"));
const ManageBooking = lazy(() => import("./pages/ManageBooking"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const VerifyEmail = lazy(() => import("./components/VerifyEmail"));

const getRouteTitle = (pathname: string) => {
  if (pathname === "/") return "Moore Hotels & Suites";
  if (pathname.startsWith("/rooms/")) return "Room details | Moore Hotels & Suites";
  if (pathname.startsWith("/checkout/")) return "Confirm booking | Moore Hotels & Suites";
  if (pathname.startsWith("/booking-confirmation/")) return "Booking status | Moore Hotels & Suites";
  const titles: Record<string, string> = {
    "/rooms": "Rooms & Suites | Moore Hotels & Suites",
    "/dining": "Dining | Moore Hotels & Suites",
    "/services": "Guest Services | Moore Hotels & Suites",
    "/about": "Our Story | Moore Hotels & Suites",
    "/auth": "Guest Account | Moore Hotels & Suites",
    "/profile": "My Account | Moore Hotels & Suites",
    "/privacy": "Privacy Notice | Moore Hotels & Suites",
    "/terms": "Terms of Use | Moore Hotels & Suites",
    "/help": "Help Center | Moore Hotels & Suites",
    "/manage-booking": "Manage Booking | Moore Hotels & Suites",
    "/booking-status": "Booking Status | Moore Hotels & Suites",
    "/verify-email": "Verify Email | Moore Hotels & Suites",
    "/reset-password": "Reset Password | Moore Hotels & Suites",
  };
  return titles[pathname] || "Page Not Found | Moore Hotels & Suites";
};

const App: React.FC = () => {
  const [user, setUser] = useState<ApplicationUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const routeTitle = getRouteTitle(location.pathname);

  // Scroll to top on route change
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.getElementById("main-content")?.focus({ preventScroll: true });
  }, [location.pathname]);

  useEffect(() => {
    document.title = routeTitle;
  }, [routeTitle]);

  // Initialize authentication
  useEffect(() => {
    const initAuth = async () => {
      if (api.hasToken()) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch {
          api.setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const handleLogin = useCallback((userData: ApplicationUser, token: string) => {
    setUser(userData);
    api.setToken(token);
    if (location.pathname === "/auth") navigate("/profile");
  }, [location.pathname, navigate]);

  const handleLogout = useCallback(() => {
    setUser(null);
    api.setToken(null);
    navigate("/");
  }, [navigate]);

  const handleUserChange = useCallback((userData: ApplicationUser) => {
    setUser(userData);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />
      
      <p className="sr-only" aria-live="polite">{routeTitle}</p>
      <main className="flex-grow" id="main-content" tabIndex={-1}>
        {/* If still checking auth, show loader. Otherwise, show routes */}
        {loading ? (
          <AestheticLoader 
            message="Loading Application" 
            subtext="Connecting to Hotel Services..." 
          />
        ) : (
          <Suspense fallback={<AestheticLoader message="Preparing your view" subtext="One moment" />}>
            <div className="route-transition" key={location.pathname}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/rooms/:id" element={<RoomDetail />} />
              <Route path="/dining" element={<Dining />} />
              <Route path="/services" element={<Services />} />
              <Route path="/about" element={<About />} />
              <Route path="/auth" element={<Auth onLogin={handleLogin} />} />
              <Route path="/profile" element={user ? <Profile user={user} onLogout={handleLogout} onUserChange={handleUserChange} /> : <Navigate to="/auth" />} />
              <Route path="/checkout/:roomId" element={<Checkout user={user} />} />
              <Route path="/booking-confirmation/:code" element={<BookingConfirmation />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/booking-status" element={<BookingStatus />} />
              <Route path="/manage-booking" element={<ManageBooking />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            </div>
          </Suspense>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default App;
