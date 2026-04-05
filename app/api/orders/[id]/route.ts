import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getOrder, updateOrderStatus } from "@/lib/services/order.service";
import { verifyAdminToken } from "@/lib/auth";
import { z } from "zod";
import type { OrderStatus } from "@/lib/interfaces";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

const idSchema = z.coerce.number().int().positive();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) {
    return NextResponse.json({ error: "معرّف غير صحيح" }, { status: 400 });
  }

  const order = await getOrder(parsed.data);
  if (!order) {
    return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  }

  // Require authentication — block unauthenticated access
  const sessionToken = request.cookies.get("customer_session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
    if (typeof payload.customerId !== "number" || order.customerId !== payload.customerId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  return NextResponse.json(order);
}

const VALID_STATUSES: OrderStatus[] = [
  "NEW", "CONFIRMED", "PREPARING", "ON_WAY", "SHIPPED", "DELIVERED", "CANCELLED",
];

const PatchOrderSchema = z.object({
  status: z.enum(["NEW", "CONFIRMED", "PREPARING", "ON_WAY", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminPayload = await verifyAdminToken(request);
  if (!adminPayload) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) {
    return NextResponse.json({ error: "معرّف غير صحيح" }, { status: 400 });
  }

  const body: unknown = await request.json().catch(() => null);
  const bodyParsed = PatchOrderSchema.safeParse(body);
  if (!bodyParsed.success) {
    return NextResponse.json(
      { error: bodyParsed.error.errors[0]?.message ?? "بيانات غير صحيحة" },
      { status: 422 }
    );
  }

  // Validate status value is one of the allowed set (belt-and-suspenders with zod enum above)
  if (!VALID_STATUSES.includes(bodyParsed.data.status)) {
    return NextResponse.json({ error: "حالة غير صحيحة" }, { status: 422 });
  }

  try {
    const result = await updateOrderStatus(parsed.data, bodyParsed.data.status, Number(adminPayload.adminId));
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }
    return NextResponse.json({ error: "حدث خطأ أثناء تحديث الحالة" }, { status: 500 });
  }
}
