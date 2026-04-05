import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import Link from "next/link";
import type { Metadata } from "next";
import { getCustomerOrders } from "@/lib/services/order.service";
import OrderStatusChip from "@/components/molecules/OrderStatusChip";
import type { OrderStatus } from "@/lib/interfaces";

export const metadata: Metadata = { title: "طلباتي" };

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export default async function OrdersPage() {
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

  const orders = await getCustomerOrders(customerId);

  return (
    <div className="max-w-lg mx-auto py-8 px-4 font-cairo" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">طلباتي</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-4">لا توجد طلبات بعد</p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-black px-6 py-3 text-white font-semibold hover:bg-gray-800 transition-colors"
          >
            تسوق الآن
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-800">
                    طلب #{order.orderNumber}
                  </span>
                  <span className="text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <OrderStatusChip status={order.status as OrderStatus} />
                  <span className="text-sm font-semibold text-gray-700">
                    {order.total.toLocaleString("ar-EG")} ج.م
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
