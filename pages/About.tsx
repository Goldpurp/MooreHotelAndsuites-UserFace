import React, { useState, useEffect } from "react";

const About: React.FC = () => {
  const [images, setImages] = useState({
    heritage: "",
    vision: "",
  });

  return (
    <div className="bg-background-dark pt-24 min-h-screen">
      <section className="relative h-[75vh] md:h-[85vh] flex items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0">
          <img
            src={
              "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=1920"
            }
            className="w-full h-full object-cover opacity-40 grayscale scale-105"
            alt="Moore Heritage"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-background-dark" />
        </div>
        <div className="relative z-10 text-center max-w-5xl mx-auto space-y-8 md:space-y-12">
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] md:tracking-[0.7em] text-primary font-black animate-pulse">
            ESTABLISHED 1994
          </p>
          <h1 className="serif-font text-5xl md:text-8xl lg:text-[11rem] text-white italic leading-[1.1] md:leading-[0.9]">
            The Pursuit of Stillness
          </h1>
          <p className="text-gray-400 font-light text-base md:text-2xl tracking-[0.2em] md:tracking-[0.3em] uppercase leading-relaxed opacity-80 max-w-3xl mx-auto">
            A sanctuary created for those who value the profound depth of
            silence.
          </p>
        </div>
      </section>

      <section className="py-24 md:py-48 px-6 md:px-10">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-32 items-center">
          <div className="space-y-10 md:space-y-14 order-2 lg:order-1">
            <div className="space-y-6">
              <p className="text-primary text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em]">
                OUR PHILOSOPHY
              </p>
              <h2 className="serif-font text-4xl md:text-7xl lg:text-[8rem] text-white leading-[1.1] md:leading-[0.85] italic">
                Sanctuary Over Service
              </h2>
            </div>
            <p className="text-gray-400 text-lg md:text-2xl font-light leading-relaxed max-w-xl">
              Moore Hotels was born from a vision to redefine hospitality as a
              gateway to emotional well-being.
            </p>
            <div className="bg-white/5 p-8 md:p-12 border-l-2 border-primary/30 italic text-gray-300 font-light text-xl">
              "We don't just check you in; we invite you to leave the chaos
              behind."
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <img
              src={"/Images/SanctuaryOverService.png"}
              className="w-full aspect-[4/5] md:aspect-video lg:aspect-[4/5] object-cover rounded-sm shadow-2xl grayscale"
              alt="Vision"
            />
          </div>
        </div>
      </section>

      <section className="py-20 md:py-40 px-6 md:px-10 bg-primary text-black text-center space-y-10 md:space-y-16">
        <h2 className="serif-font text-5xl md:text-9xl font-bold leading-none">
          You are Cordially Invited
        </h2>
        <p className="text-xl md:text-4xl italic font-light max-w-4xl mx-auto opacity-80">
          "To enter a Moore Hotel is to begin a journey inward. We provide the
          setting; you provide the soul."
        </p>
        <div className="pt-8">
          <p className="text-[12px] font-black uppercase tracking-[0.4em] mb-2">
            — THE MOORE FAMILY —
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold">
            FOUNDING VISIONARIES
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
