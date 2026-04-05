import { Truck, Banknote, RotateCcw, Gift } from "lucide-react";

const trustItems = [
  {
    icon: Truck,
    label: "شحن سريع",
    desc: "توصيل لكل مكان في مصر",
    color: "text-plum",
    bg: "bg-plum/10",
  },
  {
    icon: Banknote,
    label: "دفع عند الاستلام",
    desc: "ادفع لما تشوف منتجك",
    color: "text-walnut",
    bg: "bg-walnut/10",
  },
  {
    icon: RotateCcw,
    label: "إرجاع سهل",
    desc: "خلال 14 يوم بدون شروط",
    color: "text-plum",
    bg: "bg-plum/10",
  },
  {
    icon: Gift,
    label: "تغليف هدايا مجاني",
    desc: "بالورق والشريطة",
    color: "text-walnut",
    bg: "bg-walnut/10",
  },
];

export default function TrustSection() {
  return (
    <section className="w-full bg-warm-bg py-16 px-4" dir="rtl">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-cairo font-bold text-ink text-2xl md:text-3xl text-right mb-10">
          لماذا نحن؟
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {trustItems.map(({ icon: Icon, label, desc, color, bg }) => (
            <div
              key={label}
              className="group flex flex-col items-center gap-3 text-center p-5 rounded-2xl
                         border border-walnut/10 hover:border-walnut/25
                         bg-gradient-to-br from-white/70 to-warm-bg/50
                         hover:shadow-xl hover:-translate-y-1.5
                         transition-all duration-300 cursor-default"
            >
              {/* Icon container */}
              <div
                className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center
                            group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon size={28} className={color} />
              </div>
              <span className="text-ink font-cairo text-sm font-bold leading-tight">
                {label}
              </span>
              <span className="text-ink/50 font-cairo text-xs leading-relaxed">
                {desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
