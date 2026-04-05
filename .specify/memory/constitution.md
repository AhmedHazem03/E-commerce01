<!--
SYNC IMPACT REPORT
==================
Version change   : 1.0.0 → 1.1.0
Bump type        : MINOR — four executive decisions applied (stack upgrades +
                   DB provider change + TypeScript enforcement).

Modified principles :
  - I. Tech Stack & Architecture:
      Next.js 14.2.29 → 16.2.x (FORCED)
      MySQL → PostgreSQL via Supabase (CHANGED)
      react-stars → lucide-react (ACCEPTED, already in specs)
      TypeScript STRICTLY ENFORCED — .jsx/.js files in specs overridden

Added sections      : N/A
Removed sections    : N/A

Templates updated:
  ✅ .specify/templates/plan-template.md   — Constitution Check gates filled
  ✅ specs/08-dependencies.md              — versions updated for Next.js 16.2,
                                             PostgreSQL adapter, lucide-react
  ✅ specs/02-database-schema.md           — provider changed to postgresql,
                                             @db.Text removed (PostgreSQL-safe)
  ✅ specs/01-project-structure.md         — all .jsx/.js references → .tsx/.ts

Resolved TODOs from v1.0.0:
  ✅ "Next.js 16.2" — FORCED by executive decision. Version set to "16.2.x";
     pinned patch version TBD when stable release is confirmed.
  ✅ react-stars → lucide-react — ACCEPTED and propagated.
  ✅ TypeScript (.tsx/.ts) — STRICTLY ENFORCED; old specs overridden.
  ✅ MySQL → PostgreSQL (Supabase) — APPLIED in schema and dependencies.
-->

# E-Commerce Store Constitution

## Core Principles

### I. Tech Stack & Architecture (NON-NEGOTIABLE)

The following stack is mandatory across every feature. Deviations MUST be
justified in the Complexity Tracking section of the relevant plan.md.

- Framework MUST be Next.js 16.2.x with the App Router; no Pages Router.
  *(Executive decision 2026-04-03: version forced to 16.2.x)*
- Language MUST be TypeScript STRICTLY. All source files MUST use `.tsx`
  (components) or `.ts` (logic/utilities/route handlers). `.jsx` and `.js`
  extensions are FORBIDDEN anywhere in `app/`, `components/`, `lib/`, and
  `prisma/`. Any existing `.jsx`/`.js` files in specs are superseded by this
  rule. *(Executive decision 2026-04-03: strictly enforced)*
- Styling MUST use TailwindCSS exclusively; no inline styles, no CSS Modules
  except for unavoidable third-party overrides.
- ORM MUST be Prisma 5.22.0 connected to a **PostgreSQL** datasource via
  Supabase. The `datasource db { provider = "postgresql" }` is mandatory.
  MySQL is no longer permitted. Raw SQL is forbidden outside of `$queryRaw`
  for performance-critical read-only queries.
  *(Executive decision 2026-04-03: provider changed from MySQL to PostgreSQL)*
- Client-side global state MUST be managed with Zustand 4.5.x. React Context is
  permitted only for theme/locale values shared across the entire tree.
- Route group separation is MANDATORY:
  - `(store)/` — customer-facing storefront only.
  - `(dashboard)/` — admin panel only; MUST be protected by JWT middleware.
  - Cross-group imports are forbidden; shared utilities belong in `lib/`.

### II. Mobile-First Design (NON-NEGOTIABLE)

All UI work MUST start from the smallest breakpoint and scale up.

- CSS MUST be written mobile-first: base styles target mobile, `md:` / `lg:`
  prefixes add desktop enhancements.
- Typography MUST use the `Cairo` font (Google Fonts) for all Arabic text.
- The design token set defined below MUST be used for all colors; hard-coded
  hex values in components are forbidden:
  - `--bg` `--bg-2` `--text` `--text-muted` `--border`
  - `--accent` `--accent-light`
  - `--danger` (urgency signals)
  - `--success` (availability signals)
- Product image galleries MUST use Swiper 11.x with the configured
  `autoHeight` and `zoom` modules.
- UI transitions (drawer open/close, cart add animation, page transitions) MUST
  use Tailwind's `transition` and `duration-*` utilities; no raw CSS animations
  unless Tailwind cannot express the motion.

### III. Conversion-Driven Development (NON-NEGOTIABLE)

Marketing and conversion rules are first-class engineering constraints, not
optional polish. Violating these rules is a blocking defect.

- **Social Proof**: Every product card and product detail page MUST display
  the average star rating (rendered via `components/store/ReviewStars.tsx`
  using `lucide-react` `Star` icons + Tailwind fill) and the total buyer count.
  `react-stars` MUST NOT be used — it is incompatible with React 18.
  `lucide-react` is the accepted replacement. *(Executive decision 2026-04-03)*
- **Urgency**: When `product.stock < 5`, the string "باقي X قطع بس!" MUST be
  rendered in `--danger` color. Timed offers MUST render a live Countdown
  component; the countdown MUST NOT be purely decorative.
- **Checkout length**: The checkout flow MUST contain exactly 2 steps.
  Adding a third step or a mandatory OTP during checkout is a blocking violation.
- **Cart retention**: Cart state MUST be persisted to `localStorage` via
  `lib/cart.ts`. The coupon input field MUST be hidden behind a collapsible
  text link ("عندك كوبون خصم؟") and MUST NOT be visible by default.

### IV. Server/Client Separation (NON-NEGOTIABLE)

- All React components MUST be functional; class components are forbidden.
- All API logic MUST reside in `app/api/**/*.ts` Route Handlers.
  UI components MUST NOT import Prisma or execute database queries directly.
- All database operations MUST run server-side via Prisma. Client components
  MUST communicate with the server exclusively through `fetch` / `axios` to
  `app/api/` endpoints.
- `"use client"` directive MUST only be added when browser APIs (localStorage,
  event listeners, hooks like useState/useEffect) are strictly required.
  Server Components are the default.

## Security Requirements

- All `(dashboard)/` routes MUST be gated by `middleware.ts` using
  `jwtVerify` (jose library). Unauthenticated requests MUST be redirected to
  `/login`, never return a 200 with partial data.
- All API route handlers MUST validate request bodies server-side before any
  Prisma call. Unvalidated external input reaching the ORM is a blocking defect.
- Database connection URL and all secrets (JWT_SECRET, CRON_SECRET,
  Cloudinary keys) MUST reside in environment variables only.
  Hard-coded credentials are forbidden.
- Vercel Cron endpoints MUST verify the `Authorization: Bearer CRON_SECRET`
  header before execution.

## Development Workflow

- Every Prisma schema change MUST be accompanied by a migration file
  (`prisma migrate dev`). Direct `db push` is permitted only in development
  and MUST NOT be used against staging or production.
- Dependency versions MUST be pinned (exact versions, no `"latest"` or
  `"14.x"` ranges) in `package.json`. Unpinned dependencies in production
  are a blocking defect.
- All API Route Handlers MUST return a consistent JSON error shape:
  `{ "error": "<message>" }` with an appropriate HTTP status code.
- The `vercel.json` cron schedule MUST match the cutoff window defined in
  `app/api/cron/abandoned-cart/route.ts` (currently: every hour, `0 * * * *`).

## Governance

This constitution supersedes all other practices, docs, and prior decisions.
Amendments MUST:

1. Increment the version (MAJOR for principle removal/redefinition, MINOR for
   new section or material expansion, PATCH for wording/typo fixes).
2. Update the Sync Impact Report HTML comment at the top of this file.
3. Propagate changes to affected templates (`plan-template.md`,
   `spec-template.md`, `tasks-template.md`) on the same commit.
4. Be reviewed and approved before any in-progress feature branches rebase.

All `plan.md` Constitution Check gates MUST be re-evaluated after Phase 1
design. A failing gate blocks merging to main.

**Version**: 1.1.0 | **Ratified**: 2026-04-03 | **Last Amended**: 2026-04-03
