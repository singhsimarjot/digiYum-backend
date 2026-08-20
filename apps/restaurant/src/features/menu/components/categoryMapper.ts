import type { Category as ApiCategory } from "../../../api/categories";

export type Category = {
  id: number;
  name: string;
  icon: string;
  count: number;
  active: boolean;
};

function getCategoryIcon(name: string): string {
  const normalized = name.toLowerCase();

  if (normalized.includes("starter")) return "🥗";
  if (normalized.includes("indian")) return "🍛";
  if (normalized.includes("italian")) return "🍝";
  if (normalized.includes("pizza")) return "🍕";
  if (normalized.includes("burger")) return "🍔";
  if (normalized.includes("drink")) return "🥤";
  if (normalized.includes("dessert")) return "🍮";
  if (normalized.includes("vegan")) return "🌱";

  return "🍽️";
}

export function mapApiCategory(
  category: ApiCategory,
  menuItemCount = 0,
): Category {
  return {
    id: category.id,
    name: category.name,
    icon: getCategoryIcon(category.name),
    count: menuItemCount,
    active: category.is_active,
  };
}