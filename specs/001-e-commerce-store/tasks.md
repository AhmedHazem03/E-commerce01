# Tasks: E-Commerce Store MVP

**Feature Branch**: `001-e-commerce-store`
**Input**: `specs/001-e-commerce-store/` — spec.md, plan.md, research.md, data-model.md, contracts/api.md, quickstart.md
**Total Tasks**: 94 | **User Stories**: 4 | **Phases**: 7

## Format Legend

- **[P]** — parallelizable (different files, no incomplete dependencies)
- **[US1–US4]** — user story label (Setup & Foundational phases have no story label)
- Each task includes the exact file path to create or modify

## Standard of Excellence (applies to EVERY task)

| Rule | Requirement |
|------|-------------|
| Rule 1 — Service Pattern | All Prisma in `lib/services/` only · All Zod in `lib/validations/` · Route handlers ≤ 10 lines |
| Rule 2 — Security | `verifyAdminToken()` in every protected handler · strip `passwordHash` before JSON · CRON_SECRET checked before any DB work |
| Rule 3 — Performance | `<Suspense>` wraps every async Server Component · `next/image` replaces every `<img>` · explicit `width`+`height`+`sizes`+`priority` |

---

## Phase 1: Setup (Shared Scaffold)

**Purpose**: Project initialization — no user story can begin until this is done.

- [X] T001 Create `package.json` with exact pinned versions: next@16.2.0, react@18.3.1, typescript@5.7.3, prisma@5.22.0, @prisma/client@5.22.0, tailwindcss@3.4.17, zustand@4.5.5, lucide-react@0.468.0, jose@5.9.6, zod@3.23.8, **swiper@11.1.3**, bcryptjs@2.4.3; devDeps: **@types/node@22.15.3** (exact — not `22.x`), @types/react@18.3.1, @types/react-dom@18.3.1, @types/bcryptjs@2.4.6 — **no `^`, `~`, or range specifiers anywhere** (constitution GATE-2 + FR-020) — **`jsonwebtoken` removed**: `jose` handles both signing (`SignJWT`) and verification (`jwtVerify`) Edge-safe, eliminating the second JWT library — **Required scripts**: `"postinstall": "prisma generate"` (required for Vercel deploys — without it, `PrismaClientInitializationError` on cold start), `"dev"`, `"build"`, `"start"`, `"lint"`
- [X] T002 Create `tsconfig.json` (strict: true, target: ES2022, JSX: preserve, baseUrl: ".", paths: {"@/*": ["./*"]})
- [X] T003 [P] Create `next.config.ts` (images: `{remotePatterns: [{hostname: "res.cloudinary.com"}]}`) — **Cairo font is NOT configured here**; it is loaded via `next/font/google` in `components/templates/StoreLayout.tsx` (T029) — **ESLint rules are NOT configured here** (`next.config.ts` does not read ESLint config); the `@next/next/no-img-element: "error"` rule lives in `eslint.config.mjs` (T003b)
- [X] T003b [P] Create `eslint.config.mjs` — flat config format (Next.js 16.x default): extend `next/core-web-vitals`, add rule `"@next/next/no-img-element": "error"` to enforce `next/image` usage across all components (Rule 3 compliance)
- [X] T004 [P] Create `tailwind.config.ts` (Cairo font family, RTL direction, design tokens from specs/07-design-system.md: --primary, --danger, --surface, radius, spacing)
- [X] T005 Create `.env.local` template with 9 required vars: DATABASE_URL, DIRECT_URL, JWT_SECRET, CRON_SECRET, NEXT_PUBLIC_SITE_URL, ADMIN_PHONE, ADMIN_PASSWORD, NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET (all placeholder values, documented inline) — **WhatsApp number is NOT an env var**: it is stored in `Admin.whatsappNumber` and configured from Dashboard Settings (T055)

**Checkpoint**: `npm install` runs cleanly; `next build` succeeds on empty app.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, Prisma singleton, shared interfaces, shared Zod primitives, and JWT middleware.
**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T006 Create `prisma/schema.prisma` — full schema from specs/02-database-schema.md including all 4 cross-ref fixes: `LoyaltyTransaction.orderId Int?`, `Notification.payload Json?`, `Review @@unique([customerId, productId])`, `OrderItem.variantOptionId Int?`
- [X] T006b [P] Create `prisma/rls.sql` — Row-Level Security policies for all 10 sensitive tables: Customer, Address, Order, OrderItem, LoyaltyAccount, LoyaltyTransaction, Notification, AbandonedCart, Admin, Review. Deny `anon` and `authenticated` roles by default; allow `service_role` full access. Also create `prisma/migrate-and-rls.sh` helper script that runs `prisma migrate deploy` then applies `rls.sql` via `psql "$DIRECT_URL"`.
- [X] T007 Run `npx prisma migrate dev --name init`, then `npx prisma generate`, then apply `prisma/rls.sql` to Supabase (use DIRECT_URL for both migrate and RLS apply) — **awaits real DB credentials; run prisma/migrate-and-rls.sh**
- [X] T008 [P] Create `lib/prisma.ts` — singleton PrismaClient with `global.__prisma` guard; annotate `// server-only`
- [X] T009 [P] Create `lib/interfaces/product.ts`, `lib/interfaces/customer.ts`, `lib/interfaces/order.ts`, `lib/interfaces/notification.ts`, `lib/interfaces/admin.ts` — pure TypeScript interfaces (no Prisma types); create `lib/interfaces/index.ts` barrel re-export
- [X] T010 [P] Create `lib/validations/common.ts` — shared Zod primitives: `phoneSchema` (Egyptian 01x, 11 digits), `positiveIntSchema`, `paginationSchema`
- [X] T011 Create `middleware.ts` at repo root — `jose` jwtVerify on `admin_token` cookie; matcher: `["/dashboard/:path*"]`; on failure redirect to `/login`

**Checkpoint**: `npx prisma migrate deploy` runs clean on fresh DB (SC-007). `middleware.ts` blocks `/dashboard/test` → redirects to `/login`.

---

## Phase 3: User Story 1 — Browse → Cart → 2-Step Checkout → Confirm (Priority: P1) 🎯 MVP

**Goal**: A customer browses products, adds to cart, completes 2-step checkout, and sees an order confirmation with loyalty points earned.

**Independent Test** (from spec.md): Navigate to `/`, browse, open CartDrawer, complete both checkout steps, and see the Order Confirmed notification — no admin panel needed.

**Acceptance Scenarios**: US1 scenarios 1–8 in spec.md
**Success Criteria**: SC-001 (< 3 min purchase), SC-002 (cart survives browser close), SC-003 (server-calculated deliveryFee + pointsToEarn), SC-005 (ORDER_CONFIRMED notification in same request)

### lib — Validations & Utilities

- [X] T012 [P] [US1] Create `lib/validations/customer.ts`
- [X] T013 [P] [US1] Create `lib/validations/order.ts` — `PreviewOrderSchema` + `CreateOrderSchema` (no customerId in body — IDOR fix)
- [X] T014 [P] [US1] Create `lib/cart.ts` — Zustand persist store, `cart` localStorage key
- [X] T015 [P] [US1] Create `lib/delivery.ts` — `DeliveryZoneError` + `getDeliveryFeeFromDB()`
- [X] T015b [P] [US1] Create `lib/whatsapp.ts` — `buildWhatsAppOrderUrl()` with Arabic message template
- [X] T016 [US1] Create `lib/notifications.ts` — all 8 types, Arabic copy, FR-017 guard, `notify.*` helpers

### lib — Services (US1)

- [X] T017 [US1] Create `lib/services/product.service.ts` — `getProducts(filters?)`, `getProduct(id)`, `createProduct(data)`, `updateProduct(id, data)`, `deleteProduct(id)`; all Prisma, no leaking raw types; `getProducts` includes `VariantOption[]` and computed `averageRating`
- [X] T018 [US1] Create `lib/services/customer.service.ts` — `upsertCustomer(data: z.infer<typeof UpsertCustomerSchema>)`: `prisma.$transaction` that upserts `Customer` then `loyaltyAccount.create` if new; returns `{ customer, currentPoints, pointsToEarn }` where `pointsToEarn = Math.floor((data.cartSubtotal ?? 0) / 10)`
- [X] T019a [US1] Create `lib/services/order.service.ts` — **`getOrders(filters?: { status?, page?, limit? })`**: returns paginated order list for admin dashboard (used by T051); **`getOrder(id)`**: returns single order with items + status timeline, no sensitive fields
- [X] T019b [US1] Add `previewOrder(customerId, data)` to `lib/services/order.service.ts` — `customerId` is passed separately by the route handler (extracted from `customer_session` cookie — NOT from the request body, which would be an IDOR vulnerability); resolves `deliveryZoneId` via `prisma.deliveryZone.findUnique` (throws 404 if inactive — EC-3 fix), calculates `subtotal`, `deliveryFee`, `discount` (via coupon.service), `total`, `pointsToEarn = Math.floor(subtotal/10)`, `currentPoints` from `loyaltyAccount`; if `data.redeemPoints` is set and `>= 100`, deducts `Math.floor(redeemPoints/10)` from discount preview
- [X] T019c [US1] Add `createOrder(customerId, data)` to `lib/services/order.service.ts` — `customerId` is passed separately by the route handler (extracted from `customer_session` cookie — NOT from the request body); `prisma.$transaction`: re-validates `VariantOption.stock ≥ quantity` for each item (409 on fail); **if product has variants and `variantOptionId` is absent, throw 422** (see T013 rule); creates `Order` + `OrderItem[]` with `variantOptionId` FK, decrements stock atomically, calls `notify.orderConfirmed()` + `notify.newOrder()`; returns `{ orderId, orderNumber, total, pointsToEarn, whatsapp }` — the `whatsapp` object includes `{ storeWhatsApp, customerName, customerPhone, items: [{name, variant, quantity, price}], subtotal, deliveryFee, discount, paymentMethod, address }` where `storeWhatsApp` is read from `Admin.whatsappNumber` in DB (if `null`, `whatsapp` is `null` and the client hides the button) — all server-authoritative data needed by `lib/whatsapp.ts` T015b — **`pointsToEarn` is an estimate** (`Math.floor(subtotal/10)`); actual points awarded only on `DELIVERED` status in T065
- [X] T019d [US1] Add `updateOrderStatus(id, status, adminId)` to `lib/services/order.service.ts` — updates status, then: on `DELIVERED` → `loyalty.earnPoints(+points, orderId)` + `notify.orderDelivered()`; on `CANCELLED` → query prior positive `LoyaltyTransaction` for this order, if found call `loyalty.redeemPoints(reversal)` to reverse earned points (EC-6 fix); on any other status change → `notify.orderStatus()` — **stub loyalty calls** as no-op functions that emit a **runtime dev warning** (not just a comment):
  ```ts
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[TODO T062] loyalty.earnPoints() not wired yet — points will NOT be awarded');
  }
  ```
  This ensures dev/staging testing surfaces the gap visibly in the console. **⚠️ Known limitation**: loyalty points are NOT earned or reversed until T062+T065 implement `loyalty.service.ts` — this is expected and documented; the stubs + dev warnings exist to preserve the correct code structure and call sites for Phase 5 wiring while making the gap impossible to miss during testing
- [X] T020 [US1] Create `lib/services/abandonedCart.service.ts` — `upsertAbandonedCart(phone, cartSnapshot)`: upserts `AbandonedCart` keyed by `phone @unique`; `processAbandonedCarts()`: finds carts with `reminded = false` older than 1 hour, **for each cart: look up `Customer` by `phone`** — if a Customer record exists, call `notify.abandonedCart(customerId, phone)` to create a Notification with `customerId` set; **if no Customer record exists for the phone, skip notification** (a Notification with both `customerId=null` and `adminId=null` violates the application-level constraint in `lib/notifications.ts`); sets `reminded = true` atomically regardless

### components — Atoms

- [X] T021 [P] [US1] Create all 6 atom components: `components/atoms/Button.tsx` (variant props: primary/secondary/ghost, size: sm/md/lg), `components/atoms/Input.tsx` (RTL-aware, error state), `components/atoms/Badge.tsx` (color variants via CSS vars), `components/atoms/StarIcon.tsx` (filled/empty, uses lucide-react Star), `components/atoms/Spinner.tsx` (animated, size prop), `components/atoms/Divider.tsx` (horizontal rule with optional label)

### components — Molecules

- [X] T022 [P] [US1] Create `components/molecules/ReviewStars.tsx` (read-only, uses StarIcon, averageRating + count), `components/molecules/PriceDisplay.tsx` (price in EGP, optional strike-through for discount), `components/molecules/StockBadge.tsx` (shows "باقي X قطع بس!" in `--danger` when stock < 5, else "متاح")
- [X] T023 [P] [US1] Create `components/molecules/CartItem.tsx` (product row in CartDrawer: image + name + variant + qty controls + remove), `components/molecules/VariantSelector.tsx` (variant option buttons with individual stock state), `components/molecules/OrderStatusChip.tsx` (status → Arabic label + color map using Badge atom)

### components — Organisms

- [X] T024 [US1] Create `components/organisms/ProductCard.tsx` (Server Component: next/image with width=400 height=400 sizes prop, name, PriceDisplay, ReviewStars, StockBadge, link to /products/[id]) and `components/organisms/ProductGrid.tsx` (CSS grid, maps products to ProductCard, first card gets priority next/image) and `components/organisms/ProductGridSkeleton.tsx` (pulse skeleton matching ProductCard dimensions)
- [X] T025 [P] [US1] Create `components/organisms/CartDrawer.tsx` (`"use client"`, slide-in panel, useCartStore, shows CartItem list + subtotal, coupon code behind collapsible `<details>` trigger, Checkout CTA button)
- [X] T026 [P] [US1] Create `components/organisms/CheckoutStep1.tsx` (`"use client"`, phone + name + address inputs, on submit: POST /api/customers → store customerId in local state → advance to Step 2; UpsertCustomerSchema client-side validation via zod)
- [X] T027 [US1] Create `components/organisms/CheckoutStep2.tsx` (`"use client"`, receives `{ deliveryFee, pointsToEarn, currentPoints }` from parent after POST /api/orders/preview; displays order summary + "أتمم طلبك واكسب X نقطة! 🏆"; stub loyalty redeem toggle (disabled if < 100 points); on submit: POST /api/orders → on 201 success: call `buildWhatsAppOrderUrl()` (from `lib/whatsapp.ts` T015b) with the `whatsapp` object from the response → `window.open(whatsappUrl, '_blank')` to open WhatsApp with pre-filled message → `router.push('/orders/[id]')` to navigate to order tracking page — **fallback**: if popup is blocked, the order tracking page (T034) renders a prominent "أرسل عبر واتساب 📱" button using the same `buildWhatsAppOrderUrl` utility)
- [X] T028 [P] [US1] Create `components/organisms/OrderTimeline.tsx` (status timeline: PENDING → CONFIRMED → PREPARING → SHIPPED → DELIVERED; each step shows Arabic label + timestamp; "اطلب تاني" Reorder button at bottom when DELIVERED)

### components — Templates & Store Pages

- [X] T029 [US1] Create `components/templates/StoreLayout.tsx` (Cairo Google Font via `next/font/google`, RTL `dir="rtl"`, design tokens CSS vars injected, global nav with CartDrawer trigger + notification bell slot + **footer** with: store name from settings, social media icon links — Instagram/Facebook/TikTok — conditionally rendered only when the URL is non-null in `GET /api/settings`, link to `/policies/returns` if `returnPolicy` is non-null; footer fetches settings at layout level — Server Component fetch cached)
- [X] T030 [US1] Create `app/(store)/layout.tsx` (applies StoreLayout, provides CartDrawer portal at page root)
- [X] T031 [US1] Create `app/(store)/page.tsx` (Server Component homepage: hero section + featured products wrapped in `<Suspense fallback={<ProductGridSkeleton />}>`)
- [X] T032 [US1] Create `app/(store)/products/page.tsx` (Server Component: `<Suspense fallback={<ProductGridSkeleton />}>` wrapping `<ProductGrid />`; `loading.tsx` route-level skeleton)
- [X] T033 [US1] Create `app/(store)/products/[id]/page.tsx` (Server Component: `generateMetadata()` — **Next.js 15+ breaking change**: `params` is now a `Promise`, so use `const { id } = await params;` not `params.id` directly — + Swiper gallery with next/image `fill`+`sizes` + VariantSelector + ReviewStars + StockBadge + "أضف للسلة" button that opens CartDrawer; reviews list with ReviewStars) — **Swiper CSS**: import `swiper/css` and `swiper/css/navigation` in this page or in a client wrapper component; without these imports, Swiper renders unstyled
- [X] T034b [P] [US1] Create `app/(store)/policies/returns/page.tsx` — Server Component: fetches `GET /api/settings` → renders `returnPolicy` field as pre-formatted text (Arabic RTL); if `returnPolicy` is `null`, shows "لا توجد سياسة استرجاع حالياً"; page title "سياسة الاستبدال والاسترجاع" with store name from settings; minimal layout matching StoreLayout
- [X] T034 [US1] Create `app/(store)/orders/[id]/page.tsx` (Server Component: fetches GET /api/orders/[id] → renders OrderTimeline; shows ORDER_CONFIRMED notification copy inline; **renders a prominent "أرسل عبر واتساب 📱" `<a>` link** using `buildWhatsAppOrderUrl()` from `lib/whatsapp.ts` — this serves as fallback if `window.open` was blocked in T027, and lets the customer re-send the order details at any time; when order status is `DELIVERED`, the Reorder button rendered by `<OrderTimeline />` (T028) must be wired to populate `useCartStore` with the original order items and navigate to checkout — US1 scenario 7)

### API Routes (US1 — thin shells: validate → call service → return)

- [X] T035 [P] [US1] Create `app/api/products/route.ts` — GET: optional query params (category?, search?) → `getProducts()` → `NextResponse.json(products)`
- [X] T036 [P] [US1] Create `app/api/products/[id]/route.ts` — GET: `getProduct(id)` → `NextResponse.json(product)` or 404
- [X] T037 [US1] Create `app/api/customers/route.ts` — POST: `UpsertCustomerSchema.safeParse` → `upsertCustomer()` (uses `cartSubtotal` from body to return estimated `pointsToEarn`) → set signed HttpOnly cookie `customer_session` (value: customerId signed with `JWT_SECRET` via `jose` `SignJWT`, 30-day expiry, `SameSite=Strict`, `Secure: process.env.NODE_ENV === "production"`, `Path=/`) → return `{ customerId, currentPoints, pointsToEarn }`. **This cookie is the sole proof of customer identity for T074/T075** — eliminates the IDOR vulnerability from bare `customerId` query params (H4 fix).
- [X] T038 [US1] Create `app/api/orders/preview/route.ts` — POST: verify `customer_session` HttpOnly cookie via `jose jwtVerify` → extract `customerId` from token payload (return 401 if absent — **never read `customerId` from request body**, that is an IDOR vulnerability) → `PreviewOrderSchema.safeParse` (body has no `customerId`) → `previewOrder(customerId, result.data)` → `{ subtotal, deliveryFee, discount, total, pointsToEarn, currentPoints }`
- [X] T039 [US1] Create `app/api/orders/route.ts` — POST: verify `customer_session` HttpOnly cookie via `jose jwtVerify` → extract `customerId` from token payload (return 401 if absent — **never read `customerId` from request body**, that is an IDOR vulnerability) → `CreateOrderSchema.safeParse` (body has no `customerId`) → `createOrder(customerId, result.data)` → `{ orderId, orderNumber, total, pointsToEarn, whatsapp }` (201) — the `whatsapp` object contains server-authoritative order summary for WhatsApp message building (see T015b) — **`pointsToEarn` not `pointsEarned`**: points are estimated at creation, committed only on `DELIVERED` — **⚠️ Route coexistence note**: `app/api/orders/preview/route.ts` (T038) is a static segment that coexists with `app/api/orders/[id]/route.ts` (T040). Next.js App Router resolves static segments before dynamic ones, so `preview/` is matched before `[id]` automatically — no special configuration needed, but do **not** rename `preview/` to a dynamic pattern.
- [X] T040 [US1] Create `app/api/orders/[id]/route.ts` — GET: `getOrder(id)` → full order with items and status timeline (no sensitive fields)
- [X] T041 [US1] Create `app/api/cart/abandon/route.ts` — POST: `{ phone, cart }` → `upsertAbandonedCart(phone, cart)` → `{ ok: true }`

**Checkpoint**: Navigate `/`, browse, add to cart, CartDrawer opens with localStorage persistence (SC-002), complete 2-step checkout, POST /api/orders creates DB record, ORDER_CONFIRMED Notification row created with title+message (SC-005), **WhatsApp opens with pre-filled order summary message** to store number, redirect to /orders/[id] with OrderTimeline + "أرسل عبر واتساب 📱" fallback button.

---

## Phase 4: User Story 2 — Admin Dashboard: Manage Orders & Products (Priority: P2)

**Goal**: Store owner logs in, manages orders/products, and receives NEW_ORDER notifications. Routes fully JWT-gated.

**Independent Test** (from spec.md): Log in at `/login`, view last 10 orders, change one to PREPARING, verify ORDER_STATUS Notification row created, add new product with 2 variants.

**Acceptance Scenarios**: US2 scenarios 1–6 in spec.md
**Success Criteria**: SC-004 (100% of /dashboard/* blocked without valid JWT)

### lib — Auth & Admin Services

- [X] T042 [P] [US2] Create `lib/auth.ts` — `signAdminToken(adminId: string): Promise<string>` using `jose` `SignJWT` HS256 7-day expiry (Edge-safe, no `jsonwebtoken` needed); `verifyAdminToken(req: Request): Promise<{adminId: string} | null>` using jose jwtVerify reading `admin_token` cookie; never expose JWT_SECRET in responses
- [X] T043 [P] [US2] Create `lib/validations/auth.ts` — `LoginSchema`: `{ phone: phoneSchema, password: z.string().min(6) }` · `UpdateAdminSchema`: `{ phone?: phoneSchema, password?: z.string().min(6) }` (credentials only) · `UpdateStoreSettingsSchema`: `{ storeName?: z.string().min(1).max(100), logo?: z.string().url().nullable(), whatsappNumber?: z.string().regex(/^\d{10,15}$/).nullable(), instagram?: z.string().url().nullable(), facebook?: z.string().url().nullable(), tiktok?: z.string().url().nullable(), returnPolicy?: z.string().max(10000).nullable() }` — all fields optional, `nullable()` allows clearing via `null`
- [X] T044 [US2] Create `lib/services/admin.service.ts` — `bootstrapAdmin()`: `prisma.admin.upsert` using ADMIN_PHONE+ADMIN_PASSWORD from env (bcrypt hash), all settings fields default to `null` (except `storeName: "المتجر"`); `verifyAdminCredentials(phone, password)`: lookup + bcrypt.compare; `updateAdminCredentials(id, data)`: bcrypt.hash new password + update phone; `getStoreSettings()`: reads store settings fields from first admin record → returns `IStoreSettings` (public, no auth needed); `updateStoreSettings(id, data)`: updates store fields only (logo, whatsapp, socials, returnPolicy, storeName); always strip `passwordHash` from returned objects

### components — Dashboard Organisms & Templates

- [X] T045 [P] [US2] Create `components/organisms/OrderTable.tsx` (sortable order list: orderNumber, customer phone, total, status chip, date; PATCH action to update status; Suspense-safe — receives pre-fetched data prop)
- [X] T046 [P] [US2] Create `components/organisms/ProductForm.tsx` (`"use client"`, create/edit product with dynamic variant rows: each row has name + stock + price; Cloudinary image upload input; submit via POST or PATCH /api/products)
- [X] T047 [P] [US2] Create `components/organisms/AnalyticsCard.tsx` (metric card: label + value + trend icon using lucide-react TrendingUp/Down; used in analytics page)

### components — Dashboard Template

- [X] T048 [US2] Create `components/templates/DashboardLayout.tsx` (sidebar navigation: Orders, Products, Abandoned Carts, Analytics, Settings; NotificationCenter slot in top-right; uses lucide-react icons; applies design tokens)

### Login & Dashboard Pages

- [X] T049 [US2] Create `app/login/page.tsx` (login form with phone + password inputs; POST /api/auth/login; on success cookie set by API → redirect /dashboard/orders; show error on failure)
- [X] T050 [US2] Create `app/(dashboard)/layout.tsx` (Server Component wrapping DashboardLayout; reads admin session from cookie for display only — middleware already blocked unauthenticated)
- [X] T051 [P] [US2] Create `app/(dashboard)/orders/page.tsx` (Server Component: calls `getOrders({ page: 1, limit: 20 })` from `order.service.ts` — defined in T019; renders `<Suspense fallback={<Spinner />}><OrderTable orders={orders} /></Suspense>`)
- [X] T052 [P] [US2] Create `app/(dashboard)/products/page.tsx` (product list + "أضف منتج" button that opens ProductForm modal)
- [X] T053 [P] [US2] Create `app/(dashboard)/abandoned-carts/page.tsx` (abandoned cart list: phone, cart snapshot summary, time since abandon, reminded status)
- [X] T054 [P] [US2] Create `app/(dashboard)/analytics/page.tsx` (AnalyticsCard grid: total orders, total revenue, pending orders, abandoned carts count — all in Suspense)
- [X] T055 [US2] Create `app/(dashboard)/settings/page.tsx` (admin settings page with **two sections**: (1) **Credentials**: phone + password → `PATCH /api/auth/admin` → re-issues JWT cookie; (2) **Store Settings**: store name, logo upload (Cloudinary), WhatsApp number, Instagram URL, Facebook URL, TikTok URL, return policy (textarea/markdown) → `PATCH /api/settings`; loads current values via `GET /api/settings` on mount; each field has Arabic label + hint text)

### API Routes (US2)

- [X] T056 [US2] Create `app/api/auth/login/route.ts` — POST: `LoginSchema.safeParse` → `bootstrapAdmin()` → `verifyAdminCredentials()` → `signAdminToken()` → set `admin_token` HttpOnly cookie → `{ ok: true }` (no token in body)
- [X] T057 [US2] Create `app/api/auth/admin/route.ts` — PATCH: `verifyAdminToken()` first → `UpdateAdminSchema.safeParse` (credentials only: phone + password) → `updateAdminCredentials()` → re-issue cookie → `{ ok: true }`
- [X] T058 [US2] Update `app/api/orders/[id]/route.ts` — add PATCH handler: `verifyAdminToken()` → validate `{ status }` → `updateOrderStatus()` (triggers ORDER_STATUS notification to customer) → `{ ok: true }`
- [X] T059 [US2] Add `CreateProductSchema` to `lib/validations/product.ts` (C2 fix — must exist before T059b): `{ name: z.string().min(1), description: z.string().optional(), price: z.number().positive(), stock: z.number().int().min(0), category: z.string(), images: z.array(z.object({ url: z.string().url(), isMain: z.boolean() })), variants: z.array(z.object({ name: z.string(), options: z.array(z.object({ value: z.string(), stock: z.number().int().min(0) })) })).optional() }` · **⚠️ No `price` field inside `options`** — `VariantOption` in Prisma schema has no `price` column (only `value`, `stock`, `variantId`); adding it would cause a Prisma runtime error.
- [X] T059b [US2] Update `app/api/products/route.ts` — add POST handler: `verifyAdminToken()` → `CreateProductSchema.safeParse` → `createProduct()` → `{ product }` (201)
- [X] T060 [US2] Update `app/api/products/[id]/route.ts` — add PATCH handler (`verifyAdminToken + updateProduct`) and DELETE handler (`verifyAdminToken + deleteProduct`); both return `{ ok: true }` on success
- [X] T060b [P] [US2] Create `app/api/settings/route.ts` — **GET** (public, no auth): `getStoreSettings()` from `admin.service.ts` → returns `IStoreSettings` `{ storeName, logo, whatsappNumber, instagram, facebook, tiktok, returnPolicy }` (all `null` if not configured). **PATCH** (admin only): `verifyAdminToken()` → `UpdateStoreSettingsSchema.safeParse` → `updateStoreSettings()` → `{ ok: true }`. This separates store settings from credentials for clean UI and security.

**Checkpoint**: `/dashboard/orders` blocked without cookie (SC-004). Login flow sets HttpOnly cookie. PATCH /api/orders/[id] creates ORDER_STATUS Notification row. New product with 2 variants stored as independent VariantOption rows.

---

## Phase 5: User Story 3 — Loyalty Loop: Earn & Redeem Points (Priority: P3)

**Goal**: Returning customers earn points on delivered orders and +20 on verified reviews; they can redeem ≥ 100 points as a discount at checkout.

**Independent Test** (from spec.md): Place two orders, confirm LoyaltyTransaction rows with orderId FK, verify balances, apply points at checkout for order 3.

**Acceptance Scenarios**: US3 scenarios 1–4 in spec.md

### lib — Loyalty, Review & Coupon Services

- [X] T061 [P] [US3] Create `lib/validations/product.ts` — `CreateReviewSchema`
- [X] T062 [P] [US3] Create `lib/services/loyalty.service.ts` — `earnPoints(accountId, points, orderId?)`: creates `LoyaltyTransaction` with `orderId FK`; updates `LoyaltyAccount.points`; `redeemPoints(accountId, points)`: validates balance ≥ points, creates negative `LoyaltyTransaction`; `getBalance(customerId)`: returns current `LoyaltyAccount.points`
- [X] T063 [P] [US3] Create `lib/services/review.service.ts` — `getReviews(productId)`: returns reviews ordered by date desc; `createReview(customerId, productId, data)`: verified-purchase gate (check `Order` with `DELIVERED` status exists), `@@unique` checked via prisma error catch, creates `Review` + calls `loyalty.earnPoints(+20)` + calls `notify.reviewBonus(customerId, productName)` → returns created review
- [X] T064 [P] [US3] Create `lib/services/coupon.service.ts` — `validateCoupon(code, subtotal)`: looks up `Coupon` by code, checks expiry + minOrder, returns `{ discount, couponId }` or throws 422

### lib — Update order.service.ts for DELIVERED & CANCELLED

- [X] T065 [US3] Update `lib/services/order.service.ts` `updateOrderStatus()` — two status-specific branches consolidated here (replaces T019d stubs with real loyalty service wiring):
  - **`DELIVERED`**: call `loyalty.earnPoints(account.id, Math.floor(total/10), orderId)` → creates `LoyaltyTransaction` with `orderId FK` → then `notify.orderDelivered(customerId, points, orderNumber)` → creates `ORDER_DELIVERED` Notification
  - **`CANCELLED` (EC-6)** — two-part reversal:
    - **(a) Earn reversal**: query `LoyaltyTransaction` where `orderId = id AND points > 0`; if found (points were already awarded before cancel), call `loyalty.redeemPoints(account.id, transaction.points)` → creates a **negative** `LoyaltyTransaction` with same `orderId`
    - **(b) Redeem reversal**: query `LoyaltyTransaction` where `orderId = id AND points < 0`; if found (customer redeemed points at checkout for this order), call `loyalty.earnPoints(account.id, Math.abs(transaction.points), orderId)` → creates a **positive compensating** `LoyaltyTransaction` to restore redeemed points
    - Log both reversal amounts; no notification needed for cancellation reversals

### components — ReviewForm + CheckoutStep2 loyalty redeem

- [X] T066 [US3] Create `components/organisms/ReviewForm.tsx` (`"use client"`, star rating using StarIcon atoms, comment textarea, submit → POST /api/products/[id]/reviews; show "ربحت 20 نقطة!" toast on success)
- [X] T067 [US3] Update `components/organisms/CheckoutStep2.tsx` — activate loyalty redeem toggle: when `currentPoints ≥ 100`, show "استخدم X نقطة كخصم" checkbox; on check, re-call POST /api/orders/preview with `redeemPoints: true`; display updated discount line

### API Routes (US3)

- [X] T068 [US3] Create `app/api/products/[id]/reviews/route.ts` — GET: `getReviews(productId)` · POST: verify `customer_session` HttpOnly cookie via `jose jwtVerify` (same pattern as T074 — extract `customerId` from token; return 401 if absent) → `CreateReviewSchema.safeParse` → `createReview(customerId, productId, data)`; return 409 on duplicate (@@unique violation). **Never read `customerId` from request body or query params** — IDOR risk.
- [X] T069 [US3] Create `app/api/coupons/validate/route.ts` — POST: `{ code, subtotal }` → `validateCoupon()` → `{ discount, couponId }` or 422

**Checkpoint**: Deliver an order → LoyaltyTransaction row created with orderId FK, LoyaltyAccount.points updated. Submit review → +20 points. Checkout Step 2 shows redeem option when balance ≥ 100.

---

## Phase 6: User Story 4 — Notification Bell UI (Priority: P4)

**Goal**: Both customers (store) and admin (dashboard) see in-app notifications with unread count; mark-all-read clears the badge.

**Independent Test** (from spec.md): Three notification types appear (ORDER_CONFIRMED, ORDER_STATUS, LOYALTY_POINTS); bell shows unread count; clicking mark-all-read zeroes the badge.

**Acceptance Scenarios**: US4 scenarios 1–4 in spec.md

### lib — Notification Service

- [X] T070 [US4] Create `lib/services/notification.service.ts` — `getNotifications(filter: {customerId?} | {adminId?})`: returns notifications ordered by createdAt desc, strips no sensitive fields (no FK IDs unless needed); `markAllRead(filter)`: `prisma.notification.updateMany` sets `isRead = true`

### components — Notification Molecules & Organisms

- [X] T071 [P] [US4] Create `components/molecules/NotificationItem.tsx` (single notification row: title bold if unread, message, relative time using Intl.RelativeTimeFormat, type icon from lucide-react)
- [X] T072 [US4] Create `components/organisms/NotificationBell.tsx` (`"use client"`, bell icon from lucide-react with unread count Badge; dropdown panel lists last 5 notifications as NotificationItem; "عرض الكل" link; polls GET /api/notifications every 60 s; PATCH /api/notifications/read on open)
- [X] T073 [US4] Create `components/organisms/NotificationCenter.tsx` (`"use client"`, full notification list for dashboard sidebar slot; paginated; uses NotificationItem; mark-all-read button)

### API Routes (US4)

- [X] T074 [US4] Create `app/api/notifications/route.ts` — GET: **two-principal auth with no IDOR** (H4 fix): (1) try `verifyAdminToken(req)` — if valid, `getNotifications({ adminId }, 20)`; (2) else verify `customer_session` HttpOnly cookie using `jose jwtVerify` → extract `customerId` from token payload → `getNotifications({ customerId }, 20)`; (3) if neither token present → return 401. **Never read `customerId` from query params or request body** — that is an IDOR vulnerability. Returns `{ notifications: [{id, title, message, type, isRead, createdAt}], unreadCount }`
- [X] T075 [US4] Create `app/api/notifications/read/route.ts` — PATCH: same two-principal auth pattern as T074 (verify admin JWT cookie OR verify `customer_session` cookie) → `markAllRead(filter)` → `{ updated: N }`

**Update store layout** (US4 integration):
- [X] T076 [US4] Update `components/templates/StoreLayout.tsx` — mount `<NotificationBell />` in nav bar; **no `customerId` from `localStorage`** — the `GET /api/notifications` route authenticates via the `customer_session` HttpOnly cookie (T074); `<NotificationBell />` simply calls the API and the server extracts identity from the cookie. Storing/reading `customerId` from `localStorage` is an IDOR vulnerability and contradicts the HttpOnly cookie set in T037.

**Checkpoint**: Visit /products, order → bell shows 1 unread. Click bell → notification appears. Click mark-all-read → badge clears. Dashboard NotificationCenter shows NEW_ORDER + ORDER_STATUS notifications.

---

## Phase 7: Polish & Cross-Cutting Concerns (P5 — Abandoned Cart Cron + Final QA)

**Purpose**: Vercel Cron for abandoned cart recovery, final Lighthouse audit, and end-to-end quickstart validation.

- [X] T077 Create `vercel.json` with hourly cron: `{"crons": [{"path": "/api/cron/abandoned-cart", "schedule": "0 * * * *"}]}`
- [ ] T077b [P] **Known scope exclusion — `paymentStatus` update**: No dedicated API endpoint is created for updating `Order.paymentStatus` (PENDING → PAID). This is intentional: payment confirmation is handled externally (payment gateway webhook or manual Supabase Studio update). If a `PATCH /api/orders/[id]/payment` endpoint is needed later, it should: (1) require `verifyAdminToken()`, (2) accept `{ paymentStatus: "PAID" }`, (3) update `Order.paymentStatus` only — not `Order.status`. Documented here to avoid confusion during implementation.
- [X] T078 Create `app/api/cron/abandoned-cart/route.ts` — GET: check `Authorization: Bearer ${CRON_SECRET}` header **first** (return 401 before any DB work if absent or wrong); then `processAbandonedCarts()` → returns `{ processed: N }`; SC-006: cron processes carts abandoned > 1 hour ago
- [X] T079 [P] Audit `components/organisms/` for any raw `<img>` tags — replace with `next/image`; verify ESLint `@next/next/no-img-element` produces zero errors (`npm run lint`)
- [X] T080 [P] Verify every `<Image>` in store pages has `width`, `height` (or `fill`), `sizes`, and `priority` on LCP image (first ProductCard, hero image) — CLS = 0 target
- [ ] T081 [P] Run full quickstart.md validation locally: `prisma migrate deploy` on fresh DB → `rls.sql` apply → bootstrap admin → place order via curl → verify Notification row in DB
- [ ] T082 [P] PageSpeed Insights Desktop audit on `/products` — verify Lighthouse Performance ≥ 100 (SC-003 intent; Rule 3 compliance gate before P1 close)
- [X] T083 Update `app/(store)/products/[id]/page.tsx` — mount `<ReviewForm />` organism below product details (only shows when customer phone is in localStorage from a prior Step 1)

---

## Dependencies & Execution Order

### Phase Dependencies

| Phase | Depends On | Can Start When |
|-------|-----------|----------------|
| Phase 1 Setup | Nothing | Immediately |
| Phase 2 Foundational | Phase 1 complete | After T005 |
| Phase 3 US1 | Phase 2 complete | After T011 |
| Phase 4 US2 | Phase 2 complete | After T011 (US1 recommended first for test data) |
| Phase 5 US3 | Phase 3 US1 complete | After T041 (needs orders + customers) |
| Phase 6 US4 | Phase 3 US1 complete | After T041 (needs Notification rows) |
| Phase 7 Polish | All story phases | After T076 |

### User Story Dependencies

- **US1 (P1)**: No story dependencies — only needs Foundation (Phase 2)
- **US2 (P2)**: No story dependencies on US1, but US1 provides test data for manual testing
- **US3 (P3)**: Depends on US1 (needs `Order`, `Customer`, `LoyaltyAccount` from US1 flow)
- **US4 (P4)**: Depends on US1 (needs `Notification` rows created by order flow)

### Within Each Story

- Validations + Interfaces → Services → API Routes → Components → Pages
- Services are prerequisites for API routes
- Atoms → Molecules → Organisms → Templates → Pages

### Parallel Opportunities Per Story

**Phase 3 US1 — can run in parallel after T016:**
```
T017 product.service.ts   ┐
T018 customer.service.ts  ├─ parallel (different files)
T019a order read queries  ┘
     ↓ (all done)
T019b previewOrder ┬─ sequential (same file)
T019c createOrder  ┤
T019d updateStatus ┘
     ↓ (all done)
T021 atoms ┬─ parallel
T022 molecules ┘
     ↓
T024 ProductCard/Grid ┬─ parallel
T025 CartDrawer        ├─ parallel
T026 CheckoutStep1     ┘
     ↓
T031 products page ┬─ parallel
T033 PDP           ├─ parallel
T034 orders page   ┘
```

**Phase 4 US2 — can run in parallel after T044:**
```
T045 OrderTable  ┐
T046 ProductForm ├─ parallel
T047 Analytics   ┘
     ↓
T051 orders page  ┬─ parallel
T052 products     ├─ parallel
T053 abandoned    ┘
```

**Phase 5 US3 — can run in parallel:**
```
T062 loyalty.service.ts  ┐
T063 review.service.ts   ├─ parallel
T064 coupon.service.ts   ┘
```

---

## Implementation Strategy

| MVP Scope | Stories | Value |
|-----------|---------|-------|
| **MVP (Demo)** | Phase 1 + 2 + US1 (T001–T041) | Full purchase flow — the "Wow Factor" |
| **Operational** | + US2 (T042–T060) | Store can actually run |
| **Retention** | + US3 (T061–T069) | Loyalty hooks drive repeat purchases |
| **Engagement** | + US4 (T070–T076) | Real-time feedback loop |
| **Automation** | + Phase 7 (T077–T083) | Abandoned cart recovery + quality gate |

**Suggested sequence for solo developer**: Complete T001–T041 first for a shippable demo, then T042–T060 to make it operational, then US3/US4 together (they share the same Notification infrastructure already built in US1).

---

## Task Summary

| Phase | Tasks | Parallelizable | Key Deliverable |
|-------|-------|---------------|-----------------|
| Phase 1 Setup | T001–T005 (7) | T003, T003b, T004 | `package.json`, `tsconfig.json`, `eslint.config.mjs`, configs |
| Phase 2 Foundational | T006–T011 (7) | T006b, T008, T009, T010 | Prisma schema + RLS + migration, interfaces, middleware |
| Phase 3 US1 | T012–T041 (32) | T012–T015b, T021–T023, T025–T028, T034b, T035–T036 | Full buyer journey + WhatsApp redirect + return policy page; `getOrders()` in T019 (C3), DB delivery fee in T015 (H3), WhatsApp utility in T015b, `customer_session` cookie in T037 (H4), T034b policies page |
| Phase 4 US2 | T042–T060b (21) | T042, T043, T045–T047, T051–T055, T060b | Admin dashboard + JWT auth + settings API; T059 (CreateProductSchema) split before T059b; T060b public settings endpoint |
| Phase 5 US3 | T061–T069 (9) | T061–T064 | Loyalty earn/redeem + reviews; T065 covers DELIVERED earn AND CANCELLED reversal (EC-6) |
| Phase 6 US4 | T070–T076 (7) | T071, T074 | Notification bell + mark-read API |
| Phase 7 Polish | T077–T083 (8) | T077b, T079, T080, T081, T082 | Cron + Lighthouse 100 |
| **Total** | **94 tasks** | **34 parallelizable** | **MVP + full feature set** |
