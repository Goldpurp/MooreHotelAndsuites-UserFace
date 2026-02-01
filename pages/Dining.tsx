import React, { useState, useEffect } from "react";
import { APP_IMAGE_PROMPTS } from "../services/imageService";
import { useNavigate } from "react-router-dom";

const Dining: React.FC = () => {
  const [venueImages, setVenueImages] = useState<Record<string, string>>({});
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const venues = [
    {
      name: "L'Horizon",
      tag: "SIGNATURE FINE DINING",
      desc: "An ethereal culinary journey curated by Michelin-starred masters. Experience a marriage of local organic treasures and avant-garde molecular techniques, served with a panoramic view of the coastline.",
      img: "/Images/L'Horizon.png",
      hours: "18:00 — 23:00",
      menu: "Tasting Menu & A La Carte",
    },
    {
      name: "The Charcoal Room",
      tag: "PREMIUM GRILL & BAR",
      desc: "Bold flavors forged in open flames. Specializing in dry-aged prime cuts and sustainably sourced seafood, The Charcoal Room offers an intimate, leather-scented atmosphere for the true epicurean.",
      img: "/Images/TheCharcoalRoom.png",
      hours: "12:00 — 00:00",
      menu: "Steakhouse & Artisanal Cocktails",
    },
    {
      name: "Sanctuary Lounge",
      tag: "HIGH TEA & SPIRITS",
      desc: "A daylight haven for artisanal teas and delicate pastries, transitioning into a sophisticated cocktail sanctuary by dusk. Perfect for quiet conversation and sunset views.",
      img: "/Images/SanctuaryLounge.png",
      hours: "08:00 — 22:00",
      menu: "Botanical Infusions & Small Plates",
    },
  ];

  const handleVenueReservation = (venueName: string) => {
    alert(
      `Thank you for your interest in ${venueName}. Our culinary concierge will contact you shortly to confirm your table.`,
    );
  };

  return (
    <div className="bg-background-dark pt-24 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[65vh] flex items-center justify-center overflow-hidden">
        <img
          src={"https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1920"}
          className="absolute inset-0 w-full h-full object-cover opacity-40 scale-110"
          alt="Fine Dining"
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
                 <img
                    src={venue.img}
                    className="w-full aspect-[4/5] lg:aspect-[3/4] object-cover rounded-sm grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000"
                    alt={venue.name}
                  />
                <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 bg-black/80 backdrop-blur-md p-6 md:p-8 border border-white/10">
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
                  <h2 className="serif-font text-5xl md:text-7xl lg:text-[8rem] text-white italic leading-tight">
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
                    className="bg-primary text-black w-full md:w-auto px-10 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all rounded-sm flex items-center justify-center gap-4 shadow-xl shadow-primary/10 active:scale-95"
                  >
                    Reserve Table{" "}
                    <span className="material-symbols-outlined text-base">
                      event_seat
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Food Gallery Section */}
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
            {(galleryImages.length > 0 ? galleryImages : [1, 2, 3]).map(
              (img, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-square overflow-hidden rounded-sm border border-white/5 bg-white/5"
                >
                  {typeof img === "string" ? (
                    <img
                      src={img}
                      className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-125 grayscale-[0.3] group-hover:grayscale-0"
                      alt={`Gourmet Dish ${idx + 1}`}
                    />
                  ) : (
                    <div className="w-full h-full animate-pulse bg-white/5" />
                  )}
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
              ),
            )}
          </div>
        </div>
      </section>

      {/* Bespoke Experiences */}
      <section className="py-24 md:py-40 px-6">
        <div className="max-w-[1800px] mx-auto bg-surface-dark border border-white/10 p-10 md:p-32 relative overflow-hidden text-center shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 md:w-64 h-1 bg-primary"></div>
          <h3 className="serif-font text-4xl md:text-6xl lg:text-[7rem] text-white italic mb-8 md:mb-10 leading-tight">
            Private Dining & <br className="hidden md:block" />
            Bespoke Celebrations
          </h3>
          <p className="max-w-3xl mx-auto text-gray-400 text-lg md:text-xl leading-relaxed mb-12 md:mb-16 opacity-80">
            For occasions that demand absolute discretion and personalized
            luxury. Our dedicated culinary concierge will design a menu unique
            to your palette.
          </p>
          <button
            onClick={() => handleVenueReservation("Bespoke Private Dining")}
            className="border border-white/10 hover:border-primary hover:text-primary text-white px-10 py-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all rounded-sm hover:bg-white/5"
          >
            Inquire Privately
          </button>
        </div>
      </section>
    </div>
  );
};

export default Dining;
