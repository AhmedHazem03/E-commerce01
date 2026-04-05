import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import type { Metadata } from "next";
import { getOrder } from "@/lib/services/order.service";
import { getStoreSettings } from "@/lib/services/settings.service";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";
import OrderTimeline from "@/components/organisms/OrderTimeline";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `تتبع الطلب #${id}` };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (Number.isNaN(numericId) || numericId <= 0) notFound();

  // Auth gate: only the owning customer can view their order
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("customer_session")?.value;
  if (!sessionToken) redirect("/");

  let customerId: number;
  try {
    const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
    if (typeof payload.customerId !== "number") redirect("/");
    customerId = payload.customerId;
  } catch {
    redirect("/");
  }

  const order = await getOrder(numericId);
  // 404 for non-existent or foreign orders — don't leak existence via 403
  if (!order || order.customerId !== customerId) notFound();

  // Get WhatsApp number from settings service directly
  const settings = await getStoreSettings();

  let waUrl: string | null = null;
  if (settings.whatsappNumber) {
    waUrl = buildWhatsAppOrderUrl({
      storeWhatsApp: settings.whatsappNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      orderNumber: order.orderNumber,
      items: order.items.map((item) => ({
        name: item.name,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      discount: order.discount,
      paymentMethod: order.paymentMethod,
      address: order.address,
    });
  }

  return (
    <div className="max-w-lg mx-auto py-6 font-cairo">
      {/* WhatsApp fallback button */}
      {waUrl && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-green-500 px-6 py-3 text-white font-bold hover:bg-green-600 transition-colors w-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          أرسل عبر واتساب 📱
        </a>
      )}

      <OrderTimeline
        currentStatus={order.status}
        orderNumber={order.orderNumber}
        createdAt={order.createdAt.toISOString()}
        items={order.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          variant: item.variant,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        }))}
      />

      {/* Order summary */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-surface p-4 space-y-2 text-sm">
        <h2 className="font-bold text-base mb-3">ملخص الطلب</h2>
        <div className="flex justify-between">
          <span className="text-gray-600">المجموع الفرعي</span>
          <span>{order.subtotal.toFixed(2)} ج.م</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">رسوم التوصيل</span>
          <span>{order.deliveryFee.toFixed(2)} ج.م</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>خصم</span>
            <span>- {order.discount.toFixed(2)} ج.م</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200">
          <span>الإجمالي</span>
          <span className="text-primary">{order.total.toFixed(2)} ج.م</span>
        </div>
      </div>
    </div>
  );
}
