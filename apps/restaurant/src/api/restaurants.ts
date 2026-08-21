import { getAccessToken, logout } from "../auth/auth";
import type { components } from "@digiyum/types";

const API_URL = "http://127.0.0.1:8000";

export type Restaurant = components["schemas"]["RestaurantResponse"];
export type RestaurantUpdate = Partial<Restaurant>;

export async function getMyRestaurant(): Promise<Restaurant> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_URL}/api/v1/restaurants/`, {
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
    throw new Error(data?.detail || "Failed to load restaurant settings");
  }

  return response.json();
}

export async function updateRestaurant(
  payload: RestaurantUpdate,
): Promise<Restaurant> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_URL}/api/v1/restaurants/`, {
    method: "PATCH",
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
    throw new Error(data?.detail || "Failed to update restaurant settings");
  }

  return response.json();
}
