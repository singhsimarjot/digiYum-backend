import { useState } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Bell,
  ChevronDown,
  Menu,
} from "lucide-react";
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { MenuPage } from "../features/menu/MenuPage";
import { CategoriesPage } from "../features/menu/CategoriesPage";
import { OrdersPage } from "../features/orders/OrdersPage";
import { C } from "../features/shared/theme";
import { isAuthenticated } from "../auth/auth";
import LoginPage from "../features/auth/LoginPage";
import { AppSidebar } from "../components/AppSidebar";

type Page = "dashboard" | "menu" | "categories" | "orders";

type NavItem = {
  id: Page;
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const NAV: NavItem[] = [
  { id: "dashboard", path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "categories", path: "/categories", label: "Categories", icon: UtensilsCrossed },
  { id: "menu", path: "/menu", label: "Menu", icon: UtensilsCrossed }, 
  { id: "orders", path: "/orders", label: "Orders", icon: ClipboardList },
];

const PAGE_META: Record<Page, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Saturday, 18 Aug 2026 · Dinner service",
  },
  categories: {
    title: "Category Management",
    subtitle: "Manage your menu categories",
  },
  menu: {
    title: "Menu Management",
    subtitle: "Manage your dishes and categories",
  },
  orders: {
    title: "Live Orders",
    subtitle: "Real-time order tracking",
  },
};

function AppShell() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const pendingCount = 0;

  const currentPage =
    location.pathname === "/menu"
      ? "menu"
      : location.pathname === "/categories"
        ? "categories"
        : location.pathname === "/orders"
          ? "orders"
          : "dashboard";

  const { title, subtitle } = PAGE_META[currentPage];

  if (!authenticated) {
    return <LoginPage onLogin={() => {
      setAuthenticated(true);
      navigate("/dashboard");
    }} />;
  }

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

      <AppSidebar
        navItems={NAV}
        currentPage={currentPage}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingCount={pendingCount}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-4 lg:px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-20" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
              <Menu size={18} style={{ color: C.muted }} />
            </button>
            <div>
              <h1 className="text-base font-bold leading-tight" style={{ color: C.text }}>{title}</h1>
              <p className="text-xs hidden sm:block" style={{ color: C.muted }}>{subtitle}</p>
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

        <main className="flex-1 p-4 lg:p-6 page-enter">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
