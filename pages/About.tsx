import React from "react";

const About: React.FC = () => {
  return (
    <div className="bg-background-dark pt-24 min-h-screen text-white">
      {/* HERO SECTION */}
      <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover opacity-40 grayscale scale-105"
            alt="More Hotels"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-background-dark" />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto space-y-8 md:space-y-12">
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] md:tracking-[0.7em] text-primary font-black">
            ESTABLISHED 1994
          </p>
          <h1 className="serif-font text-5xl md:text-8xl lg:text-[10rem] text-white italic leading-[1.1] md:leading-[0.9]">
            Where Excellence Finds Rest
          </h1>
          <p className="text-gray-400 font-light text-base md:text-2xl tracking-[0.2em] md:tracking-[0.3em] uppercase leading-relaxed opacity-80 max-w-3xl mx-auto">
            More Hotels has earned a global reputation through architectural
            refinement, thoughtful hospitality, and an unwavering commitment to
            guest satisfaction across every destination we serve.
          </p>
        </div>
      </section>

      {/* PHILOSOPHY SECTION */}
      <section className="py-24 md:py-48 px-6 md:px-10">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-32 items-center">
          <div className="space-y-10 md:space-y-14 order-2 lg:order-1">
            <div className="space-y-6">
              <p className="text-primary text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em]">
                OUR PHILOSOPHY
              </p>
              <h2 className="serif-font text-4xl md:text-7xl lg:text-[8rem] text-white leading-[1.1] md:leading-[0.85] italic">
                Hospitality Through Innovation
              </h2>
            </div>
            <p className="text-gray-400 text-lg md:text-2xl font-light leading-relaxed max-w-xl">
              At More Hotels, hospitality is designed as a seamless blend of
              human warmth and intelligent innovation. From personalized guest
              environments to energy-efficient smart systems, every property is
              built to enhance comfort while preserving timeless luxury
              standards.
            </p>
            <div className="bg-white/5 p-8 md:p-12 border-l-2 border-primary/30 italic text-gray-300 font-light text-xl">
              "True luxury is consistency — excellence delivered quietly,
              flawlessly, and every single time."
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <img
              src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80"
              className="w-full aspect-[4/5] md:aspect-video lg:aspect-[4/5] object-cover rounded-sm shadow-2xl grayscale"
              alt="Innovation"
            />
          </div>
        </div>
      </section>

      {/* INNOVATION SECTION */}
      <section className="py-20 md:py-40 px-6 md:px-10 bg-primary text-black text-center space-y-10 md:space-y-16">
        <h2 className="serif-font text-5xl md:text-9xl font-bold leading-none">
          Innovation That Shapes Every Stay
        </h2>
        <p className="text-xl md:text-4xl italic font-light max-w-4xl mx-auto opacity-80">
          "We design experiences where technology disappears into comfort —
          allowing every guest to enjoy intuitive service, personalized
          environments, and seamless hospitality without interruption."
        </p>
        <div className="pt-8">
          <p className="text-[12px] font-black uppercase tracking-[0.4em] mb-2">
            — MORE HOTELS —
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold">
            GLOBAL HOSPITALITY LEADERS
          </p>
        </div>
      </section>

      {/* LEGACY SECTION */}
      <section className="py-24 md:py-48 px-6 md:px-10">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-32 items-center">
          <div className="order-1">
            <img
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
              className="w-full aspect-[4/5] md:aspect-video lg:aspect-[4/5] object-cover rounded-sm shadow-2xl grayscale"
              alt="Luxury Suite"
            />
          </div>
          <div className="space-y-10 md:space-y-14">
            <div className="space-y-6">
              <p className="text-primary text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em]">
                OUR LEGACY
              </p>
              <h2 className="serif-font text-4xl md:text-7xl lg:text-[8rem] text-white leading-[1.1] md:leading-[0.85] italic">
                A Reputation Built on Trust
              </h2>
            </div>
            <p className="text-gray-400 text-lg md:text-2xl font-light leading-relaxed max-w-xl">
              More Hotels continues to stand as a trusted destination for
              international travelers, corporate guests, and families seeking
              exceptional comfort. Our reputation is built on reliability,
              security, and attention to detail that remains consistent across
              every location.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
