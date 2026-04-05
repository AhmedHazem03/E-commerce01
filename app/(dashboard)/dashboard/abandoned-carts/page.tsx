// app/(dashboard)/abandoned-carts/page.tsx — Server Component
// Lists abandoned carts: phone, summary, time since abandon, reminded status.

import { Suspense } from "react";
import { getAbandonedCartsForAdmin } from "@/lib/services/abandonedCart.service";
import Spinner from "@/components/atoms/Spinner";

async function AbandonedCartsContent() {
  const carts = await getAbandonedCartsForAdmin();

  const now = Date.now();

  function timeAgo(d: Date): string {
    const diff = Math.floor((now - new Date(d).getTime()) / 60000);
    if (diff < 60) return `منذ ${diff} دقيقة`;
    const hrs = Math.floor(diff / 60);
    if (hrs < 24) return `منذ ${hrs} ساعة`;
    return `منذ ${Math.floor(hrs / 24)} يوم`;
  }

  function summarizeItems(items: unknown): string {
    if (!Array.isArray(items)) return "—";
    return `${items.length} ${items.length === 1 ? "منتج" : "منتجات"}`;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[--surface] bg-white">
      <table className="w-full text-sm text-right">
        <thead className="bg-[--surface] text-[--text-muted]">
          <tr>
            <th className="px-4 py-3 font-medium">رقم الهاتف</th>
            <th className="px-4 py-3 font-medium">المحتويات</th>
            <th className="px-4 py-3 font-medium">آخر تحديث</th>
            <th className="px-4 py-3 font-medium">تم التذكير</th>
          </tr>
        </thead>
        <tbody>
          {carts.map((cart) => (
            <tr key={cart.id} className="border-t border-[--surface] hover:bg-gray-50">
              <td className="px-4 py-3 font-mono">{cart.phone}</td>
              <td className="px-4 py-3 text-[--text-muted]">{summarizeItems(cart.items)}</td>
              <td className="px-4 py-3 text-[--text-muted]">{timeAgo(cart.updatedAt)}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    cart.reminded
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {cart.reminded ? "نعم" : "لا"}
                </span>
              </td>
            </tr>
          ))}
          {carts.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-10 text-center text-[--text-muted]">
                لا توجد عربات مهجورة
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function AbandonedCartsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-[--text]">العربات المهجورة</h2>
      <Suspense fallback={<div className="flex justify-center py-20"><Spinner /></div>}>
        <AbandonedCartsContent />
      </Suspense>
    </div>
  );
}
