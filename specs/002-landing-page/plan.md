# Implementation Plan: Warm Luxury Landing Page

**Branch**: `002-landing-page` | **Date**: 2026-04-04 | **Spec**: [spec.md](./spec.md)  
**Artifacts**: [research.md](./research.md) · [data-model.md](./data-model.md) · [contracts/page-contract.md](./contracts/page-contract.md) · [quickstart.md](./quickstart.md)

## Summary

Full-screen immersive landing page with 8 sequential sections for the Egyptian "Warm Luxury" e-commerce brand. The page is assembled in `app/(store)/page.tsx` using a mix of Server Components (hero, social proof, categories, best sellers, trust) and lazy-loaded Client Components (scrollytelling, UGC carousel, sticky mobile CTA). No new Prisma migrations or API routes are required — the only data change is a `sortBy: 'sold'` extension to the existing `getProducts()` service function using Prisma relation aggregate ordering.

**Critical pre-implementation action**: `framer-motion` must be installed and pinned before any Phase 2 work begins.

## Technical Context

| Property | Value |
|----------|-------|
| **Language** | TypeScript 5.7.3 strict — `.tsx`/`.ts` exclusively |
| **Framework** | Next.js 16.2.0 App Router |
| **Styling** | TailwindCSS 3.4.17 — warm-luxury tokens, mobile-first |
| **Animation** | framer-motion 11.18.2 (**NEW — must be installed and pinned**), Swiper 11.1.3 (already installed) |
| **Icons** | lucide-react 0.468.0 |
| **State** | Zustand 4.5.5 (existing store); `useState` for sticky CTA only |
| **Data** | PostgreSQL via Supabase (read-only — `getProducts()` only) |
| **No new migrations** | Prisma `orderBy: { orderItems: { _count: 'desc' } }` requires no schema change |
| **Target platform** | Vercel, Next.js App Router; `(store)/` route group |
| **Viewport range** | 320 px – 1440 px, mobile-first breakpoints |
| **Performance goals** | LCP ≤ 2.5 s (SC-001) · CLS < 0.1 (SC-002) · Skeleton ≤ 100 ms · Sticky CTA ≤ 200 ms |
| **Constraints** | RTL-only · Cairo font · Public page (no auth) · `"use client"` on exactly 3 separate files |

## Constitution Check

*Gates evaluated against constitution.md v1.1.0. Re-check required after Phase 2 implementation.*

### Standard Constitution Gates

| Gate | Rule | Status | Notes |
|------|------|--------|-------|
| GATE-1 TypeScript | All source files in `app/` and `components/` MUST use `.tsx`/`.ts` | ✅ PASS | All 8 new components and `page.tsx` are `.tsx` |
| GATE-2 Stack lock | `package.json` MUST use exact pinned versions | ⚠️ PENDING | `framer-motion` must be installed with exact version before first commit |
| GATE-3 Route groups | `(store)/` MUST NOT import from `(dashboard)/` | ✅ PASS | Landing page uses only `lib/services/` and `components/` |
| GATE-4 Checkout steps | Checkout flow MUST be exactly 2 steps | ✅ N/A | Landing page has no checkout flow |
| GATE-5 Dashboard auth | `middleware.ts` MUST gate `(dashboard)/` routes | ✅ N/A | No dashboard changes in this feature |
| GATE-6 Server separation | UI components MUST NOT import Prisma directly | ✅ PASS | BestSellers calls `getProducts()` from `lib/services/`; no direct Prisma import in components |
| GATE-7 Cart persistence | Cart MUST persist to `localStorage` via `lib/cart.ts` | ✅ N/A | No cart operations on landing page |
| GATE-8 Secret hygiene | No hard-coded credentials | ✅ PASS | Instagram URL → `NEXT_PUBLIC_INSTAGRAM_URL` env var |

### Landing Page Specific Gates

| Gate | Rule | Status | Enforcement |
|------|------|--------|-------------|
| GATE-LP-1 | No `<img>` tags — only `next/image` | ✅ DESIGN ENFORCED | All image usages documented with `next/image` in this plan |
| GATE-LP-2 | All colors use Tailwind tokens (`warm-bg`, `walnut`, `gold`, `ink`, `plum`) | ✅ DESIGN ENFORCED | Token classes defined in contracts; hex forbidden per constitution |
| GATE-LP-3 | All async Server Components wrapped in `<Suspense>` | ✅ DESIGN ENFORCED | BestSellers wrapped in Suspense with `<ProductGridSkeleton>` fallback |
| GATE-LP-4 | `"use client"` ONLY on Scrollytelling, UGCWall, StickyMobileCTA (3 separate files) | ✅ DESIGN ENFORCED | 5 static Server Components; 3 Client Components in separate files — exact count documented |
| GATE-LP-5 | No Prisma import outside `lib/services/` | ✅ PASS | Constitution GATE-6; no new violations introduced |
| GATE-LP-6 | Mobile-first CSS (base → `md:` → `lg:`) | ✅ DESIGN ENFORCED | All component specs start from base (mobile) breakpoint |
| GATE-LP-7 | RTL layout (`dir="rtl"` on `<html>`) | ✅ ALREADY CONFIGURED | `app/layout.tsx` has `<html lang="ar" dir="rtl">` |

> **ERROR policy**: GATE-2 (framer-motion pin) must be resolved before any Phase 2 component implementation. All other gates are PASS or N/A at design time.

## Architecture Overview

### Section Map

```
GET /  →  app/(store)/page.tsx
│
├── [1] HeroSection            (Server Component)   ← FR-001–005
├── [2] SocialProofBar         (Server Component)   ← FR-006–007
├── [3] CategoryGrid           (Server Component)   ← FR-008–011
├── [4] Scrollytelling         (Client — dynamic)   ← FR-012–014
├── [5] <Suspense>
│       └── BestSellers        (Server + async)     ← FR-015–019
│       fallback: ProductGridSkeleton
├── [6] TrustSection           (Server Component)   ← FR-020–022
├── [7] UGCWall                (Client — dynamic)   ← FR-023–024
└── [8] FinalCTA               (Server shell)       ← FR-025–026
        └── StickyMobileCTA    (Client — dynamic)   ← FR-027–029
```

### Data Flow

```
Database (Supabase PostgreSQL)
    │
    ▼
lib/services/product.service.ts
    getProducts({ limit: 4, sortBy: 'sold' })
    │
    ▼  (server-side, no HTTP round-trip)
BestSellers.tsx  (Async Server Component)
    │
    ▼
ProductCard.tsx  (existing component — reused)
```

```
Environment Variables
    NEXT_PUBLIC_INSTAGRAM_URL
    │
    ▼  (build-time substitution)
UGCWall.tsx  (Client Component)
    → <a href={env} target="_blank"> if non-empty
    → CTA button hidden if empty/undefined
```

### Client Boundary Map

```
app/(store)/page.tsx  (Server Component)
│
├── All static sections → Server Components (no boundary)
│
├── dynamic(Scrollytelling, { ssr: false })
│     └── Scrollytelling.tsx → "use client"
│           framer-motion: useScroll, useTransform, useReducedMotion
│
├── dynamic(UGCWall, { ssr: false })
│     └── UGCWall.tsx → "use client"
│           swiper/react: Swiper, SwiperSlide
│           modules: Navigation, Pagination, Autoplay
│
└── FinalCTA.tsx → Server Component
      (no client child — StickyMobileCTA is a separate file)

├── dynamic(StickyMobileCTA, { ssr: false })
│     └── StickyMobileCTA.tsx → "use client"
│           IntersectionObserver on #hero-sentinel div
│           useState: isVisible
│           className: "fixed bottom-0 left-0 right-0 z-50 md:hidden"
```

---

## Component Hierarchy

### Full Component Tree

```
app/(store)/page.tsx
├── HeroSection                   components/organisms/HeroSection.tsx
│                                   next/image (fill, priority, sizes="100vw")
│                                   next/link → /products
│
├── SocialProofBar                components/molecules/SocialProofBar.tsx
│                                   lucide-react Star (×5, fill="currentColor" text-gold)
│                                   Static copy: "صُمم بحب في مصر" · "+5000 طلب"
│
├── CategoryGrid                  components/organisms/CategoryGrid.tsx
│   ├── CategoryTile (×3)           next/link → /products?category=...
│   │   └── next/image (fill)       hover:scale-105 transition-transform
│   ├── ملابس
│   ├── إكسسوارات
│   └── هدايا
│
├── Scrollytelling (dynamic)      components/organisms/Scrollytelling.tsx ["use client"]
│   ├── StoryFrame (×3)             motion.div (useScroll, useTransform per element ref)
│   │   ├── next/image                Progressive text reveal on scroll
│   │   └── motion.p (text copy)    useReducedMotion() guard
│   └── (static HTML fallback if JS disabled — content always in DOM)
│
├── <Suspense fallback={<ProductGridSkeleton />}>
│   └── BestSellers               components/organisms/BestSellers.tsx [async Server]
│       └── ProductCard (×4)        components/organisms/ProductCard.tsx (existing)
│           ├── next/image (main image)
│           ├── PriceDisplay        components/molecules/PriceDisplay.tsx (existing)
│           └── StockBadge          components/molecules/StockBadge.tsx (existing)
│
├── TrustSection                  components/organisms/TrustSection.tsx
│   └── TrustItem (×4)              lucide-react: Truck, Banknote, RotateCcw, Gift
│                                   Grid 2×2 (mobile) → 4-col (md:)
│
├── UGCWall (dynamic)             components/organisms/UGCWall.tsx ["use client"]
│   ├── Swiper (Navigation, Pagination, Autoplay)
│   │   └── SwiperSlide (×6-9)      next/image (aspect-ratio: square)
│   └── <a href={NEXT_PUBLIC_INSTAGRAM_URL}>شاركنا إطلالتك</a>
│
└── FinalCTA                      components/organisms/FinalCTA.tsx [Server shell]
    ├── Headline: "لا تفوت الكولكشن الجديد"
    ├── Urgency copy (static)
    ├── next/link → /products
    └── StickyMobileCTA (dynamic)  [child: "use client"]
        └── IntersectionObserver on #hero-sentinel
            └── fixed bottom-0 z-50 md:hidden
                └── next/link → /products "اشتري الآن"
```

### Files to Create / Modify

#### New Files (8 components)

| File | Type | Key Dependencies |
|------|------|-----------------|
| `components/organisms/HeroSection.tsx` | Server Component | `next/image`, `next/link` |
| `components/molecules/SocialProofBar.tsx` | Server Component | `lucide-react` |
| `components/organisms/CategoryGrid.tsx` | Server Component | `next/image`, `next/link` |
| `components/organisms/Scrollytelling.tsx` | Client Component | `framer-motion` |
| `components/organisms/BestSellers.tsx` | Async Server Component | `lib/services/product.service` |
| `components/organisms/TrustSection.tsx` | Server Component | `lucide-react` |
| `components/organisms/UGCWall.tsx` | Client Component | `swiper/react` |
| `components/organisms/FinalCTA.tsx` | Server Component | `next/link` |
| `components/organisms/StickyMobileCTA.tsx` | Client Component | `next/link` |

#### Modified Files

| File | Change | Risk |
|------|--------|------|
| `app/globals.css` | Add `:root` CSS variables for 5 color tokens | Low — additive only |
| `tailwind.config.ts` | Extend `theme.colors` with 5 warm-luxury tokens | Low — additive only |
| `app/(store)/page.tsx` | Full replacement with 8-section assembly | Medium — full rewrite |
| `lib/services/product.service.ts` | Add `sortBy?: 'newest' \| 'sold'` to `ProductFilters` | Low — additive |
| `app/layout.tsx` | Add `next/font/google` Cairo configuration | Low — head-only |

---

## Implementation Phases

### Phase 0 — Setup & Blocking Actions

> Complete before any component development.

#### P0-T1: Install framer-motion

```bash
npm install --save-exact framer-motion@11.18.2
```

Verify `package.json` shows `"framer-motion": "11.18.2"` (no `^` or `~`). **Resolves GATE-2 for this feature.**

#### P0-T2: Create image placeholder directories

```bash
mkdir public\hero public\categories public\scrolly public\ugc
```

Add minimal placeholder images (at least 1×1 px solid-color JPEG) at:
- `public/hero/hero-main.jpg`
- `public/categories/clothing.jpg`, `accessories.jpg`, `gifts.jpg`
- `public/scrolly/story-1.jpg`, `story-2.jpg`, `story-3.jpg`
- `public/ugc/ugc-1.jpg` … `ugc-6.jpg`

#### P0-T3: Add env variable to .env.local

```
NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/placeholder_handle
```

---

### Phase 1 — Foundation (Design Tokens, Font, Service)

> Affects all components. Must be complete before any visual implementation.

#### P1-T1: Add design token CSS variables

**File**: `app/globals.css` — add after `@tailwind utilities`:

```css
:root {
  --bg: #F0EEE9;
  --bg-2: #6B4F3A;
  --accent: #F5C842;
  --text: #1A1A1A;
  --text-cta: #8B2E5A;
}
```

#### P1-T2: Extend Tailwind config with warm-luxury tokens

**File**: `tailwind.config.ts` — add to `theme.extend.colors`:

```ts
'warm-bg': 'var(--bg)',
'walnut':  'var(--bg-2)',
'gold':    'var(--accent)',
'ink':     'var(--text)',
'plum':    'var(--text-cta)',
```

#### P1-T3: Configure Cairo via next/font/google

**File**: `app/layout.tsx` — import and configure:

```tsx
import { Cairo } from 'next/font/google';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-cairo',
  weight: ['400', '600', '700', '900'],
});
// Add cairo.variable to <html> className
```

Eliminates external Google Fonts request → prevents CLS (SC-002, SC-003).

#### P1-T4: Add sortBy support to getProducts()

**File**: `lib/services/product.service.ts`

```typescript
// Extend interface:
sortBy?: 'newest' | 'sold';

// Extend orderBy logic:
const orderBy =
  filters.sortBy === 'sold'
    ? ({ orderItems: { _count: 'desc' } } as const)
    : ({ createdAt: 'desc' } as const);
```

No migration required. Prisma relation aggregate ordering is schema-free.

---

### Phase 2 — Static Server Components

#### P2-T1: HeroSection

**File**: `components/organisms/HeroSection.tsx` | Server Component

- Section wrapper: `relative w-full h-screen bg-walnut` (fallback if image fails — spec edge case)
- `<Image fill priority sizes="100vw" className="object-cover" alt="..." />`
- `<h1>` with 2-3 word Arabic headline: `font-cairo font-black text-warm-bg text-4xl md:text-6xl lg:text-7xl text-right`
- CTA: `<Link href="/products">` styled `bg-plum text-warm-bg hover:bg-walnut px-8 py-4 rounded-full font-cairo font-bold`
- Hero sentinel: `<div id="hero-sentinel" className="absolute bottom-0 h-1 w-full" />` (for StickyMobileCTA IntersectionObserver)

**Validates**: FR-001–005, SC-001 (priority image), GATE-LP-1, GATE-LP-2

#### P2-T2: SocialProofBar

**File**: `components/molecules/SocialProofBar.tsx` | Server Component

- Layout: `flex flex-row-reverse items-center justify-center gap-4 py-4 bg-warm-bg`
- Left (RTL-start): "+5000 طلب تم شحنه"
- Center: Five `<Star size={20} fill="currentColor" className="text-gold" />` from lucide-react
- Right (RTL-end): "صُمم بحب في مصر"

**Validates**: FR-006–007, US Story 2 / AC-1, GATE-LP-2

#### P2-T3: CategoryGrid

**File**: `components/organisms/CategoryGrid.tsx` | Server Component

Static data array (3 items). Layout: `grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-12`.  
Each tile: `<Link>` wrapping `relative aspect-[4/3] rounded-2xl overflow-hidden group`.  
Hover effect: `className="... group-hover:scale-105 transition-transform duration-300"` on the `<Image>`.  
Overlay text: `absolute inset-0 flex items-end p-4 bg-gradient-to-t from-walnut/70 to-transparent`.

**Validates**: FR-008–011, GATE-LP-1, GATE-LP-2

#### P2-T4: BestSellers (async Server Component)

**File**: `components/organisms/BestSellers.tsx` | Async Server Component

```tsx
export default async function BestSellers() {
  let products;
  try {
    const result = await getProducts({ limit: 4, sortBy: 'sold' });
    products = result.products;
  } catch {
    return null; // FR-019: no crash on error
  }
  if (products.length === 0) return null; // edge case
  return (
    <section className="py-12 px-4 bg-warm-bg">
      <h2 className="font-cairo font-bold text-2xl md:text-3xl text-ink text-right mb-8">
        الأكثر مبيعاً
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
```

In `page.tsx`: `<Suspense fallback={<ProductGridSkeleton />}><BestSellers /></Suspense>`

**Validates**: FR-015–019, SC-005, GATE-LP-3, GATE-LP-5

#### P2-T5: TrustSection

**File**: `components/organisms/TrustSection.tsx` | Server Component

```ts
const TRUST_ITEMS = [
  { icon: Truck,     label: 'شحن سريع' },
  { icon: Banknote,  label: 'دفع عند الاستلام' },
  { icon: RotateCcw, label: 'إرجاع سهل' },
  { icon: Gift,      label: 'تغليف هدايا مجاني' },
];
```

Layout: `grid grid-cols-2 md:grid-cols-4 gap-6 py-12 px-4 bg-warm-bg`.  
Icon size: `w-10 h-10 text-walnut`. Label: `font-cairo text-sm font-semibold text-ink`.

**Validates**: FR-020–022, US Story 2 / AC-2, GATE-LP-2

---

### Phase 3 — Client Components

> All three are `"use client"`. Imported via `dynamic()` — never as static imports in `page.tsx`.

#### P3-T1: Scrollytelling

**File**: `components/organisms/Scrollytelling.tsx` | `"use client"` | Dependencies: `framer-motion`

Per StoryFrame pattern:
1. `const ref = useRef<HTMLElement>(null);`
2. `const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });`
3. `const prefersReduced = useReducedMotion();`
4. `const opacity = useTransform(scrollYProgress, [0.1, 0.4], prefersReduced ? [1, 1] : [0, 1]);`
5. `const y = useTransform(scrollYProgress, [0.1, 0.4], prefersReduced ? [0, 0] : [30, 0]);`
6. Text wrapped in `<motion.p style={{ opacity, y }}>` — static content always in DOM

Static story data (3 items): copy + image path defined in component.  
No-JS fallback: all `<article>` elements with text visible in initial HTML — no conditional hiding.

**Validates**: FR-012–014, US Story 3 / AC-1, SC-008, GATE-LP-4

#### P3-T2: UGCWall

**File**: `components/organisms/UGCWall.tsx` | `"use client"` | Dependencies: `swiper/react`

```tsx
<Swiper
  modules={[Navigation, Pagination, Autoplay]}
  spaceBetween={16}
  slidesPerView={1.2}
  breakpoints={{ 768: { slidesPerView: 2.5 }, 1024: { slidesPerView: 3.5 } }}
  pagination={{ clickable: true }}
  autoplay={{ delay: 3500, disableOnInteraction: false }}
  dir="rtl"    {/* ← critical: fixes RTL swipe direction (Risk R5) */}
>
```

Instagram CTA: `{process.env.NEXT_PUBLIC_INSTAGRAM_URL && (<a href={...} target="_blank" rel="noopener noreferrer">شاركنا إطلالتك</a>)}`

CSS imports (valid in client components only):
```ts
import 'swiper/css';
import 'swiper/css/pagination';
```

**Validates**: FR-023–024, US Story 3 / AC-2,3, SC-007, GATE-LP-4

#### P3-T3: FinalCTA (Server) + StickyMobileCTA (Client)

**Server shell** — `components/organisms/FinalCTA.tsx`:
- `bg-walnut text-warm-bg` section (visually distinct dark section — FR-025)
- Headline: "لا تفوت الكولكشن الجديد" (FR-026)
- Urgency copy: "كميات محدودة – اطلب الآن واستلم في أسرع وقت"
- CTA link: `bg-gold text-ink hover:bg-plum hover:text-warm-bg transition-colors` → `/products`
- Does NOT mount StickyMobileCTA — `page.tsx` imports it as a separate dynamic component

**Client component** — `components/organisms/StickyMobileCTA.tsx` | `"use client"` (SEPARATE FILE):
- `IntersectionObserver` watches `#hero-sentinel` (placed at bottom of HeroSection)
- `useState(false)` → `setVisible(!entry.isIntersecting)` when sentinel exits viewport
- Renders: `fixed bottom-0 left-0 right-0 z-50 md:hidden p-4 bg-plum/95 backdrop-blur-sm`
- `<Link href="/products" aria-label="اشتري الآن">اشتري الآن</Link>`
- `if (!visible) return null;` — no render cost when hidden

**Validates**: FR-025–029, US Story 3 / AC-4,5,6, SC-009, GATE-LP-4, GATE-LP-6

---

### Phase 4 — Page Assembly & Validation

#### P4-T1: Assemble app/(store)/page.tsx

Full replacement of current content. Section order is fixed (FR-031):

```tsx
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import HeroSection from '@/components/organisms/HeroSection';
import SocialProofBar from '@/components/molecules/SocialProofBar';
import CategoryGrid from '@/components/organisms/CategoryGrid';
import BestSellers from '@/components/organisms/BestSellers';
import TrustSection from '@/components/organisms/TrustSection';
import FinalCTA from '@/components/organisms/FinalCTA';
import ProductGridSkeleton from '@/components/organisms/ProductGridSkeleton';

const Scrollytelling = dynamic(() => import('@/components/organisms/Scrollytelling'), { ssr: false });
const UGCWall = dynamic(() => import('@/components/organisms/UGCWall'), { ssr: false });
const StickyMobileCTA = dynamic(() => import('@/components/organisms/StickyMobileCTA'), { ssr: false });

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <SocialProofBar />
      <CategoryGrid />
      <Scrollytelling />
      <Suspense fallback={<ProductGridSkeleton count={4} />}>
        <BestSellers />
      </Suspense>
      <TrustSection />
      <UGCWall />
      <FinalCTA />
      <StickyMobileCTA />
    </main>
  );
}
```

#### P4-T2: Gate validation commands

```powershell
# GATE-LP-1: No raw <img> tags in new component files
Select-String -Path "components\organisms\*.tsx","components\molecules\SocialProofBar.tsx" -Pattern "<img " -SimpleMatch

# GATE-LP-2: No hardcoded hex values in new files
Select-String -Path "components\organisms\*.tsx","components\molecules\SocialProofBar.tsx" -Pattern '#[0-9A-Fa-f]{3,6}' -CaseSensitive

# GATE-LP-4: Confirm exactly 3 "use client" directives in new components
Select-String -Path "components\organisms\*.tsx","components\molecules\SocialProofBar.tsx" -Pattern '"use client"' | Select-Object Path
```

Expected output for GATE-LP-4: exactly 3 files — `Scrollytelling.tsx`, `UGCWall.tsx`, `StickyMobileCTA.tsx`.

#### P4-T3: Performance acceptance test

- Lighthouse Mobile → verify LCP ≤ 2.5 s (SC-001) and CLS < 0.1 (SC-002)
- Network tab → confirm `framer-motion` and `swiper` are **not** in the initial JS chunk
- 3G throttle → skeleton visible before 100 ms (SC-005)
- Mobile DevTools (375 px) → scroll past hero → sticky CTA appears ≤ 200 ms (SC-009)

#### P4-T4: RTL + viewport validation

- Desktop 1440 px: text right-aligned, no LTR overflow
- Mobile 375 px: no horizontal scrollbar (FR-032)
- 320 px: no horizontal scrollbar (FR-032)
- UGC carousel: swipe right = next slide (RTL direction correct — Risk R5)

---

## Constitution Gates Checklist

> Re-evaluate at Phase 4 completion. All gates must be ✅ before PR merge.

| Gate | Rule | Pre-impl | Post-impl |
|------|------|----------|-----------|
| GATE-1 | All files `.tsx`/`.ts` | ✅ | [ ] |
| GATE-2 | framer-motion exact pin in package.json | ⚠️ P0-T1 | [ ] |
| GATE-3 | No `(store)` ↔ `(dashboard)` cross-imports | ✅ | [ ] |
| GATE-8 | Instagram URL in env var only | ✅ | [ ] |
| GATE-LP-1 | `next/image` only, no `<img>` | ✅ design | [ ] |
| GATE-LP-2 | Tailwind tokens only, no hex | ✅ design | [ ] |
| GATE-LP-3 | BestSellers in `<Suspense>` | ✅ design | [ ] |
| GATE-LP-4 | `"use client"` on exactly 3 separate files | ✅ design | [ ] |
| GATE-LP-5 | No Prisma outside `lib/services/` | ✅ | [ ] |
| GATE-LP-6 | Mobile-first CSS (base → `md:` → `lg:`) | ✅ design | [ ] |
| GATE-LP-7 | `dir="rtl"` on `<html>` | ✅ configured | ✅ N/A |

---

## Risk Mitigations

### R1: Framer Motion + Swiper Bundle Size → LCP Regression

| Property | Detail |
|----------|--------|
| **Risk** | Framer Motion (~60 KB gzip) + Swiper (~35 KB gzip) in initial bundle → LCP > 2.5 s |
| **Likelihood** | High without mitigation |
| **Mitigation** | Both loaded via `dynamic({ ssr: false })` — neither Scrollytelling nor UGCWall is above-fold. Initial JS chunk sees 0 KB added. |
| **Verification** | Lighthouse → Bundle Analysis → confirm `framer-motion`/`swiper` absent from main chunk |

### R2: Hero Image Load Time

| Property | Detail |
|----------|--------|
| **Risk** | Full-screen hero = LCP element. Slow image load = SC-001 violation |
| **Likelihood** | Medium |
| **Mitigation** | `next/image priority` prop inlines `<link rel="preload" as="image">`. WebP format for hero. `bg-walnut` fallback if image fails. |
| **Verification** | Chrome DevTools Performance → hero image in LCP candidate list |

### R3: Cairo Font CLS

| Property | Detail |
|----------|--------|
| **Risk** | Cairo loaded via external Google Fonts → font swap causes reflow → CLS > 0.1 |
| **Likelihood** | **High** — current `app/layout.tsx` does NOT use `next/font/google` |
| **Mitigation** | P1-T3: Add `next/font/google` Cairo with `display: 'swap'`. Self-hosts font, eliminates external request, prevents reflow. |
| **Verification** | Lighthouse CLS < 0.1 |

### R4: Scrollytelling Static Paint Gap on Slow Connections

| Property | Detail |
|----------|--------|
| **Risk** | `dynamic({ ssr: false })` = invisible section until JS hydrates → blank gap on 3G |
| **Likelihood** | Medium (below-fold only) |
| **Mitigation** | Pass `loading: () => <div className="min-h-screen bg-warm-bg" />` to `dynamic()` call for Scrollytelling. Warm-bg colored placeholder prevents visual gap. |
| **Verification** | Slow 3G throttle → Scrollytelling area shows warm-bg color before hydration |

### R5: Swiper RTL Slide Direction

| Property | Detail |
|----------|--------|
| **Risk** | Swiper defaults to LTR. With global `dir="rtl"`, swipe direction may be reversed |
| **Likelihood** | High without fix |
| **Mitigation** | Pass `dir="rtl"` prop explicitly to `<Swiper>` component (Swiper 11 native RTL support). |
| **Verification** | Mobile swipe right → next slide appears in carousel |

### R6: IntersectionObserver Timing for StickyMobileCTA

| Property | Detail |
|----------|--------|
| **Risk** | Sentinel div must exist in DOM when `useEffect` runs in StickyMobileCTA |
| **Likelihood** | Low |
| **Mitigation** | Sentinel is in HeroSection (Server Component) → present in server-rendered HTML. DOM is fully available before client hydration events fire. |
| **Verification** | DevTools → confirm `#hero-sentinel` in DOM at page load (before JS) |

---

## Project Structure

```
specs/002-landing-page/
├── plan.md              ← This file
├── spec.md
├── research.md          ← Phase 0: 7 decisions resolved
├── data-model.md        ← Phase 1: entities, service extension, edge cases
├── quickstart.md        ← Phase 1: developer onboarding
├── contracts/
│   └── page-contract.md ← Phase 1: route, navigation, performance, a11y contracts
└── tasks.md             ← Phase 2 output (created by /speckit.tasks — not yet created)

Source changes:
app/
├── globals.css          ← MODIFIED: :root CSS token variables
├── layout.tsx           ← MODIFIED: next/font/google Cairo
└── (store)/
    └── page.tsx         ← MODIFIED: 8-section assembly

components/
├── molecules/
│   └── SocialProofBar.tsx          ← NEW (Server)
└── organisms/
    ├── HeroSection.tsx             ← NEW (Server)
    ├── CategoryGrid.tsx            ← NEW (Server)
    ├── Scrollytelling.tsx          ← NEW ("use client")
    ├── BestSellers.tsx             ← NEW (async Server)
    ├── TrustSection.tsx            ← NEW (Server)
    ├── UGCWall.tsx                 ← NEW ("use client")
    ├── FinalCTA.tsx                ← NEW (Server)
    └── StickyMobileCTA.tsx         ← NEW ("use client")

lib/services/
└── product.service.ts             ← MODIFIED: sortBy?: 'sold'

public/
├── hero/                           ← NEW directories (image assets)
├── categories/
├── scrolly/
└── ugc/
```

---

## Complexity Tracking

> No constitution violations. All deviations from default patterns are justified below.

| Pattern | Why Used | Simpler Alternative Rejected Because |
|---------|----------|--------------------------------------|
| `"use client"` on 3 components | `useScroll`, `useEffect`, Swiper require browser APIs | Server Components cannot access `window`, `IntersectionObserver`, or Swiper DOM initialization |
| `dynamic({ ssr: false })` for Scrollytelling + UGCWall | Keeps initial JS bundle ≤ 40 KB to protect LCP (R1) | Static import adds ~95 KB to first bundle; risks SC-001 violation |
| `framer-motion` new dependency | Only library providing smooth scroll-progress interpolation required by FR-013/FR-014 | CSS scroll-timeline (incomplete browser support); GSAP (commercial license for e-commerce use) |
| `sortBy: 'sold'` via Prisma `_count` | No `soldCount` column exists; relation aggregate avoids migration | Adding `soldCount` column requires schema migration + counter sync logic — out of scope for this feature |
