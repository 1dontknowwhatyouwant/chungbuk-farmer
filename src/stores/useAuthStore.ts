import { create } from 'zustand';
import type { User } from '../services/api';

type AuthState = {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
};

const AUTH_USER_STORAGE_KEY = 'chungbuk-farmer-user';

const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;

  try {
    return JSON.parse(window.localStorage.getItem(AUTH_USER_STORAGE_KEY) ?? 'null') as User | null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    }
    set({ user });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('chungbuk-farmer-access-token');
      window.sessionStorage.removeItem('chungbuk-farmer-access-token');
      window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    }
    set({ user: null });
  },
}));
