"use client";

import { useEffect, useRef } from "react";
import { ShoppingCart, X } from "lucide-react";
import { useCartStore } from "@/lib/cart";
import CartItem from "@/components/molecules/CartItem";
import Button from "@/components/atoms/Button";
import Divider from "@/components/atoms/Divider";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartDrawer({ open, onClose, onCheckout }: CartDrawerProps) {
  const { items, getSubtotal, clearCart } = useCartStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Remember subtotal for abandon cart beacon
  useEffect(() => {
    if (open) return;
    // When drawer closes, could trigger abandon cart beacon — handled at parent
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="سلة التسوق"
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-primary" />
            <h2 className="text-lg font-bold font-cairo text-gray-900">سلة التسوق</h2>
            {items.length > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground font-bold">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-gray-100 transition-colors"
            aria-label="إغلاق السلة"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
              <ShoppingCart size={48} className="text-gray-300" />
              <p className="text-gray-400 font-cairo text-center">
                سلتك فارغة
                <br />
                <span className="text-sm">أضف منتجات لتبدأ التسوق</span>
              </p>
            </div>
          ) : (
            <div className="py-2">
              {items.map((item) => (
                <CartItem
                  key={`${item.productId}-${item.variantOptionId ?? "base"}`}
                  item={item}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-4 space-y-3">
            {/* Coupon — hidden behind collapsible */}
            <details className="group">
              <summary className="cursor-pointer text-sm text-primary font-cairo font-medium list-none flex items-center gap-1 select-none">
                <span className="group-open:hidden">+ إضافة كوبون خصم</span>
                <span className="hidden group-open:block">- إخفاء الكوبون</span>
              </summary>
              <div className="mt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="أدخل كود الخصم"
                    dir="rtl"
                    className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm font-cairo focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button className="px-3 py-2 rounded bg-primary text-primary-foreground text-sm font-cairo hover:opacity-90 transition-opacity">
                    تطبيق
                  </button>
                </div>
              </div>
            </details>

            <Divider />

            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-gray-700 font-cairo">المجموع</span>
              <span className="text-lg font-bold text-primary font-cairo">
                {getSubtotal().toFixed(2)} ج.م
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={onCheckout}
            >
              إتمام الطلب 🛍️
            </Button>

            <button
              onClick={clearCart}
              className="w-full text-center text-xs text-gray-400 hover:text-danger font-cairo transition-colors"
            >
              إفراغ السلة
            </button>
          </div>
        )}
      </div>
    </>
  );
}
