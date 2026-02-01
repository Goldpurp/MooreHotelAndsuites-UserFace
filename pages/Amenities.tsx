import React, { useState } from "react";

const Amenities: React.FC = () => {
  const [amenityImages, setAmenityImages] = useState<Record<string, string>>(
    {},
  );

  const sections = [
    {
      title: "The Infinity Oasis",
      tag: "AQUATIC SANCTUARY",
      desc: "Our temp-controlled rooftop infinity pool offers a seamless blend of aquatic tranquility and panoramic city vistas. Experience weightlessness in our salt-water sanitized basin, followed by bespoke poolside service.",
      img: "/Images/TheInfinityOasis.png",
      features: [
        "Salt Water Sanitized",
        "Private Cabanas",
        "Poolside Service",
        "City Vistas",
      ],
    },
    {
      title: "The Apex Games Room",
      tag: "INTELLECTUAL PLAY",
      desc: "Designed for the modern strategist, the Apex Room features hand-crafted charcoal oak pool tables, boutique board game collections, and a private high-stakes environment.",
      img: "/Images/TheApexGamesRoom.png",
      features: [
        "Bespoke Pool Tables",
        "Private Poker Vault",
        "Board Game Library",
        "Cigar Selection",
      ],
    },
    {
      title: "The Meridian Lounge",
      tag: "SOCIAL REFINEMENT",
      desc: "An atmospheric haven for quiet conversation and refined indulgence. Transition from afternoon high-tea to evening artisanal spirit flights in a setting of velvet textures.",
      img: "/Images/TheMeridinLounge.png",
      features: [
        "Artisanal Spirits",
        "Curated Vinyls",
        "Intimate Pods",
        "Midnight Service",
      ],
    },
    {
      title: "Wellness & Sanctuary",
      tag: "THE SPA AT MOORE",
      desc: "Our award-winning spa features thermal suites, hydrotherapy pools, and private therapy cabins. Rejuvenate with bespoke rituals designed by world-renowned therapists.",
      img: "/Images/WellnessAndSanctuary.png",
      features: [
        "Thermal Suites",
        "Hydrotherapy",
        "Meditation Garden",
        "Bespoke Rituals",
      ],
    },
  ];

  return (
    <div className="bg-background-dark pt-24 min-h-screen">
      {/* Header Section */}
      <section className="relative h-[55vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={ "/Images/WellnessAndSanctuary.png"}
            className="w-full h-full object-cover opacity-30 scale-105"
            alt="Hotel Amenities Header"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-background-dark"></div>
        </div>
        <div className="relative z-10 text-center px-6">
          <p className="text-[8px] md:text-[10px] uppercase tracking-[0.6em] text-primary font-black mb-6 md:mb-8 animate-pulse">
            Unrivaled Hospitality
          </p>
          <h1 className="serif-font text-5xl md:text-[10rem] text-white italic drop-shadow-2xl leading-none">
            Refined Living
          </h1>
          <div className="h-px w-20 md:w-32 bg-primary mx-auto mt-10 md:mt-12 opacity-30"></div>
        </div>
      </section>

      {/* Main Sections */}
      <section className="py-24 md:py-40">
        <div className="max-w-[1800px] mx-auto px-6 md:px-10 space-y-32 md:space-y-52">
          {sections.map((section, idx) => (
            <div
              key={section.title}
              className={`flex flex-col ${
                idx % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
              } items-center gap-10 md:gap-24 lg:gap-32`}
            >
              {/* Image Side */}
              <div className="flex-1 relative group w-full">
                <div className="absolute -inset-4 border border-primary/10 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-1000 hidden md:block"></div>
                <div className="relative aspect-[16/10] md:aspect-[3/2] overflow-hidden rounded-sm shadow-2xl">
                  <img
                    src={section.img}
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                    alt={section.title}
                  />
                </div>
              </div>

              {/* Text Side */}
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

      {/* Concierge CTA */}
      <section className="py-24 md:py-40 px-6">
        <div className="max-w-[1800px] mx-auto text-center space-y-12 md:space-y-16 py-16 md:py-20 bg-surface-dark border border-white/5 rounded-sm shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-28 md:h-28 rounded-full bg-primary/5 border border-primary/20 text-primary mb-4 md:mb-6 animate-luxury-logo">
            <span className="material-symbols-outlined text-4xl md:text-5xl">
              support_agent
            </span>
          </div>
          <h2 className="serif-font text-4xl md:text-7xl text-white italic leading-tight">
            At Your Service, <br className="hidden md:block" />
            Every Moment
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="bg-primary text-black w-full sm:w-auto px-10 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all rounded-sm shadow-xl shadow-primary/20">
              Contact Concierge
            </button>
            <button className="border border-white/10 text-white w-full sm:w-auto px-10 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-white/5 transition-all rounded-sm">
              Amenity Guide
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Amenities;
