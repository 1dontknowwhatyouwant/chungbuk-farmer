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
  signup: (payload: { loginId: string; password: string; name: string; userType: UserType }) => api.post<User>('/api/auth/signup', payload, { headers: { 'Content-Type': 'application/json' } }),
  login: (loginId: string, password: string) => api.post<LoginResponse>('/api/auth/login', { loginId, password }, { headers: { 'Content-Type': 'application/json' } }),
  me: () => api.get<User>('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
  withdrawal: (password: string) => api.post('/api/auth/withdrawal', { password }),
};

export type FarmProfileStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'INACTIVE';
export type FarmProfilePayload = {
  farmName: string;
  representativeName: string;
  contactNumber: string;
  farmAddress: string;
  cityCounty: string;
  crops: string[];
  mainActivities: string;
  businessRegistrationNumber?: string | null;
  farmAreaPyeong: number;
};
export type FarmProfile = FarmProfilePayload & {
  id: number;
  status: FarmProfileStatus;
  reviewerId: number | null;
  reviewerName: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
};
export const farmProfileApi = {
  get: () => api.get<FarmProfile>("/api/farm-profiles/me"),
  create: (payload: FarmProfilePayload) => api.post<FarmProfile>("/api/farm-profiles", payload),
  update: (payload: FarmProfilePayload) => api.patch<FarmProfile>("/api/farm-profiles/me", payload),
};

export type PublicJobPosting = { id: number; farmProfileId: number; farmName: string; cityCounty: string; crop: string; workType: string; workDate: string; startTime: string; endTime: string; capacity: number; meetingPlace: string; supplies: string | null; precautions: string | null; farmMessage: string | null; applicantPreference: string | null; beginnerGuide: string | null; approvedAt: string; wageAmount: number; wageUnit: 'HOURLY' | 'DAILY'; title: string; description: string; recruitmentStatus: 'OPEN' | 'CLOSED'; acceptingApplications: boolean; myApplication: { applicationId: number; status: string } | null; };
export type JobPostingListResponse = { content: PublicJobPosting[]; page: number; size: number; totalElements: number; totalPages: number; hasNext: boolean; };
export const jobPostingApi = {
  list: (params?: { keyword?: string; region?: string; crop?: string; dateFrom?: string; dateTo?: string; workType?: string; recruitmentStatus?: 'OPEN' | 'CLOSED' | 'ALL'; page?: number; size?: number }) => api.get<JobPostingListResponse>('/api/job-postings', { params }),
  get: (id: number | string, includeClosed = false) => api.get<PublicJobPosting>(`/api/job-postings/${id}`, { params: { includeClosed } }),
};

// Farm-owner job posting management (ads.md): separate from the public jobPostingApi above.
export type JobPostingStatus = 'DRAFT' | 'PENDING_REVIEW' | 'OPEN' | 'CLOSED' | 'CANCELLED' | 'WORK_COMPLETED';
export type JobPostingDisplayStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'CLOSED' | 'REJECTED' | 'CANCELLED';
export type ReviewAction = 'EDITED' | 'APPROVED' | 'REJECTED' | 'CLOSED' | 'CANCELLED';

export type JobPostingRequest = {
  crop: string;
  workType: string;
  workDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  meetingPlace: string;
  wageAmount: number;
  wageUnit: 'HOURLY' | 'DAILY';
  supplies?: string | null;
  precautions?: string | null;
  farmMessage?: string | null;
  applicantPreference?: string | null;
  title: string;
  description: string;
  beginnerGuide?: string | null;
};

export type FarmJobPosting = JobPostingRequest & {
  id: number;
  farmProfileId: number;
  farmName: string;
  cityCounty: string;
  farmAddress: string;
  contactNumber: string;
  status: JobPostingStatus;
  displayStatus: JobPostingDisplayStatus;
  reviewRequestedAt: string | null;
  approvedAt: string | null;
  closedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  latestReviewAction: ReviewAction | null;
  latestReviewReason: string | null;
  latestReviewedAt: string | null;
};

export type FarmJobPostingListResponse = { content: FarmJobPosting[]; page: number; size: number; totalElements: number; totalPages: number; hasNext: boolean; };

export type ReviewHistoryEntry = {
  id: number;
  reviewerUserId: number;
  reviewerName: string;
  action: ReviewAction;
  reason: string | null;
  titleSnapshot: string;
  descriptionSnapshot: string;
  createdAt: string;
};

export const farmJobPostingApi = {
  list: (params?: { displayStatus?: JobPostingDisplayStatus; page?: number; size?: number }) =>
    api.get<FarmJobPostingListResponse>('/api/farm/job-postings', { params }),
  get: (postingId: number | string) => api.get<FarmJobPosting>(`/api/farm/job-postings/${postingId}`),
  reviewHistory: (postingId: number | string) => api.get<ReviewHistoryEntry[]>(`/api/farm/job-postings/${postingId}/review-history`),
  create: (payload: JobPostingRequest, submitForReview = false) =>
    api.post<FarmJobPosting>('/api/farm/job-postings', payload, { params: { submitForReview } }),
  update: (postingId: number | string, payload: JobPostingRequest) =>
    api.patch<FarmJobPosting>(`/api/farm/job-postings/${postingId}`, payload),
  remove: (postingId: number | string) => api.delete<void>(`/api/farm/job-postings/${postingId}`),
  submitReview: (postingId: number | string) => api.post<FarmJobPosting>(`/api/farm/job-postings/${postingId}/submit-review`),
  withdrawReview: (postingId: number | string) => api.post<FarmJobPosting>(`/api/farm/job-postings/${postingId}/withdraw-review`),
  updateApplicantPreference: (postingId: number | string, applicantPreference: string | null) =>
    api.patch<FarmJobPosting>(`/api/farm/job-postings/${postingId}/applicant-preference`, { applicantPreference }),
  cancel: (postingId: number | string) => api.post<FarmJobPosting>(`/api/farm/job-postings/${postingId}/cancel`),
};

// Farm home dashboard (ads.md 11): consolidates profile + posting counts + recent postings in one call.
export type WorkAssignmentStatus = 'SCHEDULED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
export type AttendanceStatus = 'NOT_RECORDED' | 'PRESENT' | 'ABSENT';
export type WorkAssignmentSummary = {
  id: number;
  jobPostingId: number;
  jobApplicationId: number;
  urbanFarmerUserId: number;
  urbanFarmerName: string;
  farmName: string;
  crop: string;
  workType: string;
  workDate: string;
  startTime: string;
  endTime: string;
  meetingPlace: string;
  status: WorkAssignmentStatus;
  attendanceStatus: AttendanceStatus;
};

export type FarmHomeResponse = {
  farmProfile: FarmProfile;
  postingCounts: Partial<Record<JobPostingStatus, number>>;
  displayPostingCounts: Partial<Record<JobPostingDisplayStatus, number>>;
  recentPostings: FarmJobPosting[];
  upcomingWork: WorkAssignmentSummary[];
};

export const farmHomeApi = {
  get: () => api.get<FarmHomeResponse>('/api/farm/me/home'),
};


// Dedicated client: market prices are served by a separate public host and need no auth token.
const marketPriceClient = axios.create({
  baseURL: 'https://cityfarmerplus-api-q2f7mbz7oq-uw.a.run.app',
  timeout: 10000,
});

export type MarketPriceDirection = 'UP' | 'DOWN' | 'UNCHANGED' | 'UNKNOWN';
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
  direction: MarketPriceDirection;
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
  latest: (params?: { marketType?: 'RETAIL' | 'WHOLESALE'; categoryCode?: string; keyword?: string; page?: number; size?: number }) =>
    marketPriceClient.get<MarketPriceResponse>('/api/market-prices/latest', { params }),
};
