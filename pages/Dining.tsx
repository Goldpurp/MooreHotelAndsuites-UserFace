import React from "react";
import { Link } from "react-router-dom";

const diningNotes = [
  { icon: "free_breakfast", title: "Breakfast", text: "A straightforward start to the day for resident guests." },
  { icon: "restaurant", title: "Main meals", text: "Nigerian favourites and familiar continental options." },
  { icon: "room_service", title: "Room requests", text: "Selected food and refreshments can be requested through the hotel team." },
];

const powerFeatures = [
  {
    icon: "electric_bolt",
    label: "Generator house",
    title: "Dedicated backup generation",
    text: "A dedicated generator house supports essential hotel operations when public electricity is interrupted.",
    image: "/Images/power-generator.svg",
  },
  {
    icon: "solar_power",
    label: "Solar & inverter room",
    title: "Stored energy support",
    text: "Solar storage and inverter systems help smooth transitions, support essential loads, and reduce avoidable generator runtime.",
    image: "/Images/power-solar.svg",
  },
];

const hotelExperiences = [
  {
    title: "Poolside pauses",
    eyebrow: "Open-air leisure",
    text: "A relaxed setting for a slower afternoon and an easy change of pace.",
    image: "https://res.cloudinary.com/dxryndnhl/image/upload/v1779385271/Screenshot_2026-05-20_at_6.26.14_pm_rnngx3.png",
    alt: "Poolside leisure area at Moore Hotels",
  },
  {
    title: "Games & connection",
    eyebrow: "Social spaces",
    text: "Spend time together over a game, a conversation, or a quiet break between plans.",
    image: "https://res.cloudinary.com/dxryndnhl/image/upload/v1785697853/Screenshot_2026-08-02_at_8.10.42_pm_ybmndu.png",
    alt: "Pool table in the Moore Hotels games area",
  },
  {
    title: "A calmer pace",
    eyebrow: "Wellness moments",
    text: "Comfortable shared spaces give you room to reset without leaving the hotel.",
    image: "https://res.cloudinary.com/dxryndnhl/image/upload/v1785694158/Screenshot_2026-08-02_at_7.09.12_pm_yyiwwl.png",
    alt: "Covered lounge seating at Moore Hotels",
  },
];

const Dining: React.FC = () => (
  <div className="min-h-screen bg-background-dark">
    <header className="relative flex min-h-[32rem] items-end overflow-hidden px-4 pb-16 pt-32 sm:min-h-[36rem] sm:px-6 sm:pb-20">
      <img src="https://res.cloudinary.com/dxryndnhl/image/upload/v1785694158/Screenshot_2026-08-02_at_7.09.12_pm_yyiwwl.png" alt="Covered lounge seating at Moore Hotels" className="absolute inset-0 h-full w-full object-cover opacity-50 image-luxury" fetchPriority="high" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/20" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background-dark to-transparent" />
      <div className="ui-container-wide relative z-10 w-full">
        <div className="max-w-3xl">
          <p className="ui-eyebrow">The Moore experience</p>
          <h1 className="ui-display mt-5 italic text-white">A good meal, <span className="text-primary">and more around it.</span></h1>
          <p className="ui-copy mt-6 max-w-2xl text-gray-300">Simple dining, dependable hotel systems, and easy leisure spaces—presented honestly, without unnecessary ceremony.</p>
        </div>
      </div>
    </header>

    <section className="ui-section" aria-labelledby="dining-overview-title">
      <div className="ui-container-wide grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="group overflow-hidden rounded-lg border border-white/10 bg-surface-dark shadow-2xl lg:col-span-7">
          <img src="https://res.cloudinary.com/dxryndnhl/image/upload/v1785694895/Screenshot_2026-08-02_at_7.21.28_pm_cdmivl.png" alt="A Moore Hotels chef preparing food in the hotel kitchen" className="image-luxury aspect-[4/3] w-full object-cover" loading="lazy" />
        </div>
        <div className="lg:col-span-5">
          <p className="ui-eyebrow">Food & refreshment</p>
          <h2 id="dining-overview-title" className="ui-section-title mt-4 italic text-white">Familiar choices, thoughtfully served.</h2>
          <p className="ui-copy mt-5">Our dining offer is intentionally focused: useful breakfast options, satisfying main meals, refreshments, and selected room-service requests for resident guests.</p>
          <div className="mt-7 space-y-4 border-t border-white/10 pt-6">
            {diningNotes.map((note) => (
              <div key={note.title} className="flex items-start gap-4">
                <span className="grid size-10 flex-none place-items-center rounded-full bg-primary/10 text-primary"><span className="material-symbols-outlined text-lg" aria-hidden="true">{note.icon}</span></span>
                <div><h3 className="text-sm font-semibold text-white">{note.title}</h3><p className="mt-1 text-sm leading-6 text-gray-500">{note.text}</p></div>
              </div>
            ))}
          </div>
          <a href="mailto:info@moorehotelandsuites.com?subject=Dining%20Enquiry" className="ui-button ui-button-primary mt-8">Ask about dining <span className="material-symbols-outlined text-lg" aria-hidden="true">mail</span></a>
        </div>
      </div>
    </section>

    <section className="ui-section border-y border-white/5 bg-black/45" aria-labelledby="experience-power-title">
      <div className="ui-container-wide">
        <div className="grid gap-6 md:grid-cols-2 md:items-end">
          <div><p className="ui-eyebrow">Behind every stay</p><h2 id="experience-power-title" className="ui-section-title mt-4 italic text-white">Comfort supported by real infrastructure.</h2></div>
          <p className="ui-copy max-w-xl md:justify-self-end">Reliable power is not a decorative extra. It supports lighting, connectivity, essential services, and the calm rhythm guests expect.</p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {powerFeatures.map((feature, index) => (
            <article key={feature.title} className="group relative min-h-[23rem] overflow-hidden rounded-lg border border-white/10 bg-[#111] p-6 shadow-2xl sm:p-8">
              <img src={feature.image} alt="" className="image-luxury pointer-events-none absolute inset-0 h-full w-full object-cover opacity-65 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-75" loading="lazy" aria-hidden="true" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" aria-hidden="true" />
              <div className={`pointer-events-none absolute inset-0 ${index === 0 ? "bg-[radial-gradient(circle_at_85%_10%,rgba(201,74,17,0.22),transparent_40%)]" : "bg-[radial-gradient(circle_at_80%_12%,rgba(229,192,104,0.18),transparent_42%)]"}`} aria-hidden="true" />
              <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full border border-white/[0.06] transition-transform duration-700 group-hover:scale-110" aria-hidden="true" />
              <div className="relative flex h-full flex-col">
                <div className="flex items-start gap-4">
                  <span className="grid size-14 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary"><span className="material-symbols-outlined text-3xl" aria-hidden="true">{feature.icon}</span></span>
                </div>
                <div className="mt-auto pt-16">
                  <p className="ui-eyebrow">{feature.label}</p>
                  <h3 className="font-display mt-3 text-[clamp(1.75rem,2.8vw,2.4rem)] italic leading-[1.1] text-white">{feature.title}</h3>
                  <p className="mt-5 max-w-xl text-sm leading-7 text-gray-400">{feature.text}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="ui-section" aria-labelledby="beyond-table-title">
      <div className="ui-container-wide">
        <div className="text-center"><p className="ui-eyebrow">Beyond the table</p><h2 id="beyond-table-title" className="ui-section-title mt-4 italic text-white">More ways to use your time at Moore.</h2><p className="ui-copy mx-auto mt-5 max-w-2xl">The hotel experience continues through leisure, social, and restorative spaces.</p></div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {hotelExperiences.map((experience) => (
            <article key={experience.title} className="group overflow-hidden rounded-lg border border-white/10 bg-surface-dark shadow-2xl">
              <div className="overflow-hidden"><img src={experience.image} alt={experience.alt} className="image-luxury aspect-[4/3] w-full object-cover" loading="lazy" /></div>
              <div className="p-6 sm:p-7"><p className="ui-eyebrow">{experience.eyebrow}</p><h3 className="font-display mt-3 text-2xl italic text-white">{experience.title}</h3><p className="mt-4 text-sm leading-7 text-gray-500">{experience.text}</p></div>
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/services" className="ui-button ui-button-primary">Explore guest services <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span></Link>
          <Link to="/rooms" className="ui-button ui-button-secondary">View rooms</Link>
        </div>
      </div>
    </section>
  </div>
);

export default Dining;
