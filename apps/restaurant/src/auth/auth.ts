export type LoginResponse = {
  access_token: string;
  token_type: string;
  user_id: number;
  restaurant_id: number | null;
  role: string;
};

const TOKEN_KEY = "digiyum_access_token";
const USER_KEY = "digiyum_user";

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

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function logout() {
  clearSession();
}