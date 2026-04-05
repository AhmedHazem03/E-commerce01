"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const ugcImages = [
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1485230405346-71acb9518d9c?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1574516773273-0ff7e2f5f1c5?q=80&w=800&auto=format&fit=crop",
];

/**
 * UGCHeader — Server Component (بدون "use client")
 * يُفهرَس بمحركات البحث ويُرسَم في SSR.
 * يُستخدَم في page.tsx مباشرةً خارج DynamicUGCWall.
 */
export function UGCHeader() {
  return (
    <div className="mx-auto max-w-5xl px-4 mb-8" dir="rtl">
      <h2 className="font-cairo font-bold text-ink text-2xl md:text-3xl text-right">
        إطلالات عملائنا
      </h2>
      <p className="font-cairo text-ink/60 text-sm mt-1 text-right">
        شاركينا إطلالتك واحصلي على فرصة الظهور هنا
      </p>
    </div>
  );
}

/**
 * UGCWall — Client Component
 * يحتوي فقط على الـ Swiper (يتطلب client) + زر Instagram.
 */
export default function UGCWall() {
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL;

  return (
    <section className="w-full py-12 bg-warm-bg" dir="rtl">
      {/* Header مُكرَّر هنا فقط كـ fallback عند عدم وجود SSR */}
      <UGCHeader />
      <div className="px-4">
        <Swiper
          modules={[Autoplay, Pagination]}
          dir="rtl"
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop
          spaceBetween={16}
          breakpoints={{
            0: { slidesPerView: 1.2 },
            768: { slidesPerView: 2.5 },
            1024: { slidesPerView: 3.5 },
          }}
          className="pb-10"
        >
          {ugcImages.map((src, i) => (
            <SwiperSlide key={i}>
              <div className="relative overflow-hidden rounded-2xl aspect-square group">
                <Image
                  src={src}
                  alt={`إطلالة عميلتنا ${i + 1}`}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 80vw, (max-width: 1024px) 40vw, 30vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-walnut/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {instagramUrl && (
          <div className="flex justify-center mt-6">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-plum text-warm-bg font-cairo font-bold text-base px-8 py-3 hover:bg-walnut hover:scale-105 transition-all duration-300 shadow-md"
            >
              <span>📸</span>
              شاركنا إطلالتك
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
