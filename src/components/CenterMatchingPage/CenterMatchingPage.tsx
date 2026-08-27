"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { centerAdminApi, type AdminJobPosting } from "../../services/api";
import CenterFilterDropdown from "../common/center/CenterFilterDropdown";
import CenterFeedback from "../common/center/CenterFeedback";
import CenterModal from "../common/center/CenterModal";
import AppIcon from "../common/icon/AppIcon";
import { postingStatus } from "../CenterPostingsPage/postingFilters";
import { fromApprovedParticipants, searchCandidates, type MatchingCandidate } from "./matchingCandidates";
import styles from "./CenterMatchingPage.module.css";

const PAGE_SIZE = 4;
const regionOptions = ["전체", "충북", "충남", "세종", "대전", "강원", "경기"].map((value) => ({ value, label: value }));
const monthOptions = [{ value: "전체", label: "전체" }, ...Array.from({ length: 12 }, (_, index) => ({ value: String(index + 1), label: `${index + 1}월` }))];

function errorMessage(cause: unknown, fallback: string) {
  const status = isAxiosError(cause) ? cause.response?.status : undefined;
  return status === 401 ? "로그인이 필요하거나 만료되었습니다. 다시 로그인해 주세요." : status === 403 ? "센터 관리자 권한이 필요합니다." : fallback;
}

export default function CenterMatchingPage({ selectedPostingIds }: { selectedPostingIds: number[] }) {
  const router = useRouter();
  const jobRequest = useRef(0);
  const searchRequest = useRef(0);
  const [postings, setPostings] = useState<AdminJobPosting[]>([]);
  const [postingId, setPostingId] = useState("");
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [region, setRegion] = useState("전체");
  const [month, setMonth] = useState("전체");
  const [keyword, setKeyword] = useState("");
  const [candidates, setCandidates] = useState<MatchingCandidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [unknownCount, setUnknownCount] = useState(0);
  const [page, setPage] = useState(0);
  const [confirming, setConfirming] = useState<{ candidate: MatchingCandidate; posting: AdminJobPosting } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const selectedIdsKey = selectedPostingIds.join(",");

  const resetSearch = useCallback(() => {
    searchRequest.current += 1;
    setCandidates([]); setSearched(false); setSearching(false); setSearchError(null);
    setUnknownCount(0); setPage(0); setNotice(null); setConfirming(null);
  }, []);

  const loadPostings = useCallback(async () => {
    const currentRequest = ++jobRequest.current;
    resetSearch();
    setPostings([]); setPostingId("");
    setJobsLoading(true); setJobsError(null);
    try {
      const { data } = await centerAdminApi.jobPostings({ page: 0, size: 100 });
      const all = [...data.content];
      for (let nextPage = 1; nextPage < data.totalPages; nextPage += 1) {
        if (currentRequest !== jobRequest.current) return;
        const result = await centerAdminApi.jobPostings({ page: nextPage, size: 100 });
        all.push(...result.data.content);
      }
      if (currentRequest !== jobRequest.current) return;
      const selected = selectedIdsKey ? new Set(selectedIdsKey.split(",").map(Number)) : null;
      const available = all.filter((posting) => ["pending", "approved"].includes(postingStatus(posting)) && (!selected || selected.has(posting.id)));
      setPostings(available);
      setPostingId(available.length ? String(available[0].id) : "");
    } catch (cause) {
      if (currentRequest === jobRequest.current) setJobsError(errorMessage(cause, "공고 목록을 불러오지 못했습니다."));
    } finally {
      if (currentRequest === jobRequest.current) setJobsLoading(false);
    }
  }, [selectedIdsKey, resetSearch]);

  useEffect(() => {
    void loadPostings();
    return () => { jobRequest.current += 1; searchRequest.current += 1; };
  }, [loadPostings]);

  const postingOptions = useMemo(() => postings.map((posting) => ({ value: String(posting.id), label: `${posting.workDate.slice(0, 7)} ${posting.title} (${posting.cityCounty})` })), [postings]);
  const selectedPosting = postings.find((posting) => String(posting.id) === postingId);
  const pageCount = Math.ceil(candidates.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(0, pageCount - 1));
  const visible = candidates.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const search = async () => {
    if (!selectedPosting || jobsLoading || jobsError) return;
    const currentRequest = ++searchRequest.current;
    setSearching(true); setSearched(true); setCandidates([]); setPage(0); setSearchError(null); setNotice(null); setUnknownCount(0);
    try {
      const { data } = await centerAdminApi.participationApplications();
      if (currentRequest !== searchRequest.current) return;
      const result = searchCandidates(fromApprovedParticipants(data), { region, month, keyword });
      setCandidates(result.results); setUnknownCount(result.unknownCount);
    } catch (cause) {
      if (currentRequest === searchRequest.current) setSearchError(errorMessage(cause, "후보 목록을 불러오지 못했습니다. 다시 검색해 주세요."));
    } finally {
      if (currentRequest === searchRequest.current) setSearching(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1f1f1f] sm:flex sm:justify-center sm:px-4 sm:py-8">
      <section className={styles.screen}>
        <header className={styles.header}>
          <button type="button" className={styles.back} aria-label="공고 검토로 돌아가기" onClick={() => router.push("/center-postings")}><AppIcon name="chevron-left" size={24} strokeWidth={1.5} /></button>
          <h1>매칭 관리</h1>
        </header>
        <p className={styles.description}>도시농부 목록을 확인하여 매칭 작업을 관리합니다.</p>
        <form className={styles.filters} onSubmit={(event) => { event.preventDefault(); void search(); }}>
          <CenterFilterDropdown fullWidth label="공고 선택" value={postingId} options={postingOptions} disabled={jobsLoading || Boolean(jobsError) || !postings.length} placeholder={jobsLoading ? "불러오는 중" : "선택할 공고가 없습니다"} onChange={(value) => { setPostingId(value); resetSearch(); }} />
          {jobsError ? <div className="mt-3"><CenterFeedback error={jobsError} onRetry={() => void loadPostings()} /></div> : null}
          {!jobsLoading && !jobsError && !postings.length ? <p className={styles.help}>선택한 공고가 없거나 검토 대상에서 제외되었습니다. 공고 검토 목록을 확인해 주세요.</p> : null}
          <div className={styles.filterRow}>
            <CenterFilterDropdown label="희망 지역" value={region} options={regionOptions} onChange={(value) => { setRegion(value); resetSearch(); }} />
            <CenterFilterDropdown label="가능 일정" value={month} options={monthOptions} onChange={(value) => { setMonth(value); resetSearch(); }} />
          </div>
          <label className={styles.regionLabel}>희망 지역
            <input aria-label="희망 지역 상세" value={keyword} onChange={(event) => { setKeyword(event.target.value); resetSearch(); }} placeholder="충남 서산시" />
          </label>
          <button type="submit" className={styles.searchButton} disabled={!selectedPosting || jobsLoading || Boolean(jobsError) || searching}>{searching ? "검색 중" : "후보 검색"}<span aria-hidden="true"><AppIcon name="search" size={24} strokeWidth={1.5} /></span></button>
        </form>

        <section className={styles.results} aria-labelledby="matching-candidates-title" aria-busy={searching}>
          <h2 id="matching-candidates-title">후보 도시 농부 목록</h2>
          <p className={styles.count} role="status">{searching ? "후보를 검색하고 있습니다." : searched && !searchError ? `총 ${candidates.length}명 조회 되었습니다.` : "공고를 선택하고 후보를 검색해 주세요."}</p>
          {notice ? <p className={styles.notice} role="status">{notice}</p> : null}
          <CenterFeedback loading={searching} error={searchError} onRetry={() => void search()} />
          {unknownCount > 0 ? <p className={styles.notice}>지역·일정 정보가 제공되지 않은 {unknownCount}명은 조건을 확인할 수 없어 제외했습니다. 전체 조건으로 조회할 수 있습니다.</p> : null}
          {searched && !searching && !searchError && !candidates.length && !unknownCount ? <CenterFeedback empty="조건에 맞는 참여 승인자가 없습니다." /> : null}
          {candidates.length > 0 ? <p className={styles.help}>참여 승인 목록 기준입니다. 지역·일정·교육 조건은 별도 확인이 필요합니다.</p> : null}
          <div className={styles.candidates}>
            {visible.map((candidate) => <article key={candidate.id} className={styles.candidate} aria-label={`${candidate.name} 신청자 ${candidate.id}`}>
              <div className={styles.candidateInfo}>
                <h3>{candidate.name}</h3>
                <p>{candidate.preferredRegion ?? "지역·일정 미제공"} · {candidate.educationCompleted == null ? "교육 미제공" : candidate.educationCompleted ? "교육 이수완료" : "교육 미이수"}</p>
                <p>참여 경험 {candidate.experienceYears ?? "미제공"}<span>이동 {candidate.transportationAvailable == null ? "미제공" : candidate.transportationAvailable ? "가능" : "불가"}</span></p>
              </div>
              <button type="button" className={styles.confirmButton} disabled={!selectedPosting} onClick={() => { if (selectedPosting) setConfirming({ candidate, posting: selectedPosting }); }}>매칭 확정</button>
            </article>)}
          </div>
        </section>
        {pageCount > 1 ? <nav className={styles.pagination} aria-label="후보 목록 페이지">
          {Array.from({ length: pageCount }, (_, index) => <button key={index} type="button" aria-label={`${index + 1}페이지`} aria-current={currentPage === index ? "page" : undefined} onClick={() => setPage(index)}><span aria-hidden="true" /></button>)}
        </nav> : null}
        <p className={styles.apiNotice}>후보 전용 조회·매칭 확정 API 연결 전입니다.</p>

        {confirming ? <CenterModal variant="review" title="매칭 확정" confirmLabel="확인" cancelLabel="취소" onCancel={() => setConfirming(null)} onConfirm={() => {
          // Never report a saved match until a real confirmation endpoint exists.
          setNotice(`${confirming.candidate.name}님의 선택을 확인했습니다. 매칭 확정 API가 연결되지 않아 저장되지 않았습니다.`);
          setConfirming(null);
        }}>
          <p className={styles.confirmQuestion}>매칭 확정 하시겠습니까?</p>
          <p className={styles.confirmSummary}>{confirming.posting.title}<br />{confirming.candidate.name}</p>
          <p className={styles.confirmWarning}>현재 확인 버튼은 선택 확인만 하며, 실제 매칭은 저장되지 않습니다.</p>
        </CenterModal> : null}
      </section>
    </main>
  );
}
