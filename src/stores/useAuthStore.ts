import { create } from 'zustand';
import type { User } from '../services/api';

type AuthState = {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => {
    if (typeof window !== 'undefined') window.localStorage.removeItem('chungbuk-farmer-access-token');
    set({ user: null });
  },
}));
