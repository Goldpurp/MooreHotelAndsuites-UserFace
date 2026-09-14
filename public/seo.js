(function () {
  "use strict";

  var config = window.MooreSeoData || {};
  var siteName = config.siteName || "Moore Hotels & Suites";
  var siteUrl = config.siteUrl || "https://moorehotelandsuites.com";
  var socialImage = config.socialImage || "";
  var socialImageAlt = config.socialImageAlt || "Moore Hotels & Suites in Sagamu";
  var routeMeta = Object.assign({}, config.publicRouteMeta, config.privateRouteMeta);
  var defaultMeta = routeMeta["/"] || {
    title: "Moore Hotels & Suites",
    description: "Book a stay at Moore Hotels & Suites in Sagamu, Ogun State."
  };
  var privateRoutes = config.privateRoutePrefixes || [];
  var indexableRoutes = Object.keys(config.publicRouteMeta || {});
  var dynamicRouteMeta = {};

  function upsertMeta(selector, attributes, content) {
    var element = document.head.querySelector(selector);
    if (!element) {
      element = document.createElement("meta");
      Object.keys(attributes).forEach(function (key) {
        element.setAttribute(key, attributes[key]);
      });
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
  }

  function upsertCanonical(url) {
    var canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);
  }

  function normalizedPath() {
    var path = window.location.pathname.replace(/\/+$/, "");
    return path || "/";
  }

  function currentMeta(path) {
    if (dynamicRouteMeta[path]) return dynamicRouteMeta[path];
    var embedded = document.getElementById("moore-route-meta");
    if (embedded) {
      try {
        var embeddedMeta = JSON.parse(embedded.textContent || "{}");
        if (embeddedMeta.path === path && embeddedMeta.title && embeddedMeta.description) {
          return embeddedMeta;
        }
      } catch (_) {
        // Invalid embedded metadata is ignored in favour of safe defaults.
      }
    }
    if (routeMeta[path]) return routeMeta[path];
    if (path.indexOf("/rooms/") === 0) {
      return {
        title: "Hotel Room in Sagamu | Moore Hotels & Suites",
        description: "View room details, amenities and availability, then book your stay directly with Moore Hotels & Suites in Sagamu, Ogun State."
      };
    }
    if (path.indexOf("/checkout/") === 0) {
      return {
        title: "Confirm Booking | Moore Hotels & Suites",
        description: "Review your stay details and complete your Moore Hotels & Suites reservation securely."
      };
    }
    if (path.indexOf("/booking-confirmation/") === 0) {
      return {
        title: "Booking Confirmation | Moore Hotels & Suites",
        description: "Review the current status and payment instructions for your Moore Hotels & Suites reservation."
      };
    }
    return {
      title: "Page Not Found | Moore Hotels & Suites",
      description: "The requested page could not be found. Explore rooms, services and booking help at Moore Hotels & Suites."
    };
  }

  function updateMetadata() {
    var path = normalizedPath();
    var meta = currentMeta(path);
    var isPrivate = privateRoutes.some(function (route) {
      return path === route || path.indexOf(route + "/") === 0;
    });
    var isIndexable = indexableRoutes.indexOf(path) !== -1 || path.indexOf("/rooms/") === 0;
    var canonicalUrl = siteUrl + (path === "/" ? "/" : path);

    document.title = meta.title;
    upsertMeta('meta[name="description"]', { name: "description" }, meta.description);
    upsertMeta('meta[name="robots"]', { name: "robots" }, isPrivate || !isIndexable ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    upsertCanonical(canonicalUrl);
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name" }, siteName);
    upsertMeta('meta[property="og:type"]', { property: "og:type" }, meta.type || (path.indexOf("/rooms/") === 0 ? "product" : "website"));
    upsertMeta('meta[property="og:locale"]', { property: "og:locale" }, "en_NG");
    upsertMeta('meta[property="og:title"]', { property: "og:title" }, meta.title);
    upsertMeta('meta[property="og:description"]', { property: "og:description" }, meta.description);
    upsertMeta('meta[property="og:url"]', { property: "og:url" }, canonicalUrl);
    upsertMeta('meta[property="og:image"]', { property: "og:image" }, meta.image || socialImage);
    upsertMeta('meta[property="og:image:alt"]', { property: "og:image:alt" }, meta.imageAlt || socialImageAlt);
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image");
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title" }, meta.title);
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description" }, meta.description);
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image" }, meta.image || socialImage);
    upsertMeta('meta[name="twitter:image:alt"]', { name: "twitter:image:alt" }, meta.imageAlt || socialImageAlt);
  }

  function installHotelStructuredData() {
    if (document.getElementById("moore-hotel-structured-data")) return;
    var structuredData = document.createElement("script");
    structuredData.id = "moore-hotel-structured-data";
    structuredData.type = "application/ld+json";
    structuredData.text = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": siteUrl + "/#website",
          name: siteName,
          url: siteUrl + "/",
          inLanguage: "en-NG"
        },
        {
          "@type": "Hotel",
          "@id": siteUrl + "/#hotel",
          name: siteName,
          url: siteUrl + "/",
          description: defaultMeta.description,
          image: socialImage,
          logo: config.logoUrl,
          telephone: "+2348033774544",
          email: "info@moorehotelandsuites.com",
          priceRange: "₦₦",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Harmony Estate, Sagamu–Ikenne Road, beside NYSC Camp",
            addressLocality: "Sagamu",
            addressRegion: "Ogun State",
            postalCode: "121101",
            addressCountry: "NG"
          },
          hasMap: "https://maps.google.com/?q=Harmony+Estate+Sagamu+Ikenne+Road+Ogun+State+Nigeria",
          checkinTime: "14:00",
          checkoutTime: "12:00",
          sameAs: []
        }
      ]
    });
    document.head.appendChild(structuredData);
  }

  ["pushState", "replaceState"].forEach(function (methodName) {
    var original = window.history[methodName];
    window.history[methodName] = function () {
      var result = original.apply(this, arguments);
      window.setTimeout(updateMetadata, 0);
      return result;
    };
  });
  window.addEventListener("popstate", updateMetadata);
  window.MooreSeo = {
    update: updateMetadata,
    setRouteMeta: function (path, meta) {
      dynamicRouteMeta[path] = meta;
      if (normalizedPath() === path) updateMetadata();
    },
    clearRouteMeta: function (path) {
      delete dynamicRouteMeta[path];
      if (normalizedPath() === path) updateMetadata();
    }
  };
  installHotelStructuredData();
  updateMetadata();
})();
