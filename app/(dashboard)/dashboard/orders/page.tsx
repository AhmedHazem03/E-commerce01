// app/(dashboard)/orders/page.tsx — Server Component
// Fetches all orders (paginated) and renders sortable OrderTable.

import { Suspense } from "react";
import { getOrders } from "@/lib/services/order.service";
import OrderTable from "@/components/organisms/OrderTable";
import Spinner from "@/components/atoms/Spinner";

async function OrdersContent() {
  const { orders } = await getOrders({ page: 1, limit: 50 });
  return <OrderTable orders={orders} />;
}

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-[--text]">الطلبات</h2>
      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        }
      >
        <OrdersContent />
      </Suspense>
    </div>
  );
}
