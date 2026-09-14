import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  analyticsEnabled,
  getAnalyticsConsent,
  loadAnalytics,
  setAnalyticsConsent,
  trackPageView,
} from "../services/analytics";

export const COOKIE_SETTINGS_EVENT = "moore:open-cookie-settings";

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!analyticsEnabled) return;
    const consent = getAnalyticsConsent();
    setVisible(consent === null);
    if (consent === "accepted") loadAnalytics();

    const openSettings = () => setVisible(true);
    window.addEventListener(COOKIE_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, openSettings);
  }, []);

  if (!analyticsEnabled || !visible) return null;

  const choose = (choice: "accepted" | "declined") => {
    setAnalyticsConsent(choice);
    if (choice === "accepted") {
      loadAnalytics();
      trackPageView(`${window.location.pathname}${window.location.search}`, document.title);
    }
    setVisible(false);
  };

  return (
    <aside
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl rounded-xl border border-white/15 bg-[#111]/95 p-4 text-left shadow-2xl backdrop-blur-xl sm:bottom-5 sm:p-5"
      role="dialog"
      aria-labelledby="analytics-consent-title"
      aria-describedby="analytics-consent-description"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <h2 id="analytics-consent-title" className="text-sm font-bold text-white">Help us improve your experience</h2>
          <p id="analytics-consent-description" className="mt-1 text-xs leading-5 text-gray-300">
            With your permission, we use privacy-conscious Google Analytics to understand visits and improve the website. We do not use advertising cookies. Read our <Link to="/privacy" className="text-primary underline underline-offset-2">privacy notice</Link>.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => choose("declined")} className="ui-button ui-button-secondary min-h-11 px-4 py-2 text-xs">Decline</button>
          <button type="button" onClick={() => choose("accepted")} className="ui-button ui-button-primary min-h-11 px-4 py-2 text-xs">Allow analytics</button>
        </div>
      </div>
    </aside>
  );
};

export default CookieConsent;
