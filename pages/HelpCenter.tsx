import React, { useState } from "react";

const HelpCenter: React.FC = () => {
  const [search, setSearch] = useState("");
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  const faqs = [
    {
      category: "Reservations & Stays",
      questions: [
        {
          q: "How can I modify or cancel my reservation?",
          a: "Guests can modify or cancel bookings via their profile or by contacting our front desk. Changes are subject to availability and hotel policy."
        },
        {
          q: "What are check-in and check-out times?",
          a: "Check-in is from 2:00 PM, and check-out is at 12:00 PM. Early or late check-ins may be arranged for premium members or on request."
        },
        {
          q: "Do you accommodate group bookings?",
          a: "Yes, our hotel offers tailored group and corporate packages. Please reach out to our sales team for personalized arrangements."
        }
      ]
    },
    {
      category: "Dining & Leisure",
      questions: [
        {
          q: "Are meals included in my stay?",
          a: "Room rates may include breakfast. Our restaurants offer curated menus featuring local and international cuisines."
        },
        {
          q: "Can non-residents dine at the restaurants?",
          a: "Yes, non-residents are welcome, but reservations are recommended during peak periods."
        },
        {
          q: "Is the spa accessible to all guests?",
          a: "Our spa provides wellness and skincare services for registered guests and members to ensure a tranquil experience."
        }
      ]
    },
    {
      category: "Hotel Services",
      questions: [
        {
          q: "Do you provide airport transfers?",
          a: "Yes, airport transfers are available upon request. Guests are advised to book at least 24 hours in advance."
        },
        {
          q: "Is parking available?",
          a: "Complimentary parking is offered with 24-hour security monitoring."
        },
        {
          q: "Are pets allowed?",
          a: "Small pets are permitted in select rooms with prior arrangement through our concierge."
        }
      ]
    },
    {
      category: "Payments & Security",
      questions: [
        {
          q: "Which payment methods are accepted?",
          a: "We accept major international credit cards, bank transfers, and Paystack for local transactions."
        },
        {
          q: "How is my personal data secured?",
          a: "All guest information is encrypted and stored securely. Our staff follows strict confidentiality and data protection protocols."
        }
      ]
    }
  ];

  const filteredFaqs = faqs
    .map(cat => ({
      ...cat,
      questions: cat.questions.filter(f =>
        f.q.toLowerCase().includes(search.toLowerCase()) ||
        f.a.toLowerCase().includes(search.toLowerCase())
      )
    }))
    .filter(cat => cat.questions.length > 0);

  return (
    <div className="bg-background-dark min-h-screen text-white flex flex-col">

      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-black via-background-dark to-background-dark px-6 py-24 flex flex-col items-center text-center">
        <h1 className="serif-font text-5xl sm:text-6xl md:text-7xl lg:text-[8rem] italic mb-4 text-white leading-tight">Help Center</h1>
        <p className="text-gray-400 text-sm sm:text-base mb-8 max-w-lg sm:max-w-xl">Your guide to a seamless stay at Moore Hotels & Suites</p>

        <div className="w-full max-w-md relative">
          <input
            type="text"
            placeholder="Search topics, questions, or services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-md bg-surface-dark border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary material-symbols-outlined text-xl sm:text-2xl">
            search
          </span>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full px-4 sm:px-6 md:px-10 py-12 flex-1 flex flex-col gap-10 max-w-[1800px] mx-auto">
        {filteredFaqs.length > 0 ? filteredFaqs.map((cat, idx) => (
          <div key={idx} className="flex flex-col gap-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl text-primary font-serif italic mb-4">{cat.category}</h2>
            <div className="flex flex-col gap-4">
              {cat.questions.map((faq, i) => (
                <div
                  key={i}
                  className="bg-surface-dark border border-white/5 rounded-md p-4 cursor-pointer hover:bg-surface-dark/60 transition"
                  onClick={() => setActiveFaq(activeFaq === faq.q ? null : faq.q)}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg sm:text-xl font-medium text-white">{faq.q}</h4>
                    <span className="material-symbols-outlined text-primary">{activeFaq === faq.q ? 'expand_less' : 'expand_more'}</span>
                  </div>
                  {activeFaq === faq.q && <p className="mt-2 text-gray-400 sm:text-base">{faq.a}</p>}
                </div>
              ))}
            </div>
          </div>
        )) : (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No results found. Our concierge is ready to assist you.</p>
            <button onClick={() => setSearch('')} className="text-primary hover:underline text-sm sm:text-base font-medium">Clear Search</button>
          </div>
        )}
      </section>

      {/* Contact Section */}
      <section className="w-full px-4 sm:px-6 md:px-10 py-16 flex flex-col items-center gap-12 max-w-[1800px] mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic text-primary mb-8">Need Further Assistance?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Live Chat */}
          <div className="bg-surface-dark border border-white/5 rounded-md p-6 flex flex-col items-center gap-4 hover:bg-surface-dark/60 transition">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl sm:text-3xl">
              <span className="material-symbols-outlined">chat</span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif italic">Live Chat</h3>
            <p className="text-gray-400 text-center text-sm sm:text-base">Instant assistance via our guest portal</p>
            <button className="mt-2 px-4 sm:px-6 py-2 bg-primary text-black font-medium rounded hover:bg-[#B04110] transition">Start Chat</button>
          </div>

          {/* Email */}
          <div className="bg-surface-dark border border-white/5 rounded-md p-6 flex flex-col items-center gap-4 hover:bg-surface-dark/60 transition">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl sm:text-3xl">
              <span className="material-symbols-outlined">mail</span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif italic">Email Support</h3>
            <p className="text-gray-400 text-center text-sm sm:text-base">Send inquiries directly to our team</p>
            <a 
              href="mailto:moorehotelandsuites@gmail.com" 
              className="mt-2 px-4 sm:px-6 py-2 bg-primary text-black font-medium rounded hover:bg-[#B04110] transition"
            >
              Send Email
            </a>
          </div>

          {/* Call */}
          <div className="bg-surface-dark border border-white/5 rounded-md p-6 flex flex-col items-center gap-4 hover:bg-surface-dark/60 transition">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl sm:text-3xl">
              <span className="material-symbols-outlined">call</span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif italic">Call Us</h3>
            <p className="text-gray-400 text-center text-sm sm:text-base">Reach our front desk for urgent needs</p>
            <a 
              href="tel:+2348033774544" 
              className="mt-2 px-4 sm:px-6 py-2 bg-primary text-black font-medium rounded hover:bg-[#B04110] transition"
            >
            +234 803 377 4544
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HelpCenter;
