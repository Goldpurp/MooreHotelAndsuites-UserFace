import React from "react";

const About: React.FC = () => {
  return (
    <div className="bg-background-dark pt-[clamp(5rem,8vh,7rem)] min-h-screen text-white">
      {/* HERO SECTION */}
      <section className="relative min-h-[clamp(70vh,80vh,90vh)] flex items-center justify-center overflow-hidden px-[clamp(1rem,4vw,3rem)]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover opacity-40 grayscale scale-105"
            alt="More Hotels"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-background-dark" />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto space-y-[clamp(1.5rem,3vw,3rem)]">
          <p className="text-[clamp(0.6rem,0.6vw,0.7rem)] uppercase tracking-[0.6em] text-primary font-black">
            ESTABLISHED 1994
          </p>

          <h1 className="serif-font text-[clamp(2.5rem,7vw,10rem)] text-white italic leading-[1.05]">
            Where Excellence Finds Rest
          </h1>

          <p className="text-gray-400 font-light text-[clamp(1rem,1.5vw,1.5rem)] tracking-[0.25em] uppercase leading-relaxed opacity-80 max-w-3xl mx-auto">
            More Hotels has earned a global reputation through architectural
            refinement, thoughtful hospitality, and an unwavering commitment to
            guest satisfaction across every destination we serve.
          </p>
        </div>
      </section>

      {/* PHILOSOPHY SECTION */}
      <section className="py-[clamp(3rem,8vh,10rem)] px-[clamp(1rem,4vw,3rem)]">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-[clamp(2rem,6vw,8rem)] items-center">
          <div className="space-y-[clamp(1.5rem,3vw,3rem)] order-2 lg:order-1">
            <div className="space-y-6">
              <p className="text-primary text-[clamp(0.65rem,0.7vw,0.75rem)] font-black uppercase tracking-[0.5em]">
                OUR PHILOSOPHY
              </p>
              <h2 className="serif-font text-[clamp(2rem,6vw,8rem)] text-white leading-[1.05] italic">
                Hospitality Through Innovation
              </h2>
            </div>

            <p className="text-gray-400 text-[clamp(1rem,1.4vw,1.5rem)] font-light leading-relaxed max-w-xl">
              At More Hotels, hospitality is designed as a seamless blend of
              human warmth and intelligent innovation. From personalized guest
              environments to energy-efficient smart systems, every property is
              built to enhance comfort while preserving timeless luxury
              standards.
            </p>

            <div className="bg-white/5 p-[clamp(1.5rem,3vw,3rem)] border-l-2 border-primary/30 italic text-gray-300 font-light text-[clamp(1.1rem,1.6vw,1.5rem)]">
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
      <section className="py-[clamp(3rem,8vh,8rem)] px-[clamp(1rem,4vw,3rem)] bg-primary text-black text-center space-y-[clamp(2rem,4vw,4rem)]">
        <h2 className="serif-font text-[clamp(2.5rem,8vw,9rem)] font-bold leading-none">
          Innovation That Shapes Every Stay
        </h2>

        <p className="text-[clamp(1.1rem,2vw,2.5rem)] italic font-light max-w-4xl mx-auto opacity-80">
          "We design experiences where technology disappears into comfort —
          allowing every guest to enjoy intuitive service, personalized
          environments, and seamless hospitality without interruption."
        </p>

        <div className="pt-8">
          <p className="text-[clamp(0.7rem,0.8vw,0.8rem)] font-black uppercase tracking-[0.4em] mb-2">
            — MORE HOTELS —
          </p>
          <p className="text-[clamp(0.6rem,0.7vw,0.7rem)] uppercase tracking-[0.2em] opacity-40 font-bold">
            GLOBAL HOSPITALITY LEADERS
          </p>
        </div>
      </section>

      {/* LEGACY SECTION */}
      <section className="py-[clamp(3rem,8vh,10rem)] px-[clamp(1rem,4vw,3rem)]">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-[clamp(2rem,6vw,8rem)] items-center">
          <div className="order-1">
            <img
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
              className="w-full aspect-[4/5] md:aspect-video lg:aspect-[4/5] object-cover rounded-sm shadow-2xl grayscale"
              alt="Luxury Suite"
            />
          </div>

          <div className="space-y-[clamp(1.5rem,3vw,3rem)]">
            <div className="space-y-6">
              <p className="text-primary text-[clamp(0.65rem,0.7vw,0.75rem)] font-black uppercase tracking-[0.5em]">
                OUR LEGACY
              </p>
              <h2 className="serif-font text-[clamp(2rem,6vw,8rem)] text-white leading-[1.05] italic">
                A Reputation Built on Trust
              </h2>
            </div>

            <p className="text-gray-400 text-[clamp(1rem,1.4vw,1.5rem)] font-light leading-relaxed max-w-xl">
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
