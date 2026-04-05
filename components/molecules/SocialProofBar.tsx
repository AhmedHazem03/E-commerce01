"use client";

import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const hasRun = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          let rafId: number;
          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) rafId = requestAnimationFrame(tick);
          };
          rafId = requestAnimationFrame(tick);
          // cleanup RAF إذا unmount المكون أثناء الـ animation
          return () => cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

export default function SocialProofBar() {
  const { count, ref } = useCountUp(5000);

  return (
    <div
      className="w-full bg-warm-bg border-y border-walnut/10 py-4 px-4"
      dir="rtl"
      ref={ref}
    >
      <div className="flex items-center justify-center gap-6 flex-wrap">
        {/* Stars */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={16}
              fill="currentColor"
              className="text-gold"
            />
          ))}
          <span className="font-cairo text-ink/70 text-sm mr-1">4.9</span>
        </div>

        {/* Divider */}
        <span className="text-walnut/30 hidden sm:block">|</span>

        {/* Counter */}
        <div className="flex items-center gap-1.5">
          <span className="font-cairo font-black text-plum text-xl leading-none">
            +{count.toLocaleString("ar-EG")}
          </span>
          <span className="font-cairo text-ink/70 text-sm">طلب تم شحنه</span>
        </div>

        {/* Divider */}
        <span className="text-walnut/30 hidden sm:block">|</span>

        {/* Brand */}
        <span className="font-cairo text-ink/70 text-sm">
          🇪🇬 صُمم بحب في مصر
        </span>
      </div>
    </div>
  );
}
