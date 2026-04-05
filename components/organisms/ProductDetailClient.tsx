"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import type { ProductDetail } from "@/lib/services/product.service";
import type { ProductVariant } from "@/lib/interfaces";
import VariantSelector from "@/components/molecules/VariantSelector";
import { useCartStore } from "@/lib/cart";
import Button from "@/components/atoms/Button";

interface ProductDetailClientProps {
  product: ProductDetail;
  onAddToCart?: () => void;
}

export default function ProductDetailClient({
  product,
  onAddToCart,
}: ProductDetailClientProps) {
  const { addItem } = useCartStore();
  const [selected, setSelected] = useState<Record<number, number>>(() => {
    const init: Record<number, number> = {};
    product.variants.forEach((v) => {
      const first = v.options.find((o) => o.stock > 0);
      if (first) init[v.id] = first.id;
    });
    return init;
  });
  const [added, setAdded] = useState(false);

  const handleVariantChange = (variantId: number, optionId: number) => {
    setSelected((prev) => ({ ...prev, [variantId]: optionId }));
  };

  const handleAddToCart = () => {
    const hasVariants = product.variants.length > 0;
    if (hasVariants) {
      // Check all variants have a selection
      const allSelected = product.variants.every((v) => selected[v.id] !== undefined);
      if (!allSelected) return;
    }

    // Build variant label from all selected options
    const selectedOptionId = product.variants.length === 1
      ? selected[product.variants[0].id]
      : undefined;

    const variantLabel = product.variants
      .map((v) => {
        const optionId = selected[v.id];
        return v.options.find((o) => o.id === optionId)?.value;
      })
      .filter(Boolean)
      .join(" / ") || undefined;

    addItem({
      productId: product.id,
      variantOptionId: selectedOptionId,
      name: product.name,
      image: product.images.find((img) => img.isMain)?.url ?? product.images[0]?.url ?? "",
      price: product.price,
      quantity: 1,
      variant: variantLabel,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    onAddToCart?.();
  };

  const images = product.images.length > 0 ? product.images : [];

  return (
    <div>
      {/* Image Gallery */}
      {images.length > 1 ? (
        <Swiper
          modules={[Navigation]}
          navigation
          loop
          className="rounded-xl overflow-hidden mb-4"
        >
          {images.map((img, i) => (
            <SwiperSlide key={i}>
              <div className="relative aspect-square w-full">
                <Image
                  src={img.url}
                  alt={`${product.name} — صورة ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  priority={i === 0}
                  className="object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : images.length === 1 ? (
        <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 bg-gray-50">
          <Image
            src={images[0].url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            priority
            className="object-cover"
          />
        </div>
      ) : (
        <div className="aspect-square w-full rounded-xl bg-gray-200 mb-4 flex items-center justify-center">
          <span className="text-gray-400 font-cairo">لا توجد صورة</span>
        </div>
      )}

      {/* Variant selector */}
      {product.variants.length > 0 && (
        <div className="mb-4">
          <VariantSelector
            variants={product.variants as ProductVariant[]}
            selected={selected}
            onChange={handleVariantChange}
          />
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={handleAddToCart}
        disabled={added}
      >
        {added ? "✓ أُضيف للسلة" : "أضف للسلة 🛒"}
      </Button>
    </div>
  );
}
