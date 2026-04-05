"use client";

import { useState, useCallback } from "react";
import { ShoppingCart } from "lucide-react";
import StoreLayout from "@/components/templates/StoreLayout";
import CartDrawer from "@/components/organisms/CartDrawer";
import CheckoutStep1 from "@/components/organisms/CheckoutStep1";
import CheckoutStep2 from "@/components/organisms/CheckoutStep2";
import { useCartStore } from "@/lib/cart";
import type { IStoreSettings } from "@/lib/interfaces";

interface StoreClientWrapperProps {
  children: React.ReactNode;
  settings: IStoreSettings | null;
}

type CheckoutState =
  | { step: "cart" }
  | {
      step: "step1";
    }
  | {
      step: "step2";
      customerId: number;
      addressId: number;
      currentPoints: number;
      pointsToEarn: number;
    };

export default function StoreClientWrapper({
  children,
  settings,
}: StoreClientWrapperProps) {
  const { items } = useCartStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkout, setCheckout] = useState<CheckoutState>({ step: "cart" });

  const openCart = useCallback(() => {
    setCheckout({ step: "cart" });
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setCheckout({ step: "cart" });
  }, []);

  const handleCheckout = useCallback(() => {
    setCheckout({ step: "step1" });
  }, []);

  const handleStep1Success = useCallback(
    (data: {
      customerId: number;
      addressId: number;
      currentPoints: number;
      pointsToEarn: number;
    }) => {
      setCheckout({
        step: "step2",
        customerId: data.customerId,
        addressId: data.addressId,
        currentPoints: data.currentPoints,
        pointsToEarn: data.pointsToEarn,
      });
    },
    []
  );

  const cartTrigger = (
    <button
      onClick={openCart}
      className="relative flex items-center gap-1 rounded-full p-2 hover:bg-gray-100 transition-colors"
      aria-label={`السلة — ${items.length} منتج`}
    >
      <ShoppingCart size={22} className="text-gray-700" />
      {items.length > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground font-bold">
          {items.length > 9 ? "9+" : items.length}
        </span>
      )}
    </button>
  );

  return (
    <StoreLayout
      cartTrigger={cartTrigger}
      settings={settings}
    >
      {children}

      {/* Cart / Checkout drawer */}
      <CartDrawer
        open={drawerOpen && checkout.step === "cart"}
        onClose={closeDrawer}
        onCheckout={handleCheckout}
      />

      {/* Checkout Step 1 modal */}
      {drawerOpen && checkout.step === "step1" && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white shadow-2xl p-6 max-h-[92vh] overflow-y-auto sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:w-full sm:max-w-md">
            <CheckoutStep1
              onSuccess={(data) => handleStep1Success(data)}
            />
          </div>
        </>
      )}

      {/* Checkout Step 2 modal */}
      {drawerOpen && checkout.step === "step2" && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white shadow-2xl p-6 max-h-[92vh] overflow-y-auto sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:w-full sm:max-w-md">
            <CheckoutStep2
              addressId={checkout.addressId}
              currentPoints={checkout.currentPoints}
              pointsToEarn={checkout.pointsToEarn}
            />
          </div>
        </>
      )}
    </StoreLayout>
  );
}
