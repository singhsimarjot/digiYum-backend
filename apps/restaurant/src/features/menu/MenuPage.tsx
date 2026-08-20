import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Check,
  Leaf,
  Flame,
  Edit2,
  Trash2,
  Star,
  X,
} from "lucide-react";

import { C } from "../shared/theme";

import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  type MenuItemCreate,
  type MenuItemUpdate,
} from "../../api/menu-items";

import {
  mapApiMenuItem,
  type MenuItem,
} from "./menuMapper";

import {
  getCategories,
  createCategory,
  updateCategory,
  type CategoryCreate,
} from "../../api/categories";

import {
  mapApiCategory,
  type Category,
} from "./components/categoryMapper";


/* ============================================================
   FORM TYPE
============================================================ */

type MenuItemFormState = {
  name: string;
  category_ids: number[];
  price: string;
  description: string;
};


const emptyItemForm: MenuItemFormState = {
  name: "",
  category_ids: [],
  price: "",
  description: "",
};


/* ============================================================
   PAGE
============================================================ */

export function MenuPage() {
  /* ============================================================
     STATE
  ============================================================ */

  const [menuItems, setMenuItems] =
    useState<MenuItem[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [selectedCat, setSelectedCat] =
    useState("All");

  const [showItemForm, setShowItemForm] =
    useState(false);

  const [editingItemId, setEditingItemId] =
    useState<number | null>(null);

  const [newItem, setNewItem] =
    useState<MenuItemFormState>(
      emptyItemForm,
    );


  /* ============================================================
     LOAD CATEGORIES + MENU ITEMS
  ============================================================ */

  useEffect(() => {
    async function loadMenuData() {
      try {
        setLoading(true);
        setError("");

        const [
          categoryData,
          menuItemData,
        ] = await Promise.all([
          getCategories(),
          getMenuItems(),
        ]);

        /*
         * Calculate menu item count for
         * each category.
         */
        const mappedCategories =
          categoryData.map(
            (category) => {
              const count =
                menuItemData.filter(
                  (item) =>
                    item.category_ids.includes(
                      category.id,
                    ),
                ).length;

              return mapApiCategory(
                category,
                count,
              );
            },
          );

        /*
         * Map backend menu items
         * into the UI model.
         */
        const mappedMenuItems =
          menuItemData.map((item) =>
            mapApiMenuItem(
              item,
              mappedCategories,
            ),
          );

        setCategories(
          mappedCategories,
        );

        setMenuItems(
          mappedMenuItems,
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load menu",
        );
      } finally {
        setLoading(false);
      }
    }

    loadMenuData();
  }, []);


  /* ============================================================
     FILTER MENU ITEMS
  ============================================================ */

  const filtered =
    menuItems.filter((item) => {
      const categoryMatch =
        selectedCat === "All" ||
        item.categories.some(
          (category) =>
            category.name ===
            selectedCat,
        );

      const searchMatch =
        item.name
          .toLowerCase()
          .includes(
            search
              .trim()
              .toLowerCase(),
          );

      return (
        categoryMatch &&
        searchMatch
      );
    });


  /* ============================================================
     RECALCULATE CATEGORY COUNTS
  ============================================================ */

  function refreshCategoryCounts(
    items: MenuItem[],
  ) {
    setCategories(
      (previous) =>
        previous.map(
          (category) => ({
            ...category,

            count:
              items.filter(
                (item) =>
                  item.categories.some(
                    (
                      itemCategory,
                    ) =>
                      itemCategory.id ===
                      category.id,
                  ),
              ).length,
          }),
        ),
    );
  }


  /* ============================================================
     ADD CATEGORY
  ============================================================ */

  const addCategory = async (
    name: string,
    _icon: string,
  ) => {
    try {
      setError("");

      const payload:
        CategoryCreate = {
        name: name.trim(),

        description: null,

        image_url: null,

        sort_order:
          categories.length,
      };

      const created =
        await createCategory(
          payload,
        );

      const mapped =
        mapApiCategory(
          created,
          0,
        );

      setCategories(
        (previous) => [
          ...previous,
          mapped,
        ],
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create category",
      );
    }
  };


  /* ============================================================
     CATEGORY ACTIVE TOGGLE
  ============================================================ */

  const toggleCatActive =
    async (id: number) => {
      const category =
        categories.find(
          (item) =>
            item.id === id,
        );

      if (!category) {
        return;
      }

      try {
        setError("");

        const updated =
          await updateCategory(
            id,
            {
              is_active:
                !category.active,
            },
          );

        const mapped =
          mapApiCategory(
            updated,
            category.count,
          );

        setCategories(
          (previous) =>
            previous.map(
              (item) =>
                item.id === id
                  ? mapped
                  : item,
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


  /* ============================================================
     MULTI CATEGORY SELECT
  ============================================================ */

  const toggleItemCategory = (
    categoryId: number,
  ) => {
    setNewItem(
      (previous) => {
        const selected =
          previous.category_ids.includes(
            categoryId,
          );

        return {
          ...previous,

          category_ids:
            selected
              ? previous.category_ids.filter(
                  (id) =>
                    id !==
                    categoryId,
                )
              : [
                  ...previous.category_ids,
                  categoryId,
                ],
        };
      },
    );
  };


  /* ============================================================
     OPEN CREATE FORM
  ============================================================ */

  const openCreateForm = () => {
    setEditingItemId(null);

    setNewItem(
      emptyItemForm,
    );

    setError("");

    setShowItemForm(true);
  };


  /* ============================================================
     OPEN EDIT FORM
  ============================================================ */

  const openEditForm = (
    item: MenuItem,
  ) => {
    setEditingItemId(
      item.id,
    );

    setNewItem({
      name: item.name,

      category_ids:
        item.categories.map(
          (category) =>
            category.id,
        ),

      price:
        item.price.toString(),

      description:
        item.description ?? "",
    });

    setError("");

    setShowItemForm(true);
  };


  /* ============================================================
     CLOSE FORM
  ============================================================ */

  const closeItemForm = () => {
    setShowItemForm(false);

    setEditingItemId(null);

    setNewItem(
      emptyItemForm,
    );
  };


  /* ============================================================
     CREATE / UPDATE MENU ITEM
  ============================================================ */

  const saveItem = async () => {
    if (
      !newItem.name.trim() ||
      !newItem.price ||
      newItem.category_ids
        .length === 0
    ) {
      setError(
        "Name, price and at least one category are required.",
      );

      return;
    }

    const price =
      Number(
        newItem.price,
      );

    if (
      Number.isNaN(price) ||
      price < 0
    ) {
      setError(
        "Please enter a valid price.",
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      /* ======================================================
         CREATE
      ====================================================== */

      if (
        editingItemId === null
      ) {
        const payload:
          MenuItemCreate = {
          name:
            newItem.name.trim(),

          description:
            newItem.description
              .trim() || null,

          price,

          image_url: null,

          is_available: true,

          is_featured: false,

          sort_order:
            menuItems.length,

          category_ids:
            newItem.category_ids,
        };

        const created =
          await createMenuItem(
            payload,
          );

        const mapped =
          mapApiMenuItem(
            created,
            categories,
          );

        setMenuItems(
          (previous) => {
            const next = [
              ...previous,
              mapped,
            ];

            refreshCategoryCounts(
              next,
            );

            return next;
          },
        );
      }

      /* ======================================================
         UPDATE
      ====================================================== */

      else {
        const payload:
          MenuItemUpdate = {
          name:
            newItem.name.trim(),

          description:
            newItem.description
              .trim() || null,

          price,

          category_ids:
            newItem.category_ids,
        };

        const updated =
          await updateMenuItem(
            editingItemId,
            payload,
          );

        const mapped =
          mapApiMenuItem(
            updated,
            categories,
          );

        setMenuItems(
          (previous) => {
            const next =
              previous.map(
                (item) =>
                  item.id ===
                  editingItemId
                    ? mapped
                    : item,
              );

            refreshCategoryCounts(
              next,
            );

            return next;
          },
        );
      }

      closeItemForm();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save menu item",
      );
    } finally {
      setSaving(false);
    }
  };


  /* ============================================================
     DELETE MENU ITEM
  ============================================================ */

  const removeItem = async (
    id: number,
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this menu item?",
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteMenuItem(
        id,
      );

      setMenuItems(
        (previous) => {
          const next =
            previous.filter(
              (item) =>
                item.id !== id,
            );

          refreshCategoryCounts(
            next,
          );

          return next;
        },
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete menu item",
      );
    }
  };


  /* ============================================================
     MENU ITEM ACTIVE / INACTIVE
  ============================================================ */

  const toggleItemStatus =
    async (
      item: MenuItem,
    ) => {
      try {
        setError("");

        const payload:
          MenuItemUpdate = {
          is_available:
            item.status !==
            "active",
        };

        const updated =
          await updateMenuItem(
            item.id,
            payload,
          );

        const mapped =
          mapApiMenuItem(
            updated,
            categories,
          );

        setMenuItems(
          (previous) =>
            previous.map(
              (current) =>
                current.id ===
                item.id
                  ? mapped
                  : current,
            ),
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to update menu item",
        );
      }
    };


  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span
          className="text-sm"
          style={{
            color: C.muted,
          }}
        >
          Loading menu...
        </span>
      </div>
    );
  }


  /* ============================================================
     UI
  ============================================================ */

  return (
    <div className="flex flex-col gap-6">

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div
          className="px-4 py-3 rounded-xl flex items-center justify-between gap-3"
          style={{
            background:
              "#FEE2E2",

            color:
              C.red,
          }}
        >
          <span className="text-sm">
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            <X size={15} />
          </button>
        </div>
      )}


      {/* ======================================================
          MENU ITEMS
      ====================================================== */}

      <div
        className="bg-white rounded-2xl p-5 border shadow-sm"
        style={{
          borderColor:
            C.border,
        }}
      >

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">

          <div>
            <h3
              className="font-bold text-sm"
              style={{
                color: C.text,
              }}
            >
              Menu Items
            </h3>

            <p
              className="text-xs mt-0.5"
              style={{
                color: C.muted,
              }}
            >
              {menuItems.length}{" "}
              items total
            </p>
          </div>


          <div className="flex items-center gap-2 flex-wrap">

                        {/* <button
                            type="button"
                            onClick={() => navigate("/categories")}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border"
                            style={{
                                borderColor: C.border,
                                background: "white",
                                color: C.text,
                            }}
                        >
                            <FolderOpen size={13} />
                            Categories
                        </button> */}

            <div className="relative">

              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2"
                style={{
                  color: C.muted,
                }}
              />

              <input
                value={
                  search
                }
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event.target
                      .value,
                  )
                }
                className="pl-8 pr-3 py-2 text-xs border rounded-xl w-44 focus:outline-none"
                style={{
                  borderColor:
                    C.border,
                }}
                placeholder="Search items…"
              />

            </div>


            {/* CATEGORY FILTER */}

            <select
              value={
                selectedCat
              }
              onChange={(
                event,
              ) =>
                setSelectedCat(
                  event.target
                    .value,
                )
              }
              className="text-xs border rounded-xl px-2 py-2 focus:outline-none"
              style={{
                borderColor:
                  C.border,
              }}
            >
              <option value="All">
                All Categories
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={
                      category.id
                    }
                    value={
                      category.name
                    }
                  >
                    {
                      category.name
                    }
                  </option>
                ),
              )}
            </select>


            {/* ADD ITEM */}

            <button
              type="button"
              onClick={
                openCreateForm
              }
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white"
              style={{
                background:
                  C.red,
              }}
            >
              <Plus size={13} />
              Add Item
            </button>

          </div>
        </div>


        {/* ====================================================
            CREATE / EDIT FORM
        ==================================================== */}

        {showItemForm && (

          <div
            className="mb-5 p-4 rounded-xl border"
            style={{
              background:
                "#FFF8F8",

              borderColor:
                C.red + "30",
            }}
          >

            {/* FORM HEADER */}

            <div className="flex items-center justify-between mb-4">

              <h4
                className="text-sm font-bold"
                style={{
                  color:
                    C.text,
                }}
              >
                {editingItemId ===
                null
                  ? "New Menu Item"
                  : "Edit Menu Item"}
              </h4>


              <button
                type="button"
                onClick={
                  closeItemForm
                }
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white"
              >
                <X
                  size={14}
                  style={{
                    color:
                      C.muted,
                  }}
                />
              </button>

            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* NAME */}

              <div>

                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{
                    color:
                      C.text,
                  }}
                >
                  Dish Name
                </label>

                <input
                  value={
                    newItem.name
                  }
                  onChange={(
                    event,
                  ) =>
                    setNewItem(
                      (
                        previous,
                      ) => ({
                        ...previous,

                        name:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none"
                  style={{
                    borderColor:
                      C.border,
                  }}
                  placeholder="Butter Chicken"
                />

              </div>


              {/* PRICE */}

              <div>

                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{
                    color:
                      C.text,
                  }}
                >
                  Price
                </label>

                <input
                  value={
                    newItem.price
                  }
                  onChange={(
                    event,
                  ) =>
                    setNewItem(
                      (
                        previous,
                      ) => ({
                        ...previous,

                        price:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none"
                  style={{
                    borderColor:
                      C.border,
                  }}
                  placeholder="0.00"
                  type="number"
                  min="0"
                  step="0.01"
                />

              </div>


              {/* DESCRIPTION */}

              <div className="sm:col-span-2">

                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{
                    color:
                      C.text,
                  }}
                >
                  Description
                </label>

                <textarea
                  value={
                    newItem.description
                  }
                  onChange={(
                    event,
                  ) =>
                    setNewItem(
                      (
                        previous,
                      ) => ({
                        ...previous,

                        description:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
                  rows={3}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none resize-none"
                  style={{
                    borderColor:
                      C.border,
                  }}
                  placeholder="Short description..."
                />

              </div>


              {/* =================================================
                  MULTI CATEGORY SELECT
              ================================================= */}

              <div className="sm:col-span-2">

                <label
                  className="block text-xs font-semibold mb-2"
                  style={{
                    color:
                      C.text,
                  }}
                >
                  Categories
                </label>


                <div className="flex flex-wrap gap-2">

                  {categories
                    .filter(
                      (
                        category,
                      ) =>
                        category.active,
                    )
                    .map(
                      (
                        category,
                      ) => {
                        const selected =
                          newItem.category_ids.includes(
                            category.id,
                          );

                        return (
                          <button
                            key={
                              category.id
                            }
                            type="button"
                            onClick={() =>
                              toggleItemCategory(
                                category.id,
                              )
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                            style={{
                              background:
                                selected
                                  ? C.red +
                                    "12"
                                  : "white",

                              color:
                                selected
                                  ? C.red
                                  : C.muted,

                              borderColor:
                                selected
                                  ? C.red
                                  : C.border,
                            }}
                          >

                            <span>
                              {
                                category.icon
                              }
                            </span>

                            <span>
                              {
                                category.name
                              }
                            </span>

                            {selected && (
                              <Check
                                size={
                                  12
                                }
                              />
                            )}

                          </button>
                        );
                      },
                    )}

                </div>


                {newItem
                  .category_ids
                  .length ===
                  0 && (

                  <p
                    className="text-[11px] mt-2"
                    style={{
                      color:
                        C.muted,
                    }}
                  >
                    Select at least one category
                  </p>
                )}

              </div>


              {/* =================================================
                  VEG / NON-VEG

                  UI only for now.
                  Backend doesn't have this field yet.
              ================================================= */}
{/* 
              <div className="sm:col-span-2">

                <label
                  className="block text-xs font-semibold mb-2"
                  style={{
                    color:
                      C.text,
                  }}
                >
                  Type
                </label>


                <div className="flex gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      setNewItem(
                        (
                          previous,
                        ) => ({
                          ...previous,

                          veg: true,
                        }),
                      )
                    }
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                    style={{
                      background:
                        newItem.veg
                          ? C.green +
                            "20"
                          : "rgba(0,0,0,0.05)",

                      color:
                        newItem.veg
                          ? C.green
                          : C.muted,
                    }}
                  >
                    <Leaf size={12} />
                    Veg
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setNewItem(
                        (
                          previous,
                        ) => ({
                          ...previous,

                          veg: false,
                        }),
                      )
                    }
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                    style={{
                      background:
                        !newItem.veg
                          ? C.red +
                            "20"
                          : "rgba(0,0,0,0.05)",

                      color:
                        !newItem.veg
                          ? C.red
                          : C.muted,
                    }}
                  >
                    <Flame size={12} />
                    Non-Veg
                  </button>

                </div>
              </div> */}


              {/* BUTTONS */}

              <div className="sm:col-span-2 flex gap-2 justify-end">

                <button
                  type="button"
                  onClick={
                    closeItemForm
                  }
                  className="text-xs px-3 py-2 rounded-lg"
                  style={{
                    color:
                      C.muted,
                  }}
                >
                  Cancel
                </button>


                <button
                  type="button"
                  onClick={
                    saveItem
                  }
                  disabled={
                    saving ||
                    !newItem.name.trim() ||
                    !newItem.price ||
                    newItem
                      .category_ids
                      .length === 0
                  }
                  className="text-xs font-bold px-4 py-2 rounded-lg text-white disabled:opacity-50"
                  style={{
                    background:
                      C.red,
                  }}
                >
                  {saving
                    ? "Saving..."
                    : editingItemId ===
                        null
                      ? "Add to Menu"
                      : "Save Changes"}
                </button>

              </div>

            </div>
          </div>
        )}


        {/* ====================================================
            TABLE
        ==================================================== */}

        <div className="overflow-x-auto -mx-1">

          <table className="w-full text-left min-w-[700px]">

            <thead>
              <tr
                className="border-b"
                style={{
                  borderColor:
                    C.border,
                }}
              >
                {[
                  "Item",
                  "Categories",
                  "Price",
                  "Orders",
                  "Rating",
                  "Status",
                  "",
                ].map(
                  (heading) => (
                    <th
                      key={
                        heading
                      }
                      className="text-xs font-semibold pb-2 pr-4"
                      style={{
                        color:
                          C.muted,
                      }}
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>


            <tbody>

              {filtered.map(
                (item) => (

                  <tr
                    key={
                      item.id
                    }
                    className="border-b hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor:
                        C.border,
                    }}
                  >

                    {/* ITEM */}

                    <td className="py-3 pr-4">

                      <div className="flex items-center gap-2">

                        <div
                          className="w-3 h-3 rounded-sm border-2 flex items-center justify-center flex-shrink-0"
                          style={{
                            borderColor:
                              item.veg
                                ? C.green
                                : C.red,
                          }}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              background:
                                item.veg
                                  ? C.green
                                  : C.red,
                            }}
                          />
                        </div>


                        <div>

                          <div
                            className="text-sm font-medium"
                            style={{
                              color:
                                C.text,
                            }}
                          >
                            {item.name}
                          </div>


                          {item.description && (

                            <div
                              className="text-[11px] mt-0.5 max-w-[220px] truncate"
                              style={{
                                color:
                                  C.muted,
                              }}
                            >
                              {
                                item.description
                              }
                            </div>

                          )}

                        </div>

                      </div>

                    </td>


                    {/* CATEGORIES */}

                    <td className="py-3 pr-4">

                      <div className="flex flex-wrap gap-1">

                        {item.categories.map(
                          (
                            category,
                          ) => (

                            <span
                              key={
                                category.id
                              }
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{
                                background:
                                  "rgba(0,0,0,0.05)",

                                color:
                                  C.muted,
                              }}
                            >
                              {
                                category.name
                              }
                            </span>

                          ),
                        )}

                      </div>

                    </td>


                    {/* PRICE */}

                    <td
                      className="py-3 pr-4 text-sm font-bold"
                      style={{
                        color:
                          C.text,
                      }}
                    >
                      $
                      {item.price.toFixed(
                        2,
                      )}
                    </td>


                    {/* ORDERS */}

                    <td
                      className="py-3 pr-4 text-sm"
                      style={{
                        color:
                          C.muted,
                      }}
                    >
                      {item.orders}
                    </td>


                    {/* RATING */}

                    <td className="py-3 pr-4">

                      <div className="flex items-center gap-1">

                        <Star
                          size={11}
                          fill={
                            C.yellow
                          }
                          style={{
                            color:
                              C.yellow,
                          }}
                        />

                        <span
                          className="text-sm"
                          style={{
                            color:
                              C.text,
                          }}
                        >
                          {item.rating ||
                            "—"}
                        </span>

                      </div>

                    </td>


                    {/* STATUS */}

                    <td className="py-3 pr-4">

                      <button
                        type="button"
                        onClick={() =>
                          toggleItemStatus(
                            item,
                          )
                        }
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background:
                            item.status ===
                            "active"
                              ? C.green +
                                "18"
                              : "rgba(0,0,0,0.06)",

                          color:
                            item.status ===
                            "active"
                              ? C.green
                              : C.muted,
                        }}
                      >
                        {item.status}
                      </button>

                    </td>


                    {/* ACTIONS */}

                    <td className="py-3">

                      <div className="flex items-center gap-1">

                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(
                              item,
                            )
                          }
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors"
                        >
                          <Edit2
                            size={
                              13
                            }
                            style={{
                              color:
                                "#3B82F6",
                            }}
                          />
                        </button>


                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              item.id,
                            )
                          }
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                        >
                          <Trash2
                            size={
                              13
                            }
                            style={{
                              color:
                                C.red,
                            }}
                          />
                        </button>

                      </div>

                    </td>

                  </tr>
                ),
              )}

            </tbody>

          </table>


          {/* EMPTY */}

          {filtered.length ===
            0 && (

            <div
              className="text-center py-10 text-sm"
              style={{
                color:
                  C.muted,
              }}
            >
              No items found.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}


export default MenuPage;