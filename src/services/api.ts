import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const accessToken = window.localStorage.getItem('chungbuk-farmer-access-token');
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export type UserType = 'URBAN_FARMER' | 'FARM';

export type User = {
  id: number;
  loginId: string;
  name: string;
  phoneNumber?: string | null;
  birthDate?: string | null;
  address?: string | null;
  userType: UserType;
  accountStatus: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: User;
};

export const authApi = {
  checkId: (loginId: string) => api.get<{ loginId: string; available: boolean }>('/auth/check-id', { params: { loginId } }),
  signup: (payload: { loginId: string; password: string; name: string; userType: UserType }) => api.post<User>('/auth/signup', payload),
  login: (loginId: string, password: string) => api.post<LoginResponse>('/auth/login', { loginId, password }),
  me: () => api.get<User>('/auth/me'),
  logout: () => api.post('/auth/logout'),
  withdrawal: (password: string) => api.post('/auth/withdrawal', { password }),
};
