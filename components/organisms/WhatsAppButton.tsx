"use client";

interface Props {
  whatsappNumber: string;
}

export default function WhatsAppFloatingButton({ whatsappNumber }: Props) {
  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("أهلاً، أريد الاستفسار عن منتج")}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل عبر واتساب"
      className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-2xl bg-[#25D366] hover:bg-[#20ba58] transition-all duration-300 hover:scale-110 group"
    >
      {/* WhatsApp SVG icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="white"
        className="w-7 h-7"
        aria-hidden="true"
      >
        <path d="M16.002 3C9.374 3 4 8.373 4 15.001c0 2.126.558 4.115 1.53 5.845L4 29l8.38-1.505A12.003 12.003 0 0016.002 28c6.627 0 12-5.373 12-12.001C28.002 8.373 22.63 3 16.002 3zm6.308 16.467c-.265.742-1.538 1.415-2.098 1.464-.56.048-1.09.265-3.673-.765-3.1-1.24-5.08-4.438-5.233-4.643-.154-.205-1.24-1.65-1.24-3.148 0-1.5.787-2.237 1.065-2.544.278-.308.607-.385.81-.385.205 0 .41.002.59.01.189.008.444-.072.695.53.257.616.876 2.13.953 2.286.077.154.128.335.026.539-.103.205-.154.333-.308.513-.153.179-.322.4-.46.537-.154.153-.314.318-.135.624.18.307.8 1.32 1.716 2.137 1.179 1.05 2.172 1.374 2.48 1.528.307.154.485.128.664-.077.18-.205.769-.897 1.974-.897 0 0 .282.01.42.075.154.072 2.08.98 2.08.98s.364.153.41.435c.056.334-.206 1.08-.535 1.845z" />
      </svg>
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 group-hover:opacity-0" />
    </a>
  );
}
