import { type NextRequest, NextResponse } from "next/server";
import { processAbandonedCarts } from "@/lib/services/abandonedCart.service";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/cron/abandoned-cart
//
// Invoked by Vercel Cron every hour (vercel.json schedule: "0 * * * *").
// FR-011 / SC-006: processes AbandonedCart rows older than 1 hour.
//
// Security: Authorization header MUST carry Bearer {CRON_SECRET} before any
// DB work is performed. Returns 401 immediately on missing / wrong secret.
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // ── Authorization gate — check before any DB work (constitution RULE-2) ──
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || !authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const processed = await processAbandonedCarts();

  return NextResponse.json({ processed });
}
