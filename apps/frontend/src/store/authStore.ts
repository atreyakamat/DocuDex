import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens } from '@docudex/shared-types';
import { authApi } from '@/services/api';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; fullName: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  initAuth: () => void;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      initAuth: () => {
        const state = get();
        if (state.tokens?.accessToken) {
          set({ isAuthenticated: true });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authApi.login({ email, password });
          set({
            user: data.data.user,
            tokens: data.data.tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Login failed. Please try again.';
          set({ isLoading: false, error: msg });
        }
      },

      register: async (formData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authApi.register(formData);
          set({
            user: data.data.user,
            tokens: data.data.tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed. Please try again.';
          set({ isLoading: false, error: msg });
        }
      },

      logout: async () => {
        const { tokens } = get();
        try {
          if (tokens?.refreshToken) {
            await authApi.logout(tokens.refreshToken);
          }
        } finally {
          set({ user: null, tokens: null, isAuthenticated: false });
        }
      },

      refreshToken: async () => {
        const { tokens } = get();
        if (!tokens?.refreshToken) return;
        try {
          const { data } = await authApi.refresh(tokens.refreshToken);
          set((state) => ({
            tokens: { ...state.tokens!, accessToken: data.data.accessToken },
          }));
        } catch {
          set({ user: null, tokens: null, isAuthenticated: false });
        }
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'docudex-auth',
      partialize: (state) => ({ tokens: state.tokens, user: state.user }),
    }
  )
);
