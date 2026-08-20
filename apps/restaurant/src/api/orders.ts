import { getAccessToken, logout } from "../auth/auth";
import type { components } from "@digiyum/types";
type OrderStatus = components["schemas"]["OrderStatus"];
const API_URL = "http://127.0.0.1:8000";

export type ApiOrderItem = {
  id: number;
  menu_item_id: number | null;
  name: string;
  price: number;
  quantity: number;
  total: number;
};

export type ApiOrder = {
  id: number;
  restaurant_id: number;
  table_id: number | null;

  order_type: string;
  status: OrderStatus;
  created_at: string;

  customer_name: string | null;
  customer_phone: string | null;
  notes: string | null;

  subtotal: number;
  tax: number;
  total: number;

  items: ApiOrderItem[];
};

export async function getOrders(): Promise<ApiOrder[]> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${API_URL}/api/v1/orders`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      logout();
      throw new Error("Authentication expired");
    }

    const data = await response.json().catch(() => null);

    throw new Error(
      data?.detail || "Failed to load orders",
    );
  }

  return response.json();
}



export type UpdateOrderStatusPayload = {
  status: OrderStatus;
  rejection_reason?: string | null;
};

export async function updateOrderStatus(
  orderId: number | string,
  status: OrderStatus,
  rejectionReason?: string | null,
) {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const normalizedOrderId = Number(orderId);

  if (!Number.isFinite(normalizedOrderId)) {
    throw new Error("Invalid order id");
  }

  const payload: UpdateOrderStatusPayload = {
    status,
    rejection_reason: rejectionReason ?? null,
  };

  const response = await fetch(
    `${API_URL}/api/v1/orders/${normalizedOrderId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail || "Failed to update order status");
  }

  return response.json();
}

