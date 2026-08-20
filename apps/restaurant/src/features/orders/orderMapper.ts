import type { OrderStatus } from "@digiyum/types";
import type { ApiOrder } from "../../api/orders";

export type OrderItem = {
  name: string;
  qty: number;
  price: number;
};

export type Order = {
  id: number;
  visibleId: string;
  table: string;
  items: OrderItem[];
  status: OrderStatus;
  time: string;
  total: number;
  mins: number;
};

function getMinutesAgo(createdAt: string): number {
  const created = new Date(createdAt).getTime();
  const now = Date.now();

  const minutes = Math.floor(
    (now - created) / 60000,
  );

  return Math.max(0, minutes);
}

function formatTime(createdAt: string): string {
  const mins = getMinutesAgo(createdAt);

  if (mins < 1) {
    return "Just now";
  }

  if (mins === 1) {
    return "1 min ago";
  }

  if (mins < 60) {
    return `${mins} min ago`;
  }

  const hours = Math.floor(mins / 60);

  if (hours === 1) {
    return "1 hour ago";
  }

  return `${hours} hours ago`;
}

export function mapApiOrder(order: ApiOrder): Order {
  const mins = getMinutesAgo(order.created_at);

  return {
    id: order.id,
    visibleId: `ORD-${String(order.id).padStart(3, "0")}`,

    table:
      order.table_id !== null
        ? `T-${String(order.table_id).padStart(2, "0")}`
        : "Takeout",

    items: order.items.map((item) => ({
      name: item.name,
      qty: item.quantity,
      price: item.price,
    })),

    status: order.status,

    time: formatTime(order.created_at),

    total: order.total,

    mins,
  };
}
export const ORDER_STATUS_TRANSITIONS: Partial<
  Record<OrderStatus, OrderStatus>
> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
  READY: "COMPLETED",
};