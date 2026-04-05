import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { verifyAdminToken } from "@/lib/auth";
import {
  getNotifications,
  countUnread,
} from "@/lib/services/notification.service";

// ─────────────────────────────────────────────────────────────────────────────
// Shared secret factory — keeps the secret out of module scope
// ─────────────────────────────────────────────────────────────────────────────

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET!);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/notifications
//
// Two-principal auth (H4 fix):
//   1. Verify admin_token cookie → resolve adminId (Int)
//   2. Else verify customer_session HttpOnly cookie → extract customerId from JWT
//   3. Neither present → 401
//
// Supports optional ?page=N&limit=N query params (used by NotificationCenter).
// unreadCount is always a DB COUNT — not a slice-count of returned rows.
//
// NEVER reads customerId from query params or request body (IDOR vulnerability).
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);
  const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10), 1);
  const skip = (page - 1) * limit;

  // ── 1. Admin path ──
  const admin = await verifyAdminToken(req);
  if (admin) {
    const adminId = parseInt(admin.adminId, 10);
    const filter = { adminId };
    const [notifications, unreadCount] = await Promise.all([
      getNotifications(filter, limit, skip),
      countUnread(filter),
    ]);
    return NextResponse.json({ notifications, unreadCount });
  }

  // ── 2. Customer path — identity from HttpOnly cookie only ──
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/(?:^|;\s*)customer_session=([^;]+)/);
  const token = match?.[1];

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret());
      const customerId =
        typeof payload.customerId === "number" ? payload.customerId : null;
      if (customerId !== null) {
        const filter = { customerId };
        const [notifications, unreadCount] = await Promise.all([
          getNotifications(filter, limit, skip),
          countUnread(filter),
        ]);
        return NextResponse.json({ notifications, unreadCount });
      }
    } catch {
      // Expired or tampered token — fall through to 401
    }
  }

  // ── 3. Neither token present ──
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
