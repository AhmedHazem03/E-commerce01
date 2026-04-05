// server-only
import prisma from "@/lib/prisma";
import type { Notification } from "@/lib/interfaces";

// ─────────────────────────────────────────────────────────────────────────────
// Filter type — mutually exclusive: either customerId or adminId
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationFilter = { customerId: number } | { adminId: number };

// ─────────────────────────────────────────────────────────────────────────────
// getNotifications — ordered newest-first; supports pagination via skip
// ─────────────────────────────────────────────────────────────────────────────

export async function getNotifications(
  filter: NotificationFilter,
  limit = 20,
  skip = 0
): Promise<Notification[]> {
  const rows = await prisma.notification.findMany({
    where: filter,
    orderBy: { createdAt: "desc" },
    take: limit,
    skip,
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      payload: true,
      isRead: true,
      customerId: true,
      adminId: true,
      createdAt: true,
    },
  });

  return rows.map((r) => ({
    ...r,
    payload: r.payload as Record<string, unknown> | null,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// countUnread — DB-level count so the bell badge is always accurate,
// regardless of how many rows are returned by getNotifications.
// ─────────────────────────────────────────────────────────────────────────────

export async function countUnread(filter: NotificationFilter): Promise<number> {
  return prisma.notification.count({
    where: { ...filter, isRead: false },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// markAllRead — bulk-updates isRead = true for the resolved principal
// Returns the number of rows updated.
// ─────────────────────────────────────────────────────────────────────────────

export async function markAllRead(filter: NotificationFilter): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: filter,
    data: { isRead: true },
  });

  return result.count;
}
