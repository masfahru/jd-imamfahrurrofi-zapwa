import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

type User = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super admin" | "user" | null;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>; // Logout is now async
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => {
        if (user.role === "admin" || user.role === "super admin") {
          set({ user, isAuthenticated: true });
        } else {
          console.error("Login failed: Insufficient permissions.");
          set({ user: null, isAuthenticated: false });
        }
      },
      logout: async () => {
        // Clear client-side state
        set({ user: null, isAuthenticated: false });
        // Also call the server to clear the HttpOnly cookie
        try {
          await fetch(`${SERVER_URL}/api/auth/sign-out`, {
            method: "POST",
            credentials: "include",
          });
        } catch (error) {
          console.error("Failed to sign out from server:", error);
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
