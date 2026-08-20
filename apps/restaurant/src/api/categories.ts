import { getAccessToken, logout } from "../auth/auth";
import type { components } from "@digiyum/types";

const API_URL = "http://127.0.0.1:8000";

export type Category =
  components["schemas"]["CategoryResponse"];

export type CategoryCreate =
  components["schemas"]["CategoryCreate"];

export type CategoryUpdate =
  components["schemas"]["CategoryUpdate"];


export async function getCategories(): Promise<Category[]> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${API_URL}/api/v1/categories`,
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

    throw new Error(
      data?.detail || "Failed to load categories",
    );
  }

  return response.json();
}


export async function createCategory(
  payload: CategoryCreate,
): Promise<Category> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${API_URL}/api/v1/categories`,
    {
      method: "POST",
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

    throw new Error(
      data?.detail || "Failed to create category",
    );
  }

  return response.json();
}


export async function updateCategory(
  categoryId: number,
  payload: CategoryUpdate,
): Promise<Category> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${API_URL}/api/v1/categories/${categoryId}`,
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

    throw new Error(
      data?.detail || "Failed to update category",
    );
  }

  return response.json();
}


export async function deleteCategory(
  categoryId: number,
): Promise<void> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${API_URL}/api/v1/categories/${categoryId}`,
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

    throw new Error(
      data?.detail || "Failed to delete category",
    );
  }
}