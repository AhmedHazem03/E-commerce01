# Feature Specification: Warm Luxury Landing Page

**Feature Branch**: `002-landing-page`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: User description: "Warm Luxury Landing Page for Egyptian E-Commerce fashion/gifts store"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Homepage Discovery & Purchase Journey (Priority: P1)

A first-time visitor lands on the homepage and is immediately immersed in a full-screen lifestyle image with a bold Arabic headline. They scroll through the page in order — social proof, categories, storytelling, bestsellers — and eventually tap either the hero CTA button ("تسوق الآن") or a product card to navigate into the store.

**Why this priority**: This is the core conversion path. Without a functional hero + navigation flow the page delivers no commercial value. Every other story builds on top of this journey being intact.

**Independent Test**: Load the homepage, scroll through all visible sections, tap "تسوق الآن" in the hero, and verify landing on the products listing page. Separately tap a Best Sellers product card and verify landing on that product's detail page.

**Acceptance Scenarios**:

1. **Given** a visitor loads the homepage, **When** the page renders, **Then** a full-screen lifestyle image is visible with a bold 2-3 word Arabic headline and a "تسوق الآن" call-to-action button.
2. **Given** a visitor sees the hero section, **When** they tap or click "تسوق الآن", **Then** they are navigated to `/products`.
3. **Given** a visitor scrolls to the Category Grid, **When** they tap a category tile (ملابس, إكسسوارات, or هدايا), **Then** they are navigated to `/products?category=[selected-category]`.
4. **Given** a visitor scrolls to the Best Sellers section, **When** they tap a product card, **Then** they are navigated to that product's detail page.
5. **Given** a visitor scrolls to the Final CTA section, **When** they see the page footer area, **Then** the section is visible with a dark background, an Arabic headline, and urgency copy.

---

### User Story 2 - Social Proof & Trust Signals for Conversion (Priority: P2)

A returning or evaluating visitor scrolls through the homepage and encounters multiple trust-building elements: a social proof bar with star ratings and order count, a trust section with four store guarantees, and a Best Sellers section showing real products with accurate stock and pricing. These signals reduce purchase hesitation and drive adding items to cart.

**Why this priority**: Trust signals are directly linked to conversion rate. This story can be validated without the full purchase journey completing — the signals themselves deliver measurable value.

**Independent Test**: Load the homepage and verify that the Social Proof Bar, Trust Section, and Best Sellers section each render with correct content and accurate real-time product data.

**Acceptance Scenarios**:

1. **Given** a visitor loads the homepage, **When** the Social Proof Bar is visible, **Then** it displays exactly: "صُمم بحب في مصر", five filled star icons, and "+5000 طلب تم شحنه".
2. **Given** a visitor scrolls to the Trust Section, **When** it renders, **Then** exactly 4 items are shown with icons: شحن سريع, دفع عند الاستلام, إرجاع سهل, تغليف هدايا مجاني — each with a recognizable icon and label.
3. **Given** the Best Sellers section loads successfully, **When** products are displayed, **Then** exactly 4 product cards appear, each showing product name, current price, and stock status badge.
4. **Given** a product in Best Sellers has a discounted price, **When** the card renders, **Then** the original price is displayed with a strikethrough style alongside the discounted price.
5. **Given** the Best Sellers section is fetching data, **When** the fetch is in progress, **Then** a skeleton placeholder layout is shown instead of a blank or broken area.
6. **Given** the Best Sellers product fetch fails, **When** the error is caught, **Then** the rest of the page continues to render normally without a crash or blank screen.

---

### User Story 3 - Mobile Engagement & Visual Storytelling (Priority: P3)

A mobile visitor experiences the immersive scrollytelling section with scroll-linked text reveals on lifestyle imagery, swipes through the UGC (user-generated content) carousel of lifestyle photos, and is invited to share their own look via Instagram. A sticky "اشتري الآن" button is always visible at the bottom of the screen once they scroll past the hero, ensuring a purchase path is never more than one tap away.

**Why this priority**: Mobile engagement and storytelling features reinforce brand personality and create secondary conversion paths. They complement the core journey but are not blocking for basic commercial operation.

**Independent Test**: On a mobile-width viewport, scroll through Scrollytelling to verify text animations, navigate to UGC Wall and swipe the carousel, confirm the Instagram CTA opens correctly, and verify the sticky CTA appears after scrolling past the hero and is hidden on desktop.

**Acceptance Scenarios**:

1. **Given** a visitor scrolls through the Scrollytelling section, **When** each lifestyle image enters the viewport, **Then** the paired text content animates into view in sync with scroll progress.
2. **Given** a visitor reaches the UGC Wall, **When** the section is rendered, **Then** 6-9 lifestyle images are displayed in a horizontally swipeable carousel.
3. **Given** a visitor taps "شاركنا إطلالتك" in the UGC Wall, **When** the tap registers, **Then** the store's Instagram profile opens in a new browser tab.
4. **Given** a mobile visitor scrolls past the hero section, **When** the hero is no longer in the viewport, **Then** a sticky "اشتري الآن" button appears fixed at the bottom of the screen.
5. **Given** a mobile visitor taps the sticky CTA, **When** the tap registers, **Then** they are navigated to `/products`.
6. **Given** a desktop visitor scrolls past the hero, **When** the same scroll threshold is crossed, **Then** the sticky CTA button does NOT appear (it is exclusively a mobile feature).

---

### Edge Cases

- **Best Sellers empty**: If the product data fetch returns 0 products, the Best Sellers section hides gracefully rather than showing an empty grid or broken skeleton.
- **Product missing image**: If a Best Sellers product has no associated image, a neutral placeholder image matching the design palette is shown instead.
- **All Best Sellers out of stock**: All 4 product cards render normally with an "نفدت الكمية" (out-of-stock) badge; the section does not collapse or hide.
- **Hero image load failure**: If the hero lifestyle image cannot be loaded, a solid background color from the design system palette is displayed so the headline and CTA remain legible.
- **UGC Wall with fewer than 6 images**: The carousel renders correctly with however many images are available; no empty slots or broken layout cells appear.
- **Slow network (3G)**: Above-fold content (hero image and headline) loads and is visible before below-fold sections; page does not appear blank for more than 2.5 seconds.
- **320px minimum viewport width**: No horizontal scroll bar appears; all text and images are contained within the screen width.
- **RTL text overflow**: Long Arabic words and phrases break correctly without causing content to overflow outside their containers.
- **Scrollytelling with JavaScript disabled**: The section degrades gracefully — all images and text are visible in a static layout (no animation).
- **Instagram link unavailable**: If the Instagram URL is not yet configured, the "شاركنا إطلالتك" button is hidden rather than linking to a dead URL.

---

## Requirements *(mandatory)*

### Functional Requirements

**Hero Section**
- **FR-001**: The homepage MUST render a full-screen hero as the first visible section above the fold.
- **FR-002**: The hero MUST contain a single lifestyle image spanning the full viewport width and height.
- **FR-003**: The hero MUST display a bold Arabic headline of 2-3 words overlaid on the image.
- **FR-004**: The hero MUST contain exactly one primary CTA button labeled "تسوق الآن" that navigates to `/products`.
- **FR-005**: The hero image and its text overlay MUST be rendered with highest loading priority so they are the first visual elements to appear.

**Social Proof Bar**
- **FR-006**: The page MUST render a Social Proof Bar as the second section, immediately below the hero.
- **FR-007**: The Social Proof Bar MUST display all three elements together: the text "صُمم بحب في مصر", five filled star icons, and the text "+5000 طلب تم شحنه".

**Category Grid**
- **FR-008**: The page MUST render a Category Grid with exactly 3 category tiles: ملابس, إكسسوارات, and هدايا.
- **FR-009**: Each category tile MUST navigate to `/products?category=[category-name]` when activated (click or tap).
- **FR-010**: Each category tile MUST provide a visible visual response (scale expansion) on hover or focus.
- **FR-011**: The Category Grid MUST use a bento-style three-box layout.

**Scrollytelling Section**
- **FR-012**: The page MUST include a Scrollytelling section containing 3-4 lifestyle images.
- **FR-013**: Each image in the Scrollytelling section MUST be paired with a block of descriptive text.
- **FR-014**: The text for each image MUST animate into visibility as the user scrolls to the corresponding image's viewport position.

**Best Sellers Section**
- **FR-015**: The page MUST include a Best Sellers section that fetches and displays real product data.
- **FR-016**: The Best Sellers section MUST display exactly 4 products.
- **FR-017**: Each product card MUST show: product name, current sale price, original price (with strikethrough if discounted), and a stock status badge.
- **FR-018**: The Best Sellers section MUST display a skeleton loading placeholder while product data is being fetched.
- **FR-019**: The Best Sellers section MUST degrade gracefully (no page crash, no blank screen) if the product data fetch fails.

**Trust Section**
- **FR-020**: The page MUST render a Trust Section with exactly 4 items in a grid layout.
- **FR-021**: The 4 trust items MUST be: شحن سريع, دفع عند الاستلام, إرجاع سهل, تغليف هدايا مجاني.
- **FR-022**: Each trust item MUST display both an icon and a text label.

**UGC Wall**
- **FR-023**: The page MUST include a UGC Wall section displaying 6-9 lifestyle images in a horizontally swipeable carousel.
- **FR-024**: The UGC Wall MUST display a "شاركنا إطلالتك" call-to-action that opens the store's Instagram profile page in a new browser tab.

**Final CTA Section**
- **FR-025**: The page MUST end with a Final CTA section rendered with a dark ("Walnut Retro") background, visually distinct from other sections.
- **FR-026**: The Final CTA section MUST display the headline "لا تفوت الكولكشن الجديد" and supporting urgency/FOMO copy about limited stock.

**Sticky Mobile CTA**
- **FR-027**: On mobile viewports, a sticky "اشتري الآن" button MUST appear fixed at the bottom of the screen once the user scrolls past the hero section.
- **FR-028**: The sticky CTA MUST navigate to `/products` when tapped.
- **FR-029**: The sticky CTA MUST be completely hidden on non-mobile (tablet and desktop) viewports.

**General Layout & Direction**
- **FR-030**: All page content MUST be rendered in Arabic with right-to-left (RTL) layout direction.
- **FR-031**: All 8 sections MUST appear in this fixed order: Hero → Social Proof Bar → Category Grid → Scrollytelling → Best Sellers → Trust Section → UGC Wall → Final CTA.
- **FR-032**: The page MUST render without horizontal overflow at viewport widths from 320px to 1440px.

### Key Entities

- **Product**: A sellable item displayed in Best Sellers. Key data: name, current price, original price (optional, for discount display), stock status (in-stock / low-stock / out-of-stock), primary image.
- **Category**: A top-level store classification used to filter products. The three homepage categories are: ملابس (clothing), إكسسوارات (accessories), هدايا (gifts).
- **Lifestyle Image**: A curated editorial photograph used for brand storytelling across the hero, category grid, scrollytelling, and UGC wall sections. Not product catalog images.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The largest above-fold element (hero image or headline) is fully visible to visitors within 2.5 seconds on a standard mobile 4G connection (LCP ≤ 2.5 s).
- **SC-002**: The page layout does not shift unexpectedly during or after load; the cumulative layout shift score stays below 0.1 (CLS < 0.1).
- **SC-003**: Arabic fonts render without a flash of unstyled or fallback text that causes visible layout shift; font swap does not contribute to the CLS score.
- **SC-004**: All 8 page sections render correctly on every viewport width from 320 px (small mobile) to 1440 px (large desktop) without a horizontal scrollbar.
- **SC-005**: A skeleton placeholder is visible in the Best Sellers section within 100 ms of page load, and real product data replaces it within 2 seconds under normal network conditions.
- **SC-006**: Tapping any CTA button, product card, or category tile navigates the user to the correct destination within 1 second on a standard mobile device.
- **SC-007**: The UGC carousel responds to a swipe gesture within 100 ms of touch input with no perceptible lag.
- **SC-008**: Scrollytelling text animations are triggered within one scroll step of the paired image entering the viewport.
- **SC-009**: The sticky mobile CTA button appears within 200 ms of the hero scrolling out of the viewport.
- **SC-010**: At least 60 % of homepage visitors navigate to a product listing or product detail page within their first session (homepage-to-product navigation rate, measured via analytics).

---

## Assumptions

- Lifestyle images for the hero, category grid, scrollytelling, and UGC wall are supplied by the design/content team in optimized formats before development begins.
- The store's Instagram profile URL is known and finalized; a placeholder will be used during development if the final URL is not yet available.
- The 4 Best Sellers products are determined by the existing product data service, which returns the most relevant featured products with correct real-time pricing and stock data.
- The store operates in Egypt only; no multi-currency, multi-language, or multi-region logic is required.
- All homepage visitors are anonymous — no authentication or login is required to view the page.
- The urgency copy in the Final CTA section is static marketing text; no live inventory counter is displayed there.
- Arabic is the sole language of the homepage; a language switcher is out of scope.
- The design system color palette (Warm Sand `#F0EEE9`, Warm Walnut `#6B4F3A`, Saffron `#F5C842`, Near Black `#1A1A1A`, Deep Plum `#8B2E5A`, Walnut Retro dark) is finalized and will not change during this feature's development cycle.
- The Cairo typeface is NOT currently configured via `next/font/google`; setup is required as part of this feature (see T002 in tasks.md). Once configured, it will be globally available and prevent CLS from font swap.
- The store's homepage is loaded publicly without authentication; server-side rendering is used for the initial page shell, with client-side hydration only where interactivity is required.
