import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { verifyAdminToken } from "@/lib/auth";
import { markAllRead } from "@/lib/services/notification.service";

// ─────────────────────────────────────────────────────────────────────────────
// Shared secret factory
// ─────────────────────────────────────────────────────────────────────────────

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET!);

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/notifications/read
//
// Two-principal auth (H4 fix — same pattern as T074):
//   1. Verify admin_token cookie → markAllRead({ adminId })
//   2. Else verify customer_session HttpOnly cookie → markAllRead({ customerId })
//   3. Neither present → 401
//
// NEVER reads customerId from query params or request body (IDOR vulnerability).
// ─────────────────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  // ── 1. Admin path ──
  const admin = await verifyAdminToken(req);
  if (admin) {
    const adminId = parseInt(admin.adminId, 10);
    const updated = await markAllRead({ adminId });
    return NextResponse.json({ updated });
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
        const updated = await markAllRead({ customerId });
        return NextResponse.json({ updated });
      }
    } catch {
      // Expired or tampered token — fall through to 401
    }
  }

  // ── 3. Neither token present ──
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
