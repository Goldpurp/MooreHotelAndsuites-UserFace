import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NotificationModal from './NotificationModal';

const Footer: React.FC = () => {
  const [subscribing, setSubscribing] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [modal, setModal] = useState<{ show: boolean; title: string; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    title: '',
    message: '',
    type: 'info'
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Valid email required.");
      return;
    }

    setEmailError("");
    setSubscribing(true);
    setTimeout(() => {
      setModal({
        show: true,
        title: 'Subscription Confirmed',
        message: 'You have been added to the Moore Circle list. Welcome to our elite guest network.',
        type: 'success'
      });
      setSubscribing(false);
      setEmail("");
    }, 1200);
  };

  return (
    <footer className="bg-black border-t border-white/5 pt-[clamp(3rem,6vw,6rem)] pb-[clamp(2rem,4vw,3rem)] px-[clamp(1rem,4vw,3rem)]">
      <NotificationModal 
        isOpen={modal.show}
        onClose={() => setModal({ ...modal, show: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

      <div className="max-w-[1800px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-[clamp(1.5rem,3vw,2.5rem)] mb-[clamp(2rem,4vw,3rem)]">
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-4 text-white group">
            <div className="w-[clamp(2.5rem,3vw,3rem)] h-[clamp(2.5rem,3vw,3rem)] bg-primary rounded flex items-center justify-center text-black font-bold text-[clamp(1rem,1vw,1.125rem)] shadow-lg shadow-primary/10 transition-all animate-luxury-logo group-hover:animate-luxury-spin">M</div>
            <span className="accent-font tracking-widest text-[clamp(1.4rem,2vw,2rem)] font-bold group-hover:text-primary transition-colors">MOORE</span>
          </Link>
          <p className="text-[clamp(0.75rem,0.7vw,0.875rem)] leading-relaxed text-gray-500 max-w-xs">
            Redefining professional 4-star hospitality. Experience the epitome of modern elegance and Nigerian warmth at Moore Hotels & Suites.
          </p>
        </div>

        <div>
          <h5 className="text-white text-[clamp(0.65rem,0.6vw,0.75rem)] uppercase tracking-[0.2em] font-bold mb-6">Explore</h5>
          <ul className="space-y-4 text-[clamp(0.75rem,0.7vw,0.875rem)] font-medium text-gray-500">
            <li><Link to="/rooms" className="hover:text-primary transition-colors">Exclusive Suites</Link></li>
            <li><Link to="/dining" className="hover:text-primary transition-colors">Fine Dining</Link></li>
            <li><Link to="/services" className="hover:text-primary transition-colors">Hotel Services</Link></li>
            <li><Link to="/about" className="hover:text-primary transition-colors">Our History</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-white text-[clamp(0.65rem,0.6vw,0.75rem)] uppercase tracking-[0.2em] font-bold mb-6">Guest Services</h5>
          <ul className="space-y-4 text-[clamp(0.75rem,0.7vw,0.875rem)] font-medium text-gray-500">
            <li className="flex gap-4">
              <span className="material-symbols-outlined text-primary text-lg">location_on</span>
              <span>Victoria Island,<br />Lagos, Nigeria</span>
            </li>
            <li className="flex gap-4">
              <span className="material-symbols-outlined text-primary text-lg">phone</span>
              <span>+234 123 456 7890</span>
            </li>
            <li className="flex gap-4">
              <span className="material-symbols-outlined text-primary text-lg">mail</span>
              <span>reservations@moorehotel.com</span>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="text-white text-[clamp(0.65rem,0.6vw,0.75rem)] uppercase tracking-[0.2em] font-bold mb-6">Stay Connected</h5>
          <p className="text-[clamp(0.75rem,0.7vw,0.875rem)] text-gray-500 mb-6">
            Receive exclusive invitations to private events and corporate previews.
          </p>
          <form className="space-y-3" onSubmit={handleSubscribe}>
            <div className="space-y-1">
              <input 
                required
                className={`w-full bg-white/5 border ${emailError ? 'border-red-500/50' : 'border-none'} text-white placeholder:text-gray-600 text-[clamp(0.75rem,0.7vw,0.875rem)] p-[clamp(0.75rem,1vw,1rem)] rounded focus:ring-1 focus:ring-primary`} 
                placeholder="Business Email" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && <p className="text-red-500 text-[clamp(0.55rem,0.6vw,0.65rem)] uppercase font-black tracking-widest ml-1">{emailError}</p>}
            </div>
            <button 
              disabled={subscribing}
              className="w-full bg-primary text-black py-[clamp(0.75rem,1vw,1rem)] text-[clamp(0.65rem,0.6vw,0.75rem)] uppercase tracking-widest font-black hover:bg-yellow-500 transition-colors rounded shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {subscribing && <div className="w-3 h-3 border border-black/30 border-t-black rounded-full animate-spin"></div>}
              {subscribing ? "SUBSCRIBING..." : "Join Moore Circle"}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[clamp(0.6rem,0.6vw,0.75rem)] uppercase tracking-widest text-gray-600">
        <p>© 2024 MOORE HOTELS & SUITES. 4-STAR HOSPITALITY GROUP.</p>
        <div className="flex flex-wrap justify-center gap-6">
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-primary transition-colors">Terms of Use</Link>
          <Link to="/help" className="hover:text-primary transition-colors">Help Center</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
