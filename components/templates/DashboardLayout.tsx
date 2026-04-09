"use client";
// components/templates/DashboardLayout.tsx
// Admin dashboard shell: sidebar + top bar + main content area.
// Design tokens from tailwind.config.ts; RTL layout.

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Package,
  BarChart2,
  Settings,
  ShoppingBag,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard/orders", icon: ShoppingCart, label: "الطلبات" },
  { href: "/dashboard/products", icon: Package, label: "المنتجات" },
  { href: "/dashboard/abandoned-carts", icon: ShoppingBag, label: "عربات مهجورة" },
  { href: "/dashboard/analytics", icon: BarChart2, label: "الإحصائيات" },
  { href: "/dashboard/landing", icon: LayoutDashboard, label: "الصفحة الرئيسية" },
  { href: "/dashboard/settings", icon: Settings, label: "الإعدادات" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  /** Slot for notification bell in top bar */
  notificationSlot?: React.ReactNode;
}

export default function DashboardLayout({ children, notificationSlot }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div dir="rtl" className="flex min-h-screen bg-[--surface] font-cairo">
      {/* ─── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside className="w-60 bg-white border-l border-gray-100 flex flex-col shadow-sm fixed top-0 right-0 h-full z-30">
        {/* Logo / Brand */}
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/dashboard/orders">
            <span className="text-lg font-bold text-[--primary]">لوحة التحكم</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  active
                    ? "bg-[--primary]/10 text-[--primary] font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={18} className={active ? "text-[--primary]" : "text-gray-400"} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 w-full transition-colors"
            >
              <LogOut size={18} className="text-gray-400" />
              تسجيل الخروج
            </button>
          </form>
        </div>
      </aside>

      {/* ─── Main content area ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col mr-60">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 h-14 flex items-center justify-between px-6 shadow-sm">
          <h1 className="text-sm font-medium text-gray-500">
            {NAV_ITEMS.find((n) => pathname.startsWith(n.href))?.label ?? "لوحة التحكم"}
          </h1>
          <div className="flex items-center gap-3">
            {notificationSlot}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
