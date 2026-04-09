import Image from "next/image";

interface Props {
  headline: string;
  body: string;
  image: string;
}

export default function BrandStory({ headline, body, image }: Props) {
  return (
    <section className="w-full py-16 px-4 bg-warm-bg" dir="rtl">
      <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Image */}
        <div className="relative w-full aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl order-2 md:order-1">
          <Image
            src={image}
            alt="قصتنا"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            loading="lazy"
            className="object-cover"
          />
          {/* Overlay badge */}
          <div className="absolute bottom-6 right-6 bg-walnut/90 backdrop-blur-sm text-warm-bg font-cairo font-bold text-sm px-4 py-2 rounded-2xl shadow-lg">
            🇪🇬 صُنع بحب في مصر
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-5 order-1 md:order-2">
          {/* Decorative line */}
          <div className="w-12 h-1.5 bg-gold rounded-full" />
          <h2 className="font-cairo font-black text-ink text-3xl md:text-4xl leading-tight">
            {headline}
          </h2>
          <p className="font-cairo text-ink/70 text-lg md:text-xl leading-relaxed">
            {body}
          </p>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-2">
            {[
              { value: "+٥٠٠٠", label: "عميلة سعيدة" },
              { value: "+٣٠", label: "محافظة" },
              { value: "٤.٩", label: "تقييم عملائنا" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center text-center p-3 bg-walnut/10 rounded-2xl border border-walnut/10">
                <span className="font-cairo font-black text-plum text-xl">{value}</span>
                <span className="font-cairo text-ink/60 text-xs mt-0.5">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
