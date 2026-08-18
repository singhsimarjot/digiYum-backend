import { useState } from "react";
import { LayoutDashboard, UtensilsCrossed, ClipboardList, Bell, ChevronDown, Menu } from "lucide-react";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { MenuPage } from "../features/menu/MenuPage";
import { OrdersPage, initOrders } from "../features/orders/OrdersPage";
import { C } from "../features/shared/theme";

type Page = "dashboard" | "menu" | "orders";

const NAV = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "menu" as Page, label: "Menu", icon: UtensilsCrossed },
  { id: "orders" as Page, label: "Orders", icon: ClipboardList },
];

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pendingCount = initOrders.filter((o) => o.status === "PENDING").length;

  const pageTitle = { dashboard: "Dashboard", menu: "Menu Management", orders: "Live Orders" }[page];
  const pageSubtitle = {
    dashboard: "Saturday, 18 Aug 2026 · Dinner service",
    menu: "Manage your dishes and categories",
    orders: "Real-time order tracking",
  }[page];

  return (
    <div className="min-h-screen flex" style={{ background: C.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .page-enter { animation: fadeIn 0.25s ease both; }
      `}</style>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ width: 220, background: C.sidebar, minHeight: "100vh" }}
      >
        <div className="px-5 py-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #E63946, #c0293a)" }}>
            <span className="text-base">🍽</span>
          </div>
          <div>
            <div className="text-sm font-bold text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>Saveur</div>
            <div className="text-[10px] font-medium" style={{ color: "#64748B" }}>Owner Portal</div>
          </div>
        </div>

        <nav className="flex-1 px-3 flex flex-col gap-1">
          <div className="text-[9px] font-bold tracking-widest uppercase px-2 mb-2" style={{ color: "#475569" }}>Main Menu</div>
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = page === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setPage(id);
                  setSidebarOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all relative"
                style={{ background: active ? C.sidebarActive : "transparent", color: active ? "white" : "#94A3B8" }}
              >
                <Icon size={16} />
                <span className="text-sm font-medium">{label}</span>
                {id === "orders" && pendingCount > 0 && (
                  <span className="ml-auto w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: C.red, color: "white" }}>
                    {pendingCount}
                  </span>
                )}
                {active && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l-full" style={{ background: C.red }} />}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: C.red + "40", color: C.red }}>
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">Arjun Mehta</div>
            <div className="text-[10px]" style={{ color: "#64748B" }}>Restaurant Owner</div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-4 lg:px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-20" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
              <Menu size={18} style={{ color: C.muted }} />
            </button>
            <div>
              <h1 className="text-base font-bold leading-tight" style={{ color: C.text }}>{pageTitle}</h1>
              <p className="text-xs hidden sm:block" style={{ color: C.muted }}>{pageSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors">
              <Bell size={16} style={{ color: C.muted }} />
              {pendingCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: C.red }} />}
            </button>
            <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: C.red + "20", color: C.red }}>
                A
              </div>
              <ChevronDown size={14} style={{ color: C.muted }} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 page-enter" key={page}>
          {page === "dashboard" && <DashboardPage />}
          {page === "menu" && <MenuPage />}
          {page === "orders" && <OrdersPage />}
        </main>
      </div>
    </div>
  );
}
