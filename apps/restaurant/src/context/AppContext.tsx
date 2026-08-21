import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getCurrentUserProfile, getUserProfile } from "../auth/auth";
import { getMyRestaurant } from "../api/restaurants";

type AppSession = {
  userName: string;
  restaurantName: string;
  restaurantLogo: string | null;
};

type AppContextValue = {
  session: AppSession;
  setSession: (next: Partial<AppSession>) => void;
  refreshSession: () => Promise<void>;
  clearSession: () => void;
};

const defaultSession: AppSession = {
  userName: "Owner",
  restaurantName: "Saveur",
  restaurantLogo: null,
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AppSession>(() => {
    const storedProfile = getUserProfile();

    return {
      userName:
        storedProfile && (storedProfile.first_name || storedProfile.last_name)
          ? `${storedProfile.first_name} ${storedProfile.last_name}`.trim()
          : defaultSession.userName,
      restaurantName: defaultSession.restaurantName,
      restaurantLogo: null,
    };
  });

  const setSession = useCallback((next: Partial<AppSession>) => {
    setSessionState((previous) => ({ ...previous, ...next }));
  }, []);

  const clearSession = useCallback(() => {
    setSessionState(defaultSession);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const [profile, restaurant] = await Promise.all([
        getCurrentUserProfile().catch(() => null),
        getMyRestaurant().catch(() => null),
      ]);

      const resolvedUserName =
        profile && (profile.first_name || profile.last_name)
          ? `${profile.first_name} ${profile.last_name}`.trim()
          : defaultSession.userName;

      const resolvedRestaurantName = restaurant?.name || defaultSession.restaurantName;
      const resolvedRestaurantLogo = restaurant?.logo_url || null;

      setSessionState({
        userName: resolvedUserName,
        restaurantName: resolvedRestaurantName,
        restaurantLogo: resolvedRestaurantLogo,
      });
    } catch {
      setSessionState(defaultSession);
    }
  }, []);

  const value = useMemo(
    () => ({
      session,
      setSession,
      refreshSession,
      clearSession,
    }),
    [session, setSession, refreshSession, clearSession],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppSession() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppSession must be used within AppProvider");
  }

  return context;
}
