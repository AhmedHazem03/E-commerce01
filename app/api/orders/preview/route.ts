import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { PreviewOrderSchema } from "@/lib/validations/order";
import { previewOrder } from "@/lib/services/order.service";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(request: NextRequest) {
  // Auth: extract customerId from customer_session HttpOnly cookie
  const sessionToken = request.cookies.get("customer_session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  let customerId: number;
  try {
    const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
    if (typeof payload.customerId !== "number") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
    customerId = payload.customerId;
  } catch {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "JSON غير صحيح" },
      { status: 400 }
    );
  }
  const parsed = PreviewOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "بيانات غير صحيحة" },
      { status: 422 }
    );
  }

  try {
    const result = await previewOrder(parsed.data, customerId);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معاينة الطلب" },
      { status: 500 }
    );
  }
}
