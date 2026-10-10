import { create } from 'zustand';
import type { User, UserRole } from '../types/auth.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize from localStorage
  const savedState = localStorage.getItem('auth-storage');
  let initialUser: User | null = null;
  let initialToken: string | null = null;

  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      if (parsed.state) {
        initialUser = parsed.state.user || null;
        initialToken = parsed.state.token || null;
      }
    } catch (e) {
      console.error('Failed to parse auth state:', e);
    }
  }

  return {
    user: initialUser,
    token: initialToken,
    isAuthenticated: !!initialToken,
    isLoading: false,

    setAuth: (user: User, token: string) => {
      const newState = { user, token, isAuthenticated: true };
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({ state: newState })
      );
      set(newState);
    },

    logout: () => {
      localStorage.removeItem('auth-storage');
      set({ user: null, token: null, isAuthenticated: false });
    },

    updateUser: (partial: Partial<User>) => {
      set((prev) => {
        if (!prev.user) return prev;
        const updatedUser = { ...prev.user, ...partial };
        const newState = { ...prev, user: updatedUser };
        localStorage.setItem(
          'auth-storage',
          JSON.stringify({ state: { user: updatedUser, token: prev.token } })
        );
        return newState;
      });
    },
  };
});
