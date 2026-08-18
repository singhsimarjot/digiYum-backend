import { useState } from "react";
import { AlertCircle, ChefHat, CheckCircle2, Check, Package, Clock, X } from "lucide-react";
import { C } from "../shared/theme";
import type { components } from "@digiyum/types";
type OrderStatus = components["schemas"]["OrderStatus"];

type OrderItem = { name: string; qty: number; price: number };
type Order = {
  id: string;
  table: string;
  items: OrderItem[];
  status: OrderStatus;
  time: string;
  total: number;
  mins: number;
};

export const initOrders: Order[] = [
  { id: "ORD-041", table: "T-08", items: [{ name: "Butter Chicken", qty: 2, price: 18.5 }, { name: "Mango Lassi", qty: 2, price: 6 }], status: "PENDING", time: "2 min ago", total: 49, mins: 2 },
  { id: "ORD-040", table: "T-03", items: [{ name: "Margherita Pizza", qty: 1, price: 16 }, { name: "Truffle Fettuccine", qty: 1, price: 24 }], status: "PREPARING", time: "8 min ago", total: 40, mins: 8 },
  { id: "ORD-039", table: "T-12", items: [{ name: "Smash Burger", qty: 3, price: 15 }, { name: "Mango Lassi", qty: 3, price: 6 }], status: "PREPARING", time: "14 min ago", total: 63, mins: 14 },
  { id: "ORD-038", table: "T-05", items: [{ name: "Samosa Chaat", qty: 2, price: 9 }, { name: "Butter Chicken", qty: 1, price: 18.5 }], status: "READY", time: "21 min ago", total: 36.5, mins: 21 },
  { id: "ORD-037", table: "T-01", items: [{ name: "Buddha Bowl", qty: 2, price: 17 }, { name: "Gulab Jamun", qty: 2, price: 7.5 }], status: "READY", time: "26 min ago", total: 49, mins: 26 },
  { id: "ORD-036", table: "T-09", items: [{ name: "Truffle Fettuccine", qty: 2, price: 24 }], status: "COMPLETED", time: "38 min ago", total: 48, mins: 38 },
];

function OrderCard({ order, onConfirm, onAdvance }: { order: Order; onConfirm: (id: string) => void; onAdvance: (id: string) => void }) {
  const statusConfig = {
    PENDING: { label: "New Order", bg: "#FEF3C7", color: "#D97706", dot: "#F59E0B" },
    CONFIRMED: { label: "Confirmed", bg: "#DBEAFE", color: "#1D4ED8", dot: "#3B82F6" },
    PREPARING: { label: "Preparing", bg: "#DBEAFE", color: "#1D4ED8", dot: "#3B82F6" },
    READY: { label: "Ready", bg: "#DCFCE7", color: "#15803D", dot: C.green },
    COMPLETED: { label: "Served", bg: "#F1F5F9", color: C.muted, dot: "#94A3B8" },
    REJECTED: { label: "Rejected", bg: "#FEE2E2", color: C.red, dot: C.red },
    CANCELLED: { label: "Cancelled", bg: "#F1F5F9", color: C.muted, dot: "#94A3B8" },
  }[order.status];

  const nextLabel = { PENDING: "Start Cooking", CONFIRMED: "Start Cooking", PREPARING: "Mark Ready", READY: "Mark Served", COMPLETED: "", REJECTED: "", CANCELLED: "" }[order.status];

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: C.border }}>
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: C.text }}>{order.id}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FFF5EC", color: C.orange }}>{order.table}</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Clock size={11} style={{ color: C.muted }} />
            <span className="text-xs" style={{ color: C.muted }}>{order.time}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: statusConfig.bg, color: statusConfig.color }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusConfig.dot }} />
          {statusConfig.label}
        </div>
      </div>

      <div className="px-4 py-2 border-t" style={{ borderColor: C.border }}>
        {order.items.map((it, i) => (
          <div key={i} className="flex justify-between items-center py-1">
            <span className="text-sm" style={{ color: C.text }}>{it.qty}× {it.name}</span>
            <span className="text-sm font-medium" style={{ color: C.muted }}>${(it.qty * it.price).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
        <div>
          <span className="text-xs" style={{ color: C.muted }}>Total </span>
          <span className="text-base font-bold" style={{ color: C.text }}>${order.total.toFixed(2)}</span>
        </div>
        {order.status !== "COMPLETED" && (
          <div className="flex gap-2">
            {order.status === "PENDING" && (
              <button onClick={() => onConfirm(order.id)} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95" style={{ background: C.red + "15", color: C.red }}>
                <X size={12} /> Reject
              </button>
            )}
            <button onClick={() => onAdvance(order.id)} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full text-white transition-all active:scale-95" style={{ background: order.status === "PENDING" ? C.green : order.status === "PREPARING" ? C.orange : C.red }}>
              <Check size={12} /> {nextLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function OrdersPage() {
  const [orders, setOrders] = useState(initOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const advance = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;

        const next: OrderStatus =
          o.status === "PENDING"
            ? "CONFIRMED"
            : o.status === "CONFIRMED"
              ? "PREPARING"
              : o.status === "PREPARING"
                ? "READY"
                : "COMPLETED";

        return { ...o, status: next };
      })
    );
  };

  const reject = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const cols: { key: OrderStatus; label: string; color: string; bg: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { key: "PENDING", label: "New Orders", color: C.yellow, bg: "#FEF9EC", icon: AlertCircle },
    { key: "PREPARING", label: "Preparing", color: "#3B82F6", bg: "#EFF6FF", icon: ChefHat },
    { key: "READY", label: "Ready to Serve", color: C.green, bg: "#F0FDF4", icon: CheckCircle2 },
    { key: "COMPLETED", label: "Served", color: C.muted, bg: "#F8FAFC", icon: Check },
  ];

  return (
    <>
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold" style={{ color: C.text }}>Order Confirmation</h2>
                  <p className="text-xs mt-0.5" style={{ color: C.muted }}>{selectedOrder.id} · {selectedOrder.table}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">
                  <X size={16} style={{ color: C.muted }} />
                </button>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ background: "#FFF8F8" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: C.orange + "20" }}>
                  <Package size={18} style={{ color: C.orange }} />
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: C.text }}>Table {selectedOrder.table.replace("T-", "")} · {selectedOrder.items.length} item{selectedOrder.items.length > 1 ? "s" : ""}</div>
                  <div className="text-xs" style={{ color: C.muted }}>Received {selectedOrder.time}</div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                {selectedOrder.items.map((it, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: C.border }}>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-gray-100 text-xs font-bold flex items-center justify-center" style={{ color: C.muted }}>{it.qty}×</span>
                      <span className="text-sm" style={{ color: C.text }}>{it.name}</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: C.text }}>${(it.qty * it.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-1 p-3 rounded-xl" style={{ background: C.bg }}>
                <div className="flex justify-between text-xs" style={{ color: C.muted }}>
                  <span>Subtotal</span><span>${selectedOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs" style={{ color: C.muted }}>
                  <span>Service (10%)</span><span>${(selectedOrder.total * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-1 border-t mt-1" style={{ borderColor: C.border }}>
                  <span style={{ color: C.text }}>Total</span>
                  <span style={{ color: C.red }}>${(selectedOrder.total * 1.1).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              {selectedOrder.status === "PENDING" && (
                <button onClick={() => { reject(selectedOrder.id); setSelectedOrder(null); }} className="flex-1 py-3 rounded-xl text-sm font-bold border transition-all" style={{ borderColor: C.red + "40", color: C.red }}>
                  Reject
                </button>
              )}
              {selectedOrder.status !== "COMPLETED" && (
                <button onClick={() => { advance(selectedOrder.id); setSelectedOrder(null); }} className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all" style={{ background: selectedOrder.status === "PENDING" ? C.green : selectedOrder.status === "PREPARING" ? C.orange : C.red }}>
                  {selectedOrder.status === "PENDING" ? "✓ Confirm & Cook" : selectedOrder.status === "PREPARING" ? "Mark Ready" : "Mark Served"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {cols.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.key);
          return (
            <div key={col.key} className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <col.icon size={14} style={{ color: col.color }} />
                  <span className="text-xs font-bold" style={{ color: C.text }}>{col.label}</span>
                  <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: col.bg, color: col.color }}>{colOrders.length}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 min-h-[100px] p-1 rounded-xl" style={{ background: col.bg }}>
                {colOrders.length === 0 && <div className="text-center py-6 text-xs" style={{ color: C.muted }}>No orders</div>}
                {colOrders.map((order) => (
                  <div key={order.id} onClick={() => setSelectedOrder(order)} className="cursor-pointer">
                    <OrderCard order={order} onConfirm={reject} onAdvance={advance} />
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
