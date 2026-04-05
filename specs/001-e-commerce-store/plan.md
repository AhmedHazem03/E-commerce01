# Implementation Plan: E-Commerce Store MVP

**Branch**: `001-e-commerce-store` | **Date**: 2026-04-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-e-commerce-store/spec.md`

---

## Dashboard Readiness Report — Phase 4 Targeted Audit
**Scope**: Phase 4 (User Story 2 — Admin Dashboard)
**Audit Date**: 2026-04-04

### 1. Completeness & Stubs

| Page | Route | Pattern | Real Data? | Stubs / TODOs? |
|------|-------|---------|------------|----------------|
| Orders | `/dashboard/orders` | Server Component → `getOrders()` → `<OrderTable>` | ✅ Yes | ✅ None |
| Products | `/dashboard/products` | Client Component → `fetch("/api/products")` | ✅ Yes | ✅ None |
| Abandoned Carts | `/dashboard/abandoned-carts` | Server Component → `getAbandonedCartsForAdmin()` | ✅ Yes | ✅ None |
| Analytics | `/dashboard/analytics` | Server Component → `getAnalyticsMetrics()` | ✅ Yes | ✅ None |
| Settings | `/dashboard/settings` | Client Component → `fetch("/api/settings")` | ✅ Yes | ✅ None |

**Verdict**: All 5 pages are fully implemented with live service calls. No hardcoded values, mock data, or TODO comments were found in any dashboard page or dashboard-related component.

---

### 2. Security & Auth (Double Layer)

#### Layer 1 — Route Guard (`middleware.ts`)

| Check | Result |
|-------|--------|
| `middleware.ts` file exists at repo root | ✅ Created 2026-04-04 |
| Matcher covers `/dashboard/:path*` | ✅ `config.matcher = ["/dashboard/:path*"]` |
| Redirects unauthenticated requests to `/login` | ✅ `jwtVerify` failure → redirect + clears stale cookie |

#### Layer 2 — API Route Guards (`verifyAdminToken()`)

| Route | Method | Calls `verifyAdminToken()` first? |
|-------|--------|----------------------------------|
| `app/api/orders/[id]/route.ts` | PATCH | ✅ Yes — line 1 of handler |
| `app/api/products/route.ts` | POST | ✅ Yes — line 1 of handler |
| `app/api/products/[id]/route.ts` | PATCH | ✅ Yes — line 1 of handler |
| `app/api/products/[id]/route.ts` | DELETE | ✅ Yes — line 1 of handler |
| `app/api/auth/admin/route.ts` | PATCH | ✅ Yes — line 1 of handler |
| `app/api/settings/route.ts` | PATCH | ✅ Yes — line 1 of handler |
| `app/api/notifications/route.ts` | GET | ✅ Yes — dual-principal (admin OR customer) |
| `app/api/notifications/read/route.ts` | PATCH | ✅ Yes — dual-principal (admin OR customer) |

**Verdict for Layer 2**: All admin-mutating endpoints strictly call `verifyAdminToken()` as their first operation before any business logic. Customer identity in notifications is resolved from the HttpOnly `customer_session` JWT — never from query params or body (IDOR-safe).

---

### 3. Clean Architecture

| Rule | Status | Notes |
|------|--------|-------|
| Dashboard pages import Prisma directly? | ✅ No Prisma in any `app/(dashboard)/**` file | |
| Server Components fetch via service layer? | ✅ Orders, Abandoned Carts, Analytics all use `lib/services/*` | Server Component pattern |
| Client Components go through `app/api/`? | ✅ Products page fetches `/api/products`; Settings page fetches `/api/settings` | |
| Prisma leaked into UI (components/)? | ✅ No Prisma imports in any component | |
| `OrderTable` receives pre-fetched `orders` prop? | ✅ Yes — typed `OrderListItem[]`, no DB calls | |
| `AnalyticsCard` is a pure display component? | ✅ Yes — receives `label`, `value`, `trend`, `sub` as props | |
| `ProductForm` submits via `fetch("/api/products")` / `fetch("/api/products/[id]")`? | ✅ Yes — API-only | |

**One inconsistency found**: `products/page.tsx` uses `"use client"` and fetches data client-side, while the other 3 data pages (orders, abandoned-carts, analytics) are Server Components. This is **architecturally inconsistent** but not a security violation — the products page legitimately needs client state for the add/edit modal. The pattern could be improved by extracting a Server Component wrapper that pre-fetches and passes data down.

**`window.location.reload()` in `OrderTable.tsx` (line 66)**: After updating an order's status, the component calls `window.location.reload()` instead of using `router.refresh()` (Next.js App Router) or optimistic state. This is a technical debt item.

---

### 4. Admin Notifications

| Check | Status | Notes |
|-------|--------|-------|
| `NotificationCenter.tsx` built? | ✅ Yes — full paginated list with mark-all-read | |
| `NotificationBell.tsx` built? | ✅ Yes — polls every 60 s, dropdown with unread count | |
| `DashboardLayout` has a `notificationSlot` prop? | ✅ Yes — renders `{notificationSlot}` in top bar | |
| `app/(dashboard)/layout.tsx` passes `<NotificationBell>` to `notificationSlot`? | ✅ Fixed 2026-04-04 — `notificationSlot={<NotificationBell />}` wired |
| `NEW_ORDER` notification appears in bell? | ✅ Yes — `admin_token` cookie resolved by `GET /api/notifications` |
| Browser sound on new notification? | ✅ Fixed 2026-04-04 — Web Audio API beep plays when `unreadCount` rises during polling |

---

## 🚨 PENDING ACTIONS

✅ **All pending actions resolved as of 2026-04-04.**

### Previously Blocking — Now Fixed

1. ✅ **`middleware.ts` created** — GATE-5 now passes. JWT guard on `/dashboard/:path*` with cookie cleanup on expiry.
2. ✅ **`NotificationBell` wired** — `app/(dashboard)/layout.tsx` now passes `<NotificationBell />` to `notificationSlot`. Spec US2 scenario 3 satisfied.
3. ✅ **`OrderTable` fixed** — `window.location.reload()` replaced with `router.refresh()` (Next.js App Router — Server Component re-fetch without full page reload).
4. ✅ **Browser sound added** — `NotificationBell.tsx` uses Web Audio API to play a descending sine-wave beep when `unreadCount` rises during polling.

### Remaining Non-Blocking (Tracked — No Immediate Action Required)

5. **`products/page.tsx` architecture** — Still a `"use client"` page while others are Server Components. Functionally correct; refactor only if consistency becomes a priority.
6. **No `GET /api/orders` admin endpoint** — Orders page uses direct service call server-side. Add REST endpoint only when external integrations require it.

---

## Summary

## Technical Context

**Language/Version**: TypeScript 5.7.3 (strict mode)
**Primary Dependencies**: Next.js 16.2.0 (App Router), Prisma 5.22.0, Zustand 4.5.5, TailwindCSS 3.4.17, jose 5.9.6, zod 3.23.8
**Storage**: PostgreSQL via Supabase (`DATABASE_URL` pooled + `DIRECT_URL` direct)
**Testing**: `npm test`, `npm run lint`
**Target Platform**: Web (Vercel deployment)
**Project Type**: Full-stack web application (e-commerce storefront + admin dashboard)
**Performance Goals**: <200ms p95 API responses; mobile-first
**Constraints**: Offline-capable cart (localStorage); HttpOnly cookies only for auth
**Scale/Scope**: Single-store MVP; ~50 screens across storefront + dashboard

## Constitution Check

*GATE: Evaluated during Phase 4 (US2 Dashboard) targeted audit — 2026-04-04.*

| Gate | Rule (from constitution.md) | Status |
|------|-----------------------------|--------|
| GATE-1 TypeScript | All source files in `app/` and `components/` MUST use `.tsx`/`.ts`. No `.jsx`/`.js`. | ✅ PASS |
| GATE-2 Stack lock | `package.json` MUST use exact pinned versions. No `"latest"`, no `"14.x"` ranges. | ✅ PASS |
| GATE-3 Route groups | `(store)/` and `(dashboard)/` MUST NOT cross-import each other. Shared code in `lib/`. | ✅ PASS |
| GATE-4 Checkout steps | Checkout flow MUST be exactly 2 steps. Third step or mandatory OTP = blocking violation. | ✅ PASS (US1 scope) |
| GATE-5 Dashboard auth | `middleware.ts` MUST gate all `(dashboard)/` routes via JWT. Unprotected dashboard = blocking. | ✅ PASS — `middleware.ts` created 2026-04-04 |
| GATE-6 Server separation | UI components MUST NOT import Prisma or query DB directly. API calls only via `app/api/`. | ✅ PASS — no Prisma in pages or components |
| GATE-7 Cart persistence | Cart MUST persist to `localStorage` via `lib/cart.ts`. Coupon field hidden by default. | ✅ PASS (US1 scope) |
| GATE-8 Secret hygiene | No hard-coded credentials. All secrets via env vars. | ✅ PASS |

> **ERROR policy**: All gates now PASS for the dashboard scope as of 2026-04-04.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
