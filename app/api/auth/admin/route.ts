import { NextRequest, NextResponse } from "next/server";
import { UpdateAdminSchema } from "@/lib/validations/auth";
import { updateAdminCredentials } from "@/lib/services/admin.service";
import { verifyAdminToken, signAdminToken } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  const adminPayload = await verifyAdminToken(request);
  if (!adminPayload) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = UpdateAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "بيانات غير صحيحة" },
      { status: 422 }
    );
  }

  if (!parsed.data.phone && !parsed.data.password) {
    return NextResponse.json({ error: "لم يتم تقديم أي تغييرات" }, { status: 422 });
  }

  try {
    await updateAdminCredentials(Number(adminPayload.adminId), parsed.data);
  } catch {
    return NextResponse.json({ error: "حدث خطأ أثناء التحديث" }, { status: 500 });
  }

  // Re-issue JWT cookie (phone may have changed)
  const token = await signAdminToken(adminPayload.adminId);
  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return response;
}
