export type LoginResponse = {
  access_token: string;
  token_type: string;
  user_id: number;
  restaurant_id: number | null;
  role: string;
};

export type UserProfile = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  restaurant_id: number | null;
  is_active: boolean;
  created_at: string;
};

const TOKEN_KEY = "digiyum_access_token";
const USER_KEY = "digiyum_user";
const PROFILE_KEY = "digiyum_user_profile";

export function saveAuth(data: LoginResponse) {
  localStorage.setItem(TOKEN_KEY, data.access_token);

  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      user_id: data.user_id,
      restaurant_id: data.restaurant_id,
      role: data.role,
    }),
  );
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): {
  user_id: number;
  restaurant_id: number | null;
  role: string;
} | null {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function saveUserProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getUserProfile(): UserProfile | null {
  const profile = localStorage.getItem(PROFILE_KEY);

  if (!profile) {
    return null;
  }

  try {
    return JSON.parse(profile) as UserProfile;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(PROFILE_KEY);
}

export function logout() {
  clearSession();
}

export async function getCurrentUserProfile(): Promise<UserProfile> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch("http://127.0.0.1:8000/api/v1/auth/me", {
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
    throw new Error(data?.detail || "Failed to load profile");
  }

  const profile = await response.json();
  saveUserProfile(profile);
  return profile;
}

export async function updateCurrentUserProfile(payload: {
  first_name: string;
  last_name: string;
}): Promise<UserProfile> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch("http://127.0.0.1:8000/api/v1/auth/me", {
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
    throw new Error(data?.detail || "Failed to update profile");
  }

  const profile = await response.json();
  saveUserProfile(profile);
  return profile;
}