# Quickstart: Warm Luxury Landing Page

**Branch**: `002-landing-page`  
**Date**: 2026-04-04

---

## Prerequisites

- Node.js 20 LTS
- npm 10+
- The `002-landing-page` branch checked out
- `.env.local` with `DATABASE_URL`, `DIRECT_URL`, and optionally `NEXT_PUBLIC_INSTAGRAM_URL`

---

## Step 1: Install framer-motion

`framer-motion` is not yet in `package.json`. Install it and pin the exact resolved version:

```bash
npm install framer-motion@11
```

After install, verify `package.json` shows an exact version (e.g., `"framer-motion": "11.3.31"`). No range syntax (`^` or `~`) — constitution requires exact pins.

---

## Step 2: Add placeholder image directories

The landing page expects images in these paths. Create them with placeholder files before running the dev server:

```bash
mkdir -p public/hero public/categories public/scrolly public/ugc
# Add at least one placeholder JPEG per directory:
# public/hero/hero-main.jpg
# public/categories/clothing.jpg, accessories.jpg, gifts.jpg
# public/scrolly/story-1.jpg, story-2.jpg, story-3.jpg
# public/ugc/ugc-1.jpg ... ugc-6.jpg
```

Use any solid-color 1×1 pixel JPEG during development. The `next/image` component will render them without errors.

---

## Step 3: Add environment variable

```bash
# .env.local
NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/your_store_handle
```

Leave empty or omit during development — the UGC Wall CTA will simply hide.

---

## Step 4: Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the `/` route is the landing page (`app/(store)/page.tsx`).

---

## Implementing Sections (Order)

Follow this implementation order to keep the page functional at every stage:

1. **Globals + Tailwind tokens** (`globals.css`, `tailwind.config.ts`) — enables all Tailwind warm-luxury classes
2. **Cairo font** (`app/layout.tsx`) — prevents CLS; do this before any visual review  
3. **Service extension** (`lib/services/product.service.ts`) — add `sortBy: 'sold'` before building BestSellers
4. **HeroSection** — validates design tokens and `next/image priority` setup
5. **SocialProofBar** — simplest component; good smoke test for RTL + token classes
6. **CategoryGrid** — tests Link navigation and hover states
7. **BestSellers** — first real data fetch; validate skeleton + error boundary
8. **TrustSection** — lucide-react icons + grid layout
9. **Scrollytelling** — first client boundary; validate Framer Motion + `dynamic()` import
10. **UGCWall** — Swiper with navigation/pagination modules
11. **FinalCTA + StickyMobileCTA** — last client boundary; validate scroll threshold + mobile-only visibility
12. **Page assembly** (`app/(store)/page.tsx`) — compose all 8 sections in order

---

## Key Code Patterns

### BestSellers in page.tsx

```tsx
import { Suspense } from 'react';
import ProductGridSkeleton from '@/components/organisms/ProductGridSkeleton';
import BestSellers from '@/components/organisms/BestSellers';

// In page JSX:
<Suspense fallback={<ProductGridSkeleton />}>
  <BestSellers />
</Suspense>
```

### Dynamic import for client sections

```tsx
import dynamic from 'next/dynamic';

const Scrollytelling = dynamic(
  () => import('@/components/organisms/Scrollytelling'),
  { ssr: false }
);

const UGCWall = dynamic(
  () => import('@/components/organisms/UGCWall'),
  { ssr: false }
);
```

### Tailwind warm-luxury tokens

```tsx
// Correct — tokens only
<section className="bg-warm-bg text-ink">
  <button className="bg-plum text-warm-bg hover:bg-walnut">تسوق الآن</button>
</section>

// WRONG — hardcoded hex (blocked by GATE-LP-2)
<section style={{ backgroundColor: '#F0EEE9' }}>
```

### next/image for hero

```tsx
import Image from 'next/image';

<div className="relative w-full h-screen">
  <Image
    src="/hero/hero-main.jpg"
    alt="صورة هيرو للمتجر"
    fill
    priority
    sizes="100vw"
    className="object-cover"
  />
</div>
```

### Framer Motion scroll animation

```tsx
'use client';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

export default function Scrollytelling() {
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);

  return (
    <motion.div style={prefersReduced ? {} : { opacity }}>
      {/* content */}
    </motion.div>
  );
}
```

---

## Constitution Gates Quick Reference

Before opening a PR, verify all 7 landing-page gates:

| Gate | Check |
|------|-------|
| GATE-LP-1 | `grep -r "<img " components/organisms/Hero` → 0 results |
| GATE-LP-2 | No `#` hex values in new `.tsx` files |
| GATE-LP-3 | BestSellers wrapped in `<Suspense>` in `page.tsx` |
| GATE-LP-4 | Only 3 files have `"use client"`: Scrollytelling, UGCWall, StickyMobileCTA |
| GATE-LP-5 | `grep -r "from.*prisma" components/` → 0 results |
| GATE-LP-6 | All new Tailwind classes start with base, then `md:`, then `lg:` |
| GATE-LP-7 | `<html dir="rtl">` in `app/layout.tsx` — already configured, do not remove |
