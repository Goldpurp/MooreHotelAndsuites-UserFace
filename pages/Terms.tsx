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
            Effective Date: September 13, 2026
          </p>
        </header>

        {/* Terms Sections */}
        <div className="mt-10 space-y-10 text-[0.96rem] leading-8 text-gray-400">
          {[
            {
              title: "Using This Website",
              content: "By using this website or making a reservation, you agree to these terms and to the specific rates, dates, occupancy limits, payment conditions, and cancellation information displayed or communicated for your booking. If you do not agree, please do not complete the reservation."
            },
            {
              title: "Reservations and Availability",
              content: "A booking request is subject to room availability and the payment or verification steps shown during checkout. An MHS booking code identifies the request; it does not override a pending, cancelled, failed, or expired status. Please check the confirmation page and email for the current status before travelling."
            },
            {
              title: "Payments and Verification",
              content: "Available payment methods are shown at checkout. Online payment is completed through the named payment provider. Direct transfers remain pending until verified by authorised hotel staff. Unpaid reservations may expire after the period shown during booking so the room can return to availability. Never send card security codes or account passwords to hotel staff."
            },
            {
              title: "Changes, Cancellations, and Refunds",
              content: "Cancel at least 24 hours before the scheduled check-in time to receive a full refund. Cancellations made inside the final 24 hours, including on the check-in date, and no-shows are non-refundable. A cancellation request is not complete until its status is confirmed. Approved refunds are returned through an appropriate channel and may take additional processing time outside the hotel’s control. Mandatory rights under applicable law still apply."
            },
            {
              title: "Guest Details and Conduct",
              content: "You must provide accurate booking and contact details, follow occupancy and safety rules, respect staff and other guests, and avoid unlawful, dangerous, or disruptive conduct. Identification may be requested at check-in. The hotel may refuse or end a stay where reasonably necessary for safety, security, legal compliance, non-payment, or serious breach of these terms, subject to applicable law."
            },
            {
              title: "Website Content and Availability",
              content: "We work to keep room descriptions, prices, images, and service information accurate and the website available. Temporary errors, maintenance, network interruptions, or obvious display mistakes may occur. We may correct such errors and will communicate any material booking impact using the contact information provided."
            },
            {
              title: "Liability",
              content: "Nothing in these terms excludes a right or responsibility that cannot lawfully be excluded. To the extent permitted by law, Moore Hotels & Suites is not responsible for indirect losses or events outside its reasonable control. Guests remain responsible for their belongings except where applicable law provides otherwise."
            },
            {
              title: "Privacy and Communications",
              content: "Personal information is handled as described in our Privacy Notice. Operational email, SMS, or telephone communication may be used to complete account security, payment, reservation, arrival, cancellation, and guest-support activities."
            },
            {
              title: "Governing Law and Contact",
              content: "These terms are governed by the laws of the Federal Republic of Nigeria and any mandatory rules that apply where the hotel operates. Please first contact Guest Relations at info@moorehotelandsuites.com or +234 803 377 4544 so we can try to resolve a concern promptly."
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
