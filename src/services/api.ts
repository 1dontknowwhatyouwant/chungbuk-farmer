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

// 농작물 시세 API는 인증이 필요 없는 공개 API입니다.
export const MARKET_PRICE_API_URL =
  process.env.NEXT_PUBLIC_MARKET_PRICE_API_URL ??
  'https://cityfarmerplus-api-q2f7mbz7oq-uw.a.run.app';

export const publicApi = axios.create({
  baseURL: MARKET_PRICE_API_URL.replace(/\/$/, ''),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const accessToken =
      window.localStorage.getItem('chungbuk-farmer-access-token') ??
      window.sessionStorage.getItem('chungbuk-farmer-access-token');
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
  signup: (payload: { loginId: string; password: string; name: string; phoneNumber?: string; userType: UserType }) => api.post<User>('/api/auth/signup', payload, { headers: { 'Content-Type': 'application/json' } }),
  login: (loginId: string, password: string) => api.post<LoginResponse>('/api/auth/login', { loginId, password }, { headers: { 'Content-Type': 'application/json' } }),
  me: () => api.get<User>('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
  withdrawal: (password: string) => api.post('/api/auth/withdrawal', { password }),
};

export type FarmProfile = { id: number; farmName: string; representativeName: string; contactNumber: string; farmAddress: string; cityCounty: string; crops: string[]; mainActivities: string; businessRegistrationNumber?: string | null; farmAreaPyeong: number; status: string; };
export type FarmProfilePayload = Omit<FarmProfile, "id" | "status">;
export const farmProfileApi = {
  get: () => api.get<FarmProfile>("/api/farm-profiles/me"),
  create: (payload: FarmProfilePayload) => api.post<FarmProfile>("/api/farm-profiles", payload),
  update: (payload: FarmProfilePayload) => api.patch<FarmProfile>("/api/farm-profiles/me", payload),
};

export type PublicJobPosting = { id: number; farmProfileId: number; farmName: string; cityCounty: string; crop: string; workType: string; workDate: string; startTime: string; endTime: string; capacity: number; meetingPlace: string; supplies: string | null; precautions: string | null; farmMessage: string | null; applicantPreference: string | null; beginnerGuide: string | null; approvedAt: string; wageAmount: number; wageUnit: 'HOURLY' | 'DAILY'; title: string; description: string; recruitmentStatus: 'OPEN' | 'CLOSED'; acceptingApplications: boolean; myApplication: { applicationId: number; status: string } | null; };
export type JobPostingListResponse = { content: PublicJobPosting[]; page: number; size: number; totalElements: number; totalPages: number; hasNext: boolean; };
export const jobPostingApi = { list: (params?: { keyword?: string; region?: string; crop?: string; dateFrom?: string; dateTo?: string; workType?: string; recruitmentStatus?: 'OPEN' | 'CLOSED' | 'ALL'; page?: number; size?: number }) => api.get<JobPostingListResponse>('/api/job-postings', { params }), get: (id: number | string, includeClosed = false) => api.get<PublicJobPosting>(`/api/job-postings/${id}`, { params: { includeClosed } }) };

export type ConfirmedWork = PublicJobPosting & {
  applicationId?: number;
  applicationStatus?: string;
  status?: string;
};
export type ConfirmedWorkListResponse = ConfirmedWork[] | { content: ConfirmedWork[] } | { data: ConfirmedWork[] };
export const confirmedWorkApi = {
  list: () => api.get<ConfirmedWorkListResponse>('/api/applications/me/confirmed'),
};

export type MarketPriceItem = {
  marketType: 'RETAIL' | 'WHOLESALE';
  categoryCode: string;
  categoryName: string;
  productNo: string;
  itemName: string;
  unit: string;
  observedDate: string;
  currentPrice: number;
  previousDayPrice: number;
  previousMonthPrice: number;
  previousYearPrice: number;
  direction: 'UP' | 'DOWN' | 'UNCHANGED' | 'UNKNOWN';
  changeRate: number;
};

export type MarketPriceResponse = {
  provider: string;
  description: string;
  observedDate: string;
  fetchedAt: string;
  stale: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  items: MarketPriceItem[];
};

export const marketPriceApi = {
  latest: (params?: {
    marketType?: 'RETAIL' | 'WHOLESALE';
    categoryCode?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }) =>
    publicApi.get<MarketPriceResponse>('/api/market-prices/latest', {
      params: { marketType: 'RETAIL', page: 0, size: 100, ...params },
    }),
};

export type EducationProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export type EducationCourse = {
  courseId: number;
  title: string;
  description: string;
  requiredHours: number;
  externalApplicationUrl: string | null;
  mandatory: boolean;
  latestSubmissionStatus: string | null;
  latestSubmissionId: number | null;
  attemptNumber: number | null;
  recognizedHours: number | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  progressStatus: EducationProgressStatus;
  totalMinutes: number;
  completedMinutes: number;
  remainingMinutes: number;
  progressPercentage: number;
  startedAt: string | null;
  completedAt: string | null;
  progressUpdatedAt: string | null;
  lastSyncedAt: string | null;
};

export type EducationCertification = {
  status: string;
  eligibleToApply: boolean;
  approvedRequiredCourseCount: number;
  requiredCourseCount: number;
  recognizedHours: number;
  courses: EducationCourse[];
};

export const educationApi = {
  getCertification: () => {
    const accessToken = typeof window !== 'undefined'
      ? window.localStorage.getItem('chungbuk-farmer-access-token') ??
        window.sessionStorage.getItem('chungbuk-farmer-access-token')
      : null;
    return api.get<EducationCertification>('/api/urban-farmers/me/education-certification', {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
  },
};
