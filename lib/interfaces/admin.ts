// lib/interfaces/admin.ts
// Pure TypeScript interfaces — no Prisma types exported here.
// passwordHash is NEVER included — strip before returning to callers.

export interface Admin {
  id: number;
  phone: string;
  storeName: string;
  logo: string | null;
  whatsappNumber: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  returnPolicy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Landing Page Config ────────────────────────────────────────────────────

export interface LandingAnnouncementBar {
  enabled: boolean;
  text: string;
}

export interface LandingMarquee {
  enabled: boolean;
  items: string[];
}

export interface LandingFlashSale {
  enabled: boolean;
  title: string;
  endsAt: string; // ISO datetime string
}

export interface LandingBrandStory {
  enabled: boolean;
  headline: string;
  body: string;
  image: string;
}

export interface LandingNewArrivals {
  enabled: boolean;
  title: string;
  limit: number;
}

export interface LandingOffersSection {
  enabled: boolean;
  title: string;
  limit: number;
}

export interface LandingPageConfig {
  announcementBar: LandingAnnouncementBar;
  marquee: LandingMarquee;
  flashSale: LandingFlashSale;
  brandStory: LandingBrandStory;
  newArrivals: LandingNewArrivals;
  offersSection: LandingOffersSection;
}

export const defaultLandingConfig: LandingPageConfig = {
  announcementBar: {
    enabled: true,
    text: "🎁 شحن مجاني على الطلبات فوق ٣٠٠ جنيه — اطلبي دلوقتي!",
  },
  marquee: {
    enabled: true,
    items: [
      "🔥 تخفيضات الصيف وصلت",
      "شحن مجاني فوق ٣٠٠ جنيه",
      "✨ مجموعة جديدة كل أسبوع",
      "دفع عند الاستلام متاح",
      "🎀 أقمشة فاخرة مختارة بعناية",
    ],
  },
  flashSale: {
    enabled: true,
    title: "عرض ليوم واحد فقط 🔥",
    endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  brandStory: {
    enabled: true,
    headline: "قصتنا",
    body: "بدأنا في ٢٠٢١ من شقة صغيرة في المنصورة، ودلوقتي بنوصل لأكثر من ٣٠ محافظة في مصر كلها. كل قطعة بنختارها بحب وعناية عشان تحسّي إنك مميّزة.",
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1287&auto=format&fit=crop",
  },
  newArrivals: {
    enabled: true,
    title: "وصل حديثًا ✨",
    limit: 8,
  },
  offersSection: {
    enabled: true,
    title: "عروض وتخفيضات 🎯",
    limit: 8,
  },
};

/** Public store settings — returned by GET /api/settings (no auth). */
export interface IStoreSettings {
  storeName: string;
  logo: string | null;
  whatsappNumber: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  returnPolicy: string | null;
  landingPage: LandingPageConfig;
}
