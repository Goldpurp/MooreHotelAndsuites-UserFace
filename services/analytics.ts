const CONSENT_KEY = "moore.analyticsConsent";
const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();

type AnalyticsConsent = "accepted" | "declined" | null;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const analyticsEnabled = Boolean(measurementId);

export const getAnalyticsConsent = (): AnalyticsConsent => {
  if (!analyticsEnabled) return null;
  const stored = window.localStorage.getItem(CONSENT_KEY);
  return stored === "accepted" || stored === "declined" ? stored : null;
};

export const setAnalyticsConsent = (choice: Exclude<AnalyticsConsent, null>) => {
  window.localStorage.setItem(CONSENT_KEY, choice);
};

export const loadAnalytics = () => {
  if (!measurementId || getAnalyticsConsent() !== "accepted") return false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  if (!document.getElementById("moore-google-analytics")) {
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    window.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      send_page_view: false,
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    const script = document.createElement("script");
    script.id = "moore-google-analytics";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }

  return true;
};

export const trackPageView = (path: string, title: string) => {
  if (!loadAnalytics() || !measurementId || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: `${window.location.origin}${path}`,
    page_title: title,
  });
};

