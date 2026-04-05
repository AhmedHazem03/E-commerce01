"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function StickyMobileCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById("hero-sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 md:hidden bg-plum/95 backdrop-blur-sm py-4 px-6 shadow-2xl transition-transform duration-300 ease-out ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
      dir="rtl"
    >
      <Link
        href="/products"
        aria-label="اشتري الآن"
        className="block w-full text-center text-warm-bg font-cairo font-bold text-lg rounded-full bg-gold/20 py-2 hover:bg-gold/30 transition-colors"
      >
        🛍️ اشتري الآن
      </Link>
    </div>
  );
}
