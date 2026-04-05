"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/cart";
import type { CartItem as CartItemType } from "@/lib/cart";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="relative h-16 w-16 flex-shrink-0 rounded overflow-hidden bg-gray-50">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-200" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 font-cairo truncate">
          {item.name}
        </p>
        {item.variant && (
          <p className="text-xs text-gray-500 font-cairo">{item.variant}</p>
        )}
        <p className="text-sm font-bold text-primary font-cairo mt-0.5">
          {(item.price * item.quantity).toFixed(2)} ج.م
        </p>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() =>
            updateQuantity(item.productId, item.variantOptionId, item.quantity - 1)
          }
          className="h-6 w-6 rounded flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition-colors"
          aria-label="تقليل الكمية"
        >
          <Minus size={12} />
        </button>
        <span className="w-6 text-center text-sm font-cairo">{item.quantity}</span>
        <button
          onClick={() =>
            updateQuantity(item.productId, item.variantOptionId, item.quantity + 1)
          }
          className="h-6 w-6 rounded flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition-colors"
          aria-label="زيادة الكمية"
        >
          <Plus size={12} />
        </button>
        <button
          onClick={() => removeItem(item.productId, item.variantOptionId)}
          className="h-6 w-6 rounded flex items-center justify-center text-danger hover:bg-red-50 transition-colors ml-1"
          aria-label="إزالة من السلة"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
