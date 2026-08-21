import { useState } from "react";
import { Bell, ChevronDown, Menu, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router";
import { C } from "../features/shared/theme";
import { clearSession } from "../auth/auth";
import { useAppSession } from "../context/AppContext";

type Page = "dashboard" | "menu" | "categories" | "orders";


type AppHeaderProps = {
  currentPage: Page;
  onMenuToggle: () => void;
  pendingCount?: number;
};

const getDashboardSubtitle = () => {
  const now = new Date();

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(now);

  return `${formattedDate}`;
};

const PAGE_META: Record<Page, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: getDashboardSubtitle(),
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

export function AppHeader({
  currentPage,
  onMenuToggle,
  pendingCount = 0,
}: AppHeaderProps) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { session, clearSession: clearAppSession } = useAppSession();
  const { title, subtitle } = PAGE_META[currentPage] ?? PAGE_META.dashboard;

  const handleLogout = () => {
    clearSession();
    clearAppSession();
    setShowProfileMenu(false);
    navigate("/dashboard", { replace: true });
    window.location.reload();
  };

  return (
    <header
      className="bg-white border-b px-4 lg:px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-20"
      style={{ borderColor: C.border }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"
        >
          <Menu size={18} style={{ color: C.muted }} />
        </button>
        <div>
          <h1 className="text-base font-bold leading-tight" style={{ color: C.text }}>
            {title}
          </h1>
          <p className="text-xs hidden sm:block" style={{ color: C.muted }}>
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors">
          <Bell size={16} style={{ color: C.muted }} />
          {pendingCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: C.red }}
            />
          )}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: C.red + "20", color: C.red }}
            >
              {session.userName?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <span className="text-xs font-semibold" style={{ color: C.text }}>
              {session.userName}
            </span>
            <ChevronDown size={14} style={{ color: C.muted }} />
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-44 rounded-xl border bg-white shadow-lg z-30"
              style={{ borderColor: C.border }}
            >
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium hover:bg-gray-50"
                style={{ color: C.text }}
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/settings");
                }}
              >
                <Settings size={14} />
                Settings
              </button>

              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium hover:bg-red-50"
                style={{ color: C.red }}
                onClick={handleLogout}
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
