"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import NotificationItem from "@/components/molecules/NotificationItem";
import type { Notification } from "@/lib/interfaces";

// ─────────────────────────────────────────────────────────────────────────────
// Polling interval — 60 s
// ─────────────────────────────────────────────────────────────────────────────

const POLL_MS = 60_000;

// ─────────────────────────────────────────────────────────────────────────────
// API response shape
// ─────────────────────────────────────────────────────────────────────────────

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Play a short notification beep using the Web Audio API.
// No external audio file required.
// ─────────────────────────────────────────────────────────────────────────────

function playNotificationBeep() {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
    oscillator.onended = () => ctx.close();
  } catch {
    // Web Audio not supported — silent fallback
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component — authenticates via `admin_token` or `customer_session` HttpOnly
// cookie (T037/T074). Never reads customerId from localStorage — IDOR risk.
// ─────────────────────────────────────────────────────────────────────────────

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  // Track previous unread count to detect new arrivals during polling
  const prevUnreadRef = useRef<number>(0);

  // ── Fetch notifications from API (identity resolved by HttpOnly cookie) ──
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return; // 401 = not logged in → silent, no bell shown
      const data = (await res.json()) as NotificationsResponse;
      setNotifications(data.notifications);
      setUnreadCount((prev) => {
        const incoming = data.unreadCount;
        // Play sound only on polling updates (not the initial mount)
        if (prevUnreadRef.current > 0 && incoming > prev) {
          playNotificationBeep();
        }
        prevUnreadRef.current = incoming;
        return incoming;
      });
    } catch {
      // Network error — silent; bell stays in last known state
    }
  }, []);

  // ── Initial load + polling every 60 s ──
  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, POLL_MS);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // ── Mark all read when panel opens (only if there are unread items) ──
  useEffect(() => {
    if (!open || unreadCount === 0) return;
    fetch("/api/notifications/read", { method: "PATCH" })
      .then(() => {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      })
      .catch(() => undefined);
  }, [open, unreadCount]);

  // ── Close panel on outside click ──
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell trigger button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex items-center justify-center rounded-full p-2 hover:bg-gray-100 transition-colors"
        aria-label={`الإشعارات — ${unreadCount} غير مقروء`}
      >
        <Bell size={22} className="text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
            <span className="text-sm font-bold text-gray-900">الإشعارات</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                {unreadCount} جديد
              </span>
            )}
          </div>

          {/* Notification list — last 10 (spec US4 scenario 2) */}
          <div className="max-h-80 divide-y divide-gray-50 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">
                لا توجد إشعارات
              </p>
            ) : (
              notifications
                .slice(0, 10)
                .map((n) => <NotificationItem key={n.id} notification={n} />)
            )}
          </div>

          {/* Footer link */}
          <div className="border-t border-gray-100 px-4 py-2 text-center">
            <Link
              href="/notifications"
              className="text-xs font-medium text-primary hover:underline"
            >
              عرض الكل
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
