import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => (
  <footer className="border-t border-white/10 bg-black py-14 sm:py-16" aria-label="Site footer">
    <div className="ui-container-wide">
      <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr_0.75fr_1.2fr] lg:gap-10">
        <div>
          <Link to="/" className="group inline-flex min-h-11 items-center gap-3" aria-label="Moore Hotels & Suites home">
            <span className="grid size-11 place-items-center overflow-hidden rounded-[4px] bg-[#e4e6e8]">
              <img src="https://res.cloudinary.com/dxryndnhl/image/upload/v1777386017/slazzer-preview-w1yad_jizukz.png" alt="" className="h-full w-full object-contain" />
            </span>
            <span>
              <span className="block text-sm font-bold tracking-[0.24em] text-white">MOORE</span>
              <span className="mt-1 block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-gray-500">Hotels &amp; Suites</span>
            </span>
          </Link>
          <p className="mt-6 max-w-sm text-sm leading-7 text-gray-500">
            Contemporary four-star hospitality, delivered with professional care and the warmth of Nigerian service.
          </p>
        </div>

        <div>
          <h2 className="ui-label mb-5">Explore</h2>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><Link to="/rooms" className="inline-flex min-h-8 items-center hover:text-primary">Rooms &amp; suites</Link></li>
            <li><Link to="/dining" className="inline-flex min-h-8 items-center hover:text-primary">Hotel experience</Link></li>
            <li><Link to="/services" className="inline-flex min-h-8 items-center hover:text-primary">Guest services</Link></li>
            <li><Link to="/about" className="inline-flex min-h-8 items-center hover:text-primary">Our story</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="ui-label mb-5">Your stay</h2>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><Link to="/manage-booking" className="inline-flex min-h-8 items-center hover:text-primary">Manage booking</Link></li>
            <li><Link to="/booking-status" className="inline-flex min-h-8 items-center hover:text-primary">Booking status</Link></li>
            <li><Link to="/help" className="inline-flex min-h-8 items-center hover:text-primary">Help center</Link></li>
            <li><Link to="/auth" className="inline-flex min-h-8 items-center hover:text-primary">Guest account</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="ui-label mb-5">Guest relations</h2>
          <address className="space-y-4 text-sm not-italic leading-6 text-gray-400">
            <a href="https://maps.google.com/?q=Harmony+Estate+Sagamu+Ikenne+Road+Ogun+State+Nigeria" target="_blank" rel="noopener noreferrer" className="flex gap-3 transition-colors hover:text-white">
              <span className="material-symbols-outlined mt-0.5 text-primary" aria-hidden="true">location_on</span>
              <span>Harmony Estate, Sagamu–Ikenne Road, beside NYSC Camp, Sagamu, Ogun State</span>
            </a>
            <a href="tel:+2348033774544" className="flex min-h-8 items-center gap-3 transition-colors hover:text-white">
              <span className="material-symbols-outlined text-primary" aria-hidden="true">phone</span>
              +234 803 377 4544
            </a>
            <a href="mailto:info@moorehotelandsuites.com" className="flex min-h-8 items-center gap-3 break-all transition-colors hover:text-white">
              <span className="material-symbols-outlined text-primary" aria-hidden="true">mail</span>
              info@moorehotelandsuites.com
            </a>
          </address>
        </div>
      </div>

      <div className="mt-14 flex flex-col gap-5 border-t border-white/10 pt-7 text-xs leading-5 text-gray-600 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Moore Hotels &amp; Suites. All rights reserved.</p>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <Link to="/privacy" className="hover:text-primary">Privacy</Link>
          <Link to="/terms" className="hover:text-primary">Terms</Link>
          <a href="mailto:info@moorehotelandsuites.com?subject=Guest%20Enquiry" className="hover:text-primary">Contact</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
