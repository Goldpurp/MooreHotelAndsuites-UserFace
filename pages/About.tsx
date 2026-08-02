import React from "react";
import { Link } from "react-router-dom";

const standards = [
  { icon: "room_service", title: "Attentive service", text: "A capable team that responds with care, discretion, and local knowledge." },
  { icon: "hotel", title: "Restful spaces", text: "Comfort-led rooms with the details guests need for work, rest, and longer stays." },
  { icon: "restaurant", title: "Thoughtful dining", text: "Familiar Nigerian flavours and continental choices served in a relaxed setting." },
];

const About: React.FC = () => (
  <div className="min-h-screen bg-background-dark text-white">
    <header className="relative flex min-h-[42rem] items-center overflow-hidden px-4 pb-16 pt-32 text-center sm:px-6">
      <img
        src="https://res.cloudinary.com/dxryndnhl/image/upload/v1779385271/Screenshot_2026-05-20_at_6.26.14_pm_rnngx3.png"
        alt="Moore Hotels & Suites"
        className="absolute inset-0 h-full w-full object-cover opacity-60 image-luxury"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/45 to-background-dark" />
      <div className="ui-container relative z-10 max-w-4xl">
        <p className="ui-eyebrow">Our story</p>
        <h1 className="ui-display mt-5 italic">Hospitality with <span className="text-primary">heart and purpose.</span></h1>
        <p className="mx-auto mt-6 max-w-2xl text-[clamp(1rem,2vw,1.18rem)] leading-8 text-gray-300">Moore Hotels &amp; Suites brings contemporary comfort and warm Nigerian service to the Sagamu–Ikenne corridor.</p>
      </div>
    </header>

    <section className="ui-section">
      <div className="ui-container grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="ui-eyebrow">The Moore standard</p>
          <h2 className="ui-section-title mt-4 italic">A calm base for every kind of stay.</h2>
          <p className="ui-copy mt-6">We created Moore for guests who value ease, professionalism, and a genuine welcome. Our location offers a practical retreat for business travel, family visits, events, and quiet weekends in Ogun State.</p>
          <blockquote className="mt-8 border-l-2 border-primary/50 bg-white/[0.035] p-6 font-display text-xl italic leading-8 text-gray-200">“Luxury feels most meaningful when it is personal, comfortable, and quietly dependable.”</blockquote>
        </div>
        <div className="group overflow-hidden rounded-lg border border-white/10 shadow-2xl">
          <img src="https://res.cloudinary.com/dxryndnhl/image/upload/v1785694116/Screenshot_2026-08-02_at_7.08.26_pm_xl65yh.png" alt="An elegant hotel reception" className="image-luxury aspect-[4/5] w-full object-cover lg:aspect-[4/5]" loading="lazy" />
        </div>
      </div>
    </section>

    <section className="border-y border-primary/20 bg-primary py-16 text-black sm:py-20">
      <div className="ui-container">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/60">What guests can expect</p>
        <h2 className="font-display mt-3 text-[clamp(2rem,4.5vw,3.75rem)] font-semibold leading-[1.05]">The experience, made simple.</h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-lg bg-black/15 md:grid-cols-3">
          {standards.map((standard) => (
            <article key={standard.title} className="bg-primary p-6 sm:p-8">
              <span className="material-symbols-outlined text-3xl" aria-hidden="true">{standard.icon}</span>
              <h3 className="font-display mt-5 text-2xl font-semibold">{standard.title}</h3>
              <p className="mt-3 text-sm leading-7 text-black/70">{standard.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="ui-section">
      <div className="ui-container grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="group overflow-hidden rounded-lg border border-white/10 shadow-2xl">
          <img src="https://res.cloudinary.com/dxryndnhl/image/upload/v1785699804/Screenshot_2026-08-02_at_8.43.08_pm_om7gem.png" alt="A welcoming hotel arrival" className="image-luxury aspect-[4/3] w-full object-cover" loading="lazy" />
        </div>
        <div>
          <p className="ui-eyebrow">Come as our guest</p>
          <h2 className="ui-section-title mt-4 italic">Stay for the way it feels.</h2>
          <p className="ui-copy mt-6">Choose your room, share your dates, and let our team take care of the details.</p>
          <Link to="/rooms" className="ui-button ui-button-primary mt-8">Explore rooms <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span></Link>
        </div>
      </div>
    </section>
  </div>
);

export default About;
