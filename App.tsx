import React, { useState, useEffect, useLayoutEffect, Suspense, lazy } from "react";
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

const App: React.FC = () => {
  const [user, setUser] = useState<ApplicationUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top on route change
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  // Initialize authentication
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("mhs_auth_token");
      if (token) {
        try {
          api.setToken(token);
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

  const handleLogin = (userData: ApplicationUser, token: string) => {
    setUser(userData);
    api.setToken(token);
    if (location.pathname === "/auth") navigate("/profile");
  };

  const handleLogout = () => {
    setUser(null);
    api.setToken(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />
      
      <main className="flex-grow">
        {/* If still checking auth, show loader. Otherwise, show routes */}
        {loading ? (
          <AestheticLoader 
            message="Establishing Sanctuary" 
            subtext="Secure Registry Link Active..." 
          />
        ) : (
          <Suspense fallback={<AestheticLoader message="Loading page..." subtext="Please wait..." />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/rooms/:id" element={<RoomDetail />} />
              <Route path="/dining" element={<Dining />} />
              <Route path="/services" element={<Services />} />
              <Route path="/about" element={<About />} />
              <Route path="/auth" element={<Auth onLogin={handleLogin} />} />
              <Route path="/profile" element={user ? <Profile user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} />
              <Route path="/checkout/:roomId" element={<Checkout user={user} />} />
              <Route path="/booking-confirmation/:code" element={<BookingConfirmation />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/help" element={<HelpCenter />} />
              
              {/* Redirect to home ONLY if the path is truly unrecognized */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default App;
