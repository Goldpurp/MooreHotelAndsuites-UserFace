import React from "react";
import { Link } from "react-router-dom";

type SignatureService = {
  title: string;
  tag: string;
  description: string;
  image: string;
  imageAlt: string;
  icon: string;
  note: string;
  features: string[];
};

const signatureServices: SignatureService[] = [
  {
    title: "24-hour front desk",
    tag: "Always available",
    description: "From a smooth arrival to local recommendations and late-night requests, our reception team remains available throughout your stay.",
    image: "https://res.cloudinary.com/dxryndnhl/image/upload/v1779385274/Screenshot_2026-05-20_at_6.27.21_pm_dtspvl.png",
    imageAlt: "Moore Hotels guest reception",
    icon: "support_agent",
    note: "Assistance at every hour",
    features: ["Arrival and departure support", "Local guidance", "Guest requests"],
  },
  {
    title: "Restaurant & in-room dining",
    tag: "Local and continental",
    description: "Enjoy familiar Nigerian favourites and continental classics in our dining spaces, or settle in and have a considered meal brought to your room.",
    image: "https://res.cloudinary.com/dxryndnhl/image/upload/v1785694895/Screenshot_2026-08-02_at_7.21.28_pm_cdmivl.png",
    imageAlt: "Elegant dining at L’Horizon",
    icon: "room_service",
    note: "Breakfast, lunch and dinner",
    features: ["À la carte dining", "Breakfast service", "Room delivery"],
  },
  {
    title: "Lounge & bar",
    tag: "Meet and unwind",
    description: "A relaxed setting for informal meetings, a quiet evening, or a well-made drink after the day’s plans are complete.",
    image: "https://res.cloudinary.com/dxryndnhl/image/upload/v1785694158/Screenshot_2026-08-02_at_7.09.12_pm_yyiwwl.png",
    imageAlt: "The Meridian Lounge at Moore Hotels",
    icon: "local_bar",
    note: "Open to residents and visitors",
    features: ["Signature cocktails", "Wine selection", "Light plates"],
  },
  {
    title: "Wellness & recreation",
    tag: "Time for yourself",
    description: "Restore your pace with calm leisure spaces created for unhurried mornings, quiet resets, and easy moments between plans.",
    image: "https://res.cloudinary.com/dxryndnhl/image/upload/v1779385271/Screenshot_2026-05-20_at_6.26.14_pm_rnngx3.png",
    imageAlt: "Wellness and leisure space at Moore Hotels",
    icon: "spa",
    note: "Leisure at your own pace",
    features: ["Wellness spaces", "Poolside relaxation", "Quiet seating"],
  },
  {
    title: "Games & social spaces",
    tag: "Stay entertained",
    description: "Gather for friendly competition or spend an easy evening together in spaces designed for connection beyond the room.",
    image: "https://res.cloudinary.com/dxryndnhl/image/upload/v1785697853/Screenshot_2026-08-02_at_8.10.42_pm_ybmndu.png",
    imageAlt: "The Apex games room at Moore Hotels",
    icon: "sports_esports",
    note: "Made for groups and downtime",
    features: ["Games room", "Social seating", "Group leisure"],
  },
  {
    title: "Laundry & garment care",
    tag: "Travel light",
    description: "Professional laundry and dry-cleaning support keeps your wardrobe ready, whether you are staying for one night or settling in for longer.",
    image: "https://res.cloudinary.com/dxryndnhl/image/upload/v1785694056/Screenshot_2026-08-02_at_7.07.12_pm_dplfsv.png",
    imageAlt: "Professional garment care service",
    icon: "dry_cleaning",
    note: "Collected and returned to your room",
    features: ["Laundry service", "Dry cleaning", "Garment handling"],
  },
];

const stayEssentials = [
  { icon: "wifi", title: "High-speed Wi-Fi", description: "Complimentary connectivity across guest rooms and shared spaces." },
  { icon: "bolt", title: "Resilient power", description: "Generator and inverter support for dependable round-the-clock comfort." },
  { icon: "local_parking", title: "Secure parking", description: "Convenient on-site parking with monitored guest access." },
  { icon: "shield", title: "Guest safety", description: "CCTV coverage, controlled access, and trained security personnel." },
];

const serviceHighlights = [
  { icon: "schedule", value: "24/7", label: "Front desk" },
  { icon: "wifi", value: "Included", label: "Hotel-wide Wi-Fi" },
  { icon: "local_parking", value: "On site", label: "Guest parking" },
  { icon: "room_service", value: "Available", label: "Room dining" },
];

const Services: React.FC = () => (
  <div className="min-h-screen bg-background-dark">
    <header className="relative flex min-h-[40rem] items-center overflow-hidden px-4 pb-24 pt-32 text-center sm:min-h-[44rem] sm:px-6">
      <img
        src="https://res.cloudinary.com/dxryndnhl/image/upload/v1785694266/Screenshot_2026-08-02_at_7.10.55_pm_y33xug.png"
        alt="A calm hotel wellness setting"
        className="absolute inset-0 h-full w-full object-cover opacity-50 image-luxury"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/45 to-background-dark" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background-dark to-transparent" />
      <div className="ui-container relative z-10 max-w-4xl">
        <p className="ui-eyebrow">Four-star hospitality standards</p>
        <h1 className="ui-display mt-5 italic text-white">Guest services, <span className="text-primary">thoughtfully delivered.</span></h1>
        <p className="ui-copy mx-auto mt-6 max-w-2xl text-gray-300">Professional support, useful comforts, and restorative spaces—brought together to make every part of your stay feel effortless.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a href="#signature-services" className="ui-button ui-button-primary">Explore services <span className="material-symbols-outlined text-lg" aria-hidden="true">south</span></a>
          <a href="tel:+2348033774544" className="ui-button ui-button-secondary bg-black/30 backdrop-blur-lg"><span className="material-symbols-outlined text-lg" aria-hidden="true">call</span> Guest relations</a>
        </div>
      </div>
    </header>

    <section className="relative z-20 -mt-12 px-4 sm:px-6" aria-label="Service highlights">
      <div className="ui-container-wide grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
        {serviceHighlights.map((highlight) => (
          <div key={highlight.label} className="flex items-center gap-4 bg-[#101010]/95 p-5 sm:p-6">
            <span className="grid size-10 flex-none place-items-center rounded-full border border-primary/25 bg-primary/10 text-primary"><span className="material-symbols-outlined" aria-hidden="true">{highlight.icon}</span></span>
            <div><p className="text-sm font-semibold text-white">{highlight.value}</p><p className="mt-1 text-xs text-gray-500">{highlight.label}</p></div>
          </div>
        ))}
      </div>
    </section>

    <section id="signature-services" className="scroll-mt-24 py-20 sm:py-24 lg:py-32">
      <div className="ui-container-wide">
        <div className="mb-16 grid gap-6 border-b border-white/10 pb-10 md:grid-cols-2 md:items-end lg:mb-24">
          <div><p className="ui-eyebrow">Signature services</p><h2 className="ui-section-title mt-4 italic text-white">Care that moves with your stay.</h2></div>
          <p className="ui-copy max-w-xl md:justify-self-end">Each service is designed around the same standard: clear assistance, considered spaces, and fewer interruptions to your day.</p>
        </div>

        <div className="space-y-24 lg:space-y-36">
          {signatureServices.map((service, index) => (
            <article key={service.title} className="group grid items-center gap-10 lg:grid-cols-12 lg:gap-16 xl:gap-24">
              <div className={`relative lg:col-span-7 ${index % 2 ? "lg:order-2" : ""}`}>
                <div className="relative overflow-hidden rounded-lg border border-white/10 bg-surface-dark shadow-[0_30px_90px_rgba(0,0,0,.35)]">
                  <img src={service.image} alt={service.imageAlt} className="image-luxury aspect-[4/3] w-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                </div>
                <div className={`absolute -bottom-5 hidden h-px w-32 bg-primary/60 sm:block ${index % 2 ? "right-8" : "left-8"}`} aria-hidden="true" />
              </div>

              <div className={`lg:col-span-5 ${index % 2 ? "lg:order-1" : ""}`}>
                <div className="flex items-center gap-4">
                  <span className="grid size-11 place-items-center rounded-full border border-primary/25 bg-primary/10 text-primary"><span className="material-symbols-outlined" aria-hidden="true">{service.icon}</span></span>
                  <p className="ui-eyebrow">{service.tag}</p>
                </div>
                <h3 className="font-display mt-5 text-[clamp(1.85rem,3vw,2.65rem)] italic leading-[1.1] text-white">{service.title}</h3>
                <p className="ui-copy mt-5 max-w-xl">{service.description}</p>
                <ul className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3" aria-label={`${service.title} includes`}>
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm leading-6 text-gray-300"><span className="material-symbols-outlined mt-1 text-base text-primary" aria-hidden="true">check</span><span>{feature}</span></li>
                  ))}
                </ul>
                <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-6 text-sm text-gray-400">
                  <span className="material-symbols-outlined text-primary" aria-hidden="true">concierge</span>
                  <span>{service.note}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="border-y border-white/5 bg-black/45 py-20 sm:py-24">
      <div className="ui-container-wide">
        <div className="max-w-2xl"><p className="ui-eyebrow">Throughout your stay</p><h2 className="ui-section-title mt-4 italic text-white">The essentials are already considered.</h2><p className="ui-copy mt-5">Reliable everyday services support work, rest, arrivals, and everything in between.</p></div>
        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {stayEssentials.map((essential) => (
            <article key={essential.title} className="group bg-[#101010] p-6 transition-colors duration-300 hover:bg-[#151515] sm:p-7">
              <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary transition-transform duration-300 group-hover:-translate-y-1"><span className="material-symbols-outlined" aria-hidden="true">{essential.icon}</span></span>
              <h3 className="mt-5 text-base font-semibold text-white">{essential.title}</h3>
              <p className="mt-3 text-sm leading-7 text-gray-500">{essential.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="px-4 py-20 sm:px-6 sm:py-24 lg:py-32">
      <div className="ui-container-wide relative overflow-hidden rounded-lg border border-white/10 px-6 py-16 text-center shadow-2xl sm:px-10 sm:py-20">
        <img src="/Images/SanctuaryOverService.jpg" alt="Attentive service at Moore Hotels" className="absolute inset-0 h-full w-full object-cover opacity-30 image-luxury" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/95" />
        <div className="relative z-10 mx-auto max-w-3xl">
          <span className="mx-auto grid size-12 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary"><span className="material-symbols-outlined text-2xl" aria-hidden="true">support_agent</span></span>
          <p className="ui-eyebrow mt-6">Professional support, every moment</p>
          <h2 className="ui-section-title mt-4 italic text-white">Tell us what would make your stay easier.</h2>
          <p className="ui-copy mx-auto mt-5 max-w-xl">Guest Relations can help with a specific request before arrival or while you are with us.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="tel:+2348033774544" className="ui-button ui-button-primary"><span className="material-symbols-outlined text-lg" aria-hidden="true">call</span> Call guest relations</a>
            <Link to="/help" className="ui-button ui-button-secondary bg-black/35 backdrop-blur-lg">Visit help center <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span></Link>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default Services;
