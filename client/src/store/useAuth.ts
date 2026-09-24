import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';
import type { User } from '../types';

type AuthState = {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (body: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  acceptSession: (token: string, user: User) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      async login(email, password) {
        const data = await api.login(email, password);
        set({ token: data.token, user: data.user });
      },
      async register(body) {
        const data = await api.register(body);
        if (!data.token) throw new Error('Account created. Sign in to continue.');
        set({ token: data.token, user: data.user });
      },
      acceptSession(token, user) {
        set({ token, user });
      },
      logout() {
        set({ token: null, user: null });
      },
    }),
    { name: 'sg-auth', partialize: (state) => ({ token: state.token, user: state.user }) },
  ),
);
