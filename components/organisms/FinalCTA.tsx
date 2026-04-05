import Link from "next/link";

export default function FinalCTA() {
  return (
    <section
      className="w-full bg-walnut text-warm-bg text-center py-24 px-6"
      dir="rtl"
    >
      {/* Urgency badge */}
      <div className="inline-block bg-gold text-ink text-xs font-cairo font-bold px-4 py-1.5 rounded-full mb-6 animate-bounce [animation-iteration-count:3] shadow-sm">
        🔥 الكميات تنفد بسرعة
      </div>
      <h2 className="font-cairo font-black text-4xl md:text-5xl mb-3 leading-tight">
        لا تفوت الكولكشن الجديد
      </h2>
      <p className="font-cairo text-lg mt-2 mb-10 opacity-80 max-w-md mx-auto">
        الكميات محدودة — اطلب دلوقتي واستلم في أسرع وقت
      </p>
      <Link
        href="/products"
        className="inline-block rounded-full bg-gold text-ink font-cairo font-bold text-lg px-12 py-4 hover:bg-warm-bg hover:text-walnut hover:scale-105 transition-all duration-300 shadow-lg"
      >
        تسوق الآن
      </Link>
    </section>
  );
}
