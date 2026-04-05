import { NextRequest, NextResponse } from "next/server";
import { getProduct, updateProduct, deleteProduct } from "@/lib/services/product.service";
import { verifyAdminToken } from "@/lib/auth";
import { z } from "zod";

const idSchema = z.coerce.number().int().positive();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) {
    return NextResponse.json({ error: "معرّف غير صحيح" }, { status: 400 });
  }
  try {
    const product = await getProduct(parsed.data);
    if (!product) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحميل المنتج" },
      { status: 500 }
    );
  }
}

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
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 422 });
  }

  try {
    const product = await updateProduct(parsed.data, body as Parameters<typeof updateProduct>[1]);
    return NextResponse.json({ ok: true, product });
  } catch {
    return NextResponse.json({ error: "حدث خطأ أثناء التحديث" }, { status: 500 });
  }
}

export async function DELETE(
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

  try {
    await deleteProduct(parsed.data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ أثناء الحذف" }, { status: 500 });
  }
}
