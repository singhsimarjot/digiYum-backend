import { NavLink } from "react-router";
import { C } from "../features/shared/theme";
import { useAppSession } from "../context/AppContext";

export type SidebarNavItem = {
  id: string;
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
};

type AppSidebarProps = {
  navItems: SidebarNavItem[];
  currentPage: string;
  sidebarOpen: boolean;
  onClose: () => void;
  pendingCount?: number;
};

export function AppSidebar({
  navItems,
  currentPage,
  sidebarOpen,
  onClose,
  pendingCount = 0,
}: AppSidebarProps) {
  const { session } = useAppSession();

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ width: 220, background: C.sidebar, minHeight: "100vh" }}
      >
        <div className="px-5 py-6 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ background: "linear-gradient(135deg, #E63946, #c0293a)" }}
          >
            {session.restaurantLogo ? (
              <img src={session.restaurantLogo} alt={session.restaurantName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-base">🍽</span>
            )}
          </div>
          <div>
            <div
              className="text-sm font-bold text-white truncate max-w-[110px]"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              {session.restaurantName}
            </div>
            <div className="text-[10px] font-medium" style={{ color: "#64748B" }}>
              Owner Portal
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 flex flex-col gap-1">
          <div
            className="text-[9px] font-bold tracking-widest uppercase px-2 mb-2"
            style={{ color: "#475569" }}
          >
            Main Menu
          </div>

          {navItems.map(({ id, path, label, icon: Icon }) => {
            const active = currentPage === id;

            return (
              <NavLink
                key={id}
                to={path}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all relative"
                style={{
                  background: active ? C.sidebarActive : "transparent",
                  color: active ? "white" : "#94A3B8",
                }}
              >
                <Icon size={16} />
                <span className="text-sm font-medium">{label}</span>
                {id === "orders" && pendingCount > 0 && (
                  <span
                    className="ml-auto w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{ background: C.red, color: "white" }}
                  >
                    {pendingCount}
                  </span>
                )}
                {active && (
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l-full"
                    style={{ background: C.red }}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

      </aside>
    </>
  );
}

export default AppSidebar;
