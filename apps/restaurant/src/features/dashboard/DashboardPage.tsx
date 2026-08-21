import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  TrendingUp,
  Plus,
  Search,
  Bell,
  ChevronDown,
  Star,
  Clock,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Check,
  X,
  Edit2,
  Trash2,
  ChevronRight,
  AlertCircle,
  Menu,
  Package,
  Tag,
  Eye,
  Flame,
  Leaf,
  CheckCircle2,
  Timer,
  ChefHat,
  BarChart2,
  Filter,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { C } from "../shared/theme";
import { getDashboardSummary, type DashboardResponse } from "../../api/dashboard";

const revenueData = [
  { day: "Mon", revenue: 2840, orders: 34 },
  { day: "Tue", revenue: 3200, orders: 41 },
  { day: "Wed", revenue: 2950, orders: 37 },
  { day: "Thu", revenue: 4100, orders: 52 },
  { day: "Fri", revenue: 5200, orders: 68 },
  { day: "Sat", revenue: 6800, orders: 89 },
  { day: "Sun", revenue: 5900, orders: 74 },
];

const popularItems = [
  { name: "Butter Chicken", orders: 124, revenue: 2294, trend: +12 },
  { name: "Margherita Pizza", orders: 98, revenue: 1568, trend: +8 },
  { name: "Smash Burger", orders: 87, revenue: 1305, trend: -3 },
  { name: "Mango Lassi", orders: 76, revenue: 456, trend: +21 },
  { name: "Truffle Fettuccine", orders: 61, revenue: 1464, trend: +5 },
];

const hourlyData = [
  { hour: "10", orders: 4 }, { hour: "11", orders: 8 }, { hour: "12", orders: 22 },
  { hour: "13", orders: 31 }, { hour: "14", orders: 19 }, { hour: "15", orders: 11 },
  { hour: "16", orders: 9 }, { hour: "17", orders: 14 }, { hour: "18", orders: 28 },
  { hour: "19", orders: 41 }, { hour: "20", orders: 47 }, { hour: "21", orders: 35 },
  { hour: "22", orders: 18 },
];

function StatCard({ label, value, sub, trend, icon: Icon, color }: {
  label: string;
  value: string;
  sub: string;
  trend: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}) {
  const up = trend >= 0;
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border flex flex-col gap-3" style={{ borderColor: C.border }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: C.muted }}>{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + "18" }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold" style={{ color: C.text, fontFamily: "'DM Sans', sans-serif" }}>{value}</div>
        <div className="text-xs mt-1" style={{ color: C.muted }}>{sub}</div>
      </div>
      <div className="flex items-center gap-1">
        {up ? <ArrowUpRight size={14} style={{ color: C.green }} /> : <ArrowDownRight size={14} color="#EF4444" />}
        <span className="text-xs font-semibold" style={{ color: up ? C.green : "#EF4444" }}>
          {up ? "+" : ""}{trend}%
        </span>
        <span className="text-xs" style={{ color: C.muted }}>vs last week</span>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const data = await getDashboardSummary();
        if (isMounted) {
          setDashboardData(data);
        }
      } catch {
        if (isMounted) {
          setDashboardData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const stats = dashboardData?.stats ?? {
      categories: 0,
      menu_items: 0,
      active_menu_items: 0,
    };

    return {
      revenue: "$5,842",
      orders: dashboardData ? String(stats.menu_items || 0) : "68",
      avgOrder: "$24.30",
      covers: dashboardData ? String(stats.active_menu_items || 0) : "142",
      revenueSub: dashboardData ? `${stats.menu_items || 0} items in menu` : "68 orders completed",
      ordersSub: dashboardData ? `${stats.active_menu_items || 0} active items` : "12 pending right now",
      avgSub: dashboardData ? `${stats.categories || 0} categories` : "Per customer spend",
      coversSub: dashboardData ? "Available menu items" : "Dine-in guests served",
    };
  }, [dashboardData]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Revenue" value={summary.revenue} sub={summary.revenueSub} trend={14} icon={DollarSign} color={C.red} />
        <StatCard label="Total Orders" value={summary.orders} sub={summary.ordersSub} trend={8} icon={ClipboardList} color={C.orange} />
        <StatCard label="Avg Order Value" value={summary.avgOrder} sub={summary.avgSub} trend={-2} icon={TrendingUp} color="#8B5CF6" />
        <StatCard label="Covers Today" value={summary.covers} sub={summary.coversSub} trend={5} icon={Users} color={C.green} />
      </div>

      {loading && dashboardData === null && (
        <div className="text-xs text-muted" style={{ color: C.muted }}>
          Loading dashboard data…
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border shadow-sm" style={{ borderColor: C.border }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm" style={{ color: C.text }}>Weekly Revenue</h3>
              <p className="text-xs mt-0.5" style={{ color: C.muted }}>Mon – Sun · This week</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full" style={{ background: C.green + "18", color: C.green }}>
              <ArrowUpRight size={12} /> +14% vs last week
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.red} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={C.red} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                formatter={(value: number | string) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke={C.red} strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border shadow-sm" style={{ borderColor: C.border }}>
          <div className="mb-4">
            <h3 className="font-bold text-sm" style={{ color: C.text }}>Hourly Orders</h3>
            <p className="text-xs mt-0.5" style={{ color: C.muted }}>Today's peak hours</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hourlyData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}h`} />
              <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                formatter={(value: number | string) => [Number(value), "Orders"]}
              />
              <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
                {hourlyData.map((entry, i) => (
                  <Cell key={i} fill={entry.orders === Math.max(...hourlyData.map((d) => d.orders)) ? C.red : C.orange + "80"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border shadow-sm" style={{ borderColor: C.border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm" style={{ color: C.text }}>Top Dishes This Week</h3>
            <button className="text-xs font-semibold" style={{ color: C.red }}>View all</button>
          </div>
          <div className="flex flex-col gap-3">
            {popularItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: i === 0 ? C.red + "18" : "rgba(0,0,0,0.04)", color: i === 0 ? C.red : C.muted }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate" style={{ color: C.text }}>{item.name}</span>
                    <span className="text-sm font-bold ml-2 flex-shrink-0" style={{ color: C.text }}>${item.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <div className="flex-1 h-1 rounded-full mr-3" style={{ background: "rgba(0,0,0,0.06)" }}>
                      <div className="h-1 rounded-full transition-all" style={{ width: `${(item.orders / 124) * 100}%`, background: i === 0 ? C.red : C.orange }} />
                    </div>
                    <span className="text-xs flex-shrink-0" style={{ color: C.muted }}>{item.orders} orders</span>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-xs font-semibold flex-shrink-0" style={{ color: item.trend >= 0 ? C.green : "#EF4444" }}>
                  {item.trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(item.trend)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border shadow-sm" style={{ borderColor: C.border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm" style={{ color: C.text }}>Live Order Status</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.green }} />
              <span className="text-xs" style={{ color: C.muted }}>Live</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Pending", count: 1, color: C.yellow, bg: "#FEF3C7", icon: AlertCircle },
              { label: "Preparing", count: 2, color: "#3B82F6", bg: "#DBEAFE", icon: ChefHat },
              { label: "Ready", count: 2, color: C.green, bg: "#DCFCE7", icon: CheckCircle2 },
            ].map(({ label, count, color, bg, icon: Icon }) => (
              <div key={label} className="rounded-xl p-3 text-center flex flex-col items-center gap-1" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
                <div className="text-2xl font-bold" style={{ color }}>{count}</div>
                <div className="text-xs font-medium" style={{ color }}>{label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {[
              { id: "ORD-041", table: "T-08", time: "2 min ago", total: 49 },
              { id: "ORD-040", table: "T-03", time: "8 min ago", total: 40 },
              { id: "ORD-039", table: "T-12", time: "14 min ago", total: 63 },
            ].map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-t" style={{ borderColor: C.border }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: C.text }}>{order.id}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FFF5EC", color: C.orange }}>{order.table}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: C.muted }}>{order.time}</span>
                  <span className="text-xs font-bold" style={{ color: C.text }}>${order.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
