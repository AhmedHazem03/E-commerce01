# Page Contract: Landing Page (`/`)

**Phase**: 1 — Design  
**Branch**: `002-landing-page`  
**Date**: 2026-04-04  
**Route**: `GET /` → `app/(store)/page.tsx`

---

## Route Contract

### Request

| Property | Value |
|----------|-------|
| Method | `GET` |
| Path | `/` |
| Auth required | None (public page) |
| Query params | None |

### Response

| Property | Value |
|----------|-------|
| Content-Type | `text/html` (Next.js SSR) |
| HTTP Status | `200 OK` |
| Streaming | Yes — BestSellers section streams via React Suspense |

---

## Section Render Contract

All 8 sections MUST appear in this exact order (FR-031). Each section's render guarantee:

| Order | Section Component | Render Mode | Data Source | Fails Gracefully? |
|-------|-------------------|-------------|-------------|-------------------|
| 1 | `HeroSection` | Server static | None (static JSX) | Yes — `bg-walnut` fallback if image fails |
| 2 | `SocialProofBar` | Server static | None (static JSX) | Yes — always renders |
| 3 | `CategoryGrid` | Server static | None (static JSX + routing) | Yes — always renders |
| 4 | `Scrollytelling` | Client (`dynamic ssr:false`) | None (static JSX + Framer Motion) | Yes — static HTML if JS disabled |
| 5 | `BestSellers` | Server async (Suspense) | `getProducts({ limit:4, sortBy:'sold' })` | Yes — empty state hides section; error boundary prevents crash |
| 6 | `TrustSection` | Server static | None (static JSX) | Yes — always renders |
| 7 | `UGCWall` | Client (`dynamic ssr:false`) | `NEXT_PUBLIC_INSTAGRAM_URL` env var | Yes — Swiper renders with available images; CTA hidden if URL empty |
| 8 | `FinalCTA` | Server static + Client child | None / scroll state | Yes — Server shell always renders; StickyMobileCTA progressive enhancement |

---

## Navigation Contracts

### Hero CTA Button

```
Element: <Link href="/products">تسوق الآن</Link>
Condition: Always rendered
Target: /products (store products listing page)
```

### Category Tiles

```
Element: <Link href={`/products?category=${slug}`}>{name}</Link>
Tiles: [ملابس → /products?category=ملابس], [إكسسوارات → /products?category=إكسسوارات], [هدايا → /products?category=هدايا]
Condition: Always rendered
```

### Best Sellers Product Cards

```
Element: <Link href={`/products/${product.id}`}>{product.name}</Link>
Condition: Rendered when getProducts() returns ≥ 1 product
Target: /products/[id] (product detail page)
```

### UGC Instagram CTA

```
Element: <a href={process.env.NEXT_PUBLIC_INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">شاركنا إطلالتك</a>
Condition: Rendered ONLY when NEXT_PUBLIC_INSTAGRAM_URL is non-empty
Target: Store Instagram profile (new tab)
```

### Sticky Mobile CTA

```
Element: <Link href="/products">اشتري الآن</Link>
Condition: Mobile only (md:hidden), visible after hero scrolls out of viewport
Target: /products
```

---

## Environment Variables Contract

| Variable | Type | Required | Used In | Default if Missing |
|----------|------|----------|---------|-------------------|
| `NEXT_PUBLIC_INSTAGRAM_URL` | `string` (URL) | Optional | `UGCWall.tsx` | Button hidden (not rendered) |
| `DATABASE_URL` | `string` | Required | `lib/prisma.ts` (existing) | Build error |
| `DIRECT_URL` | `string` | Required | `lib/prisma.ts` (existing) | Build error |

---

## Design Token Contract

All components MUST use Tailwind utility classes referencing these tokens. Hard-coded hex values are FORBIDDEN.

| Token Name | CSS Variable | Tailwind Class | Hex (reference only) |
|------------|-------------|----------------|---------------------|
| Warm Sand background | `--color-bg` | `bg-warm-bg` / `text-warm-bg` | `#F0EEE9` |
| Walnut brown | `--color-secondary` | `bg-walnut` / `text-walnut` | `#6B4F3A` |
| Saffron gold accent | `--color-accent` | `bg-gold` / `text-gold` | `#F5C842` |
| Near black | `--color-text` | `bg-ink` / `text-ink` | `#1A1A1A` |
| Deep plum CTA | `--color-cta` | `bg-plum` / `text-plum` | `#8B2E5A` |

Token addition targets:
- `app/globals.css` — CSS variables in `:root { }`
- `tailwind.config.ts` — `theme.extend.colors` block

---

## Performance Contract

| Metric | Target | Measurement Point |
|--------|--------|-------------------|
| LCP | ≤ 2.5 s | Hero image fully visible on mobile 4G |
| CLS | < 0.1 | Entire page scroll |
| Skeleton visible | ≤ 100 ms | BestSellers section after page load starts |
| Product data populated | ≤ 2 s | Normal network, Supabase connection |
| Swipe response | ≤ 100 ms | UGC carousel touch input |
| Sticky CTA appear | ≤ 200 ms | After hero scrolls out of viewport |

---

## Accessibility Contract

| Requirement | Implementation |
|-------------|---------------|
| All images have `alt` text | `next/image alt` prop is required; Arabic `alt` text |
| Interactive elements are keyboard-focusable | `<Link>` and `<a>` elements are focusable by default |
| Category tiles have hover and focus states | `hover:scale-105 focus:scale-105 transition-transform` |
| Arabic text direction | `dir="rtl"` on `<html>` (already set in `app/layout.tsx`) |
| Sticky CTA has accessible label | `aria-label="اشتري الآن"` |
| Framer Motion respects `prefers-reduced-motion` | Wrap `useScroll` animations in `useReducedMotion()` check |
