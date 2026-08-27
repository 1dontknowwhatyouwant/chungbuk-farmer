// Run: node --experimental-strip-types --test src/services/farmOwnership.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const { api, centerAdminApi } = require('./api.ts');
const { readFarmProfiles, ownershipFilterStatuses, ownershipReviewState, ownershipStatusLabel, ownershipStatusDescription, applyFarmOwnershipReview } = require('./farmOwnership.ts');

const profile = {
  id: 7, farmName: '충주 사과농원', representativeName: '홍길동',
  contactNumber: '01012345678', farmAddress: '충청북도 충주시 예시로 1', cityCounty: 'CHUNGJU',
  crops: ['사과', '복숭아'], mainActivities: '사과 재배와 수확 작업을 합니다.',
  businessRegistrationNumber: '1234567890', farmAreaPyeong: 500, status: 'PENDING_REVIEW',
  reviewerId: null, reviewerName: null, reviewedAt: null, rejectionReason: null,
  createdAt: '2026-08-20T00:00:00Z', updatedAt: '2026-08-23T01:00:00Z',
};
const approvedReview = {
  id: 15, attemptNumber: 1, status: 'APPROVED', farmProfileStatus: 'APPROVED',
  submittedAt: '2026-08-23T01:00:00Z', reviewerId: 3, reviewerName: '충북 담당자',
  reviewedAt: '2026-08-24T13:00:00Z', rejectionReason: null,
  documents: [{ id: 30, originalFilename: '농지원부.pdf', contentType: 'application/pdf', sizeBytes: 204800 }],
  farmNameSnapshot: profile.farmName, representativeNameSnapshot: profile.representativeName,
  farmAddressSnapshot: profile.farmAddress, cityCountySnapshot: profile.cityCounty,
  businessRegistrationNumberSnapshot: profile.businessRegistrationNumber, farmAreaPyeongSnapshot: 500,
};
const rejectedReview = {
  ...approvedReview, status: 'REJECTED', farmProfileStatus: 'REJECTED',
  reviewedAt: '2026-08-24T13:05:00Z',
  rejectionReason: '농지원부의 소유자 정보가 대표자명과 일치하지 않습니다.',
};

test('reads the supplied array response and retains farm metadata', () => {
  assert.deepEqual(readFarmProfiles([profile]), [profile]);
  assert.deepEqual(readFarmProfiles([]), []);
});

test('rejects missing profile IDs instead of using unrelated user/application IDs', () => {
  const { id, ...withoutId } = profile;
  for (const data of [null, {}, { code: 'UNAUTHORIZED' }, [{ ...withoutId, userId: 42 }], [{ ...profile, id: -1 }], [{ ...profile, id: '42' }]]) {
    assert.throws(() => readFarmProfiles(data));
  }
  assert.throws(() => readFarmProfiles({ content: [profile], totalPages: 3 }));
  assert.throws(() => readFarmProfiles([approvedReview]));
});

test('the list status controls review actions and unknown states cannot be reviewed', () => {
  assert.equal(ownershipReviewState(profile), 'pending');
  assert.equal(ownershipReviewState({ ...profile, status: 'REJECTED' }), 'rejected');
  assert.equal(ownershipStatusLabel({ ...profile, status: 'APPROVED' }), '승인');
  assert.equal(ownershipReviewState({ ...profile, status: 'DRAFT' }), 'draft');
  assert.equal(ownershipReviewState({ ...profile, status: 'INACTIVE' }), 'inactive');
  assert.equal(ownershipStatusLabel({ ...profile, status: 'DRAFT' }), '미제출');
  assert.equal(ownershipStatusLabel({ ...profile, status: 'INACTIVE' }), '비활성');
  assert.match(ownershipStatusDescription({ ...profile, status: 'DRAFT' }), /소유 증빙 제출 후/);
  assert.match(ownershipStatusDescription({ ...profile, status: 'REJECTED' }), /수정·재제출/);
  assert.equal(ownershipReviewState({ ...profile, status: 'NEW_UNKNOWN_STATE' }), 'other');
  assert.equal(ownershipReviewState({ ...profile, status: undefined }), 'other');
});

test('approval and rejection update profile 7 without replacing its ID with review ID 15', () => {
  for (const review of [approvedReview, rejectedReview]) {
    const updated = applyFarmOwnershipReview(profile, review);
    assert.deepEqual(updated, {
      ...profile, status: review.farmProfileStatus, reviewerId: 3, reviewerName: '충북 담당자',
      reviewedAt: review.reviewedAt, rejectionReason: review.rejectionReason,
    });
    assert.equal(updated.id, 7);
    assert.equal(profile.status, 'PENDING_REVIEW');
  }
});

test('review snapshots do not overwrite current profile fields and profile status is authoritative', () => {
  const updated = applyFarmOwnershipReview(profile, {
    ...approvedReview, status: 'REJECTED', farmNameSnapshot: '이전 농장 이름', farmAreaPyeongSnapshot: 100,
  });
  assert.equal(updated.status, 'APPROVED');
  assert.equal(updated.farmName, profile.farmName);
  assert.equal(updated.farmAreaPyeong, 500);
  assert.throws(() => applyFarmOwnershipReview(profile, undefined));
  assert.throws(() => applyFarmOwnershipReview(profile, { ...approvedReview, farmProfileStatus: undefined }));
});

test('farm listing and ownership reviews send the new paths and rejection body', async () => {
  const originalAdapter = api.defaults.adapter;
  const requests = [];
  api.defaults.adapter = async config => {
    requests.push(config);
    const data = config.method === 'get' ? [profile] : config.url.endsWith('/approve') ? approvedReview : rejectedReview;
    return { data, status: 200, statusText: 'OK', headers: {}, config };
  };
  try {
    const result = await centerAdminApi.farmProfiles();
    const approved = await centerAdminApi.approveFarmOwnership(result.data[0].id);
    const rejected = await centerAdminApi.rejectFarmOwnership(result.data[0].id, `  ${rejectedReview.rejectionReason}  `);
    assert.deepEqual(approved.data, approvedReview);
    assert.deepEqual(rejected.data, rejectedReview);
    assert.deepEqual(requests.map(({ method, url }) => [method, url]), [
      ['get', '/api/admin/farm-profiles'],
      ['post', '/api/admin/farm-profiles/7/ownership/approve'],
      ['post', '/api/admin/farm-profiles/7/ownership/reject'],
    ]);
    assert.deepEqual(requests[0].params, { status: 'PENDING_REVIEW' });
    assert.equal(requests[1].data, undefined);
    assert.deepEqual(JSON.parse(requests[2].data), { reason: rejectedReview.rejectionReason });
    assert.throws(() => centerAdminApi.approveFarmOwnership(0));
    assert.throws(() => centerAdminApi.rejectFarmOwnership(42, '   '));
    assert.equal(requests.length, 3);
  } finally {
    api.defaults.adapter = originalAdapter;
  }
});

test('each list filter sends explicit server statuses, never an empty or ALL status', async () => {
  const originalAdapter = api.defaults.adapter;
  const requests = [];
  api.defaults.adapter = async config => {
    requests.push(new URL(api.getUri(config), 'https://example.test').searchParams.get('status'));
    return { data: [], status: 200, statusText: 'OK', headers: {}, config };
  };
  try {
    for (const [filter, expected] of [
      ['pending', ['PENDING_REVIEW']], ['approved', ['APPROVED']], ['rejected', ['REJECTED']],
      ['inactive', ['INACTIVE']], ['draft', ['DRAFT']],
      ['ALL', ['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'INACTIVE', 'DRAFT']],
    ]) {
      requests.length = 0;
      await Promise.all(ownershipFilterStatuses(filter).map(status => centerAdminApi.farmProfiles(status)));
      assert.deepEqual(requests, expected);
    }
  } finally {
    api.defaults.adapter = originalAdapter;
  }
});
