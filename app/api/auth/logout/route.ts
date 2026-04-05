import { NextResponse } from "next/server";

/** POST /api/auth/logout — clears admin_token cookie and redirects to /login. */
export async function POST() {
  const response = NextResponse.redirect(
    new URL("/login", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
  );
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
