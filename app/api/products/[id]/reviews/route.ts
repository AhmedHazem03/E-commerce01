import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getReviews, createReview } from "@/lib/services/review.service";
import { CreateReviewSchema } from "@/lib/validations/product";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "");

async function getCustomerIdFromCookie(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get("customer_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return typeof payload.customerId === "number" ? payload.customerId : null;
  } catch {
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id, 10);
  if (isNaN(productId)) {
    return NextResponse.json({ error: "معرف غير صالح" }, { status: 400 });
  }

  const reviews = await getReviews(productId);
  return NextResponse.json(reviews);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const customerId = await getCustomerIdFromCookie(req);
  if (!customerId) {
    return NextResponse.json({ error: "يرجى تسجيل الدخول أولاً" }, { status: 401 });
  }

  const { id } = await params;
  const productId = parseInt(id, 10);
  if (isNaN(productId)) {
    return NextResponse.json({ error: "معرف غير صالح" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = CreateReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "بيانات غير صالحة" },
      { status: 400 }
    );
  }

  try {
    const review = await createReview(customerId, productId, parsed.data);
    return NextResponse.json(review, { status: 201 });
  } catch (err: unknown) {
    const statusCode =
      typeof err === "object" && err !== null && "statusCode" in err
        ? (err as { statusCode: number }).statusCode
        : 500;
    const message =
      err instanceof Error ? err.message : "حدث خطأ غير متوقع";
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
