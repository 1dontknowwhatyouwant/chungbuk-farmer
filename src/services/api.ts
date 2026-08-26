import axios from 'axios';

export const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
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
  checkId: (loginId: string) => api.get<{ loginId: string; available: boolean }>('/api/auth/check-id', { params: { loginId } }),
  signup: (payload: { loginId: string; password: string; name: string; userType: UserType }) => api.post<User>('/api/auth/signup', payload),
  login: (loginId: string, password: string) => api.post<LoginResponse>('/api/auth/login', { loginId, password }),
  me: () => api.get<User>('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
  withdrawal: (password: string) => api.post('/api/auth/withdrawal', { password }),
};

export type PublicJobPosting = { id: number; farmProfileId: number; farmName: string; cityCounty: string; crop: string; workType: string; workDate: string; startTime: string; endTime: string; capacity: number; meetingPlace: string; supplies: string | null; precautions: string | null; farmMessage: string | null; applicantPreference: string | null; beginnerGuide: string | null; approvedAt: string; wageAmount: number; wageUnit: 'HOURLY' | 'DAILY'; title: string; description: string; recruitmentStatus: 'OPEN' | 'CLOSED'; acceptingApplications: boolean; myApplication: { applicationId: number; status: string } | null; };
export type JobPostingListResponse = { content: PublicJobPosting[]; page: number; size: number; totalElements: number; totalPages: number; hasNext: boolean; };
export const jobPostingApi = { list: (params?: { keyword?: string; region?: string; crop?: string; dateFrom?: string; dateTo?: string; workType?: string; recruitmentStatus?: 'OPEN' | 'CLOSED' | 'ALL'; page?: number; size?: number }) => api.get<JobPostingListResponse>('/api/job-postings', { params }), get: (id: number | string, includeClosed = false) => api.get<PublicJobPosting>(`/api/job-postings/${id}`, { params: { includeClosed } }) };
