// server-only
// lib/auth.ts — Admin JWT helpers using jose (Edge-safe).
// Never expose JWT_SECRET in responses or logs.

import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET!);

/** Sign a 7-day admin JWT containing only { adminId }. */
export async function signAdminToken(adminId: string): Promise<string> {
  return new SignJWT({ adminId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

/** Read the `admin_token` cookie from a request and verify it.
 *  Returns `{ adminId }` on success, `null` on failure (expired / missing / tampered). */
export async function verifyAdminToken(
  req: NextRequest | Request
): Promise<{ adminId: string } | null> {
  try {
    // Works for both NextRequest (has .cookies) and raw Request (use header)
    let token: string | undefined;

    if ("cookies" in req && typeof (req as NextRequest).cookies?.get === "function") {
      token = (req as NextRequest).cookies.get("admin_token")?.value;
    } else {
      const cookie = req.headers.get("cookie") ?? "";
      const match = cookie.match(/(?:^|;\s*)admin_token=([^;]+)/);
      token = match?.[1];
    }

    if (!token) return null;

    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.adminId !== "string") return null;
    return { adminId: payload.adminId };
  } catch {
    return null;
  }
}
