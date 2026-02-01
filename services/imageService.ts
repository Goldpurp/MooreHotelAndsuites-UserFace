// Curated high-quality professional photography for a luxury hospitality aesthetic.
// Registry keys return stock photos immediately.

export const APP_IMAGE_KEYS = {
  HERO: "hero",
  DINING_GENERAL: "dining_general",
  DINING_LHORIZON: "dining_lhorizon",
  DINING_CHARCOAL: "dining_charcoal",
  DINING_SANCTUARY: "dining_sanctuary",
  WELLNESS_GENERAL: "wellness_general",
  AMENITY_POOL: "amenity_pool",
  AMENITY_GAMES: "amenity_games",
  AMENITY_SPA: "amenity_spa",
  STANDARD_ROOM: "standard_room",
  BUSINESS_ROOM: "business_room",
  EXECUTIVE_ROOM: "executive_room",
  SUITE_ROOM: "suite_room",
  ABOUT_HERITAGE: "about_heritage",
  ABOUT_VISION: "about_vision",
  FAQ_SECTION: "faq_section"
} as const;

export type AppImageKey = typeof APP_IMAGE_KEYS[keyof typeof APP_IMAGE_KEYS];

const IMAGE_REGISTRY: Record<AppImageKey, string> = {
  hero: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1920",
  dining_general: "https://images.unsplash.com/photo-1550966841-3ee7adac1668?auto=format&fit=crop&q=80&w=1200",
  dining_lhorizon: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1200",
  dining_charcoal: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1200",
  dining_sanctuary: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=1200",
  wellness_general: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200",
  amenity_pool: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=1200",
  amenity_games: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=1200",
  amenity_spa: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&q=80&w=1200",
  standard_room: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1200",
  business_room: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1200",
  executive_room: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1200",
  suite_room: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=1200",
  about_heritage: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=1200",
  about_vision: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200",
  faq_section: "https://images.unsplash.com/photo-1517672346350-f2737089fc97?auto=format&fit=crop&q=80&w=1200"
};

export const getAppImage = (
  key: AppImageKey,
  fallback: AppImageKey = APP_IMAGE_KEYS.STANDARD_ROOM
): string => {
  return IMAGE_REGISTRY[key] ?? IMAGE_REGISTRY[fallback];
};

export const APP_IMAGE_PROMPTS = {
  ...APP_IMAGE_KEYS,
  VIDEO_POSTER: APP_IMAGE_KEYS.HERO
} as const;
