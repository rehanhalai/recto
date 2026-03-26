/**
 * Zustand Auth Store
 * Global authentication state management (Sync only)
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "../types";

const sanitizeUser = (user: User | null): User | null => {
  if (!user) {
    return null;
  }

  return {
    id: user.id ?? (user as User & { _id?: string })._id ?? "",
    userName: user.userName,
    fullName: user.fullName ?? null,
    email: user.email,
    avatarImage: user.avatarImage ?? null,
    coverImage: user.coverImage ?? null,
    role: user.role,
  };
};

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;

  // Setters
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  reset: () => void;
}

/**
 * Auth Store with persistence for user data
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,

      // Setters
      setUser: (user) =>
        set(() => {
          const sanitizedUser = sanitizeUser(user);
          return {
            user: sanitizedUser,
            isAuthenticated: !!sanitizedUser,
          };
        }),

      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

      // Reset state (Logout)
      reset: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) =>
  state.isAuthenticated;
