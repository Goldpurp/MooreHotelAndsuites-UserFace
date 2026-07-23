import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-dark px-4 pb-20 pt-32 sm:px-6">
      <div className="ui-container max-w-4xl">
        {/* Header */}
        <header className="border-b border-white/10 pb-9">
          <p className="ui-eyebrow">Guest terms</p>
          <h1 className="ui-page-title mt-3 text-white">
            Terms of <span className="italic">Use</span>
          </h1>
          <p className="mt-4 text-sm text-gray-500">
            Effective Date: January 1, 2024
          </p>
        </header>

        {/* Terms Sections */}
        <div className="mt-10 space-y-10 text-[0.96rem] leading-8 text-gray-400">
          {[
            {
              title: "Acceptance of Terms",
              content: "By accessing the Moore Hotels & Suites digital platforms or booking a room within our properties, you agree to be bound by these Terms of Use. These terms constitute a binding legal agreement between you and Moore Hotels & Suites."
            },
            {
              title: "Reservation & Guarantee",
              content: "All reservations must be guaranteed by a valid payment method or through authorized member credentials. A room is only considered 'Reserved' upon the issuance of a unique MHS Booking Code."
            },
            {
              title: "Cancellation & No-Show",
              content: "To maintain the integrity of our quietude, cancellations must be made 48 hours prior to check-in. Late cancellations or no-shows will incur a fee equivalent to one night's base rate plus applicable resort taxes."
            },
            {
              title: "Guest Conduct",
              content: "Moore Hotels & Suites are sanctuaries of stillness. Guests are expected to maintain an atmosphere of mutual respect. We reserve the right to terminate a stay, without refund, should conduct disrupt the peace or safety of our staff and other residents."
            },
            {
              title: "Limitation of Liability",
              content: "While we strive for perfection, Moore Hotels & Suites is not liable for indirect, incidental, or consequential damages resulting from the use of our facilities or digital services, except where strictly mandated by law."
            },
            {
              title: "Governing Law",
              content: "These terms are governed by the laws of the jurisdiction in which the property is located. For global digital disputes, the laws of Nigeria shall apply, with exclusive jurisdiction in the courts of Lagos."
            }
          ].map((section, idx) => (
            <section key={idx}>
              <h2 className="ui-card-title mb-4 italic text-white">{`${idx + 1}. ${section.title}`}</h2>
              <p>{section.content}</p>
            </section>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-12 flex justify-center border-t border-white/10 pt-8">
          <button 
            onClick={() => window.print()} 
            className="ui-button ui-button-secondary"
          >
            <span className="material-symbols-outlined" aria-hidden="true">print</span> Print terms
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Terms;
