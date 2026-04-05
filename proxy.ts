import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is not set.");
}
const SECRET = new TextEncoder().encode(jwtSecret);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("admin_token");
    return response;
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
