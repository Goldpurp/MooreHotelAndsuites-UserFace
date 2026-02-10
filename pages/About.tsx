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
            alt="Moore Hotel & Suites"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-background-dark" />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto space-y-[clamp(1.5rem,3vw,3rem)]">
          <p className="text-[clamp(0.6rem,0.6vw,0.7rem)] uppercase tracking-[0.6em] text-primary font-black">
            THE MOORE LEGACY
          </p>

          <h1 className="serif-font text-[clamp(2.3rem,7vw,10rem)] text-white italic leading-[1.05]">
            Where Sophistication Meets Soul
          </h1>

          <p className="text-gray-400 font-light text-[clamp(1rem,1.5vw,1.5rem)] tracking-[0.25em] uppercase leading-relaxed opacity-80 max-w-3xl mx-auto">
            Moore Hotel & Suites was conceived from a singular vision: to create a sanctuary where modern architectural brilliance meets the timeless warmth of Nigerian heritage. Since our inception, we have dedicated ourselves to redefining the art of hospitality, curating an environment where every detail—from the curated art in our lobby to the bespoke linens in our suites—whispers luxury.
          </p>
        </div>
      </section>

      {/* PHILOSOPHY SECTION */}
      <section className="py-[clamp(3rem,8vh,10rem)] px-[clamp(1rem,4vw,3rem)]">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-[clamp(2rem,6vw,8rem)] items-center">
          <div className="space-y-[clamp(1.5rem,3vw,3rem)] order-2 lg:order-1">
            <div className="space-y-6">
              <p className="text-primary text-[clamp(0.65rem,0.7vw,0.75rem)] font-black uppercase tracking-[0.5em]">
                A NEW STANDARD OF ELEGANCE
              </p>
              <h2 className="serif-font text-[clamp(2rem,6vw,8rem)] text-white leading-[1.05] italic">
                An Urban Oasis
              </h2>
            </div>

            <p className="text-gray-400 text-[clamp(1rem,1.4vw,1.5rem)] font-light leading-relaxed max-w-xl">
              Perfectly positioned at the intersection of tranquility and convenience, Moore Hotel & Suites offers a discreet escape for the global elite. Whether you are navigating international business or seeking a refined leisure retreat, our estate provides a serene vantage point over the city's vibrant heartbeat. We serve as a quiet haven within reach of the region’s premier commercial and cultural landmarks.
            </p>

            <div className="bg-white/5 p-[clamp(1.5rem,3vw,3rem)] border-l-2 border-primary/30 italic text-gray-300 font-light text-[clamp(1.1rem,1.6vw,1.5rem)]">
              "Moore Hotel & Suites is where modern sophistication and soulful hospitality converge, creating a destination where luxury is personal and every moment is an enduring memory."
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <img
              src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80"
              className="w-full aspect-[4/5] md:aspect-video lg:aspect-[4/5] object-cover rounded-sm shadow-2xl grayscale"
              alt="Urban Oasis"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* INNOVATION SECTION */}
      <section className="py-[clamp(3rem,8vh,8rem)] px-[clamp(1rem,4vw,3rem)] bg-primary text-black text-center space-y-[clamp(2rem,4vw,4rem)]">
        <h2 className="serif-font text-[clamp(2.5rem,8vw,9rem)] font-bold leading-none">
          The Moore Experience
        </h2>

        <p className="text-[clamp(1.1rem,2vw,2.5rem)] italic font-light max-w-4xl mx-auto opacity-80">
          At the core of our identity is an uncompromising commitment to the "Moore Standard"—a philosophy built on:
          <br />
          <span className="block mt-4">
            <span className="font-bold">Intuitive Service:</span> Anticipating your needs before they are voiced.<br />
            <span className="font-bold">Exquisite Design:</span> A seamless blend of contemporary aesthetics and local craftsmanship.<br />
            <span className="font-bold">Culinary Artistry:</span> Gastronomic journeys that celebrate both global flavors and indigenous spices.
          </span>
        </p>

        <div className="pt-8">
          <p className="text-[clamp(0.7rem,0.8vw,0.8rem)] font-black uppercase tracking-[0.4em] mb-2">
            — MOORE HOTEL & SUITES —
          </p>
          <p className="text-[clamp(0.6rem,0.7vw,0.7rem)] uppercase tracking-[0.2em] opacity-40 font-bold">
            LUXURY REDEFINED
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
              loading="lazy"
            />
          </div>

          <div className="space-y-[clamp(1.5rem,3vw,3rem)]">
            <div className="space-y-6">
              <p className="text-primary text-[clamp(0.65rem,0.7vw,0.75rem)] font-black uppercase tracking-[0.5em]">
                DISCOVER THE MOORE STANDARD
              </p>
              <h2 className="serif-font text-[clamp(2rem,6vw,8rem)] text-white leading-[1.05] italic">
                A Destination Beyond Stay
              </h2>
            </div>

            <p className="text-gray-400 text-[clamp(1rem,1.4vw,1.5rem)] font-light leading-relaxed max-w-xl">
              We invite you to experience more than just a stay. Discover a destination where luxury is personal, and every moment is an enduring memory.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;