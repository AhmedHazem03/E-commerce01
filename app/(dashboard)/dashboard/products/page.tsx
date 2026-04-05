"use client";
// app/(dashboard)/products/page.tsx
// Product list with "أضف منتج" button that opens ProductForm in a modal.

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import Button from "@/components/atoms/Button";
import Spinner from "@/components/atoms/Spinner";
import ProductForm from "@/components/organisms/ProductForm";
import type { ProductFormData } from "@/components/organisms/ProductForm";

interface ProductRow {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  isActive: boolean;
  images: { url: string; isMain: boolean }[];
}

interface ApiProduct {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  isActive: boolean;
  images: { url: string; isMain: boolean }[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Partial<ProductFormData> | undefined>(undefined);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?limit=100");
      const data = (await res.json()) as { products: ApiProduct[] };
      setProducts(data.products ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openAdd() {
    setEditProduct(undefined);
    setModalOpen(true);
  }

  function openEdit(p: ProductRow) {
    setEditProduct({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      category: p.category,
      images: p.images,
    });
    setModalOpen(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("هل تريد حذف هذا المنتج؟")) return;
    setDeleting(id);
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      await load();
    } finally {
      setDeleting(null);
    }
  }

  const mainImage = (p: ProductRow) =>
    p.images.find((i) => i.isMain)?.url ?? p.images[0]?.url ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[--text]">المنتجات</h2>
        <Button variant="primary" onClick={openAdd}>
          <PlusCircle size={16} className="ml-1" />
          أضف منتج
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[--surface] bg-white">
          <table className="w-full text-sm text-right">
            <thead className="bg-[--surface] text-[--text-muted]">
              <tr>
                <th className="px-4 py-3 font-medium w-16">صورة</th>
                <th className="px-4 py-3 font-medium">الاسم</th>
                <th className="px-4 py-3 font-medium">الفئة</th>
                <th className="px-4 py-3 font-medium">السعر</th>
                <th className="px-4 py-3 font-medium">المخزون</th>
                <th className="px-4 py-3 font-medium">الحالة</th>
                <th className="px-4 py-3 font-medium w-24">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const img = mainImage(p);
                return (
                  <tr key={p.id} className="border-t border-[--surface] hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {img ? (
                        <Image
                          src={img}
                          alt={p.name}
                          width={40}
                          height={40}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-[--text-muted]">{p.category}</td>
                    <td className="px-4 py-3 font-semibold">{p.price.toLocaleString("ar-EG")} ج.م</td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {p.isActive ? "نشط" : "مخفي"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-gray-400 hover:text-[--primary] transition-colors"
                          title="تعديل"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting === p.id}
                          className="text-gray-400 hover:text-[--danger] transition-colors disabled:opacity-40"
                          title="حذف"
                        >
                          {deleting === p.id ? <Spinner size="sm" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[--text-muted]">
                    لا توجد منتجات حتى الآن
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ProductForm Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-bold mb-5">
              {editProduct?.id ? "تعديل المنتج" : "إضافة منتج جديد"}
            </h3>
            <ProductForm
              initial={editProduct}
              onSuccess={() => {
                setModalOpen(false);
                load();
              }}
              onCancel={() => setModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
