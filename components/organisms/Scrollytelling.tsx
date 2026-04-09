"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  useScroll,
  useTransform,
  motion,
  useReducedMotion,
} from "framer-motion";

const sections = [
  {
    image: "https://images.unsplash.com/photo-1563903530908-afdd155d057a?q=80&w=1200&auto=format&fit=crop",
    title: "جودة تحسّها",
    body: "كل تفصيلة مصنوعة بحب وعناية",
  },
  {
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
    title: "أناقة تعيشها",
    body: "ستايل يعبّر عنك بلمسة فنية",
  },
  {
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop",
    title: "ستايل يميّزك",
    body: "إطلالة تعبّر عنك في كل مناسبة",
  },
  {
    image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=1200&auto=format&fit=crop",
    title: "تسليم لبابك",
    body: "شحن سريع ومضمون لكل مكان في مصر",
  },
];

function ScrollySection({
  image,
  title,
  body,
  index,
  reducedMotion,
}: {
  image: string;
  title: string;
  body: string;
  index: number;
  reducedMotion: boolean | null;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    // reducedMotion ? undefined : ref — الهوك لا تعمل بالمرة لو undefined
    target: reducedMotion ? undefined : ref,
    offset: ["start end", "center center"],
  });
  const translateY = useTransform(scrollYProgress, [0, 1], [40, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const isEven = index % 2 === 0;

  return (
    <article
      ref={ref}
      className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-10 py-16 px-4`}
      dir="rtl"
    >
      <div className="relative w-full md:w-1/2 aspect-video overflow-hidden rounded-3xl shadow-xl">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          loading="lazy"
          className="object-cover"
        />
      </div>
      <motion.div
        className="w-full md:w-1/2 text-center md:text-right"
        style={reducedMotion ? undefined : { translateY, opacity }}
      >
        <h3 className="font-cairo font-black text-ink text-3xl md:text-4xl mb-4 leading-tight">
          {title}
        </h3>
        <p className="font-cairo text-ink/70 text-lg md:text-xl leading-relaxed">
          {body}
        </p>
      </motion.div>
    </article>
  );
}

export default function Scrollytelling() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="w-full bg-warm-bg">
      <div className="mx-auto max-w-5xl divide-y divide-walnut/10">
        {sections.map((section, index) => (
          <ScrollySection
            key={index}
            {...section}
            index={index}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>
    </section>
  );
}
