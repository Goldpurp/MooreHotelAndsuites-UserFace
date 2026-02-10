import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const sections = [
  {
    title: "24-Hour Front Desk",
    tag: "ALWAYS AVAILABLE",
    desc: "Our reception is open 24/7 to assist you with check-in, check-out, and any inquiries, ensuring a seamless experience at any hour.",
    img: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&q=80&w=1200",
    features: ["Round-the-Clock Service", "Concierge", "Guest Assistance"],
  },
  {
    title: "Restaurant (Local & Continental Dishes)",
    tag: "CULINARY DELIGHTS",
    desc: "Enjoy a diverse menu of local Nigerian favorites and continental classics, prepared by our expert chefs in a refined dining atmosphere.",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200",
    features: ["Buffet & À la Carte", "Room Service", "Breakfast, Lunch & Dinner"],
  },
  {
    title: "Lounge & Bar",
    tag: "RELAX & UNWIND",
    desc: "Sip on signature cocktails or your favorite drinks in our stylish lounge and bar, perfect for both business and leisure guests.",
    img: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&q=80&w=1200",
    features: ["Cocktails", "Wine Selection", "Relaxed Ambience"],
  },
  {
    title: "Secure Parking Space",
    tag: "CONVENIENT PARKING",
    desc: "Ample, secure parking space is available for all guests, monitored 24/7 for your peace of mind.",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200",
    features: ["24/7 Security", "Spacious Lot", "Easy Access"],
  },
  {
    title: "Laundry & Dry-Cleaning Services",
    tag: "FRESH & CLEAN",
    desc: "Professional laundry and dry-cleaning services are available to keep your wardrobe fresh throughout your stay.",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=1200",
    features: ["Express Service", "Gentle Care", "Pickup & Delivery"],
  },
  {
    title: "Free High-Speed Wi-Fi",
    tag: "CONNECTED ALWAYS",
    desc: "Enjoy complimentary high-speed Wi-Fi throughout the hotel, perfect for work, streaming, and staying in touch.",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200",
    features: ["Unlimited Access", "Secure Connection", "Hotel-wide Coverage"],
  },
  {
    title: "24-Hour Power Supply",
    tag: "UNINTERRUPTED COMFORT",
    desc: "Our facility is equipped with generator and inverter backup, guaranteeing 24-hour electricity for your comfort.",
    img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&q=80&w=1200",
    features: ["Generator Backup", "Inverter System", "No Power Outages"],
  },
  {
    title: "Room Service",
    tag: "IN-ROOM DINING",
    desc: "Order from our extensive menu and enjoy delicious meals and drinks delivered directly to your room, any time of day.",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200",
    features: ["24/7 Service", "Wide Menu", "Prompt Delivery"],
  },
  {
    title: "CCTV Surveillance & Security Personnel",
    tag: "SAFE & SECURE",
    desc: "Your safety is our priority. The hotel is monitored by CCTV and professional security personnel at all times.",
    img: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&q=80&w=1200",
    features: ["24/7 CCTV", "Trained Security", "Controlled Access"],
  },
];

const Services: React.FC = () => {
  const navigate = useNavigate();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleAction = (action: string) => {
    setLoadingAction(action);

    if (action === "helpdesk") {
      setTimeout(() => {
        setLoadingAction(null);
        navigate("/help");
      }, 1000);
      return;
    }

    setTimeout(() => {
      setLoadingAction(null);
      setShowModal(true);
    }, 1000);
  };

  return (
    <div className="bg-background-dark pt-24 min-h-screen relative">
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={() => setShowModal(false)}
          ></div>
          <div className="relative bg-surface-dark border border-primary/20 p-8 md:p-12 max-w-xl w-full rounded-xl shadow-2xl text-center space-y-10 animate-in slide-in-from-bottom-8 duration-500">
            <div className="w-20 h-20 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center text-primary mx-auto animate-luxury-logo">
              <span className="material-symbols-outlined text-4xl">contact_support</span>
            </div>
            <div className="space-y-4">
              <h3 className="serif-font text-3xl md:text-4xl text-white italic">Guest Relations</h3>
              <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed max-w-sm mx-auto">
                Our dedicated concierge team is available 24/7 to manage your inquiries, bespoke bookings, and service requests with professional precision.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 text-left">
              {[
                { icon: "location_on", label: "Location", value: "Victoria Island, Lagos, Nigeria", href: "https://www.google.com/maps/search/?api=1&query=Victoria+Island,+Lagos,+Nigeria" },
                { icon: "phone", label: "Direct Line", value: "+234 123 456 7890", href: "tel:+2341234567890" },
                { icon: "mail", label: "Registry Email", value: "reservations@moorehotel.com", href: "mailto:reservations@moorehotel.com" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-6 p-5 bg-white/[0.03] border border-white/5 rounded-xl hover:border-primary/40 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-gray-500 font-black mb-1">{item.label}</p>
                    <p className="text-white text-sm md:text-base font-medium">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-primary text-black py-4 md:py-5 uppercase text-[11px] md:text-[12px] font-black tracking-widest hover:bg-yellow-500 transition-all shadow-xl shadow-primary/20 active:scale-95 rounded-xl"
            >
              Return to Registry
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <section className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1920"
            className="w-full h-full object-cover opacity-30 scale-105"
            alt="Moore Hotel Services"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-background-dark"></div>
        </div>
        <div className="relative z-10 text-center px-6">
          <p className="text-[8px] md:text-[10px] uppercase tracking-[0.6em] text-primary font-black mb-6 md:mb-8 animate-pulse">
            4-STAR HOSPITALITY STANDARDS
          </p>
          <h1 className="serif-font text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white italic drop-shadow-2xl leading-tight">
            Guest Services
          </h1>
          <div className="h-px w-20 md:w-32 bg-primary mx-auto mt-6 md:mt-8 opacity-30"></div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1800px] mx-auto px-6 md:px-10 space-y-24 md:space-y-32">
          {sections.map((section, idx) => (
            <div
              key={section.title}
              className={`flex flex-col ${idx % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-10 md:gap-16 lg:gap-24`}
            >
              <div className="flex-1 w-full relative group">
                <div className="relative w-full overflow-hidden rounded-xl shadow-2xl bg-surface-dark border border-white/5">
                  <img
                    src={section.img}
                    className="w-full h-auto max-h-[500px] object-cover transition-all duration-700 group-hover:scale-105"
                    alt={section.title}
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="flex-1 space-y-6 md:space-y-8">
                <p className="text-primary text-[10px] md:text-[11px] font-black uppercase tracking-[0.35em]">
                  {section.tag}
                </p>
                <h2 className="serif-font text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white italic leading-tight">
                  {section.title}
                </h2>
                <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed max-w-2xl">
                  {section.desc}
                </p>
                <div className="grid grid-cols-2 gap-4 md:gap-6 pt-4 md:pt-6">
                  {section.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 md:gap-3 text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/30"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16 px-4 sm:px-6 md:py-24 md:px-10">
        <div className="max-w-[900px] mx-auto text-center bg-gradient-to-r from-background-dark via-background-dark/80 to-background-dark rounded-3xl shadow-2xl relative overflow-hidden border border-white/10 p-8 sm:p-12 md:p-16">
          <div className="inline-flex items-center justify-center w-20 sm:w-24 md:w-28 h-20 sm:h-24 md:h-28 rounded-full bg-primary/10 border-2 border-primary text-primary mb-4 sm:mb-6 md:mb-8 shadow-lg animate-luxury-logo">
            <span className="material-symbols-outlined text-4xl sm:text-5xl md:text-6xl">support_agent</span>
          </div>

          <h2 className="serif-font text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white italic leading-tight mb-6 sm:mb-8 md:mb-10">
            Professional Support, <br className="hidden md:block" /> Every Moment
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 justify-center items-center">
            <button
              onClick={() => handleAction("contact")}
              disabled={loadingAction === "contact"}
              className="bg-primary text-black w-full sm:w-auto px-10 py-3 sm:px-12 sm:py-4 md:px-16 md:py-5 text-[11px] sm:text-[12px] md:text-[14px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all rounded-full shadow-xl shadow-primary/30 h-14 flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loadingAction === "contact" && <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>}
              {loadingAction === "contact" ? "CONTACTING..." : "Contact Us"}
            </button>
            <button
              onClick={() => handleAction("helpdesk")}
              disabled={loadingAction === "helpdesk"}
              className="border border-white/20 text-white w-full sm:w-auto px-10 py-3 sm:px-12 sm:py-4 md:px-16 md:py-5 text-[11px] sm:text-[12px] md:text-[14px] font-black uppercase tracking-widest hover:bg-white/10 transition-all rounded-full shadow-md h-14 flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loadingAction === "helpdesk" && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              {loadingAction === "helpdesk" ? "FETCHING..." : "Visit Help Desk"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;