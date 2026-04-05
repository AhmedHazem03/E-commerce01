import Badge from "@/components/atoms/Badge";
import type { OrderStatus } from "@/lib/interfaces";

interface OrderStatusChipProps {
  status: OrderStatus;
}

const STATUS_MAP: Record<
  OrderStatus,
  { label: string; variant: "primary" | "danger" | "success" | "warning" | "gray" }
> = {
  NEW: { label: "جديد", variant: "primary" },
  CONFIRMED: { label: "مؤكد", variant: "primary" },
  PREPARING: { label: "قيد التحضير", variant: "warning" },
  ON_WAY: { label: "في الطريق", variant: "warning" },
  SHIPPED: { label: "تم الشحن", variant: "warning" },
  DELIVERED: { label: "تم التوصيل", variant: "success" },
  CANCELLED: { label: "ملغي", variant: "danger" },
};

export default function OrderStatusChip({ status }: OrderStatusChipProps) {
  const { label, variant } = STATUS_MAP[status] ?? { label: status, variant: "gray" };
  return <Badge variant={variant}>{label}</Badge>;
}
