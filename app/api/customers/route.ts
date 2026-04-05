import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { UpsertCustomerSchema } from "@/lib/validations/customer";
import { upsertCustomer } from "@/lib/services/customer.service";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "JSON غير صحيح" },
      { status: 400 }
    );
  }
  const parsed = UpsertCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "بيانات غير صحيحة" },
      { status: 422 }
    );
  }

  let result;
  try {
    result = await upsertCustomer(parsed.data);
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة الطلب" },
      { status: 500 }
    );
  }

  // Sign customer_session JWT
  const token = await new SignJWT({ customerId: result.customer.id })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .setIssuedAt()
    .sign(JWT_SECRET);

  const response = NextResponse.json(
    {
      id: result.customer.id,
      name: result.customer.name,
      phone: result.customer.phone,
      addressId: result.addressId,
      currentPoints: result.currentPoints,
      pointsToEarn: result.pointsToEarn,
    },
    { status: result.isNew ? 201 : 200 }
  );

  response.cookies.set("customer_session", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}
