"use client";
// components/organisms/ProductForm.tsx
// Create / edit product form used inside the admin dashboard.
// Supports dynamic variant rows + Cloudinary image upload.

import { useState, useRef } from "react";
import Image from "next/image";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Spinner from "@/components/atoms/Spinner";
import { PlusCircle, Trash2, Upload } from "lucide-react";

interface VariantOption {
  value: string;
  stock: number;
}

interface Variant {
  name: string;
  options: VariantOption[];
}

interface ProductImage {
  url: string;
  isMain: boolean;
}

export interface ProductFormData {
  id?: number;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  stock: number;
  category: string;
  images: ProductImage[];
  variants: Variant[];
}

interface ProductFormProps {
  initial?: Partial<ProductFormData>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CATEGORIES = ["فساتين", "عبايات", "بلوزات", "بناطيل", "جاكيتات", "تنانير"];

export default function ProductForm({ initial, onSuccess, onCancel }: ProductFormProps) {
  const isEditing = Boolean(initial?.id);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [oldPrice, setOldPrice] = useState(String(initial?.oldPrice ?? ""));
  const [stock, setStock] = useState(String(initial?.stock ?? "0"));
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0]);
  const [images, setImages] = useState<ProductImage[]>(initial?.images ?? []);
  const [variants, setVariants] = useState<Variant[]>(initial?.variants ?? []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ─── Image upload via Cloudinary unsigned preset ───────────────────────────
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !preset) {
      setError("إعدادات Cloudinary غير مكتملة — تحقق من متغيرات البيئة");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", preset);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`${res.status}: ${errText}`);
      }
      const data = (await res.json()) as { secure_url: string };
      setImages((prev) => [
        ...prev,
        { url: data.secure_url, isMain: prev.length === 0 },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل رفع الصورة، حاول مرة أخرى");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeImage(idx: number) {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      // ensure at least one isMain
      if (next.length > 0 && !next.some((img) => img.isMain)) {
        next[0].isMain = true;
      }
      return next;
    });
  }

  function setMain(idx: number) {
    setImages((prev) => prev.map((img, i) => ({ ...img, isMain: i === idx })));
  }

  // ─── Variant helpers ────────────────────────────────────────────────────────
  function addVariant() {
    setVariants((prev) => [...prev, { name: "", options: [{ value: "", stock: 0 }] }]);
  }

  function removeVariant(vi: number) {
    setVariants((prev) => prev.filter((_, i) => i !== vi));
  }

  function updateVariantName(vi: number, name: string) {
    setVariants((prev) => prev.map((v, i) => (i === vi ? { ...v, name } : v)));
  }

  function addOption(vi: number) {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === vi ? { ...v, options: [...v.options, { value: "", stock: 0 }] } : v
      )
    );
  }

  function removeOption(vi: number, oi: number) {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === vi ? { ...v, options: v.options.filter((_, j) => j !== oi) } : v
      )
    );
  }

  function updateOption(vi: number, oi: number, field: keyof VariantOption, val: string) {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === vi
          ? {
              ...v,
              options: v.options.map((opt, j) =>
                j === oi
                  ? { ...opt, [field]: field === "stock" ? Number(val) : val }
                  : opt
              ),
            }
          : v
      )
    );
  }

  // ─── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const body = {
      name,
      description,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      stock: Number(stock),
      category,
      images,
      variants,
    };

    try {
      const url = isEditing ? `/api/products/${initial!.id}` : "/api/products";
      const method = isEditing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "حدث خطأ");
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Basic info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="اسم المنتج"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[--text]">الفئة</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[--primary]"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[--text]">الوصف</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[--primary] resize-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="السعر (ج.م)"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <Input
          label="السعر القديم (اختياري)"
          type="number"
          min="0"
          step="0.01"
          value={oldPrice}
          onChange={(e) => setOldPrice(e.target.value)}
        />
        <Input
          label="المخزون"
          type="number"
          min="0"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
        />
      </div>

      {/* Images */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[--text]">الصور</label>
        <div className="flex flex-wrap gap-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={img.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
                {!img.isMain && (
                  <button
                    type="button"
                    onClick={() => setMain(idx)}
                    className="text-white text-[10px] bg-[--primary] rounded px-1"
                  >
                    رئيسية
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="text-white"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {img.isMain && (
                <span className="absolute bottom-0 right-0 bg-[--primary] text-white text-[10px] px-1 rounded-tl">
                  رئيسية
                </span>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-[--primary] hover:text-[--primary] transition-colors"
          >
            {uploading ? <Spinner size="sm" /> : <Upload size={20} />}
            <span className="text-[10px]">رفع</span>
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      {/* Variants */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[--text]">الأحجام / الألوان (اختياري)</label>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1 text-[--primary] text-sm hover:underline"
          >
            <PlusCircle size={16} />
            أضف متغير
          </button>
        </div>

        {variants.map((variant, vi) => (
          <div key={vi} className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Input
                label="اسم المتغير (مثال: المقاس)"
                value={variant.name}
                onChange={(e) => updateVariantName(vi, e.target.value)}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeVariant(vi)}
                className="text-[--danger] mt-6"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {variant.options.map((opt, oi) => (
              <div key={oi} className="flex items-end gap-2">
                <Input
                  label="القيمة (مثال: S)"
                  value={opt.value}
                  onChange={(e) => updateOption(vi, oi, "value", e.target.value)}
                  className="flex-1"
                />
                <Input
                  label="المخزون"
                  type="number"
                  min="0"
                  value={String(opt.stock)}
                  onChange={(e) => updateOption(vi, oi, "stock", e.target.value)}
                  className="w-24"
                />
                <button
                  type="button"
                  onClick={() => removeOption(vi, oi)}
                  disabled={variant.options.length === 1}
                  className="text-gray-400 hover:text-[--danger] disabled:opacity-30 mb-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addOption(vi)}
              className="text-sm text-[--primary] hover:underline self-start"
            >
              + أضف خيار
            </button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            إلغاء
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? <Spinner size="sm" /> : isEditing ? "حفظ التعديلات" : "إضافة المنتج"}
        </Button>
      </div>
    </form>
  );
}
