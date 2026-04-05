import { NextRequest, NextResponse } from "next/server";
import { LoginSchema } from "@/lib/validations/auth";
import { bootstrapAdmin, verifyAdminCredentials } from "@/lib/services/admin.service";
import { signAdminToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "بيانات غير صحيحة" },
      { status: 422 }
    );
  }

  // Ensure admin record exists (seeds from env on first login)
  try {
    await bootstrapAdmin();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "خطأ في إعداد المسؤول" },
      { status: 500 }
    );
  }

  const result = await verifyAdminCredentials(parsed.data.phone, parsed.data.password);
  if (!result) {
    return NextResponse.json(
      { error: "رقم الهاتف أو كلمة المرور غير صحيحة" },
      { status: 401 }
    );
  }

  const token = await signAdminToken(result.id);

  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });

  return response;
}
