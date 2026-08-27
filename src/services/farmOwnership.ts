import type { AdminFarmProfile, FarmOwnershipReview, FarmProfileStatus } from './api';

export type OwnershipReviewState = 'pending' | 'approved' | 'rejected' | 'inactive' | 'draft' | 'other';
export type OwnershipFilter = 'ALL' | Exclude<OwnershipReviewState, 'other'>;

export function ownershipFilterStatuses(filter: OwnershipFilter): FarmProfileStatus[] {
  const statuses: Record<Exclude<OwnershipFilter, 'ALL'>, FarmProfileStatus> = {
    pending: 'PENDING_REVIEW', approved: 'APPROVED', rejected: 'REJECTED',
    inactive: 'INACTIVE', draft: 'DRAFT',
  };
  // ALL is a UI filter, not a server status. Include unsubmitted/inactive profiles.
  return filter === 'ALL' ? Object.values(statuses) : [statuses[filter]];
}

export function ownershipReviewState(profile: AdminFarmProfile): OwnershipReviewState {
  const status = profile.status;
  if (status === 'PENDING_REVIEW') return 'pending';
  if (status === 'APPROVED') return 'approved';
  if (status === 'REJECTED') return 'rejected';
  if (status === 'INACTIVE') return 'inactive';
  if (status === 'DRAFT') return 'draft';
  return 'other';
}

export function ownershipStatusLabel(profile: AdminFarmProfile) {
  const state = ownershipReviewState(profile);
  const labels: Record<OwnershipReviewState, string> = {
    pending: '대기', approved: '승인', rejected: '반려', inactive: '비활성', draft: '미제출', other: '검토 상태 확인 필요',
  };
  return labels[state];
}

export function ownershipStatusDescription(profile: AdminFarmProfile) {
  const descriptions: Record<OwnershipReviewState, string> = {
    pending: '소유 증빙이 제출되어 중개센터 심사를 기다리고 있습니다.',
    approved: '소유 증빙이 승인되어 공고 작성 등 승인 농가 기능을 사용할 수 있습니다.',
    rejected: '반려 사유를 확인하고 소유 증빙을 수정·재제출해야 합니다.',
    inactive: '탈퇴 등으로 비활성화되어 정상적인 농가 기능을 사용할 수 없습니다.',
    draft: '기본 프로필만 작성되어 있습니다. 소유 증빙 제출 후 심사할 수 있습니다.',
    other: '소유 증빙 심사 상태를 확인해 주세요.',
  };
  return descriptions[ownershipReviewState(profile)];
}

// The list endpoint returns an array of farm profiles, not ownership submissions.
export function readFarmProfiles(data: unknown): AdminFarmProfile[] {
  if (!Array.isArray(data) || data.some(item => !item || !Number.isSafeInteger(item.id) || item.id <= 0 || typeof item.farmName !== 'string' || typeof item.status !== 'string')) {
    throw new Error('농장 목록 응답 형식을 확인해 주세요.');
  }
  return data as AdminFarmProfile[];
}

export function applyFarmOwnershipReview(profile: AdminFarmProfile, review: FarmOwnershipReview): AdminFarmProfile {
  if (!review || !['APPROVED', 'REJECTED'].includes(review.farmProfileStatus)) {
    throw new Error('처리 응답을 확인하지 못했습니다. 목록을 새로 확인해 주세요.');
  }
  // Do not spread the review: its ID and historical snapshots are not profile data.
  return {
    ...profile,
    status: review.farmProfileStatus,
    reviewerId: review.reviewerId,
    reviewerName: review.reviewerName,
    reviewedAt: review.reviewedAt,
    rejectionReason: review.rejectionReason,
  };
}
