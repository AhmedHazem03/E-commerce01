# Tasks: Warm Luxury Landing Page

**Feature**: `002-landing-page`  
**Input**: `specs/002-landing-page/` — plan.md · spec.md · research.md · data-model.md · contracts/page-contract.md  
**Output**: `app/(store)/page.tsx` (rewritten) + 8 new components + config changes  
**Total Tasks**: 17  
**Tests**: Not requested — no test tasks generated  

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other tasks in the same phase (different files, no blocking dependency)
- **[US1/2/3]**: User story label (maps to spec.md priorities)
- All file paths are relative to `f:\E-Commerce\`

---

## Phase 0: Setup (Blocking — Complete Before Any Component Work)

**Purpose**: Install missing dependency, configure font, extend design tokens, create asset directories, and extend the product service. No component can be built until T001–T007 are done.

**⚠️ GATE-2 BLOCKER**: `framer-motion` is NOT in `package.json`. Scrollytelling.tsx will fail to compile without it. T001 must be completed and verified before Phase 2 begins.

**⚠️ GATE-LP-2 + GATE-LP-7 BLOCKERS**: T002, T003, T004 must land before any component references `bg-plum`, `text-gold`, or `font-cairo`.

- [X] T001 Install `framer-motion` with exact version pin (no `^` or `~`) — run `npm install --save-exact framer-motion@11.18.2`, verify `package.json` shows `"framer-motion": "11.18.2"` (no `^` or `~` prefix — GATE-2)
- [X] T002 Configure Cairo font via `next/font/google` in `app/layout.tsx` — import `Cairo` with `{ subsets: ['arabic'], variable: '--font-cairo', display: 'swap' }`, add `className={cairo.variable}` to `<html>` tag (resolves Decision 7 / CLS risk)
- [X] T003 Add warm-luxury color tokens to `tailwind.config.ts` — extend `theme.colors` with: `warm-bg: 'var(--bg)'`, `walnut: 'var(--bg-2)'`, `gold: 'var(--accent)'`, `ink: 'var(--text)'`, `plum: 'var(--text-cta)'`
- [X] T004 Add CSS custom properties to `app/globals.css` — inside `:root { }` add: `--bg: #F0EEE9; --bg-2: #6B4F3A; --accent: #F5C842; --text: #1A1A1A; --text-cta: #8B2E5A;`
- [X] T005 [P] Document hero image placeholder — create directory `public/hero/` and add a `README.md` noting that `hero-main.jpg` (WebP, 1440×900 minimum) is required before production deploy; add solid-color `hero-main.jpg` placeholder for development
- [X] T006 [P] Document UGC and category/scrolly image placeholders — create `public/ugc/`, `public/categories/`, `public/scrolly/` directories, each with a `README.md` listing required filenames: `ugc-[1-6].jpg`, `clothing.jpg` / `accessories.jpg` / `gifts.jpg`, `story-[1-3].jpg`; add same-dimension solid-color JPEG placeholders for each slot
- [X] T007 Extend `getProducts()` in `lib/services/product.service.ts` — add `sortBy?: 'newest' | 'sold'` to `ProductFilters` interface; inside the function add `const orderBy = filters.sortBy === 'sold' ? { orderItems: { _count: 'desc' as const } } : { createdAt: 'desc' as const };` and pass `orderBy` to `prisma.product.findMany()`; no schema migration required

**Checkpoint**: framer-motion installed, Cairo configured, design tokens live, image directories scaffolded, `getProducts()` accepts sortBy. Component implementation can now begin.

---

## Phase 1: Foundation (Shared — No User Story Label)

**Purpose**: Standalone Server Components with no async data dependency. They are shared infrastructure rendered on every page load. Can be built in parallel once Phase 0 is complete.

**Independent Test**: Load the homepage and verify SocialProofBar shows exactly "صُمم بحب في مصر", five gold stars, and "+5000 طلب تم شحنه". Verify TrustSection shows exactly 4 items in a grid with correct icons and Arabic labels.

- [X] T008 [P] Create `components/molecules/SocialProofBar.tsx` — Server Component (no `"use client"`), static JSX, render: centered flex row with `<Star />` icons (×5, `fill="currentColor" className="text-gold"`) from `lucide-react`, static Arabic copy "صُمم بحب في مصر" and "+5000 طلب تم شحنه", `bg-warm-bg` background, `dir="rtl"` text; no props required (GATE-LP-1: no `<img>` tags)
- [X] T009 [P] Create `components/organisms/TrustSection.tsx` — Server Component (no `"use client"`), render a 4-column grid (2-col mobile base → `md:grid-cols-4`) on `bg-warm-bg` background; 4 items using `lucide-react` icons: `<Truck />` for "شحن سريع", `<Banknote />` for "دفع عند الاستلام", `<RotateCcw />` for "إرجاع سهل", `<Gift />` for "تغليف هدايا مجاني"; each item: icon centered above label, `text-walnut` icon color, `text-ink` label; no props (GATE-LP-2: use token classes only)

**Checkpoint**: SocialProofBar and TrustSection compile and render correctly in isolation.

---

## Phase 2: Static Server Organisms (US1 + US2)

**Purpose**: Core above-fold Server Components covering the primary discovery and conversion path (US1) and the trust-signal sections (US2). Depend on Phase 0 tokens + font being in place.

**Goal (US1)**: Hero section renders above the fold with full-screen image, bold Arabic headline, and working "تسوق الآن" CTA.  
**Goal (US2)**: Category Grid and Best Sellers section both render with correct data and navigation.

**Independent Test (US1)**: Load homepage, verify full-screen hero image is visible, Arabic headline overlaid, "تسوق الآن" button present; tap/click and confirm navigation to `/products`.  
**Independent Test (US2)**: Scroll to CategoryGrid, verify 3 bento tiles with hover scale effect; click ملابس and confirm URL becomes `/products?category=ملابس`. Scroll to Best Sellers, verify 4 product cards render with name, price, and stock badge, or skeleton placeholder while loading.

- [X] T010 [US1] Create `components/organisms/HeroSection.tsx` — Server Component, accepts props `{ headline: string; imageSrc: string }`; render: `<section id="hero" className="relative h-screen w-full bg-walnut">`, inside: `<Image src={imageSrc} alt={headline} fill priority sizes="100vw" className="object-cover" />` (GATE-LP-1 + Decision 5), `fetchpriority` attribute via `next/image` priority prop (no manual `<img>` tag), dark gradient overlay div, `<h1>` with bold Arabic headline in `text-white font-cairo text-4xl md:text-6xl`, `<Link href="/products">` wrapping a `<Button>` atom with `className="bg-plum text-white"` and label "تسوق الآن"; add a `<div id="hero-sentinel" className="absolute bottom-0" />` for IntersectionObserver use by StickyMobileCTA (GATE-LP-2: no hex colors; GATE-LP-6: mobile-first)
- [X] T011 [US2] Create `components/organisms/CategoryGrid.tsx` — Server Component; render: 3-tile bento layout — on mobile single column (`grid-cols-1`), on desktop 2-column CSS grid with 1 large tile spanning 2 rows left and 2 stacked tiles right (`md:grid-cols-2`); each tile: `<Link href={"/products?category=" + slug}>` wrapping a `relative aspect-square group overflow-hidden rounded-2xl` container, `<Image fill src={src} alt={name} sizes="(max-width:768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />`, `<span>` with Arabic category name overlaid; tiles: `{ name: 'ملابس', slug: 'ملابس', src: '/categories/clothing.jpg' }`, `{ name: 'إكسسوارات', slug: 'إكسسوارات', src: '/categories/accessories.jpg' }`, `{ name: 'هدايا', slug: 'هدايا', src: '/categories/gifts.jpg' }` (GATE-LP-1 compliance; GATE-LP-6: base → md)
- [X] T012 [US2] Create `components/organisms/BestSellers.tsx` — `async` Server Component; at top of component body call `const { products } = await getProducts({ limit: 4, sortBy: 'sold' })` from `lib/services/product.service` (NOTE: `getProducts()` returns `{ products, total, page, pages }` — must destructure); guard: `if (!products.length) return null;`; render: `<section>` with Arabic heading "الأكثر مبيعًا", then `<ProductGrid>` rendering `<ProductCard>` for each product; wrap the async component body in a `try/catch` — on error log to console and return `null` (graceful degradation per FR-019 + spec edge case "Best Sellers empty"); does NOT wrap itself in `<Suspense>` — caller (`page.tsx`) does that (GATE-LP-5: no Prisma import; calls service only)

**Checkpoint (US1)**: HeroSection renders above the fold with correct image, headline, and navigation CTA. US1 acceptance scenarios 1–2 are satisfied.  
**Checkpoint (US2)**: CategoryGrid navigates correctly (scenarios 3). BestSellers renders with real data or hides gracefully (scenarios 3–6 from US2).

---

## Phase 3: Client Organisms (US3)

**Purpose**: Below-fold Client Components for mobile engagement — scroll-linked storytelling, UGC carousel, and the sticky CTA. All wrapped in `dynamic()` at the page level. Depend on framer-motion (T001) and Swiper (already installed).

**Goal (US3)**: Mobile visitor experiences immersive scroll animations, can swipe UGC carousel, tap Instagram CTA, and always has a sticky purchase button visible after scrolling past the hero.

**Independent Test (US3)**: On a 390 px viewport, scroll through Scrollytelling and verify text opacity/translateY animates in sync with scroll. Navigate to UGC Wall, swipe carousel, verify carousel wraps. Tap "شاركنا إطلالتك" and verify new tab opens to `NEXT_PUBLIC_INSTAGRAM_URL`. Scroll past hero and verify sticky "اشتري الآن" button appears (`fixed bottom-0`), is absent on desktop (`md:hidden`).

- [X] T013 [US3] Create `components/organisms/Scrollytelling.tsx` — `"use client"` directive at top; import `{ useScroll, useTransform, motion, useReducedMotion }` from `framer-motion`; render 4 `<article>` elements (images and text always in DOM for no-JS fallback per Decision 6); for each article use a `ref` + `useScroll({ target: ref, offset: ['start end', 'center center'] })` and `useTransform(scrollYProgress, [0,1], [30, 0])` for translateY and `[0, 1]` for opacity; guard: `const reducedMotion = useReducedMotion()` — if true, skip `initial` opacity/transform (accessibility); sections in order: `{ image: '/scrolly/story-1.jpg', title: 'جودة تحسّها', body: 'كل تفصيلة مصنوعة بحب وعناية' }`, `{ image: '/scrolly/story-2.jpg', title: 'أناقة تعيشها', body: 'ستايل يعبّر عنك' }`, `{ image: '/scrolly/story-3.jpg', title: 'هدايا تُفرحها', body: 'اختارها باهتمام، وصّلناها بأمان' }`, plus a 4th static `{ image: '/hero/hero-main.jpg', title: 'تسليم لبابك', body: 'شحن سريع لكل مكان في مصر' }`; alternate image-left/text-right and image-right/text-left layout per section index; all images via `<Image>` (GATE-LP-1); use only token classes (GATE-LP-2)
- [X] T014 [US3] Create `components/organisms/UGCWall.tsx` — `"use client"` directive at top; `import { Swiper, SwiperSlide } from 'swiper/react'`; `import { Autoplay, Pagination } from 'swiper/modules'`; `import 'swiper/css'`; `import 'swiper/css/pagination'`; render `<Swiper modules={[Autoplay, Pagination]} autoplay={{ delay: 3000 }} pagination={{ clickable: true }} breakpoints={{ 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}`; 6 slides using `<Image src={"/ugc/ugc-" + n + ".jpg"} alt={"إطلالة عميلتنا " + n} width={400} height={400} className="object-cover aspect-square" />` (GATE-LP-1); below carousel: conditionally render `<a href={process.env.NEXT_PUBLIC_INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">` CTA "شاركنا إطلالتك" only when `process.env.NEXT_PUBLIC_INSTAGRAM_URL` is non-empty (Decision 4 + spec edge case); use `bg-plum` for CTA background (GATE-LP-2)
- [X] T015a [US3] Create `components/organisms/FinalCTA.tsx` — **default export** `FinalCTA` — Server Component (no `"use client"`), renders `<section className="bg-walnut text-white text-center py-24 px-6">` containing `<h2>` "لا تفوت الكولكشن الجديد" `(text-4xl font-cairo font-bold)`, `<p>` "الكميات محدودة — اطلب دلوقتي" `(text-lg mt-2)`, `<Link href="/products">` button "تسوق الآن" `(bg-plum ...)`; does NOT mount StickyMobileCTA — that is done by `page.tsx` separately
- [X] T015b [P] [US3] Create `components/organisms/StickyMobileCTA.tsx` — **separate file** with `"use client"` directive at top (CRITICAL: Next.js App Router applies `"use client"` to the entire module — cannot mix server + client exports in one file); `useEffect` + `IntersectionObserver` on `#hero-sentinel` element; `const [isVisible, setIsVisible] = useState(false)`; when sentinel leaves viewport set `isVisible = true`; render: `{isVisible && <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-plum py-4 px-6"><Link href="/products" aria-label="اشتري الآن"><button>اشتري الآن</button></Link></div>}`; cleanup `observer.disconnect()` in useEffect return (GATE-LP-4: `"use client"` on exactly 3 separate files: Scrollytelling, UGCWall, StickyMobileCTA)

**Checkpoint (US3)**: All three client components compile without TypeScript errors. Framer Motion animations fire on scroll. Swiper carousel is swipeable. StickyMobileCTA appears only on mobile after hero scrolls out.

---

## Phase 4: Assembly (US1 — Ties Everything Together)

**Purpose**: Rewrite `app/(store)/page.tsx` to compose all 8 sections in the exact order required by the page contract. This is the integration point — all prior phases must be complete before this task.

**Goal**: The full landing page renders end-to-end at `GET /` with all sections visible, correct section ordering, Suspense boundary around BestSellers, and dynamic imports for Client Components.

**Independent Test**: Run `npm run dev`, open `http://localhost:3000`, scroll through all 8 sections in order verifying: hero image + CTA, social proof bar, category grid, scrollytelling animations, best sellers product cards (or skeleton), trust section grid, UGC carousel + Instagram CTA, FinalCTA section, sticky mobile CTA on resize to 390 px. Verify TypeScript passes with `npm run build`.

- [X] T016 [US1] Write `app/(store)/page.tsx` — Server Component (no `"use client"`); use `next/dynamic` with `{ ssr: false }` for `Scrollytelling`, `UGCWall`, `StickyMobileCTA` (3 separate dynamic imports); compose all sections in this exact order matching page-contract.md: `<HeroSection headline="أناقة مصرية" imageSrc="/hero/hero-main.jpg" />`, `<SocialProofBar />`, `<CategoryGrid />`, `<DynamicScrollytelling />`, `<Suspense fallback={<ProductGridSkeleton count={4} />}><BestSellers /></Suspense>`, `<TrustSection />`, `<DynamicUGCWall />`, `<FinalCTA />`, `<DynamicStickyMobileCTA />`; wrap page in `<main dir="rtl">` (GATE-LP-7 already on `<html>` but `<main>` reinforces for component isolation); pass `count={4}` to `ProductGridSkeleton` to match BestSellers (avoids 8→4 CLS shift — B1 fix); verify all constitution gates are satisfied inline

**Checkpoint (US1/FINAL)**: `npm run build` exits with 0 errors. All 8 sections render in correct order. Navigation CTAs work. GATE-2 (framer-motion pinned), GATE-LP-3 (BestSellers in Suspense), GATE-LP-4 (`"use client"` on exactly 3 files) are all satisfied.

---

## Dependencies Graph

```
T001 ──► T013 (framer-motion required)
T002 ──► T016 (Cairo font must be live before page assembly)
T003
T004 ──┬─► T008, T009, T010, T011, T012 (design tokens required by all components)
T005  │
T006  │
T007 ──► T012 (sortBy:'sold' required by BestSellers)
       │
       └─► T016 (all components must exist before assembly)

T008 ──┐
T009 ──┤
T010 ──┤
T011 ──┤─► T016
T012 ──┤
T013 ──┤
T014 ──┤
T015a──┤
T015b──┘
```

**Story completion order**:
1. Phase 0 (T001–T007) — Blocking for all
2. Phase 1 (T008–T009) — Can run in parallel; no story dependency
3. Phase 2 (T010–T012) — US1 + US2; T010 and T011 parallel, T012 depends on T007
4. Phase 3 (T013–T015b) — US3; all parallel with each other (T015a ‖ T015b)
5. Phase 4 (T016) — US1 assembly; depends on T002–T015b

---

## Parallel Execution Opportunities

### Phase 0 Parallelizable Pairs
```
T005 ‖ T006  — asset directory scaffolding (different directories, no dependency)
```

### Phase 1 Full Parallel
```
T008 ‖ T009  — different files, no shared imports
```

### Phase 2 Partial Parallel
```
T010 ‖ T011  — HeroSection and CategoryGrid are independent Server Components
T012          — sequential; depends on T007 (sortBy must be in service first)
```

### Phase 3 Full Parallel
```
T013 ‖ T014 ‖ T015a ‖ T015b  — four independent components in different files
```

### Maximum Parallel Session (after T001–T007 complete)
```
T008, T009, T010, T011, T013, T014, T015a, T015b  — 8 files simultaneously
(T012 waits on T007 completion verification)
```

---

## Implementation Strategy

### MVP Scope (deliver US1 first)
Complete T001 → T007 → T008 → T010 → T016 (stub remaining sections as `null`).  
This gives a working hero + CTA + font + tokens. US1 acceptance scenarios 1–2 are satisfied.

### Increment 2 (add US2)
Add T009, T011, T012 to complete trust signals and category navigation.  
US2 acceptance scenarios 1–6 are satisfied.

### Increment 3 (add US3 + polish)
Add T013, T014, T015a, T015b (all parallel), then update T016 to wire them in.  
Full page is complete. All acceptance scenarios satisfied.

---

## Constitution Gate Checklist

Run this checklist before merging the feature branch:

- [ ] **GATE-2**: `framer-motion` version in `package.json` has no `^` or `~` prefix
- [ ] **GATE-LP-1**: `grep -r "<img " components/organisms/ components/molecules/` returns zero results
- [ ] **GATE-LP-2**: `grep -rn "#[0-9A-Fa-f]" components/` returns zero results in `.tsx` files
- [ ] **GATE-LP-3**: `BestSellers` is wrapped in `<Suspense>` in `app/(store)/page.tsx`
- [ ] **GATE-LP-4**: `grep -rn '"use client"' components/` returns exactly 3 files: `Scrollytelling.tsx`, `UGCWall.tsx`, `StickyMobileCTA.tsx`
- [ ] **GATE-LP-5**: `grep -rn "from '@prisma/client'" components/` returns zero results
- [ ] **GATE-LP-6**: All new component files use base (mobile) class first before `md:` or `lg:` modifiers
- [ ] **GATE-LP-7**: `app/layout.tsx` has `<html lang="ar" dir="rtl">` with Cairo variable class
