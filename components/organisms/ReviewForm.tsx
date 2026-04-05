"use client";

import { useState } from "react";
import StarIcon from "@/components/atoms/StarIcon";
import Button from "@/components/atoms/Button";

interface ReviewFormProps {
  productId: number;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("اختر تقييمك أولاً");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "حدث خطأ");
        return;
      }

      setSuccess(true);
    } catch {
      setError("خطأ في الاتصال، حاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center font-cairo">
        <p className="text-green-800 font-semibold text-lg">شكراً لتقييمك! ⭐</p>
        <p className="text-green-700 text-sm mt-1">ربحت 20 نقطة! 🏆</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 font-cairo">
      <h3 className="text-lg font-bold text-gray-900">شاركنا رأيك</h3>

      {/* Star rating */}
      <div className="flex gap-1" role="radiogroup" aria-label="التقييم">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 cursor-pointer"
            aria-label={`${star} نجمة`}
          >
            <StarIcon
              filled={star <= (hovered || rating)}
              size={28}
            />
          </button>
        ))}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="اكتب تعليقك (اختياري)"
        maxLength={500}
        rows={3}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary resize-none"
        dir="rtl"
      />

      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="md"
        loading={submitting}
      >
        إرسال التقييم
      </Button>
    </form>
  );
}
