import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

import { C } from "../shared/theme";
import {
  getCategories,
  createCategory,
  updateCategory,
  type CategoryCreate,
} from "../../api/categories";
import { getMenuItems } from "../../api/menu-items";
import { CategoriesSection } from "./components/CategoriesSection";
import { mapApiCategory, type Category } from "./components/categoryMapper";

export function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategoriesPage() {
      try {
        setLoading(true);
        setError("");

        const [categoryData, menuItemData] = await Promise.all([
          getCategories(),
          getMenuItems(),
        ]);

        const mappedCategories = categoryData.map((category) => {
          const count = menuItemData.filter((item) =>
            item.category_ids.includes(category.id),
          ).length;

          return mapApiCategory(category, count);
        });

        setCategories(mappedCategories);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load categories",
        );
      } finally {
        setLoading(false);
      }
    }

    loadCategoriesPage();
  }, []);

  const handleAddCategory = async (name: string, _icon: string) => {
    try {
      setError("");

      const payload: CategoryCreate = {
        name: name.trim(),
        description: null,
        image_url: null,
        sort_order: categories.length,
      };

      const created = await createCategory(payload);

      setCategories((previous) => [
        ...previous,
        mapApiCategory(created, 0),
      ]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create category",
      );
    }
  };

  const handleToggleCategory = async (id: number) => {
    const category = categories.find((item) => item.id === id);

    if (!category) {
      return;
    }

    try {
      setError("");

      const updated = await updateCategory(id, {
        is_active: !category.active,
      });

      setCategories((previous) =>
        previous.map((item) =>
          item.id === id ? mapApiCategory(updated, item.count) : item,
        ),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update category",
      );
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/menu")}
          className="inline-flex items-center gap-2 text-xs font-semibold rounded-xl px-3 py-2 border"
          style={{
            borderColor: C.border,
            color: C.muted,
            background: "white",
          }}
        >
          <ArrowLeft size={14} />
          Back to Menu
        </button>

        <div className="text-xs" style={{ color: C.muted }}>
          {categories.length} total categories
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs"
          style={{ color: C.red }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          className="rounded-2xl border bg-white p-6 text-sm"
          style={{ borderColor: C.border, color: C.muted }}
        >
          Loading categories...
        </div>
      ) : (
        <CategoriesSection
          categories={categories}
          onToggleActive={handleToggleCategory}
          onAddCategory={handleAddCategory}
        />
      )}
    </div>
  );
}

export default CategoriesPage;
