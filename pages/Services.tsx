import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Amenities: React.FC = () => {
  const navigate = useNavigate();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const sections = [
    {
      title: "The Infinity Pool",
      tag: "AQUATIC EXCELLENCE",
      desc: "Our rooftop pool offers a professional yet relaxing environment with sweeping views of the Lagos skyline. Perfect for business travelers looking for a morning lap or evening relaxation in a premier 4-star hotel setting.",
      img: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=1200",
      features: ["Temperature Controlled", "Private Cabanas", "Towel Service", "City Views"],
    },
    {
      title: "The Executive Lounge",
      tag: "PROFESSIONAL LEISURE",
      desc: "A sophisticated space for our executive guests. Featuring high-speed connectivity, artisanal coffee, and a quiet atmosphere designed for networking or focused work sessions in the heart of Victoria Island.",
      img: "https://images.unsplash.com/photo-1517841078499-2815ec1966a4?auto=format&fit=crop&q=80&w=1200",
      features: ["High-Speed Wi-Fi", "Business Center", "All-Day Refreshments", "Meeting Pods"],
    },
    {
      title: "The Sky Bar",
      tag: "EVENING REFINEMENT",
      desc: "Experience the transition from a productive business day to a relaxed Lagos evening. Our sky bar serves artisanal cocktails and local craft beverages with professional service and a premium vibe.",
      img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1200",
      features: ["Premium Spirits", "Live Music", "Intimate Seating", "Late Night Menu"],
    },
    {
      title: "Hotel Spa & Wellness",
      tag: "GUEST REJUVENATION",
      desc: "Our 4-star wellness center provides professional therapeutic treatments. From deep tissue massages to skin rejuvenation, we use premium local and international products to ensure your stay is refreshing.",
      img: "https://images.unsplash.com/photo-1544161515-4ae6ce6db87e?auto=format&fit=crop&q=80&w=1200",
      features: ["Sauna & Steam", "Therapeutic Massage", "Fitness Center", "Professional Staff"],
    },
  ];

  const handleAction = (action: string) => {
    setLoadingAction(action);
    
    if (action === "helpdesk") {
      setTimeout(() => {
        setLoadingAction(null);
        navigate("/help");
      }, 1000);
      return;
    }

    // Contact Us behavior
    setTimeout(() => {
      setLoadingAction(null);
      setShowModal(true);
    }, 1000);
  };

  return (
    <div className="bg-background-dark pt-24 min-h-screen relative">
      {/* Premium Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-surface-dark border border-primary/20 p-8 md:p-12 max-w-xl w-full rounded-sm shadow-[0_30px_100px_rgba(0,0,0,0.9)] text-center space-y-10 animate-in slide-in-from-bottom-8 duration-500">
            <div className="w-20 h-20 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center text-primary mx-auto animate-luxury-logo">
              <span className="material-symbols-outlined text-4xl">contact_support</span>
            </div>
            <div className="space-y-4">
              <h3 className="serif-font text-4xl text-white italic">Guest Relations</h3>
              <p className="text-gray-400 text-base font-light leading-relaxed max-w-sm mx-auto">
                Our dedicated concierge team is available 24/7 to manage your inquiries, bespoke bookings, and service requests with professional precision.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 text-left">
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Victoria+Island,+Lagos,+Nigeria" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-6 p-5 bg-white/[0.03] border border-white/5 rounded-sm hover:border-primary/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div>
                  <p className="text-[8px] uppercase tracking-[0.3em] text-gray-500 font-black mb-1">Location</p>
                  <p className="text-white text-sm font-medium">Victoria Island, Lagos, Nigeria</p>
                </div>
              </a>

              <a 
                href="tel:+2341234567890" 
                className="flex items-center gap-6 p-5 bg-white/[0.03] border border-white/5 rounded-sm hover:border-primary/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                  <span className="material-symbols-outlined">phone</span>
                </div>
                <div>
                  <p className="text-[8px] uppercase tracking-[0.3em] text-gray-500 font-black mb-1">Direct Line</p>
                  <p className="text-white text-sm font-medium">+234 123 456 7890</p>
                </div>
              </a>

              <a 
                href="mailto:reservations@moorehotel.com" 
                className="flex items-center gap-6 p-5 bg-white/[0.03] border border-white/5 rounded-sm hover:border-primary/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div>
                  <p className="text-[8px] uppercase tracking-[0.3em] text-gray-500 font-black mb-1">Registry Email</p>
                  <p className="text-white text-sm font-medium">reservations@moorehotel.com</p>
                </div>
              </a>
            </div>

            <button 
              onClick={() => setShowModal(false)}
              className="w-full bg-primary text-black py-5 uppercase text-[10px] font-black tracking-[0.4em] hover:bg-yellow-500 transition-all shadow-xl shadow-primary/20 active:scale-95"
            >
              Return to Registry
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
     <section className="relative h-[55vh] md:h-[60vh] flex items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1920"
            className="w-full h-full object-cover opacity-30 scale-105"
            alt="Moore Hotel Services"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-background-dark"></div>
        </div>
        <div className="relative z-10 text-center px-6">
          <p className="text-[8px] md:text-[10px] uppercase tracking-[0.6em] text-primary font-black mb-6 md:mb-8 animate-pulse">
            4-STAR HOSPITALITY STANDARDS
          </p>
          <h1 className="serif-font text-5xl md:text-[10rem] text-white italic drop-shadow-2xl leading-none">
            Guest Services
          </h1>
          <div className="h-px w-20 md:w-32 bg-primary mx-auto mt-10 md:mt-12 opacity-30"></div>
        </div>
      </section>

      {/* Services Sections */}
      <section className="py-24 md:py-40">
        <div className="max-w-[1800px] mx-auto px-6 md:px-10 space-y-32 md:space-y-52">
          {sections.map((section, idx) => (
            <div
              key={section.title}
              className={`flex flex-col ${idx % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-10 md:gap-24 lg:gap-32`}
            >
              {/* Image */}
              <div className="flex-1 relative group w-full">
                <div className="absolute -inset-4 border border-primary/10 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-1000 hidden md:block"></div>
                <div className="relative w-full overflow-hidden rounded-sm shadow-2xl bg-surface-dark border border-white/5">
                  <img
                    src={section.img}
                    className="w-full h-auto max-h-[600px] object-cover transition-all duration-700 group-hover:scale-105 shadow-inner"
                    alt={section.title}
                  />
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 space-y-8 md:space-y-10">
                <div className="space-y-4 md:space-y-6">
                  <p className="text-primary text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em]">
                    {section.tag}
                  </p>
                  <h2 className="serif-font text-5xl md:text-7xl lg:text-[8rem] text-white leading-tight italic">
                    {section.title}
                  </h2>
                </div>
                <p className="text-gray-400 text-lg md:text-2xl font-light leading-relaxed max-w-2xl">
                  {section.desc}
                </p>

                <div className="grid grid-cols-2 gap-4 md:gap-6 pt-6 md:pt-10">
                  {section.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors"
                    >
                      <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-primary/30"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Guest Support CTA */}
      <section className="pb-16 px-4 sm:px-6 md:py-24 md:px-10">
        <div className="max-w-[900px] mx-auto text-center bg-gradient-to-r from-background-dark via-background-dark/80 to-background-dark rounded-3xl shadow-2xl relative overflow-hidden border border-white/10 p-8 sm:p-12 md:p-16">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-primary/10 border-2 border-primary text-primary mb-4 sm:mb-6 md:mb-8 shadow-lg animate-luxury-logo">
            <span className="material-symbols-outlined text-4xl sm:text-5xl md:text-6xl">support_agent</span>
          </div>

          <h2 className="serif-font text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-white italic leading-tight mb-6 sm:mb-8 md:mb-10">
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

export default Amenities;