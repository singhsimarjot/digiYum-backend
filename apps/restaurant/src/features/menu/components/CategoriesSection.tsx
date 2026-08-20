import { useState, type CSSProperties } from "react";
import { Plus, Check } from "lucide-react";
import { C } from "../../shared/theme";

export type Category = {
  id: number;
  name: string;
  icon: string;
  count: number;
  active: boolean;
};

type CategoriesSectionProps = {
  categories: Category[];
  onToggleActive: (id: number) => void;
  onAddCategory: (name: string, icon: string) => void;
};

export function CategoriesSection({
  categories,
  onToggleActive,
  onAddCategory,
}: CategoriesSectionProps) {
  const [showCatForm, setShowCatForm] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", icon: "🍽" });

  const addCategory = () => {
    if (!newCat.name.trim()) return;

    onAddCategory(newCat.name.trim(), newCat.icon || "🍽");
    setNewCat({ name: "", icon: "🍽" });
    setShowCatForm(false);
  };

  return (
    <div
      className="bg-white rounded-2xl p-5 border shadow-sm"
      style={{ borderColor: C.border }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm" style={{ color: C.text }}>
            Categories
          </h3>
          <p className="text-xs mt-0.5" style={{ color: C.muted }}>
            {categories.length} categories · {categories.filter((c) => c.active).length} active
          </p>
        </div>
        <button
          onClick={() => setShowCatForm((prev) => !prev)}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white transition-all active:scale-95"
          style={{ background: C.red }}
        >
          <Plus size={13} /> Add Category
        </button>
      </div>

      {showCatForm && (
        <div
          className="mb-4 p-4 rounded-xl border flex flex-col gap-3"
          style={{ background: "#FFF8F8", borderColor: C.red + "30" }}
        >
          <div className="flex gap-2">
            <input
              value={newCat.icon}
              onChange={(e) =>
                setNewCat((prev) => ({ ...prev, icon: e.target.value }))
              }
              className="w-14 text-center text-xl border rounded-xl p-2 focus:outline-none"
              style={{ borderColor: C.border }}
              placeholder="🍽"
              maxLength={2}
            />
            <input
              value={newCat.name}
              onChange={(e) =>
                setNewCat((prev) => ({ ...prev, name: e.target.value }))
              }
              className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: C.border,
                "--tw-ring-color": C.red,
              } as CSSProperties}
              placeholder="Category name e.g. Seafood"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowCatForm(false)}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ color: C.muted }}
            >
              Cancel
            </button>
            <button
              onClick={addCategory}
              className="text-xs font-bold px-4 py-1.5 rounded-lg text-white"
              style={{ background: C.red }}
            >
              Add Category
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="relative border rounded-xl p-3 flex flex-col gap-1 transition-all"
            style={{
              borderColor: cat.active ? C.red + "40" : C.border,
              background: cat.active ? "#FFF8F8" : "#FAFAFA",
            }}
          >
            <div className="flex items-start justify-between">
              <span className="text-2xl">{cat.icon}</span>
              <button
                onClick={() => onToggleActive(cat.id)}
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                style={{
                  borderColor: cat.active ? C.green : "#CBD5E1",
                  background: cat.active ? C.green : "transparent",
                }}
              >
                {cat.active && <Check size={10} color="white" />}
              </button>
            </div>
            <div className="text-sm font-semibold" style={{ color: C.text }}>
              {cat.name}
            </div>
            <div className="text-xs" style={{ color: C.muted }}>
              {cat.count} items
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoriesSection;
