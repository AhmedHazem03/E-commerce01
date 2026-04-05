import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getProducts, createProduct } from "@/lib/services/product.service";
import { verifyAdminToken } from "@/lib/auth";
import { CreateProductSchema } from "@/lib/validations/product";

const ProductQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const raw: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    raw[key] = value;
  });

  const parsed = ProductQuerySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "بيانات غير صحيحة" },
      { status: 422 }
    );
  }

  try {
    const result = await getProducts(parsed.data);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحميل المنتجات" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const adminPayload = await verifyAdminToken(request);
  if (!adminPayload) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = CreateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "بيانات غير صحيحة" },
      { status: 422 }
    );
  }

  try {
    const product = await createProduct(parsed.data);
    return NextResponse.json({ product }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء المنتج" },
      { status: 500 }
    );
  }
}
