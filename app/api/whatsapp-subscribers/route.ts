import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const SubscribeSchema = z.object({
  phone: z
    .string()
    .regex(/^(01)[0-9]{9}$/, "رقم الهاتف غير صحيح — يجب أن يبدأ بـ 01 ويكون 11 رقمًا"),
});

/** POST /api/whatsapp-subscribers — يحفظ رقم المشترك */
export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = SubscribeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "رقم غير صحيح" },
      { status: 422 }
    );
  }

  try {
    await prisma.whatsAppSubscriber.upsert({
      where: { phone: parsed.data.phone },
      create: { phone: parsed.data.phone },
      update: {},
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ — حاول مرة أخرى" },
      { status: 500 }
    );
  }
}
