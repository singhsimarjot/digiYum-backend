import type { components } from "../api";

export type OrderStatus = components["schemas"]["OrderStatus"];

export type OrderStatusConfig = {
  label: string;
  bg: string;
  color: string;
  dot: string;
};

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  OrderStatusConfig
> = {
  PENDING: {
    label: "New Order",
    bg: "#FEF3C7",
    color: "#D97706",
    dot: "#F59E0B",
  },

  CONFIRMED: {
    label: "Confirmed",
    bg: "#DBEAFE",
    color: "#1D4ED8",
    dot: "#3B82F6",
  },

  PREPARING: {
    label: "Preparing",
    bg: "#DBEAFE",
    color: "#1D4ED8",
    dot: "#3B82F6",
  },

  READY: {
    label: "Ready",
    bg: "#DCFCE7",
    color: "#15803D",
    dot: "#16A34A",
  },

  COMPLETED: {
    label: "Served",
    bg: "#F1F5F9",
    color: "#64748B",
    dot: "#94A3B8",
  },

  REJECTED: {
    label: "Rejected",
    bg: "#FEE2E2",
    color: "#DC2626",
    dot: "#DC2626",
  },

  CANCELLED: {
    label: "Cancelled",
    bg: "#F1F5F9",
    color: "#64748B",
    dot: "#94A3B8",
  },
};

export const ORDER_NEXT_ACTION: Record<OrderStatus, string> = {
  PENDING: "Start Cooking",
  CONFIRMED: "Start Cooking",
  PREPARING: "Mark Ready",
  READY: "Mark Served",
  COMPLETED: "",
  REJECTED: "",
  CANCELLED: "",
};