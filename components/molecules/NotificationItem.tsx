import type { LucideIcon } from "lucide-react";
import {
  Bell,
  ShoppingBag,
  Package,
  Star,
  Gift,
  AlertTriangle,
  ShoppingCart,
} from "lucide-react";
import type { Notification, NotificationType } from "@/lib/interfaces";

// ─────────────────────────────────────────────────────────────────────────────
// Icon map — one lucide icon per notification type
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  ORDER_CONFIRMED: ShoppingBag,
  ORDER_STATUS: Package,
  ORDER_DELIVERED: Gift,
  REVIEW_REQUEST: Star,
  LOYALTY_POINTS: Gift,
  ABANDONED_CART: ShoppingCart,
  NEW_ORDER: Bell,
  LOW_STOCK: AlertTriangle,
};

// ─────────────────────────────────────────────────────────────────────────────
// Relative time — Arabic locale via Intl.RelativeTimeFormat
// ─────────────────────────────────────────────────────────────────────────────

function relativeTime(date: Date): string {
  const diffSec = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("ar", { numeric: "auto" });

  if (diffSec < 60) return rtf.format(-diffSec, "second");
  if (diffSec < 3_600) return rtf.format(-Math.floor(diffSec / 60), "minute");
  if (diffSec < 86_400)
    return rtf.format(-Math.floor(diffSec / 3_600), "hour");
  return rtf.format(-Math.floor(diffSec / 86_400), "day");
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface NotificationItemProps {
  notification: Notification;
}

export default function NotificationItem({
  notification,
}: NotificationItemProps) {
  const Icon = TYPE_ICONS[notification.type] ?? Bell;

  return (
    <div
      className={`flex items-start gap-3 p-3 transition-colors ${
        notification.isRead ? "bg-white" : "bg-primary/5"
      }`}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Icon size={16} className="text-primary" />
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm leading-tight ${
            notification.isRead
              ? "font-normal text-gray-700"
              : "font-bold text-gray-900"
          }`}
        >
          {notification.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
          {notification.message}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {relativeTime(notification.createdAt)}
        </p>
      </div>
    </div>
  );
}
