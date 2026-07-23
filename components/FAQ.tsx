import React, { useState } from 'react';

const FAQ_DATA = [
  {
    question: "What are your standard check-in and check-out times?",
    answer: "Check-in begins from 2:00pm, while check-out is at 12:00pm. Early check-in or late check-out may be arranged through the front desk, subject to room availability."
  },
  {
    question: "Do you provide airport pickup or drop-off services?",
    answer: "Yes, airport transfer services can be arranged through our concierge team for an additional fee. Executive and selected suite bookings may qualify for complimentary scheduled transfers."
  },
  {
    question: "Can additional guests or children stay in the room?",
    answer: "Children and additional occupants are welcome. Extra beds or connecting rooms can be arranged on request, depending on the room category booked and availability at the time of check-in."
  },
  {
    question: "What security measures are available at the hotel?",
    answer: "Our property operates 24-hour monitored security, controlled access entry points, and dedicated guest safety personnel to ensure a secure and comfortable stay for all residents."
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="ui-section bg-black/40">
      <div className="ui-container max-w-4xl space-y-10 sm:space-y-14">
        <div className="space-y-4 text-center">
          <p className="ui-eyebrow">
            Guest Information
          </p>
          <h2 className="ui-section-title italic text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {FAQ_DATA.map((item, index) => (
            <div
              key={index} 
              className="overflow-hidden border-b border-white/10"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="group flex min-h-16 w-full items-center justify-between gap-5 py-5 text-left sm:py-6"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className={`font-display text-[clamp(1.15rem,2vw,1.4rem)] italic transition-colors ${openIndex === index ? 'text-primary' : 'text-white group-hover:text-primary/80'}`}>
                  {item.question}
                </span>
                <span className={`material-symbols-outlined text-primary transition-transform duration-500 ${openIndex === index ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              <div
                id={`faq-answer-${index}`}
                aria-hidden={openIndex !== index}
                className={`transition-all duration-500 ease-in-out ${openIndex === index ? 'max-h-96 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="ui-copy max-w-3xl px-1">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
