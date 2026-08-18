import { useState, type CSSProperties } from "react";
import { Search, Plus, Check, Leaf, Flame, Edit2, Trash2, Star } from "lucide-react";
import { C } from "../shared/theme";

type Category = { id: number; name: string; icon: string; count: number; active: boolean };
const initCategories: Category[] = [
  { id: 1, name: "Starters", icon: "🥗", count: 6, active: true },
  { id: 2, name: "Indian", icon: "🍛", count: 12, active: true },
  { id: 3, name: "Italian", icon: "🍝", count: 8, active: true },
  { id: 4, name: "Pizza", icon: "🍕", count: 10, active: true },
  { id: 5, name: "Burgers", icon: "🍔", count: 7, active: true },
  { id: 6, name: "Drinks", icon: "🥤", count: 14, active: true },
  { id: 7, name: "Desserts", icon: "🍮", count: 9, active: true },
  { id: 8, name: "Vegan", icon: "🌱", count: 5, active: false },
];

type MenuItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  status: "active" | "inactive";
  rating: number;
  orders: number;
  veg: boolean;
};

const initMenuItems: MenuItem[] = [
  { id: 1, name: "Butter Chicken", category: "Indian", price: 18.5, status: "active", rating: 4.9, orders: 124, veg: false },
  { id: 2, name: "Margherita Pizza", category: "Pizza", price: 16, status: "active", rating: 4.7, orders: 98, veg: true },
  { id: 3, name: "Truffle Fettuccine", category: "Italian", price: 24, status: "active", rating: 4.8, orders: 61, veg: true },
  { id: 4, name: "Smash Burger", category: "Burgers", price: 15, status: "active", rating: 4.6, orders: 87, veg: false },
  { id: 5, name: "Samosa Chaat", category: "Starters", price: 9, status: "active", rating: 4.5, orders: 53, veg: true },
  { id: 6, name: "Mango Lassi", category: "Drinks", price: 6, status: "active", rating: 4.9, orders: 76, veg: true },
  { id: 7, name: "Gulab Jamun", category: "Desserts", price: 7.5, status: "inactive", rating: 4.8, orders: 40, veg: true },
  { id: 8, name: "Buddha Bowl", category: "Vegan", price: 17, status: "active", rating: 4.6, orders: 33, veg: true },
];

export function MenuPage() {
  const [categories, setCategories] = useState(initCategories);
  const [menuItems, setMenuItems] = useState(initMenuItems);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [showCatForm, setShowCatForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", icon: "🍽" });
  const [newItem, setNewItem] = useState({ name: "", category: "Indian", price: "", veg: true, description: "" });

  const filtered = menuItems.filter((i) => {
    const catMatch = selectedCat === "All" || i.category === selectedCat;
    const searchMatch = i.name.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  const addCategory = () => {
    if (!newCat.name.trim()) return;
    setCategories((prev) => [...prev, { id: Date.now(), name: newCat.name, icon: newCat.icon, count: 0, active: true }]);
    setNewCat({ name: "", icon: "🍽" });
    setShowCatForm(false);
  };

  const addItem = () => {
    if (!newItem.name.trim() || !newItem.price) return;
    setMenuItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newItem.name,
        category: newItem.category,
        price: parseFloat(newItem.price),
        status: "active",
        rating: 0,
        orders: 0,
        veg: newItem.veg,
      },
    ]);
    setNewItem({ name: "", category: "Indian", price: "", veg: true, description: "" });
    setShowItemForm(false);
  };

  const toggleCatActive = (id: number) =>
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));

  const deleteItem = (id: number) => setMenuItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-2xl p-5 border shadow-sm" style={{ borderColor: C.border }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm" style={{ color: C.text }}>Categories</h3>
            <p className="text-xs mt-0.5" style={{ color: C.muted }}>{categories.length} categories · {categories.filter((c) => c.active).length} active</p>
          </div>
          <button onClick={() => setShowCatForm(!showCatForm)} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white transition-all active:scale-95" style={{ background: C.red }}>
            <Plus size={13} /> Add Category
          </button>
        </div>

        {showCatForm && (
          <div className="mb-4 p-4 rounded-xl border flex flex-col gap-3" style={{ background: "#FFF8F8", borderColor: C.red + "30" }}>
            <div className="flex gap-2">
              <input value={newCat.icon} onChange={(e) => setNewCat((p) => ({ ...p, icon: e.target.value }))} className="w-14 text-center text-xl border rounded-xl p-2 focus:outline-none" style={{ borderColor: C.border }} placeholder="🍽" maxLength={2} />
              <input value={newCat.name} onChange={(e) => setNewCat((p) => ({ ...p, name: e.target.value }))} className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2" style={{ borderColor: C.border, "--tw-ring-color": C.red } as CSSProperties} placeholder="Category name e.g. Seafood" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCatForm(false)} className="text-xs px-3 py-1.5 rounded-lg" style={{ color: C.muted }}>Cancel</button>
              <button onClick={addCategory} className="text-xs font-bold px-4 py-1.5 rounded-lg text-white" style={{ background: C.red }}>Add Category</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <div key={cat.id} className="relative border rounded-xl p-3 flex flex-col gap-1 transition-all" style={{ borderColor: cat.active ? C.red + "40" : C.border, background: cat.active ? "#FFF8F8" : "#FAFAFA" }}>
              <div className="flex items-start justify-between">
                <span className="text-2xl">{cat.icon}</span>
                <button onClick={() => toggleCatActive(cat.id)} className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all" style={{ borderColor: cat.active ? C.green : "#CBD5E1", background: cat.active ? C.green : "transparent" }}>
                  {cat.active && <Check size={10} color="white" />}
                </button>
              </div>
              <div className="text-sm font-semibold" style={{ color: C.text }}>{cat.name}</div>
              <div className="text-xs" style={{ color: C.muted }}>{cat.count} items</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border shadow-sm" style={{ borderColor: C.border }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-sm" style={{ color: C.text }}>Menu Items</h3>
            <p className="text-xs mt-0.5" style={{ color: C.muted }}>{menuItems.length} items total</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 pr-3 py-2 text-xs border rounded-xl w-44 focus:outline-none" style={{ borderColor: C.border }} placeholder="Search items…" />
            </div>
            <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)} className="text-xs border rounded-xl px-2 py-2 focus:outline-none" style={{ borderColor: C.border }}>
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <button onClick={() => setShowItemForm(!showItemForm)} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white" style={{ background: C.red }}>
              <Plus size={13} /> Add Item
            </button>
          </div>
        </div>

        {showItemForm && (
          <div className="mb-4 p-4 rounded-xl border" style={{ background: "#FFF8F8", borderColor: C.red + "30" }}>
            <h4 className="text-sm font-bold mb-3" style={{ color: C.text }}>New Menu Item</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={newItem.name} onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))} className="border rounded-xl px-3 py-2 text-sm focus:outline-none" style={{ borderColor: C.border }} placeholder="Dish name" />
              <div className="flex gap-2">
                <select value={newItem.category} onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value }))} className="flex-1 text-sm border rounded-xl px-2 py-2 focus:outline-none" style={{ borderColor: C.border }}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
                  ))}
                </select>
                <input value={newItem.price} onChange={(e) => setNewItem((p) => ({ ...p, price: e.target.value }))} className="w-24 border rounded-xl px-3 py-2 text-sm focus:outline-none" style={{ borderColor: C.border }} placeholder="$0.00" type="number" min="0" step="0.5" />
              </div>
              <input value={newItem.description} onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))} className="sm:col-span-2 border rounded-xl px-3 py-2 text-sm focus:outline-none" style={{ borderColor: C.border }} placeholder="Short description (optional)" />
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: C.muted }}>Type:</span>
                <button onClick={() => setNewItem((p) => ({ ...p, veg: true }))} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all" style={{ background: newItem.veg ? C.green + "20" : "rgba(0,0,0,0.05)", color: newItem.veg ? C.green : C.muted }}>
                  <Leaf size={12} /> Veg
                </button>
                <button onClick={() => setNewItem((p) => ({ ...p, veg: false }))} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all" style={{ background: !newItem.veg ? C.red + "20" : "rgba(0,0,0,0.05)", color: !newItem.veg ? C.red : C.muted }}>
                  <Flame size={12} /> Non-Veg
                </button>
              </div>
              <div className="flex gap-2 justify-end items-center">
                <button onClick={() => setShowItemForm(false)} className="text-xs px-3 py-1.5 rounded-lg" style={{ color: C.muted }}>Cancel</button>
                <button onClick={addItem} className="text-xs font-bold px-4 py-1.5 rounded-lg text-white" style={{ background: C.red }}>Add to Menu</button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-left min-w-[540px]">
            <thead>
              <tr className="border-b" style={{ borderColor: C.border }}>
                {['Item', 'Category', 'Price', 'Orders', 'Rating', 'Status', ''].map((h) => (
                  <th key={h} className="text-xs font-semibold pb-2 pr-4" style={{ color: C.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: C.border }}>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: item.veg ? C.green : C.red }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.veg ? C.green : C.red }} />
                      </div>
                      <span className="text-sm font-medium" style={{ color: C.text }}>{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(0,0,0,0.05)", color: C.muted }}>
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-sm font-bold" style={{ color: C.text }}>${item.price.toFixed(2)}</td>
                  <td className="py-3 pr-4 text-sm" style={{ color: C.muted }}>{item.orders}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1">
                      <Star size={11} fill={C.yellow} style={{ color: C.yellow }} />
                      <span className="text-sm" style={{ color: C.text }}>{item.rating || "—"}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: item.status === "active" ? C.green + "18" : "rgba(0,0,0,0.06)", color: item.status === "active" ? C.green : C.muted }}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors">
                        <Edit2 size={13} style={{ color: "#3B82F6" }} />
                      </button>
                      <button onClick={() => deleteItem(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors">
                        <Trash2 size={13} style={{ color: C.red }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-10 text-sm" style={{ color: C.muted }}>No items found.</div>}
        </div>
      </div>
    </div>
  );
}

export default MenuPage;
