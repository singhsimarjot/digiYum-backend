import { getAccessToken, logout } from "../auth/auth";
import type { components } from "@digiyum/types";

const API_URL = "http://127.0.0.1:8000";

export type MenuItem = components["schemas"]["MenuItemResponse"];
export type MenuItemCreate = components["schemas"]["MenuItemCreate"];
export type MenuItemUpdate = components["schemas"]["MenuItemUpdate"];

export async function getMenuItems(): Promise<MenuItem[]> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_URL}/api/v1/menu-items`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      logout();
      throw new Error("Authentication expired");
    }

    const data = await response.json().catch(() => null);

    throw new Error(data?.detail || "Failed to load menu items");
  }

  return response.json();
}

export async function getMenuItem(menuItemId: number): Promise<MenuItem> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${API_URL}/api/v1/menu-items/${menuItemId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      logout();
      throw new Error("Authentication expired");
    }

    const data = await response.json().catch(() => null);

    throw new Error(data?.detail || "Failed to load menu item");
  }

  return response.json();
}

export async function createMenuItem(
  payload: MenuItemCreate,
): Promise<MenuItem> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_URL}/api/v1/menu-items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 401) {
      logout();
      throw new Error("Authentication expired");
    }

    const data = await response.json().catch(() => null);

    throw new Error(data?.detail || "Failed to create menu item");
  }

  return response.json();
}

export async function updateMenuItem(
  menuItemId: number,
  payload: MenuItemUpdate,
): Promise<MenuItem> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${API_URL}/api/v1/menu-items/${menuItemId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      logout();
      throw new Error("Authentication expired");
    }

    const data = await response.json().catch(() => null);

    throw new Error(data?.detail || "Failed to update menu item");
  }

  return response.json();
}

export async function deleteMenuItem(menuItemId: number): Promise<void> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${API_URL}/api/v1/menu-items/${menuItemId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      logout();
      throw new Error("Authentication expired");
    }

    const data = await response.json().catch(() => null);

    throw new Error(data?.detail || "Failed to delete menu item");
  }
}
