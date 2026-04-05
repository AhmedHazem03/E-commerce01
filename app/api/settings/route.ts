import { NextRequest, NextResponse } from "next/server";
import { getStoreSettings } from "@/lib/services/settings.service";
import { updateStoreSettings } from "@/lib/services/admin.service";
import { verifyAdminToken } from "@/lib/auth";
import { UpdateStoreSettingsSchema } from "@/lib/validations/auth";

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحميل الإعدادات" },
      { status: 500 }
    );
  }
}

/** PATCH /api/settings — admin-only. Updates store meta fields. */
export async function PATCH(request: NextRequest) {
  const adminPayload = await verifyAdminToken(request);
  if (!adminPayload) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = UpdateStoreSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "بيانات غير صحيحة" },
      { status: 422 }
    );
  }

  try {
    await updateStoreSettings(Number(adminPayload.adminId), parsed.data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ أثناء حفظ الإعدادات" },
      { status: 500 }
    );
  }
}
