# Data Model: Warm Luxury Landing Page

**Phase**: 1 — Design  
**Branch**: `002-landing-page`  
**Date**: 2026-04-04

---

## Overview

The landing page is **read-only** with respect to the data layer. No new Prisma models, no new migrations, no new API routes are created. All data consumed is either:

1. **Static** — authored directly in component JSX (hero copy, trust items, category names, scrollytelling copy)
2. **Static assets** — images served from `/public/` (hero, UGC, category tiles, scrollytelling)
3. **Dynamic — read-only** — `Product` records fetched via `getProducts()` in the BestSellers Server Component

---

## Entity 1: Product (Existing — Read Only)

**Source**: `prisma/schema.prisma` — `Product` model  
**Service**: `lib/services/product.service.ts` → `getProducts()`  
**Usage in landing page**: BestSellers section (FR-015 to FR-019)

### Fields consumed by BestSellers

| Field | Type | Display Usage |
|-------|------|---------------|
| `id` | `Int` | Link key → `/products/[id]` |
| `name` | `String` | Product card title |
| `price` | `Float` | Current sale price |
| `oldPrice` | `Float \| null` | Strikethrough original price (if non-null and `> price`) |
| `stock` | `Int` | Drives `StockBadge` variant |
| `images[isMain=true].url` | `String` | Primary product image via `next/image` |
| `category` | `String` | Not displayed; kept for future filtering |

### Service Extension Required

`lib/services/product.service.ts` — add `sortBy` to `ProductFilters`:

```typescript
interface ProductFilters {
  // ... existing fields ...
  sortBy?: 'newest' | 'sold';   // NEW: 'sold' → orderBy orderItems._count desc
}
```

**`orderBy` mapping**:

```typescript
const orderBy = filters.sortBy === 'sold'
  ? { orderItems: { _count: 'desc' as const } }
  : { createdAt: 'desc' as const };
```

No migration. No schema change. Purely a service-layer extension.

### Stock Badge Logic

| Condition | Badge Text | Tailwind color |
|-----------|-----------|----------------|
| `stock === 0` | نفدت الكمية | `text-danger bg-danger/10` |
| `stock > 0 && stock < 5` | `باقي ${stock} قطع بس!` | `text-danger` (constitution urgency rule) |
| `stock >= 5` | متوفر | `text-green-600 bg-green-50` |

### Edge Cases

- **No image**: `images.find(i => i.isMain)?.url` may be undefined → fall back to `/public/placeholder.jpg` (warm-bg toned neutral)
- **Fetch fails**: Wrap BestSellers in `<ErrorBoundary>` + `<Suspense>`. On error, the section silently unmounts (spec: "no crash, no blank screen")
- **0 products returned**: Section renders nothing; outer `<section>` tag hides via `{products.length > 0 && (...)}` guard

---

## Entity 2: Category (Static Enum — No DB Entity)

**Source**: Hardcoded in `CategoryGrid.tsx`  
**Usage**: 3 category tiles navigating to `/products?category=[slug]`

| Display Name (AR) | URL Slug | Category Tile Image |
|-------------------|----------|---------------------|
| ملابس | `ملابس` | `/public/categories/clothing.jpg` |
| إكسسوارات | `إكسسوارات` | `/public/categories/accessories.jpg` |
| هدايا | `هدايا` | `/public/categories/gifts.jpg` |

**Note**: The `category` filter in `getProducts()` performs a case-insensitive database match via `{ name: { contains: search, mode: 'insensitive' } }`. Category slug values in URLs must match exact `Product.category` strings in the DB.

---

## Entity 3: LifestyleImage (Static File Asset — No DB Entity)

**Source**: `/public/` directory  
**Usage**: Hero, Scrollytelling (3-4 items), UGC Wall (6-9 items)

### Hero Image

| Field | Value |
|-------|-------|
| Path | `/public/hero/hero-main.jpg` |
| Format | WebP (preferred), JPEG fallback |
| Dimensions | 1440 × 900 minimum recommended |
| `next/image` props | `fill priority sizes="100vw"` |
| Fallback | `bg-walnut` CSS class on `<section>` wrapper |

### Scrollytelling Images

| Slot | Path | Title (AR) | Body (AR) |
|------|------|------------|----------|
| 1 | `/public/scrolly/story-1.jpg` | "جودة تحسّها" | "كل تفصيلة مصنوعة بحب وعناية" |
| 2 | `/public/scrolly/story-2.jpg` | "أناقة تعيشها" | "ستايل يعبّر عنك" |
| 3 | `/public/scrolly/story-3.jpg` | "هدايا تُفرحها" | "اختارها باهتمام، وصّلناها بأمان" |
| 4 | `/public/hero/hero-main.jpg` | "تسليم لبابك" | "شحن سريع لكل مكان في مصر" |

> Story 4 reuses the hero image from `/public/hero/hero-main.jpg` — no additional asset required.

### UGC Wall Images

| Count | Path pattern | Alt text |
|-------|-------------|----------|
| 6-9 | `/public/ugc/ugc-[1-9].jpg` | `إطلالة عميلتنا [n]` |

**All images consumed via `next/image`** — GATE-LP-1 compliance.  
**Placeholder requirement**: During development, place same-dimension solid-color JPEG files in these directories before component implementation.

---

## State: StickyMobileCTA Visibility

Not a DB entity — local UI state managed by `useState` inside `StickyMobileCTA.tsx`.

| State Variable | Type | Initial | Trigger |
|----------------|------|---------|---------|
| `isVisible` | `boolean` | `false` | `window.scrollY > heroSectionHeight` |

**Detection strategy**: Use `useEffect` + `scroll` event listener. `heroSectionHeight` ≈ `window.innerHeight` (hero is 100vh). Alternatively: `IntersectionObserver` on a sentinel `<div>` at the bottom edge of `HeroSection`.

> **Recommendation**: Use `IntersectionObserver` — more performant than scroll event listener on mobile, fires within 200 ms of hero leaving viewport (SC-009).

---

## No New Entities

The following were considered and rejected:

| Potential Entity | Reason Not Needed |
|-----------------|-------------------|
| `HeroConfig` (DB) | Hero copy is static marketing text — managed in code, not a CMS |
| `TrustItem` (DB) | 4 fixed trust items — no operator UI to change them per spec |
| `UGCImage` (DB) | UGC is static editorial photography — no user upload flow this sprint |
| `PageAnalytics` (DB) | SC-010 measured via external analytics tool, not stored in-app |
