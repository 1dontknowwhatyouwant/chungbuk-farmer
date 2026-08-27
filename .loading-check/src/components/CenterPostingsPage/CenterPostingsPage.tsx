"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { centerAdminApi, type AdminJobPosting } from "../../services/api";
import CenterFeedback from "../common/center/CenterFeedback";
import CenterModal from "../common/center/CenterModal";
import CenterFilterDropdown from "../common/center/CenterFilterDropdown";
import AppIcon from "../common/icon/AppIcon";
import { formatWorkDate, postingStatus, postingStatusLabel, statusOptions, workCategory, workOptions } from "./postingFilters";
import styles from "./CenterPostingsPage.module.css";

type Review = { action: "approve" | "reject"; posting: AdminJobPosting };
const PAGE_SIZE = 3;
function formatWage(posting: AdminJobPosting) {
  return `${posting.wageAmount.toLocaleString("ko-KR")}원 / ${posting.wageUnit === "HOURLY" ? "시간" : "일"}`;
}

export default function CenterPostingsPage() {
  const router = useRouter();
  const requestId = useRef(0);
  const mutationInFlight = useRef(false);
  const [postings, setPostings] = useState<AdminJobPosting[]>([]);
  const [status, setStatus] = useState("ALL");
  const [workType, setWorkType] = useState("전체");
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [detail, setDetail] = useState<AdminJobPosting | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [reason, setReason] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const { data } = await centerAdminApi.jobPostings({ page: 0, size: 100 });
      const all = [...data.content];
      // Filters operate on the full result, not only the first API page.
      for (let nextPage = 1; nextPage < data.totalPages; nextPage += 1) {
        if (currentRequest !== requestId.current) return;
        const result = await centerAdminApi.jobPostings({ page: nextPage, size: 100 });
        all.push(...result.data.content);
      }
      if (currentRequest !== requestId.current) return;
      setPostings(all);
      setSelectedIds((ids) => ids.filter((id) => all.some((item) => item.id === id && ["pending", "approved"].includes(postingStatus(item)))));
    } catch (cause) {
      if (currentRequest !== requestId.current) return;
      const code = isAxiosError(cause) ? cause.response?.status : undefined;
      setError(code === 401 ? "로그인이 필요하거나 만료되었습니다. 다시 로그인해 주세요." : code === 403 ? "센터 관리자 권한이 필요합니다." : "농가 공고 검토 목록을 불러오지 못했습니다.");
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); return () => { requestId.current += 1; }; }, [load]);
  const filtered = useMemo(() => postings.filter((item) =>
    (status === "ALL" || postingStatus(item) === status) && (workType === "전체" || workCategory(item.workType) === workType)
  ), [postings, status, workType]);
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(0, pageCount - 1));
  const visible = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const openReview = (action: Review["action"], posting: AdminJobPosting) => {
    if (mutationInFlight.current || postingStatus(posting) !== "pending") return;
    setReason(""); setReviewError(null); setReview({ action, posting });
  };
  const confirmReview = async () => {
    if (!review || mutationInFlight.current) return;
    if (review.action === "reject" && !reason.trim()) { setReviewError("반려 사유를 입력해 주세요."); return; }
    mutationInFlight.current = true;
    setSubmitting(true); setReviewError(null);
    try {
      const { data } = review.action === "approve"
        ? await centerAdminApi.approveJobPosting(review.posting.id)
        : await centerAdminApi.rejectJobPosting(review.posting.id, reason.trim());
      setPostings((items) => items.map((item) => item.id === data.id ? data : item));
      if (review.action === "reject") setSelectedIds((ids) => ids.filter((id) => id !== data.id));
      setDetail((item) => item?.id === data.id ? data : item);
      setReview(null);
    } catch {
      setReviewError("처리하지 못했습니다. 현재 공고 상태를 확인하고 다시 시도해 주세요.");
    } finally { mutationInFlight.current = false; setSubmitting(false); }
  };

  return (
    <main className="min-h-screen bg-[#1f1f1f] sm:flex sm:justify-center sm:px-4 sm:py-8">
      <section className={styles.screen}>
        <header className={styles.header}>
          <button type="button" className={styles.back} aria-label="센터 홈으로 돌아가기" onClick={() => router.push("/center-home")}><AppIcon name="chevron-left" size={24} strokeWidth={1.5} /></button>
          <h1>농가 공고 검토 목록</h1>
        </header>
        <p className={styles.description}>농가에서 신청한 공고를 관리자가 확인합니다.</p>
        <div className={styles.toolbar}>
          <CenterFilterDropdown label="공고 상태" value={status} options={statusOptions} onChange={(value) => { setStatus(value); setPage(0); }} />
          <CenterFilterDropdown label="작업 종류" value={workType} options={workOptions} onChange={(value) => { setWorkType(value); setPage(0); }} />
        </div>
        <div className={styles.list} aria-busy={loading}>
          <CenterFeedback loading={loading} loadingLabel="농가 공고 검토 목록을 불러오는 중입니다." error={error} onRetry={() => void load()} />
          {!loading && !error && !filtered.length ? <CenterFeedback empty="조건에 맞는 농가 공고가 없습니다." /> : null}
          {!loading && !error ? visible.map((posting) => {
            const state = postingStatus(posting);
            const canSelect = state === "pending" || state === "approved";
            return (
              <article key={posting.id} className={`${styles.card} ${styles[state]}`} aria-label={`${posting.farmName} ${postingStatusLabel(posting)}`}>
                <span className={styles.status}>{postingStatusLabel(posting)}</span>
                <button type="button" className={styles.cardHeading} onClick={() => setDetail(posting)} aria-label={`${posting.farmName} 공고 상세 검토`}>
                  <h2>{posting.farmName}</h2><span>{posting.title}</span>
                </button>
                <dl className={styles.facts}>
                  <div><dt>작업일:</dt><dd>{formatWorkDate(posting.workDate)}</dd></div>
                  <div><dt>모집</dt><dd>{posting.capacity}명</dd></div>
                  <div><dt>집결</dt><dd>{posting.startTime.slice(0, 5)}</dd></div>
                </dl>
                <div className={styles.cardFooter}>
                  <button type="button" onClick={() => setDetail(posting)} className={styles.note}>
                    {posting.meetingPlace ? `집결 장소 ${posting.meetingPlace}` : "집결 장소 미입력 △"}
                    {!posting.supplies?.trim() ? <span>준비물 미입력 △</span> : null}
                  </button>
                  <label className={styles.selection}>
                    <input type="checkbox" aria-label={`${posting.farmName} 공고 선택`} checked={selectedIds.includes(posting.id)} disabled={!canSelect || submitting} onChange={() => setSelectedIds((ids) => ids.includes(posting.id) ? ids.filter((id) => id !== posting.id) : [...ids, posting.id])} />
                  </label>
                </div>
                {state === "pending" || state === "rejected" ? <div className={styles.actions}>
                  <button type="button" disabled={state !== "pending" || submitting} onClick={() => openReview("reject", posting)}>반려</button>
                  <button type="button" disabled={state !== "pending" || submitting} onClick={() => openReview("approve", posting)}>승인</button>
                </div> : null}
              </article>
            );
          }) : null}
        </div>
        {!loading && !error && pageCount > 1 ? <nav className={styles.pagination} aria-label="공고 목록 페이지">
          {Array.from({ length: pageCount }, (_, index) => <button key={index} type="button" aria-label={`${index + 1}페이지`} aria-current={currentPage === index ? "page" : undefined} onClick={() => setPage(index)}><span aria-hidden="true" /></button>)}
        </nav> : null}
        <p className="sr-only" role="status">{loading ? "불러오는 중" : error || `공고 ${filtered.length}건, ${pageCount ? currentPage + 1 : 0}/${pageCount}페이지, 선택 ${selectedIds.length}건`}</p>
        <footer className={styles.matching}>
          {selectedIds.length > 0 ? <div className={styles.selectionSummary}><span>{selectedIds.length}개 공고 선택</span><button type="button" onClick={() => setSelectedIds([])}>선택 해제</button></div> : null}
          <button type="button" className={styles.matchingButton} disabled={submitting} onClick={() => router.push(`/center-matching${selectedIds.length ? `?postingIds=${selectedIds.join(",")}` : ""}`)}>매칭 관리로 이동</button>
          {!selectedIds.length ? <p>매칭할 공고는 다음 화면에서 선택할 수 있습니다.</p> : null}
        </footer>

        {detail ? <div className={styles.detailOverlay} role="dialog" aria-modal="true" aria-labelledby="posting-detail-title">
          <article className={styles.detail}>
            <button type="button" className={styles.detailClose} onClick={() => setDetail(null)} aria-label="상세 닫기">×</button>
            <p className="mt-5 text-sm text-[#78904b]">{detail.farmName} · {detail.cityCounty}</p>
            <h2 id="posting-detail-title" className="mt-2 text-[22px] font-semibold">{detail.title}</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6">{detail.description}</p>
            <dl className={styles.detailFacts}>
              <div><dt>작업일시</dt><dd>{formatWorkDate(detail.workDate)} {detail.startTime.slice(0, 5)}~{detail.endTime.slice(0, 5)}</dd></div>
              <div><dt>집결 장소</dt><dd>{detail.meetingPlace || "미입력"}</dd></div>
              <div><dt>농가 주소</dt><dd>{detail.farmAddress}</dd></div>
              <div><dt>연락처</dt><dd>{detail.contactNumber}</dd></div>
              <div><dt>작업·작물</dt><dd>{detail.workType} · {detail.crop}</dd></div>
              <div><dt>임금</dt><dd>{formatWage(detail)}</dd></div>
              <div><dt>준비물</dt><dd>{detail.supplies || "별도 안내 없음"}</dd></div>
              <div><dt>주의사항</dt><dd>{detail.precautions || "없음"}</dd></div>
            </dl>
            {detail.beginnerGuide ? <p className="mt-4 whitespace-pre-wrap text-sm">초보자 안내: {detail.beginnerGuide}</p> : null}
            {detail.latestReviewReason ? <p className="mt-4 whitespace-pre-wrap text-sm text-[#9e4c43]">검토 사유: {detail.latestReviewReason}</p> : null}
            {postingStatus(detail) === "pending" ? <div className={styles.actions}>
              <button type="button" disabled={submitting} onClick={() => openReview("reject", detail)}>반려</button>
              <button type="button" disabled={submitting} onClick={() => openReview("approve", detail)}>승인</button>
            </div> : null}
          </article>
        </div> : null}
        {review ? <CenterModal variant="review" title={review.action === "approve" ? "승인 처리" : "반려 처리"} description={review.action === "reject" ? "반려 사유를 입력해주세요. 사유는 공고를 등록한 농가에 전달됩니다." : undefined} confirmLabel={review.action === "approve" ? "네" : "반려 확정"} cancelLabel={review.action === "approve" ? "아니오" : "취소"} confirmFirst={review.action === "approve"} submitting={submitting} onCancel={() => { if (!mutationInFlight.current) setReview(null); }} onConfirm={() => void confirmReview()}>
          {review.action === "approve" ? <p className="mt-3 text-xs leading-5">선택한 농가 공고를 승인하시겠습니까?</p> : <label className={styles.reasonLabel}>반려 사유
            <textarea className={styles.reasonInput} value={reason} onChange={(event) => { setReason(event.target.value); setReviewError(null); }} maxLength={1000} rows={3} aria-invalid={Boolean(reviewError)} aria-describedby={reviewError ? "posting-review-error" : undefined} />
          </label>}
          {reviewError ? <p id="posting-review-error" role="alert" className="mt-2 text-xs text-[#9e4c43]">{reviewError}</p> : null}
        </CenterModal> : null}
      </section>
    </main>
  );
}
