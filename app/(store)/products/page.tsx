import { Suspense } from "react";
import Link from "next/link";
import ProductGrid from "@/components/organisms/ProductGrid";
import ProductGridSkeleton from "@/components/organisms/ProductGridSkeleton";
import { getProducts } from "@/lib/services/product.service";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "المنتجات",
  description: "تصفح جميع منتجاتنا",
};

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; page?: string; q?: string; sort?: string }>;
}

async function ProductList({
  category,
  page,
  search,
  sortBy,
}: {
  category?: string;
  page?: number;
  search?: string;
  sortBy?: "newest" | "sold";
}) {
  const { products, total } = await getProducts({ category, page, limit: 20, search, sortBy });

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center" dir="rtl">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-xl font-bold font-cairo text-gray-700 mb-2">
          {search ? `لا توجد نتائج لـ "${search}"` : "لا توجد منتجات"}
        </p>
        <p className="text-sm text-gray-400 font-cairo mb-6">
          {search ? "جربي كلمة بحث أخرى أو تصفحي كل المنتجات" : "لم يتم إضافة منتجات بعد"}
        </p>
        {search && (
          <Link
            href="/products"
            className="px-5 py-2.5 rounded-xl bg-plum text-white text-sm font-bold font-cairo hover:bg-plum/90 transition-all"
          >
            عرض كل المنتجات
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      {search && (
        <p className="text-sm text-gray-500 font-cairo mb-4" dir="rtl">
          {total} نتيجة لـ{" "}
          <span className="font-bold text-ink">&ldquo;{search}&rdquo;</span>
        </p>
      )}
      <ProductGrid products={products} />
    </>
  );
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category;
  const page = params.page ? Number(params.page) : 1;
  const search = params.q?.trim() || undefined;
  const sortBy = params.sort === "sold" ? "sold" : "newest";

  const title = search
    ? `نتائج البحث: "${search}"`
    : category
      ? category
      : "جميع المنتجات";

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold font-cairo text-gray-900">{title}</h1>
        {search && (
          <Link
            href="/products"
            className="text-xs font-cairo text-plum hover:underline underline-offset-2"
          >
            ✕ إلغاء البحث
          </Link>
        )}
      </div>

      <Suspense key={`${search}-${category}-${page}`} fallback={<ProductGridSkeleton />}>
        <ProductList category={category} page={page} search={search} sortBy={sortBy} />
      </Suspense>
    </div>
  );
}
