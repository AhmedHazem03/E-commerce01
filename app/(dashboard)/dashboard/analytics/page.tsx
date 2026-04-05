// app/(dashboard)/analytics/page.tsx — Server Component
// Analytics overview: total orders, revenue, pending orders, abandoned carts count.

import { Suspense } from "react";
import { getAnalyticsMetrics } from "@/lib/services/order.service";
import AnalyticsCard from "@/components/organisms/AnalyticsCard";
import Spinner from "@/components/atoms/Spinner";

async function AnalyticsContent() {
  const { totalOrders, totalRevenue, pendingOrders, abandonedCarts } =
    await getAnalyticsMetrics();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <AnalyticsCard
        label="إجمالي الطلبات"
        value={totalOrders.toLocaleString("ar-EG")}
        trend={1}
        sub="جميع الطلبات"
      />
      <AnalyticsCard
        label="إجمالي الإيرادات"
        value={`${totalRevenue.toLocaleString("ar-EG")} ج.م`}
        trend={1}
        sub="باستثناء الملغية"
      />
      <AnalyticsCard
        label="طلبات جديدة"
        value={pendingOrders.toLocaleString("ar-EG")}
        trend={pendingOrders > 0 ? -1 : 0}
        sub="بانتظار التأكيد"
      />
      <AnalyticsCard
        label="عربات مهجورة"
        value={abandonedCarts.toLocaleString("ar-EG")}
        trend={abandonedCarts > 0 ? -1 : 0}
        sub="لم يتم التذكير بها"
      />
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-[--text]">الإحصائيات</h2>
      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        }
      >
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}
