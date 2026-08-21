import { useEffect, useState } from "react";
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
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { MenuPage } from "../features/menu/MenuPage";
import { CategoriesPage } from "../features/menu/CategoriesPage";
import { OrdersPage } from "../features/orders/OrdersPage";
import { RestaurantSettingsPage } from "../features/settings/RestaurantSettingsPage";
import { C } from "../features/shared/theme";
import { isAuthenticated } from "../auth/auth";
import LoginPage from "../features/auth/LoginPage";
import { AppSidebar } from "../components/AppSidebar";
import { AppHeader } from "../components/AppHeader";
import { AppProvider, useAppSession } from "../context/AppContext";

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



function AppShell() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshSession, clearSession } = useAppSession();
  const pendingCount = 0;

  useEffect(() => {
    if (authenticated) {
      refreshSession();
    } else {
      clearSession();
    }
  }, [authenticated, refreshSession, clearSession]);

  const currentPage =
    location.pathname === "/menu"
      ? "menu"
      : location.pathname === "/categories"
        ? "categories"
        : location.pathname === "/orders"
          ? "orders"
          : location.pathname === "/settings"
            ? "dashboard"
            : "dashboard";


  if (!authenticated) {
    return <LoginPage onLogin={async () => {
      setAuthenticated(true);
      await refreshSession();
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
        <AppHeader
        currentPage={currentPage}
          onMenuToggle={() => setSidebarOpen(true)}
          pendingCount={pendingCount}
        />

        <main className="flex-1 p-4 lg:p-6 page-enter">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/settings" element={<RestaurantSettingsPage />} />
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
      <AppProvider>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  );
}
