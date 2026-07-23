import React from "react";

const venues = [
  {
    name: "L’Horizon",
    tag: "Signature dining",
    description: "A composed menu that brings local ingredients and contemporary technique together in an elegant evening setting.",
    image: "/Images/L'Horizon.jpg",
    hours: "6:00 pm – 11:00 pm",
    menu: "Tasting menu and à la carte",
  },
  {
    name: "The Charcoal Room",
    tag: "Grill & bar",
    description: "Open-flame cooking, quality cuts, fresh seafood, and a considered drinks list in a warm, intimate room.",
    image: "/Images/TheCharcoalRoom.jpg",
    hours: "12:00 pm – 12:00 am",
    menu: "Grill menu and cocktails",
  },
  {
    name: "Sanctuary Lounge",
    tag: "Tea, plates & spirits",
    description: "A relaxed all-day lounge for tea, pastries, light plates, and cocktails as the evening settles in.",
    image: "/Images/SanctuaryLounge.jpg",
    hours: "8:00 am – 10:00 pm",
    menu: "Infusions and small plates",
  },
];

const Dining: React.FC = () => (
  <div className="min-h-screen bg-background-dark">
    <header className="relative flex min-h-[38rem] items-center overflow-hidden px-4 pb-16 pt-32 text-center sm:px-6">
      <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=82&w=1920" alt="An elegant dining room" className="absolute inset-0 h-full w-full object-cover opacity-55 image-luxury" fetchPriority="high" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-background-dark" />
      <div className="ui-container relative z-10 max-w-4xl">
        <p className="ui-eyebrow">Dining at Moore</p>
        <h1 className="ui-display mt-5 italic text-white">Good food, <span className="text-primary">beautifully served.</span></h1>
        <p className="ui-copy mx-auto mt-6 max-w-2xl text-gray-300">Discover distinct spaces for composed dinners, flame-led cooking, relaxed meetings, and a quiet drink.</p>
      </div>
    </header>

    <section className="ui-section">
      <div className="ui-container-wide space-y-20 lg:space-y-28">
        {venues.map((venue, index) => (
          <article key={venue.name} className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-20 ${index % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
            <div className="group relative overflow-hidden rounded-lg border border-white/10 bg-surface-dark shadow-2xl">
              <img src={venue.image} alt={venue.name} className="image-luxury aspect-[4/3] w-full object-cover" loading="lazy" />
              <div className="absolute bottom-4 right-4 rounded border border-white/10 bg-black/75 px-4 py-3 backdrop-blur-lg">
                <span className="ui-label mb-1">Hours</span><span className="text-sm font-semibold text-white">{venue.hours}</span>
              </div>
            </div>
            <div>
              <p className="ui-eyebrow">{venue.tag}</p>
              <h2 className="ui-section-title mt-4 italic text-white">{venue.name}</h2>
              <p className="ui-copy mt-6 max-w-xl">{venue.description}</p>
              <div className="mt-7 flex items-center gap-4 border-t border-white/10 pt-6">
                <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary"><span className="material-symbols-outlined" aria-hidden="true">restaurant_menu</span></span>
                <div><span className="ui-label mb-1">Menu style</span><p className="text-sm font-medium text-white">{venue.menu}</p></div>
              </div>
              <a href={`mailto:info@moorehotelandsuites.com?subject=${encodeURIComponent(`Table enquiry — ${venue.name}`)}`} className="ui-button ui-button-primary mt-7">Enquire about a table <span className="material-symbols-outlined" aria-hidden="true">event_seat</span></a>
            </div>
          </article>
        ))}
      </div>
    </section>

    <section className="ui-section border-t border-white/5 bg-black/45">
      <div className="ui-container-wide">
        <div className="text-center"><p className="ui-eyebrow">A taste of Moore</p><h2 className="ui-section-title mt-4 italic text-white">Spaces for every mood.</h2></div>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {["/Images/SanctuaryOverService.jpg", "/Images/TheMeridinLounge.jpg", "/Images/L'Horizon.jpg"].map((image, index) => (
            <div key={image} className="group overflow-hidden rounded-lg border border-white/10"><img src={image} alt={["Sanctuary service", "The Meridian Lounge", "L’Horizon dining room"][index]} className="image-luxury aspect-square w-full object-cover" loading="lazy" /></div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default Dining;
