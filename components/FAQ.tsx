import React, { useState } from 'react';

const FAQ_DATA = [
  {
    question: "What are your standard check-in and check-out times?",
    answer: "Check-in begins from 3:00 PM, while check-out is at 11:30 AM. Early check-in or late check-out may be arranged through the front desk, subject to room availability."
  },
  {
    question: "Do you provide airport pickup or drop-off services?",
    answer: "Yes, airport transfer services can be arranged through our concierge team for an additional fee. Executive and selected suite bookings may qualify for complimentary scheduled transfers."
  },
  {
    question: "Can additional guests or children stay in the room?",
    answer: "Children and additional occupants are welcome. Extra beds or connecting rooms can be arranged on request, depending on the room category booked and availability at the time of arrival."
  },
  {
    question: "What security measures are available at the hotel?",
    answer: "Our property operates 24-hour monitored security, controlled access entry points, and dedicated guest safety personnel to ensure a secure and comfortable stay for all residents."
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-[clamp(3rem,8vh,8rem)] px-[clamp(1rem,4vw,3rem)] bg-black/40">
      <div className="max-w-4xl mx-auto space-y-[clamp(2rem,5vw,4rem)]">
        <div className="text-center space-y-6">
          <p className="text-primary text-[clamp(0.65rem,0.6vw,0.75rem)] font-black uppercase tracking-[0.6em]">
            Guest Information
          </p>
          <h2 className="serif-font text-[clamp(2rem,6vw,5rem)] text-white italic">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {FAQ_DATA.map((item, index) => (
            <div 
              key={index} 
              className="border-b border-white/5 overflow-hidden"
            >
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full py-[clamp(1.5rem,3vw,2.5rem)] flex justify-between items-center text-left group"
              >
                <span className={`serif-font text-[clamp(1.1rem,2vw,1.5rem)] italic transition-colors ${openIndex === index ? 'text-primary' : 'text-white hover:text-primary/80'}`}>
                  {item.question}
                </span>
                <span className={`material-symbols-outlined text-primary transition-transform duration-500 ${openIndex === index ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              <div 
                className={`transition-all duration-500 ease-in-out ${openIndex === index ? 'max-h-96 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-gray-400 text-[clamp(0.95rem,1.1vw,1.125rem)] font-light leading-relaxed px-1">
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
