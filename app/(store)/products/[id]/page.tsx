import { cache } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct } from "@/lib/services/product.service";
import ReviewStars from "@/components/molecules/ReviewStars";
import StockBadge from "@/components/molecules/StockBadge";
import PriceDisplay from "@/components/molecules/PriceDisplay";
import ProductDetailClient from "@/components/organisms/ProductDetailClient";
import ReviewForm from "@/components/organisms/ReviewForm";

const getCachedProduct = cache(getProduct);

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getCachedProduct(Number(id));
  if (!product) return { title: "المنتج غير موجود" };

  return {
    title: product.name,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      images: product.images[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (Number.isNaN(numericId) || numericId <= 0) notFound();

  const product = await getCachedProduct(numericId);

  if (!product || !product.isActive) notFound();

  // T083: ReviewForm is shown only to customers who have an active session.
  // The API itself enforces the verified-purchase gate.
  const cookieStore = await cookies();
  const hasSession = cookieStore.has("customer_session");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {/* Images + Actions (Client) */}
      <div>
        <ProductDetailClient product={product} />
      </div>

      {/* Product info */}
      <div className="flex flex-col gap-4 font-cairo">
        <div>
          <p className="text-xs text-gray-400 mb-1">{product.category}</p>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        </div>

        <ReviewStars
          averageRating={product.avgRating}
          count={product.reviewCount}
          size={18}
        />

        <PriceDisplay
          price={product.price}
          oldPrice={product.oldPrice}
          className="text-xl"
        />

        <StockBadge stock={product.stock} />

        {product.description && (
          <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </div>
        )}

        {/* Reviews */}
        {product.reviews.length > 0 && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <h2 className="font-bold text-base mb-3">آراء العملاء</h2>
            <ul className="space-y-3">
              {product.reviews.slice(0, 5).map((review) => (
                <li key={review.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <ReviewStars averageRating={review.rating} size={14} />
                    <span className="text-xs text-gray-500">
                      {review.customer.name}
                    </span>
                    <span className="text-xs text-gray-300">
                      {new Date(review.createdAt).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* T083: Review form — only for customers with an active session */}
        {hasSession && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <ReviewForm productId={numericId} />
          </div>
        )}
      </div>
    </div>
  );
}
