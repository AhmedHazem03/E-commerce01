"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

import type { HeroSlide } from "./HeroSection";

interface HeroSliderProps {
  slides: HeroSlide[];
}

/**
 * HeroSlider — Client Component
 * يُحمَّل lazily بعد ما Next.js يرسم الصورة الأولى في SSR.
 * المسؤوليات: Swiper autoplay، fade effect، pagination، scroll indicator.
 */
export default function HeroSlider({ slides }: HeroSliderProps) {
  return (
    <>
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        allowTouchMove={false}
        style={{ position: "absolute", inset: 0, height: "100%", width: "100%" }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index} style={{ height: "100%", position: "relative" }}>
            <Image
              src={slide.imageSrc}
              alt={slide.headline}
              fill
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
              sizes="100vw"
              className="object-cover object-center"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

            {/* Content */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-4 text-center z-10"
              dir="rtl"
            >
              <h1 className="font-cairo font-black text-warm-bg text-4xl md:text-6xl lg:text-7xl leading-tight drop-shadow-2xl">
                {slide.headline}
              </h1>
              <Link
                href="/products"
                className="relative inline-block overflow-hidden rounded-full bg-plum text-warm-bg font-cairo font-bold text-lg px-10 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 before:absolute before:inset-0 before:bg-white/15 before:translate-x-[-110%] hover:before:translate-x-[110%] before:transition-transform before:duration-600 before:ease-out"
              >
                تسوق الآن
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Scroll indicator */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce z-30 pointer-events-none">
        <span className="text-warm-bg/70 font-cairo text-xs drop-shadow-md">اكتشف المزيد</span>
        <ChevronDown size={28} className="text-warm-bg/70 drop-shadow-md" />
      </div>

      <style jsx global>{`
        #hero .swiper,
        #hero .swiper-wrapper,
        #hero .swiper-slide {
          height: 100% !important;
          width: 100% !important;
        }
        #hero .swiper-pagination {
          bottom: 28px !important;
          z-index: 30;
        }
        #hero .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.5);
          width: 10px;
          height: 10px;
          opacity: 1;
          transition: all 0.3s ease;
          margin: 0 4px !important;
        }
        #hero .swiper-pagination-bullet-active {
          background: #ffffff;
          width: 28px;
          border-radius: 5px;
        }
      `}</style>
    </>
  );
}
