import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Rooms from "./pages/Rooms";
import RoomDetail from "./pages/RoomDetail";
import Dining from "./pages/Dining";
import Services from "./pages/Services";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import BookingConfirmation from "./pages/BookingConfirmation";
import Checkout from "./pages/Checkout";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import HelpCenter from "./pages/HelpCenter";
import { ApplicationUser } from "./types";
import { api } from "./services/api";
import AestheticLoader from './components/AestheticLoader';


const App: React.FC = () => {
  const [user, setUser] = useState<ApplicationUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("mhs_auth_token");
      if (token) {
        try {
          api.setToken(token);
          const userData = await api.getMe();
          setUser(userData);
        } catch (error) {
          console.error("Auth initialization failed");
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
    if (location.pathname === "/auth") {
      navigate("/profile");
    }
  };

  const handleLogout = () => {
    setUser(null);
    api.setToken(null);
    navigate("/");
  };

  if (loading) {
    return (
      <AestheticLoader 
        message="Establishing Sanctuary" 
        subtext="Secure Registry Link Active..." 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/dining" element={<Dining />} />
          <Route path="/amenities" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<Auth onLogin={handleLogin} />} />
          <Route
            path="/profile"
            element={
              user ? (
                <Profile user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
          <Route path="/checkout/:roomId" element={<Checkout user={user} />} />
          <Route
            path="/booking-confirmation/:code"
            element={<BookingConfirmation />}
          />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
