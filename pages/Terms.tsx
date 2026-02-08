import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="bg-background-dark pt-32 pb-20 min-h-screen px-6">
      <div className="max-w-4xl mx-auto space-y-20 md:space-y-28">
        {/* Header */}
        <header className="space-y-4 border-b border-white/5 pb-12">
          <p className="text-primary text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em]">Rules of Engagement</p>
          <h1 className="serif-font text-4xl md:text-5xl lg:text-7xl text-white leading-tight">
            Terms of <span className="italic">Use</span>
          </h1>
          <p className="text-gray-500 text-xs md:text-sm uppercase tracking-widest font-medium">
            Effective Date: January 1, 2024
          </p>
        </header>

        {/* Terms Sections */}
        <div className="space-y-12 text-gray-400 font-light leading-relaxed md:leading-loose">
          {[
            {
              title: "Acceptance of Terms",
              content: "By accessing the Moore Hotels & Suites digital platforms or reserving a sanctuary within our properties, you agree to be bound by these Terms of Use. These terms constitute a binding legal agreement between you and the Sanctuary Group."
            },
            {
              title: "Reservation & Guarantee",
              content: "All reservations must be guaranteed by a valid credit instrument or through pre-authorized Moore Circle credentials. A sanctuary is only considered 'Reserved' upon the issuance of a unique MHS Booking Code."
            },
            {
              title: "Cancellation & No-Show",
              content: "To maintain the integrity of our quietude, cancellations must be made 48 hours prior to arrival. Late cancellations or no-shows will incur a fee equivalent to one night's base rate plus applicable resort taxes."
            },
            {
              title: "Guest Conduct",
              content: "Moore Hotels & Suites are sanctuaries of stillness. Guests are expected to maintain an atmosphere of mutual respect. We reserve the right to terminate a stay, without refund, should conduct disrupt the peace or safety of our staff and other residents."
            },
            {
              title: "Limitation of Liability",
              content: "While we strive for perfection, the Sanctuary Group is not liable for indirect, incidental, or consequential damages resulting from the use of our facilities or digital services, except where strictly mandated by law."
            },
            {
              title: "Governing Law",
              content: "These terms are governed by the laws of the jurisdiction in which the property is located. For global digital disputes, the laws of Nigeria shall apply, with exclusive jurisdiction in the courts of Lagos."
            }
          ].map((section, idx) => (
            <section key={idx} className="space-y-4 md:space-y-6">
              <h2 className="serif-font text-2xl md:text-3xl text-white italic">{`${idx + 1}. ${section.title}`}</h2>
              <p className="text-gray-400 text-sm md:text-base">{section.content}</p>
            </section>
          ))}
        </div>

        {/* Footer */}
        <footer className="pt-12 border-t border-white/5 flex justify-center">
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-3 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-primary hover:text-white transition-all"
          >
            <span className="material-symbols-outlined">print</span> Download PDF
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Terms;
