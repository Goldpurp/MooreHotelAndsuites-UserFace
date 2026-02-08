import React from "react";

const Privacy: React.FC = () => {
  return (
    <div className="bg-background-dark pt-24 md:pt-32 pb-16 md:pb-20 min-h-screen px-4 sm:px-6 lg:px-12">
      <div className="max-w-4xl mx-auto space-y-12 md:space-y-16">
        {/* HEADER */}
        <header className="space-y-4 border-b border-white/5 pb-8 md:pb-12">
          <p className="text-primary text-[10px] sm:text-[11px] font-black uppercase tracking-[0.5em]">
            Legal Sanctuary
          </p>
          <h1 className="serif-font text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white">
            Privacy <span className="italic">Policy</span>
          </h1>
          <p className="text-gray-500 text-[9px] sm:text-xs uppercase tracking-widest font-medium">
            Last Updated: October 24, 2024
          </p>
        </header>

        {/* CONTENT SECTIONS */}
        <div className="space-y-10 md:space-y-12 text-gray-400 font-light leading-relaxed">
          <section className="space-y-4 md:space-y-6">
            <h2 className="serif-font text-2xl sm:text-3xl md:text-3xl lg:text-3xl text-white italic">
              1. Our Commitment
            </h2>
            <p>
              At Moore Hotels & Suites, we recognize that your privacy is a cornerstone of your peace of mind. As a provider of sanctuary, we are committed to protecting the personal data you entrust to us. This policy outlines how we collect, use, and safeguard your information across our global portfolio of properties and digital platforms.
            </p>
          </section>

          <section className="space-y-4 md:space-y-6">
            <h2 className="serif-font text-2xl sm:text-3xl md:text-3xl lg:text-3xl text-white italic">
              2. Information We Collect
            </h2>
            <div className="space-y-3 md:space-y-4">
              <p>To provide an unrivaled hospitality experience, we collect the following categories of data:</p>
              <ul className="list-disc pl-6 space-y-2 md:space-y-3 marker:text-primary">
                <li>
                  <strong className="text-white">Identity Data:</strong> Legal name, passport details, nationality, and biometric identifiers where applicable for secure access.
                </li>
                <li>
                  <strong className="text-white">Contact Data:</strong> Residential address, personal email, and phone numbers.
                </li>
                <li>
                  <strong className="text-white">Stay Preferences:</strong> Dietary requirements, pillow choices, room temperature preferences, and historical stay feedback to personalize your next arrival.
                </li>
                <li>
                  <strong className="text-white">Financial Data:</strong> Encrypted payment card information and transaction history within the Moore ecosystem.
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4 md:space-y-6">
            <h2 className="serif-font text-2xl sm:text-3xl md:text-3xl lg:text-3xl text-white italic">
              3. How We Use Your Data
            </h2>
            <p>Your information is used solely to enhance your journey with us. This includes:</p>
            <ul className="list-disc pl-6 space-y-2 md:space-y-3 marker:text-primary">
              <li>Executing your reservations and processing payments.</li>
              <li>Anticipating your needs through curated concierge services.</li>
              <li>Maintaining the security and safety of our sanctuaries and guests.</li>
              <li>Inviting you to exclusive events via the Moore Circle membership.</li>
            </ul>
          </section>

          <section className="space-y-4 md:space-y-6">
            <h2 className="serif-font text-2xl sm:text-3xl md:text-3xl lg:text-3xl text-white italic">
              4. Data Sharing & Security
            </h2>
            <p>
              Moore Hotels & Suites never sells your data. We only share information with trusted partners (such as private chauffeurs or specialized spa practitioners) when necessary to fulfill your requests. All data is stored in encrypted, high-security environments compliant with global protection standards (GDPR, NDPR).
            </p>
          </section>

          <section className="space-y-4 md:space-y-6">
            <h2 className="serif-font text-2xl sm:text-3xl md:text-3xl lg:text-3xl text-white italic">
              5. Your Rights
            </h2>
            <p>
              You maintain the absolute right to access, rectify, or request the deletion of your personal identity records. You may exercise these rights at any time by contacting our Privacy Concierge at{" "}
              <span className="text-primary italic">privacy@moorehotel.com</span>.
            </p>
          </section>
        </div>

        {/* FOOTER */}
        <footer className="pt-8 md:pt-12 border-t border-white/5 flex justify-center">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 md:gap-3 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-primary hover:text-white transition-all"
          >
            <span className="material-symbols-outlined">print</span> Print Documentation
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Privacy;
