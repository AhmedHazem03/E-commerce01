// lib/whatsapp.ts
// Client-safe utility — no Prisma, no server-only imports.

export interface WhatsAppOrderData {
  storeWhatsApp: string | null;
  customerName: string;
  customerPhone: string;
  orderNumber: string;
  items: {
    name: string;
    variant: string | null | undefined;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  paymentMethod: string;
  address: string;
}

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "كاش",
  VODAFONE_CASH: "فودافون كاش",
  INSTAPAY: "إنستاباي",
  CARD: "بطاقة",
};



/**
 * Builds the wa.me deep-link URL with a pre-filled Arabic order summary.
 * Returns null when the store has no WhatsApp number configured.
 * The client redirects to this URL immediately after POST /api/orders.
 */
export function buildWhatsAppOrderUrl(
  data: WhatsAppOrderData
): string | null {
  if (!data.storeWhatsApp) return null;

  // Normalise phone: strip leading +, spaces, dashes.
  // Egyptian numbers stored as "01XXXXXXXXX" → "201XXXXXXXXX"
  const rawPhone = data.storeWhatsApp.replace(/[\s\-().]/g, "");
  const phone = rawPhone.startsWith("+")
    ? rawPhone.slice(1)
    : rawPhone.startsWith("0")
    ? `2${rawPhone}` // Egypt country code
    : rawPhone;

  const itemLines = data.items
    .map((i) => {
      const variantPart = i.variant ? ` (${i.variant})` : "";
      return `• ${i.name}${variantPart} × ${i.quantity} — ${(i.price * i.quantity).toFixed(2)} ج.م`;
    })
    .join("\n");

  const totalAfterDiscount = data.subtotal + data.deliveryFee - data.discount;
  const paymentLabel = PAYMENT_LABELS[data.paymentMethod] ?? data.paymentMethod;

  const lines = [
    `🛍️ طلب جديد — ${data.orderNumber}`,
    "",
    `الاسم: ${data.customerName}`,
    `الهاتف: ${data.customerPhone}`,
    "",
    "المنتجات:",
    itemLines,
    "",
    `المجموع: ${data.subtotal.toFixed(2)} ج.م`,
    `رسوم التوصيل: ${data.deliveryFee.toFixed(2)} ج.م`,
    ...(data.discount > 0
      ? [`الخصم: -${data.discount.toFixed(2)} ج.م`]
      : []),
    `الإجمالي: ${totalAfterDiscount.toFixed(2)} ج.م`,
    "",
    `طريقة الدفع: ${paymentLabel}`,
    `العنوان: ${data.address}`,
  ];

  const message = lines.join("\n");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
