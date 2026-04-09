// Dynamic imports wrapper — NO "use client" here.
// next/dynamic with ssr:false MUST live in a Client Component in Next.js 16 Turbopack.
// We achieve this by having each component declare its own "use client" boundary,
// and importing them through this thin re-export module.
// The loading fallbacks (Risk R4) are handled via the loading prop on each dynamic call.
"use client";

import dynamic from "next/dynamic";

export const DynamicHeroSlider = dynamic(
  () => import("@/components/organisms/HeroSlider"),
  { ssr: false }
);

export const DynamicScrollytelling = dynamic(
  () => import("@/components/organisms/Scrollytelling"),
  {
    ssr: true,
    loading: () => (
      <div className="w-full bg-warm-bg" style={{ minHeight: "1120px" }} />
    ),
  }
);

export const DynamicUGCWall = dynamic(
  () => import("@/components/organisms/UGCWall"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full bg-warm-bg" style={{ minHeight: "400px" }} />
    ),
  }
);

export const DynamicStickyMobileCTA = dynamic(
  () => import("@/components/organisms/StickyMobileCTA"),
  { ssr: false }
);

export const DynamicAnnouncementBar = dynamic(
  () => import("@/components/organisms/AnnouncementBar"),
  { ssr: false }
);

export const DynamicMarqueeTicker = dynamic(
  () => import("@/components/organisms/MarqueeTicker"),
  { ssr: false }
);

export const DynamicWhatsAppButton = dynamic(
  () => import("@/components/organisms/WhatsAppButton"),
  { ssr: false }
);

export const DynamicFlashSaleCountdown = dynamic(
  () => import("@/components/organisms/FlashSaleCountdown"),
  { ssr: false }
);
