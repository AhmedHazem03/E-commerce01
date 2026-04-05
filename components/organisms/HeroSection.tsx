import Image from "next/image";
import { DynamicHeroSlider } from "@/components/organisms/DynamicClientSections";

export interface HeroSlide {
  headline: string;
  imageSrc: string;
}

interface HeroSectionProps {
  slides: HeroSlide[];
}

/**
 * HeroSection — Server Component
 *
 * استراتيجية LCP:
 * 1. الصورة الأولى تُرسَم في الـ SSR HTML مباشرةً (priority + eager)
 *    → Browser يراها قبل أي JavaScript = LCP أسرع بـ ~1-2s
 * 2. HeroSlider يتحمّل بعدين (client-side) ويُحلّ محل الصورة الثابتة
 *    → Autoplay + fade effect + pagination يعملون بعد hydration
 * 3. كلاهما في نفس الـ section → لا CLS
 */
export default function HeroSection({ slides }: HeroSectionProps) {
  const firstSlide = slides[0];

  return (
    <section
      id="hero"
      style={{ height: "100svh" }}
      className="relative w-full bg-walnut overflow-hidden"
    >
      {/*
       * SSR Fallback — الصورة الأولى مباشرةً في الـ HTML
       * تُخفى تلقائياً بعد ما HeroSlider يُحمَّل (position absolute + z-index أقل)
       */}
      <Image
        src={firstSlide.imageSrc}
        alt={firstSlide.headline}
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Gradient overlay على الـ SSR fallback */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 z-[1]" />
      {/* Headline على الـ SSR fallback */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-4 text-center z-[2]"
        dir="rtl"
      >
        <h1 className="font-cairo font-black text-warm-bg text-4xl md:text-6xl lg:text-7xl leading-tight drop-shadow-2xl">
          {firstSlide.headline}
        </h1>
      </div>

      {/*
       * HeroSlider — Client Component (z-index أعلى)
       * يُغطّي الـ SSR fallback بعد hydration ويُشغّل الـ autoplay
       */}
      <div className="absolute inset-0 z-[3]">
        <DynamicHeroSlider slides={slides} />
      </div>

      {/* Hero sentinel for IntersectionObserver (StickyMobileCTA) */}
      <div id="hero-sentinel" className="absolute bottom-0 w-full h-1 z-20 pointer-events-none" />
    </section>
  );
}

