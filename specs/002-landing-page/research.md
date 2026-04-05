# Research: Warm Luxury Landing Page

**Phase**: 0 — Research & Unknowns Resolution  
**Branch**: `002-landing-page`  
**Date**: 2026-04-04

---

## Decision 1: Framer Motion Installation

**Status**: RESOLVED  
**Unknown**: `framer-motion` is NOT present in `package.json`. The Scrollytelling component requires `useScroll` / `useTransform`.

- **Decision**: Add `framer-motion` to `dependencies` with an exact pinned version. Run `npm install framer-motion@11` and lock the resolved patch version (e.g., `"framer-motion": "11.3.31"`).  
- **Rationale**: Framer Motion 11 is the only scroll-animation library that pairs natively with React 18 concurrent rendering and satisfies the "text animates as user scrolls" requirement (FR-013/FR-014). Version 11 ships its own tree-shaking so only used APIs are bundled.  
- **Alternatives considered**:  
  - *CSS scroll-timeline* — zero JS overhead, but cross-browser support is incomplete (Firefox 123+, no Safari until 2025). Rejected: spec targets all mobile browsers.  
  - *Intersection Observer only* — snaps text in/out; cannot produce smooth scroll-progress interpolation. Rejected: spec requires progressive reveal in sync with scroll position (SC-008).  
  - *GSAP ScrollTrigger* — industry standard, but GSAP Business License is required for commercial use. Rejected: license cost.  
- **Bundle risk mitigation**: Wrap `Scrollytelling` in `dynamic(() => import(...), { ssr: false })` at the page level to code-split it out of the initial JS bundle (see Decision 3).

---

## Decision 2: Best Sellers Sort Strategy

**Status**: RESOLVED  
**Unknown**: `getProducts()` `ProductFilters` has no `sortBy` field. The spec requires "4 products sorted by units sold". The `Product` model has no `soldCount` column.

- **Decision**: Add `sortBy?: 'newest' | 'sold'` to `ProductFilters` in `lib/services/product.service.ts`. When `sortBy === 'sold'`, switch `orderBy` from `{ createdAt: 'desc' }` to `{ orderItems: { _count: 'desc' } }`. No schema migration required — Prisma supports relation aggregate ordering on `_count`.  
- **Rationale**: Prisma's `orderBy` on relation aggregates (`_count`) is a server-side SQL `ORDER BY (SELECT COUNT(*) FROM order_items WHERE product_id = ...)` — zero schema cost, correct semantic ("best selling = most ordered"). Performance on the expected dataset (< 10 k products) is acceptable without an index.  
- **Alternatives considered**:  
  - *Add `soldCount Int @default(0)` column* — fast reads, but requires migration + counter sync logic on every order. Rejected: unnecessary migration scope for this feature.  
  - *Hardcode top-4 product IDs in a config file* — fragile, requires manual edits as inventory changes. Rejected: unmaintainable.  
  - *Sort in application layer* — fetch all products and `.sort()` client-side. Rejected: N+1 data waste, constitution forbids client-side DB-concern logic.

---

## Decision 3: Dynamic Imports for Bundle Size

**Status**: RESOLVED  
**Unknown**: Framer Motion (~60 KB gzip) + Swiper (~35 KB gzip) = ~95 KB added to the JS bundle. This threatens LCP (SC-001 requires LCP ≤ 2.5 s).

- **Decision**:  
  - `Scrollytelling` → `dynamic(() => import('@/components/organisms/Scrollytelling'), { ssr: false })` in `app/(store)/page.tsx`  
  - `UGCWall` → `dynamic(() => import('@/components/organisms/UGCWall'), { ssr: false })` in `app/(store)/page.tsx`  
  - `FinalCTA` → render Server shell statically; `StickyMobileCTA` uses `dynamic(() => import(...), { ssr: false })`  
- **Rationale**: Both sections are below the fold — `ssr: false` is safe because neither provides meaningful crawlable content. Initial JS bundle for above-fold content stays under 40 KB, protecting LCP.  
- **Tradeoff**: These sections will show a brief paint delay on slow connections. Mitigated by: (a) they are visually below the fold, and (b) a static `loading` placeholder can be passed as the `loading` prop to `dynamic()`.  
- **Alternatives considered**:  
  - *Import normally* — simple, but adds ~95 KB to the critical JS bundle. Rejected: violates SC-001.  
  - *Use lighter animation library* — Contradicts the architecture decision in the spec (Framer Motion named explicitly).

---

## Decision 4: Instagram URL Configuration

**Status**: RESOLVED  
**Unknown**: The spec edge case states "if the Instagram URL is not yet configured, the 'شاركنا إطلالتك' button is hidden rather than linking to a dead URL."

- **Decision**: Read `process.env.NEXT_PUBLIC_INSTAGRAM_URL` in the UGC Wall Server Component. If the env var is empty, falsy, or undefined, do not render the CTA anchor element at all (conditional rendering, not `visibility: hidden`).  
- **Rationale**: `NEXT_PUBLIC_` prefix exposes the value to the browser safely. Conditional non-render (rather than a disabled link) ensures no blank anchor confuses screen readers or broken crawls. Dev environments can set the var to a placeholder URL.  
- **Alternatives considered**:  
  - *Hardcode Instagram URL in component* — violates constitution Secret Hygiene gate (GATE-8). Rejected.  
  - *config.ts file* — technically valid for public URLs, but env var is the established pattern in this codebase.

---

## Decision 5: Hero Image LCP Strategy

**Status**: RESOLVED  
**Unknown**: Hero image must be "rendered with highest loading priority" (FR-005) and LCP ≤ 2.5 s (SC-001). Need to verify correct technique.

- **Decision**: Use `<Image src="..." priority fill sizes="100vw" alt="..." />` from `next/image`. The `priority` prop automatically injects a `<link rel="preload" as="image">` tag in the `<head>`. No manual `<link>` tag required.  
- **Rationale**: Next.js Image `priority` is the canonical way to preload above-fold images. It also disables lazy loading, ensures the browser fetches the image before the main JS bundle is evaluated.  
- **Hero image source path**: `/public/hero/hero-main.jpg` (WebP preferred). A solid `bg-walnut` fallback class is added to the `<section>` wrapper so the headline + CTA remain legible if the image fails to load (spec edge case).  
- **Alternatives considered**:  
  - *fetchpriority="high" on `<img>`* — requires `<img>` tag, which violates GATE-LP-1. Rejected.  
  - *Manual `<link rel="preload">`* — redundant when `next/image priority` is used; adds maintenance risk of mismatched URLs.

---

## Decision 6: Scrollytelling SSR + JS-Disabled Degradation

**Status**: RESOLVED  
**Unknown**: Spec requires graceful degradation when JavaScript is disabled — "all images and text visible in a static layout".

- **Decision**: The `"use client"` component renders all `<article>` elements in the initial JSX tree (not conditionally). The Framer Motion `motion.div` wrappers add opacity/transform only as progressive enhancement. Without JS hydration, the browser renders the raw HTML with `opacity: 1` (the default CSS value) and no transforms — all content is visible.  
- **Rationale**: This pattern is called "static shell + motion enhancement" and is the recommended Framer Motion approach for accessible degradation. No `<noscript>` tag is needed because the static content is already present in DOM.  
- **Implementation note**: Set `initial={{ opacity: 0, y: 30 }}` only inside a `useEffect` guard that checks `typeof window !== 'undefined'`, OR use Framer Motion's `LazyMotion` with `domAnimation` to ensure correct server/no-JS behavior.

---

## Decision 7: Cairo Font — Display Swap Verification

**Status**: RESOLVED  
**Unknown**: Constitution requires "font swap does not contribute to CLS score" (SC-003). Need to verify Cairo configuration.

- **Decision**: `tailwind.config.ts` already maps `cairo` to `var(--font-cairo)`. The root `app/layout.tsx` must configure Cairo via `next/font/google` with `display: 'swap'` and `variable: '--font-cairo'`. If not already done, this must be added in Phase 1.  
- **Current state**: `app/layout.tsx` does NOT import Cairo via `next/font/google` — it only loads `globals.css`. This is a **Phase 1 blocking action**.  
- **Rationale**: `next/font/google` self-hosts the font file, inlines the `@font-face` with `font-display: swap` in the `<head>`, and eliminates the external Google Fonts network request that causes CLS. Without this, Cairo falls back to the system `sans-serif`, causing a visible font swap that shifts layout.

---

## Summary Table

| # | Unknown | Decision | Impact |
|---|---------|----------|--------|
| 1 | framer-motion not installed | `npm install framer-motion@11` + pin exact version | Phase 0 blocking action |
| 2 | `getProducts` no `sortBy` | Add `sortBy?: 'sold'` → Prisma relation `_count` orderBy | Service edit, no migration |
| 3 | Bundle size Framer + Swiper | `dynamic()` for Scrollytelling, UGCWall, StickyMobileCTA | Below-fold sections SSR off |
| 4 | Instagram URL | `NEXT_PUBLIC_INSTAGRAM_URL` env var; hide if empty | No new API route |
| 5 | Hero LCP technique | `next/image priority fill` | Standard Next.js pattern |
| 6 | Scrollytelling no-JS fallback | Static HTML + motion as progressive enhancement | `initial` props + useEffect guard |
| 7 | Cairo font CLS | Add `next/font/google` with `display: 'swap'` to `app/layout.tsx` | Phase 1 blocking action |
