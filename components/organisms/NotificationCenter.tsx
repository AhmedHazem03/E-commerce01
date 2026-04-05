"use client";

import { useState, useEffect, useCallback } from "react";
import NotificationItem from "@/components/molecules/NotificationItem";
import Button from "@/components/atoms/Button";
import type { Notification } from "@/lib/interfaces";

// ─────────────────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

// ─────────────────────────────────────────────────────────────────────────────
// API response shape
// ─────────────────────────────────────────────────────────────────────────────

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// NotificationCenter — full paginated list for dashboard sidebar slot.
// Authenticates via admin_token OR customer_session HttpOnly cookie (T074/T075).
// ─────────────────────────────────────────────────────────────────────────────

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/notifications?page=${p}&limit=${PAGE_SIZE}`
      );
      if (!res.ok) return;
      const data = (await res.json()) as NotificationsResponse;
      setNotifications((prev) =>
        p === 1 ? data.notifications : [...prev, ...data.notifications]
      );
      setUnreadCount(data.unreadCount);
      setHasMore(data.notifications.length === PAGE_SIZE);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  // ── Mark all read ──
  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications/read", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Network error — silent
    }
  };

  // ── Load next page ──
  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPage(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">الإشعارات</h2>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
            تعليم الكل كمقروء
          </Button>
        )}
      </div>

      {/* Notification list */}
      <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
        {notifications.length === 0 && !loading ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400">
            لا توجد إشعارات
          </p>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))
        )}
      </div>

      {/* Load more */}
      {hasMore && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleLoadMore}
          disabled={loading}
          className="self-center"
        >
          {loading ? "جاري التحميل..." : "تحميل المزيد"}
        </Button>
      )}
    </div>
  );
}
