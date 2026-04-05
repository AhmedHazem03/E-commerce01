"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";

interface CheckoutStep1Props {
  onSuccess: (data: {
    customerId: number;
    name: string;
    phone: string;
    addressId: number;
    currentPoints: number;
    pointsToEarn: number;
  }) => void;
}

interface FieldErrors {
  phone?: string;
  name?: string;
  address?: string;
  general?: string;
}

export default function CheckoutStep1({ onSuccess }: CheckoutStep1Props) {
  const { getSubtotal } = useCartStore();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("المتصفح لا يدعم تحديد الموقع");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ar`,
            { headers: { "User-Agent": "ecommerce-store/1.0" } }
          );
          if (!res.ok) throw new Error();
          const data = await res.json();
          const parts = [
            data.address?.road,
            data.address?.suburb,
            data.address?.neighbourhood,
            data.address?.city ?? data.address?.town ?? data.address?.village,
            data.address?.state,
          ].filter(Boolean);
          setAddress(parts.join("، ") || data.display_name || "");
        } catch {
          setGpsError("تعذر تحويل الموقع إلى عنوان");
        } finally {
          setGpsLoading(false);
        }
      },
      () => {
        setGpsError("لم يتم السماح بالوصول للموقع");
        setGpsLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};
    if (!/^01[0-9]{9}$/.test(phone)) {
      newErrors.phone = "رقم هاتف غير صحيح (يجب أن يبدأ بـ 01 ويتكون من 11 رقم)";
    }
    if (!name.trim()) {
      newErrors.name = "الاسم مطلوب";
    }
    if (!address.trim()) {
      newErrors.address = "عنوان التوصيل مطلوب";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          name: name.trim(),
          address: address.trim() || undefined,
          cartSubtotal: getSubtotal(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrors({ general: data.error ?? "حدث خطأ، حاول مرة أخرى" });
        return;
      }

      const data = await res.json();
      onSuccess({
        customerId: data.id,
        name: data.name,
        phone: data.phone,
        addressId: data.addressId,
        currentPoints: data.currentPoints,
        pointsToEarn: data.pointsToEarn,
      });
    } catch {
      setErrors({ general: "حدث خطأ في الاتصال، حاول مرة أخرى" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold font-cairo text-gray-900">بيانات التوصيل</h2>
        <p className="text-sm text-gray-500 font-cairo mt-1">الخطوة 1 من 2</p>
      </div>

      <Input
        label="رقم الهاتف"
        type="tel"
        inputMode="numeric"
        placeholder="01xxxxxxxxx"
        value={phone}
        onChange={(e) => setPhone(e.target.value.trim())}
        error={errors.phone}
        required
      />

      <Input
        label="الاسم"
        type="text"
        placeholder="اسمك الكامل"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
      />

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold font-cairo text-gray-700">
            عنوان التوصيل <span className="text-danger">*</span>
          </label>
          <button
            type="button"
            onClick={detectLocation}
            disabled={gpsLoading}
            className="flex items-center gap-1 text-xs text-primary font-cairo font-medium hover:underline disabled:opacity-50"
          >
            {gpsLoading ? (
              <>
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                جارٍ التحديد...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                تحديد موقعي تلقائياً
              </>
            )}
          </button>
        </div>
        <Input
          type="text"
          placeholder="المنطقة، الشارع، رقم المبنى..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          error={errors.address}
          required
        />
        {gpsError && (
          <p className="text-xs text-danger font-cairo">{gpsError}</p>
        )}
      </div>

      {errors.general && (
        <div className="rounded bg-red-50 border border-danger px-3 py-2 text-sm text-danger font-cairo" role="alert">
          {errors.general}
        </div>
      )}

      <div className="text-center text-sm text-primary font-cairo font-medium bg-primary/10 rounded py-2 px-3">
        🏆 أتمم طلبك واكسب نقاط مكافأة!
      </div>

      <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
        التالي — اختر طريقة الدفع
      </Button>
    </form>
  );
}
