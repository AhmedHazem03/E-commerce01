import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: "swap",
  weight: ["400", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "المتجر",
    template: "%s | المتجر",
  },
  description: "تسوق أون لاين — تسليم سريع واكسب نقاط مكافأة",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <head>
        {/* DNS preconnect — يُسرّع تحميل كل صور Unsplash ~150-300ms */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {/* Cloudinary preconnect للصور المرفوعة */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className={`${cairo.variable} font-cairo antialiased`}>{children}</body>
    </html>
  );
}
