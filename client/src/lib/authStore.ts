import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

type User = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super admin" | "user" | null;
  licenseKey?: string | null;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  setUserProfile: (profile: Partial<User>) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => {
          set({ user, isAuthenticated: true });
      },
      logout: async () => {
        set({ user: null, isAuthenticated: false });
        try {
          await fetch(`${SERVER_URL}/api/auth/sign-out`, {
            method: "POST",
            credentials: "include",
          });
        } catch (error) {
          console.error("Failed to sign out from server:", error);
        }
      },
      setUserProfile: (profile) => {
        if (get().isAuthenticated) {
          set({ user: { ...get().user!, ...profile } });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
