// Dynamic imports wrapper — NO "use client" here.
// next/dynamic with ssr:false MUST live in a Client Component in Next.js 16 Turbopack.
// We achieve this by having each component declare its own "use client" boundary,
// and importing them through this thin re-export module.
// The loading fallbacks (Risk R4) are handled via the loading prop on each dynamic call.
"use client";

import dynamic from "next/dynamic";

/**
 * DynamicHeroSlider — ssr:false مسموح هنا لأن الملف "use client"
 * HeroSection (Server Component) تستورد هذا بدلاً من استخدام dynamic مباشرةً
 * الصورة الأولى تُرسَم في SSR في HeroSection، والـ Slider يتحمّل بعدين
 */
export const DynamicHeroSlider = dynamic(
  () => import("@/components/organisms/HeroSlider"),
  {
    ssr: false,
    // لا loading fallback — الـ SSR image في HeroSection تملأ المكان
  }
);

export const DynamicScrollytelling = dynamic(
  () => import("@/components/organisms/Scrollytelling"),
  {
    ssr: true, // framer-motion يدعم SSR — المحتوى مرئي لـ Google
    loading: () => (
      // minHeight يطابق تقريباً ارتفاع 4 sections (كل section ~280px)
      <div className="w-full bg-warm-bg" style={{ minHeight: "1120px" }} />
    ),
  }
);


export const DynamicUGCWall = dynamic(
  () => import("@/components/organisms/UGCWall"),
  {
    ssr: false, // Swiper لا يدعم SSR — الـ header مفصول عنه في UGCWall
    loading: () => (
      <div className="w-full bg-warm-bg" style={{ minHeight: "400px" }} />
    ),
  }
);


export const DynamicStickyMobileCTA = dynamic(
  () => import("@/components/organisms/StickyMobileCTA"),
  { ssr: false }
);
