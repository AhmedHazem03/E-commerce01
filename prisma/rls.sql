-- =============================================================================
-- Row Level Security (RLS) — E-Commerce Store MVP
-- Branch: 001-e-commerce-store
-- =============================================================================
-- WHEN TO RUN:
--   After every `prisma migrate dev` or `prisma migrate deploy`.
--   Run via Supabase SQL Editor or:
--     psql "$DIRECT_URL" -f prisma/rls.sql
--
-- DESIGN:
--   Prisma connects with the `service_role` key (DATABASE_URL / DIRECT_URL).
--   The service_role BYPASSES RLS automatically — no policy needed for it.
--   RLS blocks the `anon` and `authenticated` roles, preventing direct DB
--   access from the Supabase Dashboard, REST API, or a leaked anon key.
-- =============================================================================

-- ── Enable RLS on every table that holds PII or financial data ───────────────

ALTER TABLE "Customer"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Address"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LoyaltyAccount"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LoyaltyTransaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AbandonedCart"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Admin"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review"             ENABLE ROW LEVEL SECURITY;

-- ── Deny all access from anon / authenticated roles (default deny) ───────────
-- No explicit DENY policy needed: once RLS is enabled with no permissive
-- policies, all roles other than service_role are blocked automatically.

-- ── Optional: read-only public access for non-sensitive tables ───────────────
-- Uncomment if you add Supabase Realtime or client-side data fetching
-- for products/categories. Keep disabled for the Demo.

-- ALTER TABLE "Product"       ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "ProductImage"  ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "ProductVariant" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "VariantOption" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "DeliveryZone"  ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Coupon"        ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "public_read_products" ON "Product"
--   FOR SELECT USING (true);

-- ── Verify ───────────────────────────────────────────────────────────────────
-- Run this SELECT to confirm RLS is enabled before deploying to production:
--
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
--
-- Expected: rowsecurity = true for all tables listed in ALTER TABLE above.
