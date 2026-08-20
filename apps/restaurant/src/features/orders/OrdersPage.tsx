import { useEffect, useState } from "react";
import {
  AlertCircle,
  ChefHat,
  CheckCircle2,
  Check,
  Package,
  Clock,
  X,
  type LucideIcon,
} from "lucide-react";

import { C } from "../shared/theme";
import {
  type OrderStatus,
  ORDER_STATUS_CONFIG,
  ORDER_NEXT_ACTION
} from "@digiyum/types";

import { getOrders,updateOrderStatus  } from "../../api/orders";
import {
  mapApiOrder,
  type Order,
  ORDER_STATUS_TRANSITIONS
} from "./orderMapper";


function OrderCard({
  order,
  onConfirm,
  onAdvance,
}: {
  order: Order;
  onConfirm: (id: number) => void;
  onAdvance: (id: number) => void;
}) {

  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const nextLabel = ORDER_NEXT_ACTION[order.status];

  return (
    <div
      className="bg-white rounded-2xl border shadow-sm overflow-hidden"
      style={{ borderColor: C.border }}
    >
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold"
              style={{ color: C.text }}
            >
              {order.visibleId}
            </span>

            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: "#FFF5EC",
                color: C.orange,
              }}
            >
              {order.table}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-0.5">
            <Clock
              size={11}
              style={{ color: C.muted }}
            />

            <span
              className="text-xs"
              style={{ color: C.muted }}
            >
              {order.time}
            </span>
          </div>
        </div>

        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            background: statusConfig.bg,
            color: statusConfig.color,
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: statusConfig.dot,
            }}
          />

          {statusConfig.label}
        </div>
      </div>

      <div
        className="px-4 py-2 border-t"
        style={{ borderColor: C.border }}
      >
        {order.items.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center py-1"
          >
            <span
              className="text-sm"
              style={{ color: C.text }}
            >
              {item.qty}× {item.name}
            </span>

            <span
              className="text-sm font-medium"
              style={{ color: C.muted }}
            >
              ${(item.qty * item.price).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
        <div>
          <span
            className="text-xs"
            style={{ color: C.muted }}
          >
            Total{" "}
          </span>

          <span
            className="text-base font-bold"
            style={{ color: C.text }}
          >
            ${order.total.toFixed(2)}
          </span>
        </div>

        {order.status !== "COMPLETED" &&
          order.status !== "REJECTED" &&
          order.status !== "CANCELLED" && (
            <div className="flex gap-2">
              {order.status === "PENDING" && (
                <button
                  onClick={() => onConfirm(order.id)}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95"
                  style={{
                    background: C.red + "15",
                    color: C.red,
                  }}
                >
                  <X size={12} />
                  Reject
                </button>
              )}

              <button
                onClick={() => onAdvance(order.id)}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full text-white transition-all active:scale-95"
                style={{
                  background:
                    order.status === "PENDING"
                      ? C.green
                      : order.status === "PREPARING"
                        ? C.orange
                        : C.red,
                }}
              >
                <Check size={12} />
                {nextLabel}
              </button>
            </div>
          )}
      </div>
    </div>
  );
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const data = await getOrders();

        console.log("API ORDERS:", data);

        const mappedOrders = data.map(mapApiOrder);

        console.log(
          "MAPPED ORDERS:",
          mappedOrders,
        );

        setOrders(mappedOrders);
      } catch (error) {
        console.error("ORDER LOAD ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load orders",
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const advance = async (id: number) => {
    const currentOrder = orders.find((order) => order.id === id);

    if (!currentOrder) {
      return;
    }

    const nextStatus = ORDER_STATUS_TRANSITIONS[currentOrder.status];

    if (!nextStatus) {
      return;
    }

    try {
      await updateOrderStatus(id, nextStatus);

      setOrders((previous) =>
        previous.map((order) =>
          order.id === id ? { ...order, status: nextStatus } : order,
        ),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update order status",
      );
    }
  };

  const reject = async (id: number) => {
    const currentOrder = orders.find((order) => order.id === id);

    if (!currentOrder) {
      return;
    }

    try {
      await updateOrderStatus(id, "REJECTED", "Rejected by staff");

      setOrders((previous) =>
        previous.filter((order) => order.id !== id),
      );
      setSelectedOrder(null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to reject order",
      );
    }
  };

  const cols: {
    key: OrderStatus;
    label: string;
    color: string;
    bg: string;
    icon: LucideIcon;
  }[] = [
    {
      key: "PENDING",
      label: "New Orders",
      color: C.yellow,
      bg: "#FEF9EC",
      icon: AlertCircle,
    },
    {
      key: "CONFIRMED",
      label: "Preparing",
      color: "#3B82F6",
      bg: "#EFF6FF",
      icon: ChefHat,
    },
    {
      key: "READY",
      label: "Ready to Serve",
      color: C.green,
      bg: "#F0FDF4",
      icon: CheckCircle2,
    },
    {
      key: "COMPLETED",
      label: "Served",
      color: C.muted,
      bg: "#F8FAFC",
      icon: Check,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="text-sm"
          style={{ color: C.muted }}
        >
          Loading orders...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div
          className="text-sm font-semibold"
          style={{ color: C.red }}
        >
          {error}
        </div>

        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white"
          style={{ background: C.red }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.5)",
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2
                    className="text-base font-bold"
                    style={{ color: C.text }}
                  >
                    Order Confirmation
                  </h2>

                  <p
                    className="text-xs mt-0.5"
                    style={{ color: C.muted }}
                  >
                    {selectedOrder.id} ·{" "}
                    {selectedOrder.table}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setSelectedOrder(null)
                  }
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
                >
                  <X
                    size={16}
                    style={{ color: C.muted }}
                  />
                </button>
              </div>

              <div
                className="flex items-center gap-2 p-3 rounded-xl mb-4"
                style={{ background: "#FFF8F8" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: C.orange + "20",
                  }}
                >
                  <Package
                    size={18}
                    style={{ color: C.orange }}
                  />
                </div>

                <div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: C.text }}
                  >
                    Table{" "}
                    {selectedOrder.table.replace(
                      "T-",
                      "",
                    )}{" "}
                    · {selectedOrder.items.length} item
                    {selectedOrder.items.length > 1
                      ? "s"
                      : ""}
                  </div>

                  <div
                    className="text-xs"
                    style={{ color: C.muted }}
                  >
                    Received {selectedOrder.time}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                {selectedOrder.items.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b"
                      style={{
                        borderColor: C.border,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-full bg-gray-100 text-xs font-bold flex items-center justify-center"
                          style={{
                            color: C.muted,
                          }}
                        >
                          {item.qty}×
                        </span>

                        <span
                          className="text-sm"
                          style={{ color: C.text }}
                        >
                          {item.name}
                        </span>
                      </div>

                      <span
                        className="text-sm font-semibold"
                        style={{ color: C.text }}
                      >
                        $
                        {(
                          item.qty * item.price
                        ).toFixed(2)}
                      </span>
                    </div>
                  ),
                )}
              </div>

              <div
                className="flex flex-col gap-1 p-3 rounded-xl"
                style={{ background: C.bg }}
              >
                <div
                  className="flex justify-between text-xs"
                  style={{ color: C.muted }}
                >
                  <span>Subtotal</span>
                  <span>
                    $
                    {selectedOrder.total.toFixed(
                      2,
                    )}
                  </span>
                </div>

                <div
                  className="flex justify-between text-xs"
                  style={{ color: C.muted }}
                >
                  <span>Service (10%)</span>
                  <span>
                    $
                    {(
                      selectedOrder.total * 0.1
                    ).toFixed(2)}
                  </span>
                </div>

                <div
                  className="flex justify-between text-sm font-bold pt-1 border-t mt-1"
                  style={{
                    borderColor: C.border,
                  }}
                >
                  <span style={{ color: C.text }}>
                    Total
                  </span>

                  <span style={{ color: C.red }}>
                    $
                    {(
                      selectedOrder.total * 1.1
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              {selectedOrder.status ===
                "PENDING" && (
                <button
                  onClick={() =>
                    reject(selectedOrder.id)
                  }
                  className="flex-1 py-3 rounded-xl text-sm font-bold border transition-all"
                  style={{
                    borderColor: C.red + "40",
                    color: C.red,
                  }}
                >
                  Reject
                </button>
              )}

              {selectedOrder.status !==
                "COMPLETED" &&
                selectedOrder.status !==
                  "REJECTED" &&
                selectedOrder.status !==
                  "CANCELLED" && (
                  <button
                    onClick={() => {
                      advance(selectedOrder.id);
                      setSelectedOrder(null);
                    }}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all"
                    style={{
                      background:
                        selectedOrder.status ===
                        "PENDING"
                          ? C.green
                          : selectedOrder.status ===
                              "PREPARING"
                            ? C.orange
                            : C.red,
                    }}
                  >
                    {selectedOrder.status ===
                    "PENDING"
                      ? "✓ Confirm & Cook"
                      : selectedOrder.status ===
                          "PREPARING"
                        ? "Mark Ready"
                        : "Mark Served"}
                  </button>
                )}
            </div>
          </div>
        </div>
      )}

      {/* ORDERS BOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {cols.map((column) => {
          const columnOrders = orders.filter(
            (order) =>
              order.status === column.key,
          );

          return (
            <div
              key={column.key}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <column.icon
                    size={14}
                    style={{
                      color: column.color,
                    }}
                  />

                  <span
                    className="text-xs font-bold"
                    style={{ color: C.text }}
                  >
                    {column.label}
                  </span>

                  <span
                    className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{
                      background: column.bg,
                      color: column.color,
                    }}
                  >
                    {columnOrders.length}
                  </span>
                </div>
              </div>

              <div
                className="flex flex-col gap-3 min-h-[100px] p-1 rounded-xl"
                style={{
                  background: column.bg,
                }}
              >
                {columnOrders.length === 0 && (
                  <div
                    className="text-center py-6 text-xs"
                    style={{ color: C.muted }}
                  >
                    No orders
                  </div>
                )}

                {columnOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() =>
                      setSelectedOrder(order)
                    }
                    className="cursor-pointer"
                  >
                    <OrderCard
                      order={order}
                      onConfirm={reject}
                      onAdvance={advance}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default OrdersPage;