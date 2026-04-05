"use client";
// components/organisms/OrderTable.tsx
// Sortable order list for the admin dashboard.

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderListItem } from "@/lib/services/order.service";
import OrderStatusChip from "@/components/molecules/OrderStatusChip";
import type { OrderStatus } from "@/lib/interfaces";

const ORDER_STATUSES: OrderStatus[] = [
  "NEW",
  "CONFIRMED",
  "PREPARING",
  "ON_WAY",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_AR: Record<OrderStatus, string> = {
  NEW: "جديد",
  CONFIRMED: "مؤكد",
  PREPARING: "جار التحضير",
  ON_WAY: "في الطريق",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التوصيل",
  CANCELLED: "ملغي",
};

type SortKey = "createdAt" | "total";
type SortDir = "asc" | "desc";

interface OrderTableProps {
  orders: OrderListItem[];
}

export default function OrderTable({ orders }: OrderTableProps) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [updating, setUpdating] = useState<number | null>(null);

  const sorted = [...orders].sort((a, b) => {
    const va = sortKey === "createdAt" ? new Date(a.createdAt).getTime() : a.total;
    const vb = sortKey === "createdAt" ? new Date(b.createdAt).getTime() : b.total;
    return sortDir === "asc" ? va - vb : vb - va;
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  async function handleStatusChange(orderId: number, status: OrderStatus) {
    setUpdating(orderId);
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      // Refresh Server Component data without full-page reload
      router.refresh();
    } finally {
      setUpdating(null);
    }
  }

  const arrowIcon = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div className="overflow-x-auto rounded-xl border border-[--surface] bg-white">
      <table className="w-full text-sm text-right">
        <thead className="bg-[--surface] text-[--text-muted]">
          <tr>
            <th className="px-4 py-3 font-medium">رقم الطلب</th>
            <th className="px-4 py-3 font-medium">العميل</th>
            <th
              className="px-4 py-3 font-medium cursor-pointer select-none"
              onClick={() => toggleSort("total")}
            >
              الإجمالي{arrowIcon("total")}
            </th>
            <th className="px-4 py-3 font-medium">الحالة</th>
            <th
              className="px-4 py-3 font-medium cursor-pointer select-none"
              onClick={() => toggleSort("createdAt")}
            >
              التاريخ{arrowIcon("createdAt")}
            </th>
            <th className="px-4 py-3 font-medium">تغيير الحالة</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((order) => (
            <tr key={order.id} className="border-t border-[--surface] hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-mono text-xs">{order.orderNumber}</td>
              <td className="px-4 py-3">
                <div className="font-medium">{order.customer.name}</div>
                <div className="text-[--text-muted] text-xs">{order.customer.phone}</div>
              </td>
              <td className="px-4 py-3 font-semibold">{order.total.toLocaleString("ar-EG")} ج.م</td>
              <td className="px-4 py-3">
                <OrderStatusChip status={order.status} />
              </td>
              <td className="px-4 py-3 text-[--text-muted] text-xs">
                {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td className="px-4 py-3">
                <select
                  disabled={updating === order.id}
                  value={order.status}
                  onChange={(e) =>
                    handleStatusChange(order.id, e.target.value as OrderStatus)
                  }
                  className="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[--primary] disabled:opacity-50"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_AR[s]}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}

          {sorted.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-[--text-muted]">
                لا توجد طلبات حتى الآن
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
