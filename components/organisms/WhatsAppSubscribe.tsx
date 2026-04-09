"use client";

import { useState } from "react";

interface Props {
  discountPercent: number;
  title: string;
}

export default function WhatsAppSubscribe({ discountPercent, title }: Props) {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg(""); 
    

    try {
      const res = await fetch("/api/whatsapp-subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        const data = (await res.json()) as { error?: string };
        setErrorMsg(data.error ?? "حدث خطأ");
        setStatus("error");
      }
    } catch {
      setErrorMsg("تحقق من اتصال الإنترنت وحاول مرة أخرى");
      setStatus("error");
    }
  }

  return (
    <section
      className="w-full py-16 px-4 bg-gradient-to-br from-plum/8 via-warm-bg to-gold/8"
      dir="rtl"
    >
      <div className="mx-auto max-w-xl text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-[#25D366] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="white" className="w-9 h-9" aria-hidden="true">
            <path d="M16.002 3C9.374 3 4 8.373 4 15.001c0 2.126.558 4.115 1.53 5.845L4 29l8.38-1.505A12.003 12.003 0 0016.002 28c6.627 0 12-5.373 12-12.001C28.002 8.373 22.63 3 16.002 3zm6.308 16.467c-.265.742-1.538 1.415-2.098 1.464-.56.048-1.09.265-3.673-.765-3.1-1.24-5.08-4.438-5.233-4.643-.154-.205-1.24-1.65-1.24-3.148 0-1.5.787-2.237 1.065-2.544.278-.308.607-.385.81-.385.205 0 .41.002.59.01.189.008.444-.072.695.53.257.616.876 2.13.953 2.286.077.154.128.335.026.539-.103.205-.154.333-.308.513-.153.179-.322.4-.46.537-.154.153-.314.318-.135.624.18.307.8 1.32 1.716 2.137 1.179 1.05 2.172 1.374 2.48 1.528.307.154.485.128.664-.077.18-.205.769-.897 1.974-.897 0 0 .282.01.42.075.154.072 2.08.98 2.08.98s.364.153.41.435c.056.334-.206 1.08-.535 1.845z" />
          </svg>
        </div>

        <h2 className="font-cairo font-black text-ink text-2xl md:text-3xl mb-2">
          {title}
        </h2>
        <p className="font-cairo text-ink/60 text-sm mb-8">
          سجّلي رقمك واحصلي على كود خصم {discountPercent}٪ عبر الواتساب
        </p>

        {status === "success" ? (
          <div className="bg-green-50 border border-green-300 rounded-2xl p-6">
            <span className="text-3xl">🎉</span>
            <p className="font-cairo font-bold text-green-700 mt-2 text-lg">
              تم التسجيل بنجاح!
            </p>
            <p className="font-cairo text-green-600 text-sm mt-1">
              هيوصلك كود الخصم على الواتساب في أقرب وقت ✓
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="tel"
              placeholder="01xxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              inputMode="numeric"
              className="flex-1 rounded-full border border-walnut/20 bg-white px-5 py-3.5 text-right font-cairo text-sm placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-plum shadow-sm"
              dir="ltr"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-full bg-[#25D366] text-white font-cairo font-bold px-7 py-3.5 hover:bg-[#20ba58] transition-all duration-300 hover:scale-105 shadow-md disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
            >
              {status === "loading" ? "جارٍ التسجيل..." : "احصلي على الخصم"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="font-cairo text-red-600 text-sm mt-3">{errorMsg}</p>
        )}

        <p className="font-cairo text-ink/40 text-xs mt-4">
          لن نرسل لك أي رسائل مزعجة — فقط أفضل العروض
        </p>
      </div>
    </section>
  );
}
