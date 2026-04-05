// app/(dashboard)/layout.tsx — Server Component
// Wraps all /dashboard/* pages with DashboardLayout.
// Middleware (middleware.ts) already blocks unauthenticated access.

import DashboardLayout from "@/components/templates/DashboardLayout";
import NotificationBell from "@/components/organisms/NotificationBell";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout notificationSlot={<NotificationBell />}>
      {children}
    </DashboardLayout>
  );
}
