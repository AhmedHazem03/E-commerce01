import Image from "next/image";
import Link from "next/link";
import PriceDisplay from "@/components/molecules/PriceDisplay";
import ReviewStars from "@/components/molecules/ReviewStars";
import StockBadge from "@/components/molecules/StockBadge";
import type { ProductListItem } from "@/lib/services/product.service";

interface ProductCardProps {
  product: ProductListItem;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const mainImage = product.images.find((img) => img.isMain) ?? product.images[0];

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col rounded-2xl overflow-hidden border border-walnut/15 hover:border-walnut/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-surface"
      dir="rtl"
    >
      {/* Image */}
      <div className="relative aspect-square w-full bg-warm-bg overflow-hidden">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full bg-walnut/10 flex items-center justify-center">
            <span className="text-walnut/40 font-cairo text-sm">لا توجد صورة</span>
          </div>
        )}
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-walnut/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-4">
        <p className="font-cairo font-semibold text-ink text-sm line-clamp-2 leading-snug">
          {product.name}
        </p>
        <ReviewStars averageRating={product.avgRating} count={product.reviewCount} />
        <div className="flex items-center justify-between flex-wrap gap-1 mt-1">
          <PriceDisplay price={product.price} oldPrice={product.oldPrice} />
          <StockBadge stock={product.stock} />
        </div>
      </div>
    </Link>
  );
}
