import React, { useState } from "react";

const Dining: React.FC = () => {
  const [reservingVenue, setReservingVenue] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<string>("");

  const venues = [
    {
      name: "L'Horizon",
      tag: "SIGNATURE FINE DINING",
      desc: "An ethereal culinary journey on Sagamu-Ikenne Road, blending local Nigerian ingredients with avant-garde techniques and panoramic coastal views.",
      img: "/Images/L'Horizon.png",
      hours: "18:00 — 23:00",
      menu: "Tasting Menu & A La Carte",
    },
    {
      name: "The Charcoal Room",
      tag: "PREMIUM GRILL & BAR",
      desc: "Bold flavors forged in open flames. Specializing in dry-aged prime cuts and sustainably sourced seafood in an intimate, leather-scented Nigerian setting.",
      img: "/Images/TheCharcoalRoom.png",
      hours: "12:00 — 00:00",
      menu: "Steakhouse & Artisanal Cocktails",
    },
    {
      name: "Sanctuary Lounge",
      tag: "HIGH TEA & SPIRITS",
      desc: "Daylight haven for artisanal teas and delicate pastries, transitioning into a cocktail sanctuary by dusk with Nigerian hospitality at its heart.",
      img: "/Images/SanctuaryLounge.png",
      hours: "08:00 — 22:00",
      menu: "Botanical Infusions & Small Plates",
    },
  ];

  const handleVenueReservation = (venueName: string) => {
    setReservingVenue(venueName);
    setSelectedVenue(venueName);

    setTimeout(() => {
      setReservingVenue(null);
      setShowModal(true);
    }, 1500);
  };

  return (
    <div className="bg-background-dark pt-24 min-h-screen relative">
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-surface-dark border border-primary/20 p-8 md:p-12 max-w-lg w-full rounded-sm shadow-[0_30px_100px_rgba(0,0,0,0.9)] text-center space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            <div className="w-16 h-16 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center text-primary mx-auto animate-luxury-logo">
              <span className="material-symbols-outlined text-4xl">restaurant</span>
            </div>
            <div className="space-y-4">
              <h3 className="serif-font text-3xl text-white italic">In-Person Excellence</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Our dining service isn't available online yet, but we will serve you better on site.
                <br /><br />
                <span className="text-primary/60 text-[10px] uppercase tracking-widest font-black italic">
                  Visit us at MOORE HOTELS for the full experience.
                </span>
              </p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-primary text-black py-4 uppercase text-[10px] font-black tracking-[0.4em] hover:bg-[#B04110] transition-all shadow-xl shadow-primary/20"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[65vh] flex items-center justify-center overflow-hidden px-6">
        <img
          src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1920"
          className="absolute inset-0 w-full h-full object-cover opacity-40 scale-110 transition-transform duration-700"
          alt="Fine Dining"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-background-dark"></div>
        <div className="relative z-10 text-center px-6">
          <p className="text-[8px] md:text-[10px] uppercase tracking-[0.6em] text-primary font-black mb-6 md:mb-8 animate-pulse">
            Epicurean Journeys
          </p>
          <h1 className="serif-font text-5xl md:text-[10rem] text-white italic drop-shadow-2xl leading-none">
            Culinary Arts
          </h1>
          <p className="max-w-2xl mx-auto mt-8 text-gray-400 font-light tracking-[0.3em] uppercase text-[10px] md:text-sm leading-relaxed">
            Experience a symphony of flavors in Lagos' most prestigious dining
            sanctuaries.
          </p>
        </div>
      </section>

      {/* Venues Listing */}
      <section className="py-24 md:py-40 px-6 md:px-10">
        <div className="max-w-[1800px] mx-auto space-y-32 md:space-y-52">
          {venues.map((venue, idx) => (
            <div
              key={venue.name}
              className={`flex flex-col ${idx % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 md:gap-24 lg:gap-32`}
            >
              <div className="flex-1 relative group w-full">
                <div className="absolute -inset-4 border border-primary/10 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-700 hidden md:block"></div>
                <div className="relative w-full overflow-hidden rounded-xl shadow-2xl bg-surface-dark border border-white/5">
                  <img
                    src={venue.img}
                    className="w-full h-auto max-h-[600px] object-contain transition-all duration-700 group-hover:scale-105"
                    alt={venue.name}
                    loading="lazy"
                  />
                </div>
                <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 bg-black/80 backdrop-blur-md p-4 md:p-6 border border-white/10 rounded-lg">
                  <p className="text-primary text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1 md:mb-2">
                    Operating Hours
                  </p>
                  <p className="text-white text-sm md:text-base font-medium tracking-wide">
                    {venue.hours}
                  </p>
                </div>
              </div>

              <div className="flex-1 space-y-8 md:space-y-10">
                <div className="space-y-4 md:space-y-6">
                  <p className="text-primary text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em]">
                    {venue.tag}
                  </p>
                  <h2 className="serif-font text-5xl md:text-7xl lg:text-[8rem] text-white leading-tight italic">
                    {venue.name}
                  </h2>
                </div>
                <p className="text-gray-400 text-lg md:text-2xl font-light leading-relaxed max-w-2xl">
                  {venue.desc}
                </p>

                <div className="pt-8 md:pt-10 border-t border-white/5 space-y-6 md:space-y-8">
                  <div className="flex items-center gap-6 md:gap-8">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-2xl md:text-3xl">
                        restaurant_menu
                      </span>
                    </div>
                    <div>
                      <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-gray-600 font-black">
                        Experience
                      </p>
                      <p className="text-white text-base md:text-lg font-medium">
                        {venue.menu}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleVenueReservation(venue.name)}
                    disabled={reservingVenue === venue.name}
                    className="bg-primary text-black w-full md:w-auto px-10 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-[#B04110] transition-all rounded-full flex items-center justify-center gap-4 shadow-xl shadow-primary/10 active:scale-95 disabled:opacity-70 h-14"
                  >
                    {reservingVenue === venue.name && <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>}
                    {reservingVenue === venue.name ? "CONTACTING..." : "Reserve Table"} 
                    {!reservingVenue && <span className="material-symbols-outlined text-base">event_seat</span>}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Food Gallery */}
      <section className="py-24 md:py-40 bg-black/50 border-t border-white/5 overflow-hidden px-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="text-center mb-16 md:mb-32 space-y-4 md:space-y-6">
            <h2 className="serif-font text-5xl md:text-7xl lg:text-[8rem] text-white italic leading-none">
              The Plate Gallery
            </h2>
            <p className="text-[9px] md:text-[11px] uppercase tracking-[0.4em] text-gray-600 font-black">
              VISUAL GASTRONOMY AT MOORE
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-16">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="group relative aspect-square overflow-hidden rounded-xl border border-white/5 bg-white/5">
                <div className="w-full h-full animate-pulse bg-white/5" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 md:gap-4">
                    <span className="material-symbols-outlined text-primary text-3xl md:text-5xl transform scale-50 group-hover:scale-100 transition-all duration-500">
                      restaurant
                    </span>
                    <p className="text-primary text-[8px] md:text-[10px] font-black tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-opacity delay-300">
                      Culinary Art
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dining;
