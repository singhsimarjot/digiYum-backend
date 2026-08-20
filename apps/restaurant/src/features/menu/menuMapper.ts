import type { MenuItem as ApiMenuItem } from "../../api/menu-items";
import type { Category } from "./components/CategoriesSection";

export type MenuItem = {
  id: number;
  name: string;
  description?: string;
  categories: Category[];
  price: number;
  status: "active" | "inactive";
  rating: number;
  orders: number;
  veg: boolean;
};

export function mapApiMenuItem(
  item: ApiMenuItem,
  categories: Category[],
): MenuItem {
  const itemCategories = categories.filter((category) =>
    item.category_ids.includes(category.id),
  );

  return {
    id: item.id,
    name: item.name,

    description:
      item.description ?? undefined,

    categories: itemCategories,

    // FastAPI/OpenAPI currently returns price as string
    price: Number(item.price),

    status:
      item.is_available
        ? "active"
        : "inactive",

    // Not provided by backend yet
    rating: 0,

    // Not provided by backend yet
    orders: 0,

    // Not provided by backend yet
    veg: false,
  };
}