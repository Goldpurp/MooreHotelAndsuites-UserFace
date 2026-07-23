import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const faqGroups = [
  { category: "Reservations & stays", questions: [
    { q: "How can I modify or cancel my reservation?", a: "Retrieve the booking with your reference and email, then contact Guest Relations for any change or cancellation. Requests remain subject to room availability and the applicable booking terms." },
    { q: "What are check-in and check-out times?", a: "Check-in begins at 2:00 pm and check-out is at 12:00 pm. Ask the front desk about early arrival or late departure, which is subject to availability." },
    { q: "Can Moore arrange group or corporate stays?", a: "Yes. Contact Guest Relations with your dates, number of rooms, and any meeting or dining needs so the team can prepare an appropriate offer." },
  ]},
  { category: "Dining & guest services", questions: [
    { q: "Are meals included in my stay?", a: "Inclusions depend on the room offer selected. Review your booking record or contact the hotel to confirm whether breakfast is included." },
    { q: "Can non-residents dine at the hotel?", a: "Non-resident dining enquiries are welcome. Contact the hotel in advance, especially for evenings and larger groups." },
    { q: "Can I arrange an airport transfer?", a: "Transfer requests can be arranged in advance through Guest Relations. Availability and pricing depend on the route and vehicle required." },
  ]},
  { category: "Payments & security", questions: [
    { q: "Which payment methods are supported?", a: "Direct hotel bank transfer is currently available and remains pending until the hotel verifies receipt. Secure Monnify checkout will appear here when the hotel enables it." },
    { q: "Does Moore collect my card details?", a: "No. When secure online payment is enabled, card and supported payment details are entered on the payment provider’s checkout, not on the Moore Hotels website." },
    { q: "How do I check a payment or booking status?", a: "Use Manage Booking with the booking reference and the exact email used at checkout. The retrieved record shows the latest verified booking and payment status." },
  ]},
];

const HelpCenter: React.FC = () => {
  const [search, setSearch] = useState("");
  const [activeFaq, setActiveFaq] = useState<string | null>(null);
  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return faqGroups;
    return faqGroups.map((group) => ({ ...group, questions: group.questions.filter((faq) => faq.q.toLowerCase().includes(query) || faq.a.toLowerCase().includes(query)) })).filter((group) => group.questions.length);
  }, [search]);

  return (
    <div className="min-h-screen bg-background-dark text-white">
      <header className="border-b border-white/5 bg-gradient-to-b from-black to-background-dark px-4 pb-16 pt-36 text-center sm:px-6">
        <p className="ui-eyebrow">Guest support</p><h1 className="ui-page-title mt-3 italic">How can we help?</h1><p className="ui-copy mx-auto mt-4 max-w-xl">Find quick answers or contact the hotel team directly.</p>
        <label className="relative mx-auto mt-8 block w-full max-w-xl"><span className="sr-only">Search help topics</span><input type="search" placeholder="Search bookings, payments, dining…" value={search} onChange={(event) => setSearch(event.target.value)} className="ui-input h-14 pl-12 pr-12" /><span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary" aria-hidden="true">search</span>{search && <button type="button" onClick={() => setSearch("")} className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center text-gray-500 hover:text-white" aria-label="Clear search"><span className="material-symbols-outlined" aria-hidden="true">close</span></button>}</label>
      </header>

      <section className="ui-section">
        <div className="ui-container max-w-4xl space-y-12">
          {filteredGroups.length ? filteredGroups.map((group) => (
            <div key={group.category}>
              <h2 className="ui-card-title italic text-primary">{group.category}</h2>
              <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
                {group.questions.map((faq) => {
                  const open = activeFaq === faq.q;
                  const id = `help-${faq.q.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
                  return <div key={faq.q}><button type="button" onClick={() => setActiveFaq(open ? null : faq.q)} aria-expanded={open} aria-controls={id} className="flex min-h-16 w-full items-center justify-between gap-5 py-5 text-left"><span className="text-base font-semibold text-white sm:text-lg">{faq.q}</span><span className={`material-symbols-outlined text-primary transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">expand_more</span></button><div id={id} aria-hidden={!open} className={`grid transition-[grid-template-rows,opacity] duration-300 ${open ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0"}`}><div className="overflow-hidden"><p className="ui-copy max-w-3xl">{faq.a}</p></div></div></div>;
                })}
              </div>
            </div>
          )) : <div className="py-12 text-center"><h2 className="ui-card-title italic">No matching answer</h2><p className="ui-copy mt-3">Try another phrase or contact Guest Relations.</p><button type="button" onClick={() => setSearch("")} className="ui-button ui-button-secondary mt-6">Clear search</button></div>}
        </div>
      </section>

      <section className="ui-section border-t border-white/5 bg-black/35">
        <div className="ui-container"><div className="text-center"><p className="ui-eyebrow">Still need help?</p><h2 className="ui-section-title mt-3 italic">Talk to our team.</h2></div><div className="mx-auto mt-9 grid max-w-5xl gap-5 md:grid-cols-3"><SupportCard icon="travel_explore" title="Manage booking" text="Retrieve a reservation securely." action={<Link to="/manage-booking" className="ui-button ui-button-secondary mt-6 w-full">Find booking</Link>} /><SupportCard icon="mail" title="Email support" text="Send a non-urgent enquiry." action={<a href="mailto:info@moorehotelandsuites.com" className="ui-button ui-button-secondary mt-6 w-full">Send email</a>} /><SupportCard icon="call" title="Call the front desk" text="Get help with an urgent need." action={<a href="tel:+2348033774544" className="ui-button ui-button-primary mt-6 w-full">+234 803 377 4544</a>} /></div></div>
      </section>
    </div>
  );
};

const SupportCard = ({ icon, title, text, action }: { icon: string; title: string; text: string; action: React.ReactNode }) => <article className="ui-card flex flex-col p-6 text-center"><span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary"><span className="material-symbols-outlined" aria-hidden="true">{icon}</span></span><h3 className="ui-card-title mt-5 italic">{title}</h3><p className="mt-3 flex-1 text-sm leading-6 text-gray-400">{text}</p>{action}</article>;

export default HelpCenter;
