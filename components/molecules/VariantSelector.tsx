"use client";

import type { VariantOption, ProductVariant } from "@/lib/interfaces";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selected: Record<number, number>;
  onChange: (variantId: number, optionId: number) => void;
}

export default function VariantSelector({
  variants,
  selected,
  onChange,
}: VariantSelectorProps) {
  return (
    <div className="flex flex-col gap-4">
      {variants.map((variant) => (
        <div key={variant.id}>
          <p className="text-sm font-semibold text-gray-700 font-cairo mb-2">
            {variant.name}
          </p>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option: VariantOption) => {
              const isSelected = selected[variant.id] === option.id;
              const isOutOfStock = option.stock === 0;

              return (
                <button
                  key={option.id}
                  disabled={isOutOfStock}
                  onClick={() => onChange(variant.id, option.id)}
                  className={[
                    "px-3 py-1.5 rounded border text-sm font-cairo transition-all",
                    isOutOfStock
                      ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                      : isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-gray-300 text-gray-700 hover:border-primary",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-pressed={isSelected}
                  aria-disabled={isOutOfStock}
                >
                  {option.value}
                  {isOutOfStock && " (نفد)"}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
