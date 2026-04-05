# Feature Specification: E-Commerce Store MVP

**Feature Branch**: `001-e-commerce-store`
**Created**: 2026-04-03
**Status**: Clarified — Ready for Plan
**Input**: Full specs in `specs/01–15-*.md` + 5-question clarification session (2026-04-03)

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Browse → Cart → 2-Step Checkout → Confirm (Priority: P1) 🎯 MVP

A customer discovers the store, browses products, selects a variant, adds to
the CartDrawer, completes 2-step checkout, and receives an in-app order
confirmation with loyalty points preview.

**Why this priority**: Core revenue flow. This is the "Wow Factor" demo path.
Nothing else matters until a full purchase completes end-to-end on mobile.

**Independent Test**: Navigate to `/`, browse, open CartDrawer, complete both
checkout steps, and see the Order Confirmed notification — no admin panel needed.

**Acceptance Scenarios**:

1. **Given** a customer on the homepage, **When** they tap a product card,
   **Then** the PDP loads with Swiper gallery, variant options (individual stock),
   and the average star rating from reviews.
2. **Given** `VariantOption.stock < 5`, **Then** "باقي X قطع بس!" renders in `--danger` color.
3. **Given** a customer adds an item to cart, **When** CartDrawer opens,
   **Then** cart state is persisted in `localStorage` and coupon field is
   hidden behind a collapsible trigger link.
4. **Given** Step 1 of Checkout, **When** the customer enters their phone,
   **Then** `POST /api/customers` upserts the Customer and eagerly creates
   a `LoyaltyAccount` (0 points if new), returning `pointsToEarn`.
5. **Given** Step 2 renders, **Then** `POST /api/orders/preview` has been
   called server-side and the Order Summary displays the calculated
   `deliveryFee` and "أتمم طلبك واكسب X نقطة! 🏆" (X = `pointsToEarn`).
6. **Given** Step 2 is submitted, **Then** the order is persisted, an
   `ORDER_CONFIRMED` In-App `Notification` is created, **the customer is
   redirected to WhatsApp** (`wa.me/{STORE_WHATSAPP}`) with a pre-filled
   message containing the full order summary (order number, items, total,
   delivery fee, payment method, address), **and** the order tracking page
   opens at `/orders/[id]`.
7. **Given** the order tracking page, **Then** the status Timeline is visible,
   a "أرسل عبر واتساب 📱" button is present for re-sending the order
   via WhatsApp, and a "اطلب تاني" Reorder button is present.
8. **Given** a customer enters their phone in Step 1 then abandons the tab,
   **Then** `POST /api/cart/abandon` upserts an `AbandonedCart` record keyed
   by phone (`@unique`).

---

### User Story 2 — Admin Dashboard: Manage Orders & Products (Priority: P2)

The store owner logs in to the admin panel, sees incoming orders, updates their
status, manages the product catalogue (variants with individual stock), and
monitors abandoned carts.

**Why this priority**: Operationally required before launch, but not the Demo
"Wow Factor". Depends on the order data created by US1.

**Independent Test**: Log in at `/login`, view the last 10 orders, change one
order to `PREPARING`, verify the customer receives an `ORDER_STATUS`
notification, then add a new product with 2 variants.

**Acceptance Scenarios**:

1. **Given** any request to `/dashboard/*` without a valid JWT cookie,
   **Then** `middleware.ts` redirects to `/login`.
2. **Given** first login with `ADMIN_PHONE` + `ADMIN_PASSWORD` from `.env`,
   **When** no Admin DB record exists,
   **Then** `prisma.admin.upsert` bootstraps the record and sets a
   `admin_token` HttpOnly JWT cookie (`jose` signed).
3. **Given** a new order is created, **Then** a `NEW_ORDER` In-App
   `Notification` appears in `NotificationCenter.tsx` with a browser sound.
4. **Given** admin changes order status, **Then** an `ORDER_STATUS`
   Notification is created for the customer.
5. **Given** admin adds a product with variants, **Then** each variant is stored
   as independent `VariantOption` rows with their own `stock` values.
6. **Given** Dashboard Settings, **When** admin updates credentials,
   **Then** `PATCH /api/auth/admin` updates phone/password and re-issues JWT.
   **When** admin updates store settings (store name, logo, WhatsApp number,
   social media links, return policy), **Then** `PATCH /api/settings` persists
   the changes. The storefront reads all settings via `GET /api/settings` —
   social links render conditionally in the footer, return policy page at
   `/policies/returns` shows the policy text, and the "أرسل عبر واتساب"
   button is hidden if `whatsappNumber` is `null`.

---

### User Story 3 — Loyalty Loop: Earn & Redeem Points (Priority: P3)

A returning customer earns points on every delivered order, sees their balance
in the notifications/order confirmation, and can redeem points as a discount
on the next checkout.

**Why this priority**: Drives repeat purchase. Builds on US1 data (orders +
customers). Can be added without breaking the existing checkout flow.

**Independent Test**: Place two orders, verify `LoyaltyTransaction` records
exist with correct amounts, verify balance shown matches DB, apply points
discount on order 3.

**Acceptance Scenarios**:

1. **Given** an order reaches `DELIVERED` status, **Then** a `LoyaltyTransaction`
   of `+Math.floor(total / 10)` is created and `LoyaltyAccount.points` updated.
2. **Given** a verified customer submits a first review for a product,
   **Then** a `LoyaltyTransaction` of `+20` is created with reason
   "مراجعة منتج".
3. **Given** a customer has ≥ 100 points at Checkout Step 2,
   **Then** a "استخدم X نقطة → خصم Y جنيه" option is visible and selectable.
4. **Given** points are redeemed, **Then** a negative `LoyaltyTransaction`
   is recorded and the Order `discount` field reflects the deduction.

---

### User Story 4 — In-App Notification Bell & Center (Priority: P4)

Both the storefront and admin dashboard have a notification bell that shows
unread count and a recent-notifications dropdown.

**Why this priority**: Thin UI layer on top of the `Notification` DB model.
Enables all other stories to surface events. Builds last (or in parallel
with US2) once the model exists.

**Independent Test**: Trigger an `ORDER_CONFIRMED` event, open the
`NotificationBell`, verify the unread badge appears, click bell to see
the notification, verify badge clears after `PATCH /api/notifications/read`.

**Acceptance Scenarios**:

1. **Given** a customer has unread notifications, **Then** `NotificationBell.tsx`
   renders a numeric badge with the unread count.
2. **Given** the bell is clicked, **Then** a dropdown lists the last 10
   notifications (title + relative time + `isRead` styling).
3. **Given** notifications are opened, **Then** `PATCH /api/notifications/read`
   marks them read and the badge disappears.
4. **Given** the admin dashboard, **Then** `NotificationCenter.tsx` mirrors
   this behaviour for admin-targeted notifications.

### Edge Cases

- Checkout submitted with an out-of-stock variant → `POST /api/orders` returns 409;
  UI shows error without losing form state.
- Expired or invalid coupon applied at checkout → 422 with `{ "error": "<message>" }`;
  subtotal unchanged.
- `deliveryZoneId` inactive or not found → `POST /api/orders/preview` returns 404;
  Step 2 cannot render.
- Customer opens checkout with an empty cart → redirect to `/products`.
- Customer tries to redeem more points than their balance → API returns 422.
- Order cancelled → earned points from that order are reversed via a negative
  `LoyaltyTransaction`.
- Cron runs while an `AbandonedCart` has `reminded = true` → record is skipped;
  no duplicate notification.
- Admin hits `/dashboard/*` with an expired JWT → `middleware.ts` redirects
  to `/login` (no infinite loop because `/login` is not protected).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST serve product listings filterable by category, price
  range, and variant value via `GET /api/products`.
- **FR-002**: System MUST display average star rating and total buyer count on
  every product card and detail page using `lucide-react` star icons.
- **FR-003**: System MUST render "باقي X قطع بس!" in `--danger` when
  `VariantOption.stock < 5` (or `Product.stock < 5` if no variants).
- **FR-004**: Cart state MUST persist in `localStorage` across browser sessions
  via `lib/cart.ts` (Zustand `persist` middleware).
- **FR-005**: Coupon field MUST be hidden behind a collapsible text link;
  MUST NOT be visible by default.
- **FR-006**: Checkout MUST contain exactly 2 steps. A third step or mandatory
  OTP verification is a blocking constitution violation.
- **FR-007**: `POST /api/customers` MUST upsert Customer by phone and eagerly
  create `LoyaltyAccount` if absent, returning `{ pointsToEarn, currentPoints }`.
- **FR-008**: `POST /api/orders/preview` MUST validate `deliveryZoneId`
  server-side and return `{ subtotal, deliveryFee, total, pointsToEarn, currentPoints }`.
- **FR-009**: Step 2 of Checkout MUST display "أتمم طلبك واكسب X نقطة! 🏆"
  using `pointsToEarn` from FR-008 response (never client-calculated).
- **FR-010**: `POST /api/cart/abandon` MUST upsert `AbandonedCart` by phone
  (`phone` column is `@unique`).
- **FR-011**: Vercel Cron (`0 * * * *`) MUST trigger
  `GET /api/cron/abandoned-cart` (authenticated via `CRON_SECRET` header)
  which creates `ABANDONED_CART` Notifications for carts older than 1 hour
  with `reminded = false`.
- **FR-012**: All `(dashboard)/` routes MUST be protected by `middleware.ts`
  using `jose jwtVerify`. Unauthenticated requests MUST redirect to `/login`.
- **FR-013**: First admin login MUST bootstrap an `Admin` DB record from
  `ADMIN_PHONE` + `ADMIN_PASSWORD` env vars if no record exists.
- **FR-014**: Every order status change MUST synchronously create an
  `ORDER_STATUS` In-App Notification for the customer.
- **FR-015**: System MUST create a `LoyaltyTransaction` of
  `+Math.floor(total / 10)` when an order reaches `DELIVERED` status.
- **FR-016**: System MUST create a `LoyaltyTransaction` of `+20` when a
  customer submits a review, only if: (a) they purchased the product, and (b)
  they have not previously reviewed that product.
- **FR-017**: `Notification` model MUST support both `customerId` and
  `adminId` targets; at least one MUST be non-null per row.
- **FR-018**: `GET /api/notifications` MUST return the last 20 notifications
  for the authenticated principal.
- **FR-019**: All source files MUST use `.tsx` (components) or `.ts` (logic).
  No `.jsx` or `.js` files are permitted anywhere in the project.
- **FR-020**: All dependency versions in `package.json` MUST be pinned to
  exact values. No `"latest"` or semver range specifiers.

### Key Entities

- **Product**: Catalogue item — images, category, price, stock, variants,
  reviews, average rating.
- **VariantOption**: Individual size/color entry with its own `stock`;
  replaces comma-separated strings.
- **Customer**: Identified by unique phone; has addresses, orders,
  `LoyaltyAccount`, and notifications.
- **LoyaltyAccount**: One per Customer; holds cumulative `points` balance.
- **LoyaltyTransaction**: Immutable ledger entry — `+earn` or `-redeem`.
- **Order**: Links Customer + Address + DeliveryZone + optional Coupon;
  `source` is `OrderSource` enum.
- **AbandonedCart**: Phone-keyed (`@unique`) snapshot of cart items;
  `reminded` flag prevents duplicate cron notifications.
- **Notification**: Polymorphic (customer OR admin); typed by
  `NotificationType` enum (8 values); `isRead` flag.
- **Admin**: Single store owner record; bootstrapped from env vars;
  credentials updatable via `PATCH /api/auth/admin`; store settings
  (logo, socials, WhatsApp, return policy) via `PATCH /api/settings`.
- **DeliveryZone**: Named zone with flat `deliveryFee`; drives server-side
  fee calculation in `POST /api/orders/preview`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor MUST be able to complete a full purchase
  (browse → cart → checkout → confirmation) in under 3 minutes on a mobile
  browser.
- **SC-002**: Cart state MUST survive a browser close and reopen
  (`localStorage` persistence verified by re-opening the tab).
- **SC-003**: Step 2 of Checkout MUST always display the server-calculated
  `deliveryFee` and `pointsToEarn` — zero tolerance for client-side
  calculation of those values.
- **SC-004**: Admin MUST NOT be able to access any `/dashboard/*` route
  without a valid JWT cookie — middleware blocks 100% of unauthenticated
  requests.
- **SC-005**: A new order MUST trigger an `ORDER_CONFIRMED` In-App
  Notification within the same HTTP request/response cycle (synchronous;
  no background queue).
- **SC-006**: Vercel Cron MUST process unreminded abandoned carts within
  1 hour ± 5 minutes of cart abandonment.
- **SC-007**: `prisma migrate deploy` MUST run cleanly on a fresh
  PostgreSQL/Supabase instance with zero manual SQL.

## Assumptions

- Target users are Egyptian consumers on mobile (RTL Arabic interface,
  Cairo Google Font).
- A single Supabase project provides both `DATABASE_URL` (pooled) and
  `DIRECT_URL` (direct connection for `prisma migrate`).
- Cloudinary is pre-configured with an upload preset; no server-side
  upload signing is required for the Demo.
- Payment is a UI stub for the Demo — payment method selector exists but
  actual gateway calls (Paymob) are mocked until post-Demo.
- A single Admin user per store instance; multi-admin is out of scope.
- WhatsApp notifications are out of scope for the Demo; `lib/notifications.ts`
  is architected to add the WhatsApp channel later without schema changes.
- `next: "16.2.0"` is forced by executive decision; the team accepts
  any breaking changes that result from upgrading past Next.js 14.x.
- `lucide-react` is the sole icon/rating library; `react-stars` is banned
  (React 18 incompatible).
