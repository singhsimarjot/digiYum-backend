import { getAccessToken, logout } from "../auth/auth";

const API_URL = "http://127.0.0.1:8000";

export type DashboardStats = {
  categories: number;
  menu_items: number;
  active_menu_items: number;
};

export type DashboardResponse = {
  restaurant: {
    id: number;
    name: string;
  };
  stats: DashboardStats;
};

export async function getDashboardSummary(): Promise<DashboardResponse> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_URL}/api/v1/dashboard`, {
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
    throw new Error(data?.detail || "Failed to load dashboard data");
  }

  return response.json();
}
