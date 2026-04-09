"use client";

import { ReactNode, useState, useEffect, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Cairo } from "next/font/google";
import {
  Instagram,
  Facebook,
  ShoppingBag,
  MessageCircle,
  ChevronUp,
  MapPin,
  Shield,
  Truck,
  RotateCcw,
  Sparkles,
  Award,
  Menu,
  X,
  Search,
  ArrowLeft,
} from "lucide-react";
import NotificationBell from "@/components/organisms/NotificationBell";
import type { IStoreSettings } from "@/lib/interfaces";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

interface StoreLayoutProps {
  children: ReactNode;
  cartTrigger?: ReactNode;
  settings?: IStoreSettings | null;
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.78a4.85 4.85 0 01-1.01-.09z" />
    </svg>
  );
}

export default function StoreLayout({
  children,
  cartTrigger,
  settings,
}: StoreLayoutProps) {
  const storeName = settings?.storeName ?? "المتجر";
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    closeSearch();
    router.push(`/products?q=${encodeURIComponent(q)}`);
  };

  /** Normalize Egyptian phone → wa.me URL */
  const waUrl = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    const normalized = digits.startsWith("0") ? "2" + digits : digits;
    return `https://wa.me/${normalized}?text=${encodeURIComponent("أهلاً، أريد الاستفسار عن منتج")}`;
  };

  const hasSocial = !!(
    settings?.instagram ||
    settings?.facebook ||
    settings?.tiktok ||
    settings?.whatsappNumber
  );

  const navLinks = [
    { href: "/products", label: "المنتجات" },
    { href: "/orders", label: "طلباتي" },
    ...(settings?.returnPolicy
      ? [{ href: "/policies/returns", label: "سياسة الإرجاع" }]
      : []),
  ];

  return (
    <div
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} min-h-screen flex flex-col bg-white text-gray-900 antialiased`}
      style={
        {
          "--primary": "#6c47ff",
          "--primary-foreground": "#ffffff",
          "--danger": "#ef4444",
          "--danger-foreground": "#ffffff",
          "--surface": "#f8f9fa",
          "--surface-foreground": "#1a1a1a",
          "--radius": "0.5rem",
          "--spacing-xs": "0.25rem",
          "--spacing-sm": "0.5rem",
          "--spacing-md": "1rem",
          "--spacing-lg": "1.5rem",
          "--spacing-xl": "2rem",
        } as React.CSSProperties
      }
    >
      {/* ══════════════════════════════════════════════
          ANNOUNCEMENT BAR — seamless marquee ticker
      ══════════════════════════════════════════════ */}
      <div className="relative h-9 overflow-hidden bg-[#07070f] select-none">
        {/* Aurora glow blobs */}
        <div className="pointer-events-none absolute -top-6 left-[15%] h-16 w-40 rounded-full bg-violet-600/25 blur-2xl" />
        <div className="pointer-events-none absolute -top-6 left-[50%] h-16 w-32 rounded-full bg-fuchsia-600/20 blur-2xl" />
        <div className="pointer-events-none absolute -top-6 right-[15%] h-16 w-40 rounded-full bg-indigo-600/25 blur-2xl" />

        {/* Fade masks */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l from-[#07070f] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10 bg-gradient-to-r from-[#07070f] to-transparent" />

        {/* Ticker — 2 identical copies for seamless loop */}
        <div className="flex h-full items-center">
          <div className="animate-ticker flex shrink-0 items-center gap-0 whitespace-nowrap">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="inline-flex items-center">
                <span className="inline-flex items-center gap-2 px-7 text-[11px] font-medium tracking-wide text-white/70 font-cairo">
                  <Sparkles size={10} className="text-yellow-400 shrink-0" />
                  شحن سريع لجميع المناطق
                </span>
                <span className="text-white/15 text-base">✦</span>
                <span className="inline-flex items-center gap-2 px-7 text-[11px] font-medium tracking-wide text-white/70 font-cairo">
                  <Shield size={10} className="text-emerald-400 shrink-0" />
                  دفع آمن 100% مضمون
                </span>
                <span className="text-white/15 text-base">✦</span>
                <span className="inline-flex items-center gap-2 px-7 text-[11px] font-medium tracking-wide text-white/70 font-cairo">
                  <Award size={10} className="text-fuchsia-400 shrink-0" />
                  جودة مضمونة أو استرداد كامل
                </span>
                <span className="text-white/15 text-base">✦</span>
                <span className="inline-flex items-center gap-2 px-7 text-[11px] font-medium tracking-wide text-white/70 font-cairo">
                  <Truck size={10} className="text-sky-400 shrink-0" />
                  توصيل في أسرع وقت ممكن
                </span>
                <span className="text-white/15 text-base">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          MAIN HEADER — warm glassmorphism + brand depth
      ══════════════════════════════════════════════ */}
      <header
        className={`sticky top-0 z-30 transition-all duration-500 ${
          scrolled
            ? "bg-warm-bg/96 backdrop-blur-2xl shadow-[0_4px_28px_-4px_rgba(139,46,90,0.13)] border-b border-walnut/10"
            : "bg-warm-bg/75 backdrop-blur-xl border-b border-walnut/[0.07]"
        }`}
      >
        {/* Permanent thin gold accent at very top */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-l from-transparent via-gold/70 to-transparent" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-[76px] flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <Link
            href="/"
            className="group flex items-center gap-3 shrink-0"
            aria-label={storeName}
          >
            {settings?.logo ? (
              <Image
                src={settings.logo}
                alt={storeName}
                width={46}
                height={46}
                sizes="46px"
                className="h-11 w-auto object-contain rounded-2xl transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="animate-logo-glow h-11 w-11 rounded-2xl bg-gradient-to-br from-plum via-walnut to-plum flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-plum/20">
                <ShoppingBag size={20} className="text-white" strokeWidth={2.5} />
              </div>
            )}
            <div className="hidden sm:flex flex-col leading-none gap-1">
              <span className="text-[18px] font-extrabold font-cairo text-ink leading-none">
                {storeName}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold font-cairo uppercase tracking-[0.15em] text-walnut/60">
                <span className="h-1 w-1 rounded-full bg-gold inline-block" />
                متجر أزياء فاخرة
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="التنقل الرئيسي"
          >
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="relative px-4 py-2 text-sm font-semibold text-ink/65 hover:text-plum rounded-xl hover:bg-plum/[0.06] transition-all duration-200 font-cairo after:absolute after:bottom-1.5 after:right-4 after:left-4 after:h-[2px] after:rounded-full after:bg-gold after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200 after:origin-right"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* ── Actions ── */}
          <div className="flex items-center gap-1.5">
            {/* Search — expandable */}
            {searchOpen ? (
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-1 animate-float-up"
              >
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحثي عن منتج..."
                  className="w-44 sm:w-56 h-9 rounded-xl border border-walnut/20 bg-warm-bg px-3 text-sm font-cairo text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-plum/25 transition-all"
                />
                <button
                  type="submit"
                  className="h-9 w-9 flex items-center justify-center rounded-xl bg-plum text-white hover:bg-plum/90 transition-all shrink-0"
                  aria-label="تنفيذ البحث"
                >
                  <ArrowLeft size={15} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={closeSearch}
                  className="h-9 w-9 flex items-center justify-center rounded-xl text-ink/40 hover:text-ink hover:bg-walnut/10 transition-all shrink-0"
                  aria-label="إغلاق البحث"
                >
                  <X size={15} strokeWidth={2} />
                </button>
              </form>
            ) : (
              <button
                onClick={openSearch}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-ink/45 hover:text-plum hover:bg-plum/[0.06] transition-all duration-200"
                aria-label="بحث"
              >
                <Search size={17} strokeWidth={2} />
              </button>
            )}

            {settings?.whatsappNumber && (
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="تواصل عبر واتساب"
                className="hidden sm:inline-flex items-center gap-1.5 text-[11.5px] font-bold text-white bg-gradient-to-l from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-full px-4 py-2 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-200 hover:scale-105 font-cairo"
              >
                <MessageCircle size={13} strokeWidth={2.5} />
                واتساب
              </a>
            )}

            <NotificationBell />
            {cartTrigger}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-walnut/15 bg-warm-bg hover:bg-walnut/10 transition-all duration-200"
              aria-label="القائمة"
            >
              {mobileOpen ? (
                <X size={17} className="text-ink" />
              ) : (
                <Menu size={17} className="text-ink" />
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile Nav Drawer ── */}
        {mobileOpen && (
          <div className="animate-float-up md:hidden border-t border-walnut/10 bg-warm-bg/98 backdrop-blur-2xl px-4 py-4 space-y-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-ink/75 hover:text-plum hover:bg-plum/[0.05] rounded-xl transition-all font-cairo"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                {label}
              </Link>
            ))}
            {settings?.whatsappNumber && (
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50/60 rounded-xl transition-all font-cairo"
              >
                <MessageCircle size={15} className="shrink-0" />
                تواصل عبر واتساب
              </a>
            )}
          </div>
        )}

        {/* Gold gradient accent line on scroll */}
        {scrolled && (
          <div className="absolute bottom-0 inset-x-0 h-[1.5px] bg-gradient-to-l from-transparent via-gold/55 to-transparent" />
        )}
      </header>

      {/* ══════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════ */}
      <main className="flex-1 w-full">{children}</main>

      {/* ══════════════════════════════════════════════
          FOOTER — dark luxury with aurora depth
      ══════════════════════════════════════════════ */}
      <footer className="relative mt-auto overflow-hidden bg-[#07070f] text-gray-300">
        {/* Aurora glow blobs — depth layer */}
        <div className="pointer-events-none absolute -top-32 -right-16 h-80 w-80 rounded-full bg-violet-700/15 blur-[90px]" />
        <div className="pointer-events-none absolute top-24 left-0 h-64 w-64 rounded-full bg-indigo-800/10 blur-[80px]" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-fuchsia-900/10 blur-[70px]" />

        <div className="relative z-10">

          {/* ── Trust Bento Strip ── */}
          <div className="border-b border-white/[0.04]">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {(
                [
                  {
                    icon: Truck,
                    label: "شحن سريع",
                    sub: "لجميع المناطق",
                    grad: "from-sky-400 to-blue-600",
                    glow: "shadow-sky-500/25",
                  },
                  {
                    icon: Shield,
                    label: "دفع آمن",
                    sub: "100% مضمون",
                    grad: "from-emerald-400 to-teal-600",
                    glow: "shadow-emerald-500/25",
                  },
                  {
                    icon: RotateCcw,
                    label: "إرجاع مجاني",
                    sub: settings?.returnPolicy ? "حسب السياسة" : "خلال 7 أيام",
                    grad: "from-orange-400 to-amber-600",
                    glow: "shadow-orange-500/25",
                  },
                  {
                    icon: Award,
                    label: "جودة مضمونة",
                    sub: "أو استرداد كامل",
                    grad: "from-fuchsia-400 to-violet-600",
                    glow: "shadow-fuchsia-500/25",
                  },
                ] as const
              ).map(({ icon: Icon, label, sub, grad, glow }) => (
                <div
                  key={label}
                  className="group flex items-center gap-3.5 rounded-2xl border border-white/[0.05] bg-white/[0.03] p-4 hover:border-white/[0.10] hover:bg-white/[0.06] transition-all duration-300"
                >
                  <div
                    className={`h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-lg ${glow} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon size={19} className="text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white font-cairo">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-cairo">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Main Grid ── */}
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

            {/* Brand Column */}
            <div className="space-y-5">
              <Link href="/" className="group inline-flex items-center gap-3">
                {settings?.logo ? (
                  <Image
                    src={settings.logo}
                    alt={storeName}
                    width={38}
                    height={38}
                    sizes="38px"
                    className="h-[38px] w-auto object-contain brightness-0 invert opacity-80"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-700 flex items-center justify-center">
                    <ShoppingBag size={17} className="text-white" />
                  </div>
                )}
                <span className="text-xl font-extrabold text-white font-cairo group-hover:text-violet-300 transition-colors">
                  {storeName}
                </span>
              </Link>

              <p className="text-sm text-gray-500 leading-relaxed font-cairo max-w-[280px]">
                نقدم لكم أفضل المنتجات بجودة عالية وأسعار منافسة. رضاؤكم هو الهدف الأول دائمًا.
              </p>

              {/* Social row — always visible; clickable only when URL is set */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {/* Instagram */}
                {settings?.instagram ? (
                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="h-10 w-10 rounded-xl border border-white/[0.07] bg-white/[0.04] hover:bg-pink-500 hover:border-pink-500/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/20"
                  >
                    <Instagram size={15} />
                  </a>
                ) : (
                  <span className="h-10 w-10 rounded-xl border border-white/[0.05] bg-white/[0.02] flex items-center justify-center text-gray-700 cursor-default">
                    <Instagram size={15} />
                  </span>
                )}

                {/* Facebook */}
                {settings?.facebook ? (
                  <a
                    href={settings.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="h-10 w-10 rounded-xl border border-white/[0.07] bg-white/[0.04] hover:bg-blue-600 hover:border-blue-500/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20"
                  >
                    <Facebook size={15} />
                  </a>
                ) : (
                  <span className="h-10 w-10 rounded-xl border border-white/[0.05] bg-white/[0.02] flex items-center justify-center text-gray-700 cursor-default">
                    <Facebook size={15} />
                  </span>
                )}

                {/* TikTok */}
                {settings?.tiktok ? (
                  <a
                    href={settings.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    className="h-10 w-10 rounded-xl border border-white/[0.07] bg-white/[0.04] hover:bg-[#010101] hover:border-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
                  >
                    <TikTokIcon className="h-[14px] w-[14px]" />
                  </a>
                ) : (
                  <span className="h-10 w-10 rounded-xl border border-white/[0.05] bg-white/[0.02] flex items-center justify-center text-gray-700 cursor-default">
                    <TikTokIcon className="h-[14px] w-[14px]" />
                  </span>
                )}

                {/* WhatsApp */}
                {settings?.whatsappNumber ? (
                  <a
                    href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="h-10 w-10 rounded-xl border border-white/[0.07] bg-white/[0.04] hover:bg-emerald-600 hover:border-emerald-500/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-emerald-500/20"
                  >
                    <MessageCircle size={15} />
                  </a>
                ) : (
                  <span className="h-10 w-10 rounded-xl border border-white/[0.05] bg-white/[0.02] flex items-center justify-center text-gray-700 cursor-default">
                    <MessageCircle size={15} />
                  </span>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-5">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-600 font-cairo">
                روابط سريعة
              </h3>
              <ul className="space-y-3">
                {navLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group inline-flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors duration-200 font-cairo"
                    >
                      <span className="h-px w-4 rounded-full bg-gray-700 group-hover:w-6 group-hover:bg-violet-500 transition-all duration-300" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-5">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-600 font-cairo">
                تواصل معنا
              </h3>
              <ul className="space-y-3">
                {settings?.whatsappNumber && (
                  <li>
                    <a
                      href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200"
                    >
                      <div className="h-9 w-9 shrink-0 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] group-hover:bg-emerald-500/20 flex items-center justify-center transition-colors">
                        <MessageCircle size={14} className="text-emerald-500" />
                      </div>
                      <span dir="ltr" className="font-cairo">
                        {settings.whatsappNumber}
                      </span>
                    </a>
                  </li>
                )}
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="h-9 w-9 shrink-0 rounded-xl border border-violet-500/20 bg-violet-500/[0.08] flex items-center justify-center">
                    <MapPin size={14} className="text-violet-400" />
                  </div>
                  <span className="font-cairo">مصر - سوهاج</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Gradient divider */}
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="h-px bg-gradient-to-l from-transparent via-white/[0.08] to-transparent" />
          </div>

          {/* Bottom bar */}
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-600 font-cairo">
              © {new Date().getFullYear()} {storeName}. جميع الحقوق محفوظة.
            </p>
            <p className="text-xs text-gray-700 font-cairo">
              صُنع بـ{" "}
              <span className="text-fuchsia-500 font-bold">❤</span>{" "}
              لتجربة تسوق استثنائية
            </p>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════
          FLOATING — WhatsApp + Back to Top
      ══════════════════════════════════════════════ */}
      {settings?.whatsappNumber && (
        <a
          href={waUrl(settings.whatsappNumber)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="تواصل عبر واتساب"
          className="group fixed bottom-6 left-4 z-50 h-[54px] w-[54px] rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/35 hover:scale-110 active:scale-95 transition-all duration-200 bg-[#25D366] hover:bg-[#20ba58]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="white" className="w-7 h-7" aria-hidden="true">
            <path d="M16.002 3C9.374 3 4 8.373 4 15.001c0 2.126.558 4.115 1.53 5.845L4 29l8.38-1.505A12.003 12.003 0 0016.002 28c6.627 0 12-5.373 12-12.001C28.002 8.373 22.63 3 16.002 3zm6.308 16.467c-.265.742-1.538 1.415-2.098 1.464-.56.048-1.09.265-3.673-.765-3.1-1.24-5.08-4.438-5.233-4.643-.154-.205-1.24-1.65-1.24-3.148 0-1.5.787-2.237 1.065-2.544.278-.308.607-.385.81-.385.205 0 .41.002.59.01.189.008.444-.072.695.53.257.616.876 2.13.953 2.286.077.154.128.335.026.539-.103.205-.154.333-.308.513-.153.179-.322.4-.46.537-.154.153-.314.318-.135.624.18.307.8 1.32 1.716 2.137 1.179 1.05 2.172 1.374 2.48 1.528.307.154.485.128.664-.077.18-.205.769-.897 1.974-.897 0 0 .282.01.42.075.154.072 2.08.98 2.08.98s.364.153.41.435c.056.334-.206 1.08-.535 1.845z" />
          </svg>
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25 group-hover:opacity-0" />
        </a>
      )}

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="العودة للأعلى"
          className="animate-float-up fixed bottom-6 right-4 z-40 h-11 w-11 rounded-2xl bg-gradient-to-br from-plum to-walnut flex items-center justify-center shadow-lg shadow-plum/25 hover:shadow-plum/45 hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <ChevronUp size={20} className="text-white" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
