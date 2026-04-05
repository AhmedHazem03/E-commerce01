"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart";
import type { OrderStatus } from "@/lib/interfaces";

interface TimelineStep {
  status: OrderStatus;
  label: string;
  description: string;
}

const STEPS: TimelineStep[] = [
  { status: "NEW", label: "تم استلام الطلب", description: "طلبك وصلنا بنجاح" },
  { status: "CONFIRMED", label: "تم التأكيد", description: "تم تأكيد طلبك" },
  { status: "PREPARING", label: "قيد التحضير", description: "جاري تجهيز طلبك" },
  { status: "ON_WAY", label: "في الطريق", description: "طلبك خرج للتوصيل" },
  { status: "SHIPPED", label: "تم الشحن", description: "تم شحن طلبك" },
  { status: "DELIVERED", label: "تم التوصيل 🎉", description: "وصل طلبك بنجاح" },
];

const STATUS_ORDER: OrderStatus[] = [
  "NEW",
  "CONFIRMED",
  "PREPARING",
  "ON_WAY",
  "SHIPPED",
  "DELIVERED",
];

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  orderNumber: string;
  createdAt: string;
  items?: {
    productId: number;
    name: string;
    variant?: string | null;
    variantOptionId?: number;
    quantity: number;
    price: number;
    image?: string | null;
  }[];
}

export default function OrderTimeline({
  currentStatus,
  orderNumber,
  createdAt,
  items,
}: OrderTimelineProps) {
  const { addItem, clearCart } = useCartStore();
  const router = useRouter();
  const isCancelled = currentStatus === "CANCELLED";
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  const handleReorder = () => {
    if (!items || items.length === 0) return;
    clearCart();
    items.forEach((item) => {
      addItem({
        productId: item.productId,
        variantOptionId: item.variantOptionId,
        name: item.name,
        image: item.image ?? "",
        price: item.price,
        quantity: item.quantity,
        variant: item.variant ?? undefined,
      });
    });
    // Navigate to homepage so CartDrawer can be opened
    router.push("/");
  };

  return (
    <div className="font-cairo">
      <div className="mb-6">
        <p className="text-sm text-gray-500">رقم الطلب</p>
        <p className="text-lg font-bold text-gray-900">{orderNumber}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date(createdAt).toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {isCancelled ? (
        <div className="rounded-lg border border-danger bg-red-50 px-4 py-4 text-center">
          <p className="text-danger font-bold text-base">تم إلغاء الطلب</p>
          <p className="text-sm text-gray-500 mt-1">نأسف لذلك. تم رد أي نقاط تم خصمها</p>
        </div>
      ) : (
        <ol className="relative border-r-2 border-gray-200 pr-6 space-y-6">
          {STEPS.map((step, index) => {
            const stepIndex = STATUS_ORDER.indexOf(step.status);
            const isDone = currentIndex >= stepIndex;
            const isCurrent = currentIndex === stepIndex;

            return (
              <li key={step.status} className="relative">
                {/* Dot */}
                <div
                  className={[
                    "absolute -right-[25px] top-0 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                    isDone
                      ? "border-primary bg-primary"
                      : "border-gray-300 bg-white",
                  ].join(" ")}
                >
                  {isDone && (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>

                <div className={isCurrent ? "font-semibold" : isDone ? "text-gray-700" : "text-gray-400"}>
                  <p className={["text-sm", isDone ? "text-gray-900" : "text-gray-400"].join(" ")}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-400">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {/* Reorder button — shown when DELIVERED */}
      {currentStatus === "DELIVERED" && items && items.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={handleReorder}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            🔄 اطلب تاني
          </button>
        </div>
      )}
    </div>
  );
}
