"use client";
// app/login/page.tsx
// Admin login page — POST /api/auth/login → redirect to /dashboard/orders.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Spinner from "@/components/atoms/Spinner";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      if (res.ok) {
        router.push("/dashboard/orders");
        return;
      }

      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "بيانات الدخول غير صحيحة");
    } catch {
      setError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[--surface] flex items-center justify-center px-4 font-cairo"
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8 flex flex-col gap-6">
        {/* Brand */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[--primary]">لوحة التحكم</h1>
          <p className="text-sm text-[--text-muted] mt-1">أدخل بياناتك لتسجيل الدخول</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="رقم الهاتف"
            type="tel"
            placeholder="01xxxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <Input
            label="كلمة المرور"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? <Spinner size="sm" /> : "تسجيل الدخول"}
          </Button>
        </form>
      </div>
    </div>
  );
}
