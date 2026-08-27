import axios from 'axios';

export const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  // 운영 서버가 cold start 중일 때도 인증/교육 조회가 중단되지 않도록 한다.
  timeout: 30000,
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

export const ACCESS_TOKEN_KEY = 'chungbuk-farmer-access-token';
export const ACCESS_TOKEN_EXPIRES_AT_KEY = 'chungbuk-farmer-access-token-expires-at';
const getAccessToken = () => typeof window === 'undefined' ? null : window.localStorage.getItem(ACCESS_TOKEN_KEY) ?? window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
const isExpired = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
  } catch { return false; }
};

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken && !isExpired(accessToken)) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

export type UserType = 'URBAN_FARMER' | 'FARM' | 'CENTER_ADMIN';
export type PublicSignupUserType = Exclude<UserType, 'CENTER_ADMIN'>;

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
  signup: (payload: { loginId: string; password: string; name: string; phoneNumber?: string; userType: PublicSignupUserType }) => api.post<User>('/api/auth/signup', payload, { headers: { 'Content-Type': 'application/json' } }),
  login: (loginId: string, password: string) => api.post<LoginResponse>('/api/auth/login', { loginId, password }, { headers: { 'Content-Type': 'application/json' } }),
  me: () => api.get<User>('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
  withdrawal: (password: string) => api.post('/api/auth/withdrawal', { password }),
};

export type FarmProfileStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'INACTIVE' | 'DRAFT';
export type FarmProfile = { id: number; farmName: string; representativeName: string; contactNumber: string; farmAddress: string; cityCounty: string; crops: string[]; mainActivities: string; businessRegistrationNumber?: string | null; farmAreaPyeong: number; status: FarmProfileStatus; };
export type AdminFarmProfile = FarmProfile & {
  reviewerId: number | null;
  reviewerName: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
};
export type FarmOwnershipReview = {
  /** Ownership submission ID, not the farm profile ID used in the request URL. */
  id: number;
  attemptNumber: number;
  status: 'APPROVED' | 'REJECTED';
  farmProfileStatus: 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewerId: number | null;
  reviewerName: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  documents: { id: number; originalFilename: string; contentType: string; sizeBytes: number }[];
  farmNameSnapshot: string;
  representativeNameSnapshot: string;
  farmAddressSnapshot: string;
  cityCountySnapshot: string;
  businessRegistrationNumberSnapshot: string | null;
  farmAreaPyeongSnapshot: number;
};
export type FarmProfilePayload = Omit<FarmProfile, "id" | "status">;
export const farmProfileApi = {
  get: () => api.get<FarmProfile>("/api/farm-profiles/me"),
  create: (payload: FarmProfilePayload) => api.post<FarmProfile>("/api/farm-profiles", payload),
  update: (payload: FarmProfilePayload) => api.patch<FarmProfile>("/api/farm-profiles/me", payload),
};

export type PublicJobPosting = { id: number; farmProfileId: number; farmName: string; cityCounty: string; crop: string; workType: string; workDate: string; startTime: string; endTime: string; capacity: number; meetingPlace: string; supplies: string | null; precautions: string | null; farmMessage: string | null; applicantPreference: string | null; beginnerGuide: string | null; approvedAt: string; wageAmount: number; wageUnit: 'HOURLY' | 'DAILY'; title: string; description: string; recruitmentStatus: 'OPEN' | 'CLOSED'; acceptingApplications: boolean; myApplication: { applicationId: number; status: string } | null; };
export type JobPostingListResponse = { content: PublicJobPosting[]; page: number; size: number; totalElements: number; totalPages: number; hasNext: boolean; };
export const jobPostingApi = { list: (params?: { keyword?: string; region?: string; crop?: string; dateFrom?: string; dateTo?: string; workType?: string; recruitmentStatus?: 'OPEN' | 'CLOSED' | 'ALL'; page?: number; size?: number }) => api.get<JobPostingListResponse>('/api/job-postings', { params }), get: (id: number | string, includeClosed = false) => api.get<PublicJobPosting>(`/api/job-postings/${id}`, { params: { includeClosed } }) };

export type WorkAssignment = { id: number; jobPostingId: number; jobApplicationId: number; urbanFarmerUserId: number; urbanFarmerName: string; confirmedByUserId: number | null; confirmedByName: string | null; confirmedByContactNumber: string | null; farmName: string; farmAddress: string; farmContactNumber: string | null; crop: string; workType: string; workDate: string; startTime: string; endTime: string; recruitmentCapacity: number | null; meetingPlace: string; wageAmount: number; wageUnit: 'HOURLY' | 'DAILY'; supplies: string | null; precautions: string | null; status: string; attendanceStatus: string | null; completedAt: string | null; };
export type ConfirmedWork = WorkAssignment;
export type WorkAssignmentGuide = {
  workAssignmentId: number;
  workSummary: string | null;
  officialPrecautions: string | null;
  preparationChecklist: string[];
  recommendedClothing: string[];
  safetyRules: string[];
  workSteps: string[];
  beginnerTip: string | null;
  generator: string | null;
};
export type ConfirmedWorkListResponse = WorkAssignment[] | { content: WorkAssignment[] } | { data: WorkAssignment[] };
export const confirmedWorkApi = {
  list: (params?: { view?: 'ALL' | 'UPCOMING' | 'PAST'; page?: number; size?: number }) => api.get<ConfirmedWorkListResponse>('/api/urban-farmers/me/work-assignments', { params }),
  get: (id: number | string) => api.get<WorkAssignment>(`/api/urban-farmers/me/work-assignments/${id}`),
  guide: (id: number | string) => api.get<WorkAssignmentGuide>(`/api/urban-farmers/me/work-assignments/${id}/guide`),
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
    const accessToken = getAccessToken();
    return api.get<EducationCertification>('/api/urban-farmers/me/education-certification', {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
  },
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

export type AdminDashboard = {
  submittedParticipationApplications: number;
  pendingEducationSubmissions: number;
  pendingFarmOwnershipSubmissions: number;
  pendingJobPostings: number;
  openJobPostings: number;
  pendingJobApplications: number;
  scheduledWorkAssignments: number;
  completedWorkAssignments: number;
  activeUrbanFarmerCount: number;
  activeFarmCount: number;
  activeCenterAdminCount: number;
};

export type ParticipationApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export type ParticipationApplication = {
  id: number;
  urbanFarmerId: number;
  urbanFarmerName: string;
  programYear: number;
  agriculturalBusinessRegistered: boolean;
  applicationNote?: string | null;
  status: ParticipationApplicationStatus;
  reviewedByUserId?: number | null;
  rejectionReason?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  cancelledAt?: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type ParticipationApplicationPayload = {
  programYear: number;
  agriculturalBusinessRegistered: boolean;
  applicationNote?: string;
};

export const participationApplicationApi = {
  me: () => api.get<ParticipationApplication | null>('/api/participation-applications/me'),
  submit: (payload: ParticipationApplicationPayload) =>
    api.post<ParticipationApplication>('/api/participation-applications', payload),
};

export type WorkPreference = {
  id: number;
  urbanFarmerId: number;
  preferredRegions: string[];
  availableDays: string[];
  availableWorkTypes: string[];
  preferredStartDate: string | null;
  preferredEndDate: string | null;
  canTravel: boolean;
  notes: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type WorkPreferencePayload = Omit<Pick<WorkPreference, 'preferredRegions' | 'availableDays' | 'availableWorkTypes' | 'preferredStartDate' | 'preferredEndDate' | 'canTravel' | 'notes'>, never>;
export const workPreferenceApi = {
  me: () => api.get<WorkPreference>('/api/urban-farmers/me/work-preference'),
  upsert: (payload: WorkPreferencePayload) => api.put<WorkPreference>('/api/urban-farmers/me/work-preference', payload),
};

export type EducationDocument = {
  id: number;
  displayOrder: number;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  sha256: string;
  createdAt: string;
};

export type EducationSubmission = {
  id: number;
  certificationId: number;
  urbanFarmerId: number;
  urbanFarmerName: string;
  courseId: number;
  courseTitle: string;
  requiredHoursSnapshot: number;
  attemptNumber: number;
  completionDate: string;
  completionHours: number;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  reviewedByUserId?: number | null;
  reviewedAt?: string | null;
  recognizedHours?: number | null;
  rejectionReason?: string | null;
  documents: EducationDocument[];
  version: number;
  submittedAt: string;
};

export type AdminJobPosting = {
  id: number;
  farmProfileId: number;
  farmName: string;
  cityCounty: string;
  farmAddress: string;
  contactNumber: string;
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
  status: string;
  displayStatus: string;
  reviewRequestedAt?: string | null;
  approvedAt?: string | null;
  closedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  latestReviewAction?: string | null;
  latestReviewReason?: string | null;
  latestReviewedAt?: string | null;
};

export const centerAdminApi = {
  dashboard: () => api.get<AdminDashboard>('/api/admin/dashboard'),
  farmProfiles: (status: FarmProfileStatus = 'PENDING_REVIEW') =>
    api.get<AdminFarmProfile[]>('/api/admin/farm-profiles', { params: { status } }),
  approveFarmOwnership: (profileId: number) => {
    if (!Number.isSafeInteger(profileId) || profileId <= 0) throw new Error('농장 프로필 ID가 올바르지 않습니다.');
    return api.post<FarmOwnershipReview>(`/api/admin/farm-profiles/${profileId}/ownership/approve`);
  },
  rejectFarmOwnership: (profileId: number, reason: string) => {
    if (!Number.isSafeInteger(profileId) || profileId <= 0) throw new Error('농장 프로필 ID가 올바르지 않습니다.');
    if (!reason.trim()) throw new Error('반려 사유를 입력해 주세요.');
    return api.post<FarmOwnershipReview>(`/api/admin/farm-profiles/${profileId}/ownership/reject`, { reason: reason.trim() });
  },
  participationApplications: () =>
    api.get<ParticipationApplication[]>('/api/admin/participation-applications'),
  participationApplication: (id: number) =>
    api.get<ParticipationApplication>(`/api/admin/participation-applications/${id}`),
  approveParticipation: (id: number) =>
    api.post<ParticipationApplication>(`/api/admin/participation-applications/${id}/approve`),
  rejectParticipation: (id: number, reason: string) =>
    api.post<ParticipationApplication>(`/api/admin/participation-applications/${id}/reject`, { reason }),
  educationSubmissions: (params?: { page?: number; size?: number }) =>
    api.get<PageResponse<EducationSubmission>>('/api/admin/education/submissions', { params }),
  educationSubmission: (id: number) =>
    api.get<EducationSubmission>(`/api/admin/education/submissions/${id}`),
  approveEducation: (id: number, recognizedHours: number) =>
    api.post<EducationSubmission>(`/api/admin/education/submissions/${id}/approve`, { recognizedHours }),
  rejectEducation: (id: number, reason: string) =>
    api.post<EducationSubmission>(`/api/admin/education/submissions/${id}/reject`, { reason }),
  educationDocument: (submissionId: number, documentId: number) =>
    api.get<Blob>(`/api/admin/education/submissions/${submissionId}/documents/${documentId}`, {
      responseType: 'blob',
    }),
  jobPostings: (params?: { page?: number; size?: number }) =>
    api.get<PageResponse<AdminJobPosting>>('/api/admin/job-postings', { params }),
  approveJobPosting: (id: number) =>
    api.post<AdminJobPosting>(`/api/admin/job-postings/${id}/approve`),
  rejectJobPosting: (id: number, reason: string) =>
    api.post<AdminJobPosting>(`/api/admin/job-postings/${id}/reject`, { reason }),
  workAssignments: (params?: { status?: string; page?: number; size?: number }) =>
    api.get<PageResponse<WorkAssignment>>('/api/admin/work-assignments', { params }),
};
