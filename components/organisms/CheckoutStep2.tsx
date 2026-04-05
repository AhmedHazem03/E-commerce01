"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";
import Button from "@/components/atoms/Button";
import Spinner from "@/components/atoms/Spinner";
import Divider from "@/components/atoms/Divider";

type PaymentMethod = "CASH" | "VODAFONE_CASH" | "INSTAPAY" | "CARD";

interface OrderPreview {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  pointsToEarn: number;
  currentPoints: number;
}

interface CheckoutStep2Props {
  addressId: number;
  currentPoints: number;
  pointsToEarn: number;
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH: "كاش عند الاستلام",
  VODAFONE_CASH: "فودافون كاش",
  INSTAPAY: "إنستاباي",
  CARD: "بطاقة ائتمانية",
};

export default function CheckoutStep2({
  addressId,
  currentPoints,
  pointsToEarn,
}: CheckoutStep2Props) {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [preview, setPreview] = useState<OrderPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadPreview = async (redeem: boolean) => {
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const res = await fetch("/api/orders/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantOptionId: i.variantOptionId,
            quantity: i.quantity,
          })),
          redeemPoints: redeem ? currentPoints : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setPreviewError(data.error ?? "تعذر حساب السعر");
        return;
      }
      const data: OrderPreview = await res.json();
      setPreview(data);
    } catch {
      setPreviewError("خطأ في الاتصال");
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    void loadPreview(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRedeemToggle = async (checked: boolean) => {
    setRedeemPoints(checked);
    await loadPreview(checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId,
          paymentMethod,
          items: items.map((i) => ({
            productId: i.productId,
            variantOptionId: i.variantOptionId,
            quantity: i.quantity,
          })),
          redeemPoints: redeemPoints ? currentPoints : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setSubmitError(data.error ?? "حدث خطأ عند إنشاء الطلب");
        return;
      }

      const data = await res.json();
      clearCart();

      // Redirect directly to WhatsApp with pre-filled order message.
      // Using window.location.href instead of window.open ensures the redirect
      // is never blocked by popup blockers (it's equivalent to clicking a link).
      if (data.whatsapp) {
        const waUrl = buildWhatsAppOrderUrl({
          ...data.whatsapp,
          orderNumber: data.orderNumber,
        });
        if (waUrl) {
          // Persist orderId so user can navigate back to their order after WhatsApp
          sessionStorage.setItem("lastOrderId", String(data.orderId));
          window.location.href = waUrl;
          return;
        }
      }

      // Fallback: no WhatsApp configured → go straight to order confirmation page
      router.push(`/orders/${data.orderId}`);
    } catch {
      setSubmitError("خطأ في الاتصال، حاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  };

  if (previewLoading && !preview) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Spinner size="lg" />
        <p className="text-gray-500 font-cairo text-sm">جار حساب التفاصيل...</p>
      </div>
    );
  }

  if (previewError && !preview) {
    return (
      <div className="rounded bg-red-50 border border-danger px-4 py-4 text-danger font-cairo text-sm text-center">
        {previewError}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold font-cairo text-gray-900">تأكيد الطلب</h2>
        <p className="text-sm text-gray-500 font-cairo mt-1">الخطوة 2 من 2</p>
      </div>

      {/* Points earn banner */}
      {(preview?.pointsToEarn ?? pointsToEarn) > 0 && (
        <div className="bg-primary/10 rounded py-2 px-3 text-center font-cairo text-sm text-primary font-semibold">
          🏆 أتمم طلبك واكسب {preview?.pointsToEarn ?? pointsToEarn} نقطة!
        </div>
      )}

      {/* Order summary */}
      {preview && (
        <div className="rounded-lg border border-gray-200 bg-surface p-4 space-y-2 font-cairo text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">المجموع الفرعي</span>
            <span className="font-medium">{preview.subtotal.toFixed(2)} ج.م</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">رسوم التوصيل</span>
            <span className="font-medium">{preview.deliveryFee.toFixed(2)} ج.م</span>
          </div>
          {preview.discount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>خصم</span>
              <span className="font-medium">- {preview.discount.toFixed(2)} ج.م</span>
            </div>
          )}
          <Divider />
          <div className="flex justify-between text-base font-bold">
            <span>الإجمالي</span>
            <span className="text-primary">{preview.total.toFixed(2)} ج.م</span>
          </div>
        </div>
      )}

      {/* Loyalty redeem — only when ≥ 100 points */}
      {currentPoints >= 100 && (
        <label className="flex items-center gap-3 cursor-pointer rounded border border-primary/30 bg-primary/5 px-3 py-3 font-cairo">
          <input
            type="checkbox"
            checked={redeemPoints}
            onChange={(e) => handleRedeemToggle(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            disabled={previewLoading}
          />
          <span className="text-sm text-gray-800">
            استخدم <strong>{currentPoints}</strong> نقطة كخصم إضافي
          </span>
        </label>
      )}

      {/* Payment method */}
      <div>
        <p className="text-sm font-semibold text-gray-700 font-cairo mb-2">طريقة الدفع</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setPaymentMethod(method)}
              className={[
                "flex flex-col items-center justify-center rounded border p-3 text-sm font-cairo transition-all",
                paymentMethod === method
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-gray-300 text-gray-700 hover:border-primary",
              ].join(" ")}
            >
              {PAYMENT_LABELS[method]}
            </button>
          ))}
        </div>
      </div>

      {submitError && (
        <div
          className="rounded bg-red-50 border border-danger px-3 py-2 text-sm text-danger font-cairo"
          role="alert"
        >
          {submitError}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={submitting}
        className="w-full"
      >
        تأكيد الطلب
      </Button>
    </form>
  );
}
