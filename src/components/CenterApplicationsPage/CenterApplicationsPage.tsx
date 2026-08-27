"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import {
  centerAdminApi,
  type EducationSubmission,
  type ParticipationApplication,
  type ParticipationApplicationStatus,
} from "../../services/api";
import CenterFeedback from "../common/center/CenterFeedback";
import CenterModal from "../common/center/CenterModal";
import AppIcon from "../common/icon/AppIcon";
import ApplicationCard, { applicationStatusLabel } from "./ApplicationCard";
import styles from "./CenterApplicationsPage.module.css";

type Section = "participation" | "education";
type ParticipationFilter = "ALL" | ParticipationApplicationStatus;
type ModalState =
  | { kind: "approve-participation"; item: ParticipationApplication }
  | { kind: "reject-participation"; item: ParticipationApplication }
  | { kind: "approve-education"; item: EducationSubmission }
  | { kind: "reject-education"; item: EducationSubmission }
  | null;

const PAGE_SIZE = 3;

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(value));
}

export default function CenterApplicationsPage() {
  const router = useRouter();
  const requestId = useRef(0);
  const mutationInFlight = useRef(false);
  const [section, setSection] = useState<Section>("participation");
  const [filter, setFilter] = useState<ParticipationFilter>("ALL");
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [participation, setParticipation] = useState<ParticipationApplication[]>([]);
  const [education, setEducation] = useState<EducationSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [reason, setReason] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [recognizedHours, setRecognizedHours] = useState("");
  const [submitting, setSubmitting] = useState<number | null>(null);

  const load = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      if (section === "participation") {
        const { data } = await centerAdminApi.participationApplications();
        if (currentRequest === requestId.current) setParticipation(data);
      } else {
        const { data } = await centerAdminApi.educationSubmissions({ page: 0, size: 100 });
        if (currentRequest === requestId.current) setEducation(data.content);
      }
    } catch (cause) {
      if (currentRequest !== requestId.current) return;
      const status = isAxiosError(cause) ? cause.response?.status : undefined;
      setError(status === 401 ? "로그인이 필요하거나 만료되었습니다. 다시 로그인해 주세요." : status === 403 ? "센터 관리자 권한이 필요합니다." : "신청 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [section]);

  useEffect(() => {
    void load();
    return () => { requestId.current += 1; };
  }, [load]);

  const filteredParticipation = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    return participation.filter((item) => {
      const filterMatched = filter === "ALL" || item.status === filter;
      const keywordMatched = !normalized || item.urbanFarmerName.toLowerCase().includes(normalized) || String(item.urbanFarmerId).includes(normalized);
      return filterMatched && keywordMatched;
    });
  }, [filter, keyword, participation]);

  const pageCount = Math.ceil(filteredParticipation.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(0, pageCount - 1));
  const visibleParticipation = filteredParticipation.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const filteredEducation = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    return education.filter((item) => !normalized || item.urbanFarmerName.toLowerCase().includes(normalized) || item.courseTitle.toLowerCase().includes(normalized));
  }, [education, keyword]);

  const openModal = (next: NonNullable<ModalState>) => {
    if (mutationInFlight.current) return;
    setReason("");
    setModalError(null);
    if (next.kind === "approve-education") {
      setRecognizedHours(String(next.item.completionHours));
    }
    setModal(next);
  };

  const confirmModal = async () => {
    if (!modal || mutationInFlight.current) return;
    if ((modal.kind === "reject-participation" || modal.kind === "reject-education") && !reason.trim()) {
      setModalError("반려 사유를 입력해 주세요.");
      return;
    }
    setModalError(null);
    mutationInFlight.current = true;
    setSubmitting(modal.item.id);
    try {
      if (modal.kind === "approve-participation") {
        const { data } = await centerAdminApi.approveParticipation(modal.item.id);
        setParticipation((current) => current.map((entry) => entry.id === data.id ? data : entry));
      } else if (modal.kind === "reject-participation") {
        const { data } = await centerAdminApi.rejectParticipation(modal.item.id, reason.trim());
        setParticipation((current) => current.map((entry) => entry.id === data.id ? data : entry));
      } else if (modal.kind === "approve-education") {
        const hours = Number(recognizedHours);
        const minimumHours = Math.max(8, modal.item.requiredHoursSnapshot);
        if (!Number.isFinite(hours) || hours < minimumHours || hours > modal.item.completionHours) {
          setModalError(`인정 시간은 ${minimumHours}~${modal.item.completionHours}시간 사이여야 합니다.`);
          return;
        }
        await centerAdminApi.approveEducation(modal.item.id, hours);
        setEducation((current) => current.filter((entry) => entry.id !== modal.item.id));
      } else {
        await centerAdminApi.rejectEducation(modal.item.id, reason.trim());
        setEducation((current) => current.filter((entry) => entry.id !== modal.item.id));
      }
      setModal(null);
    } catch {
      setModalError("처리하지 못했습니다. 입력값과 현재 상태를 확인해 주세요.");
    } finally {
      mutationInFlight.current = false;
      setSubmitting(null);
    }
  };

  const downloadDocument = async (submission: EducationSubmission, documentId: number, filename: string) => {
    try {
      const { data } = await centerAdminApi.educationDocument(submission.id, documentId);
      const url = URL.createObjectURL(data);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      window.alert("증빙 파일을 내려받지 못했습니다.");
    }
  };

  return (
    <main className="min-h-screen bg-[#1f1f1f] sm:flex sm:justify-center sm:px-4 sm:py-8">
      <section className={styles.screen}>
      <header className={styles.header}>
        <button type="button" className={styles.back} aria-label="센터 홈으로 돌아가기" onClick={() => router.push("/center-home")}>
          <AppIcon name="chevron-left" size={24} strokeWidth={1.5} />
        </button>
        <h1>{section === "participation" ? "도시 농부 신청 대기 목록" : "도시 농부 교육 증빙 검토"}</h1>
      </header>
      <p className={styles.description}>관리자가 도시농부 신청 대기 건을 목록으로 조회하는 화면 입니다.</p>
      <label className={styles.search}>
        <span className="sr-only">검색</span>
        <input
          type="search"
          value={keyword}
          onChange={(event) => { setKeyword(event.target.value); setPage(0); }}
          placeholder={section === "participation" ? "이름 또는 신청자 번호 검색" : "이름 또는 교육 과정 검색"}
        />
        <span aria-hidden="true"><AppIcon name="search" size={22} strokeWidth={1.5} className={styles.searchIcon} /></span>
      </label>

      {section === "participation" ? (
        <div className={styles.filters} role="group" aria-label="신청 상태 필터">
          {(["ALL", "SUBMITTED", "APPROVED", "REJECTED"] as ParticipationFilter[]).map((value) => (
            <button key={value} type="button" aria-pressed={filter === value} onClick={() => { setFilter(value); setPage(0); }}>
              {value === "ALL" ? "전체" : applicationStatusLabel[value]}
            </button>
          ))}
        </div>
      ) : null}

      <div className={section === "participation" ? styles.list : styles.education} aria-busy={loading}>
        <CenterFeedback loading={loading} loadingLabel={section === "participation" ? "도시 농부 신청 목록을 불러오는 중입니다." : "교육 증빙 목록을 불러오는 중입니다."} error={error} onRetry={() => void load()} />
        {!loading && !error && section === "participation" && filteredParticipation.length === 0 ? <CenterFeedback empty="조건에 맞는 참여 신청이 없습니다." /> : null}
        {!loading && !error && section === "education" && filteredEducation.length === 0 ? <CenterFeedback empty="검토할 교육 증빙이 없습니다." /> : null}

        {!loading && !error && section === "participation" ? visibleParticipation.map((item) => (
          <ApplicationCard key={item.id} item={item} submitting={submitting === item.id} disabled={submitting !== null} onApprove={() => openModal({ kind: "approve-participation", item })} onReject={() => openModal({ kind: "reject-participation", item })} />
        )) : null}

        {!loading && !error && section === "education" ? filteredEducation.map((item) => (
          <article key={item.id} className="rounded-2xl border border-[#dce3d5] bg-white p-4 shadow-[0_3px_10px_rgba(91,110,72,0.08)]">
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="text-[17px] font-semibold text-[#3f4d51]">{item.urbanFarmerName}</h2><p className="mt-1 text-sm text-[#647175]">{item.courseTitle}</p></div>
              <span className="rounded-full bg-[#fff0c9] px-3 py-1 text-xs text-[#8d6717]">검토 대기</span>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[#f6f8f2] p-3 text-center text-xs">
              <div><dt className="text-[#829093]">이수</dt><dd className="mt-1 text-[#435055]">{item.completionHours}시간</dd></div>
              <div><dt className="text-[#829093]">필수</dt><dd className="mt-1 text-[#435055]">{item.requiredHoursSnapshot}시간</dd></div>
              <div><dt className="text-[#829093]">완료일</dt><dd className="mt-1 text-[#435055]">{formatDate(item.completionDate)}</dd></div>
            </dl>
            {item.documents.length ? <div className="mt-3 flex flex-wrap gap-2">{item.documents.map((document) => (
              <button key={document.id} type="button" onClick={() => void downloadDocument(item, document.id, document.originalFilename)} className="max-w-full truncate rounded-full bg-[#e8effb] px-3 py-2 text-xs text-[#385784]">↓ {document.originalFilename}</button>
            ))}</div> : null}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => openModal({ kind: "reject-education", item })} className="rounded-xl border border-[#d98e85] py-2.5 text-sm text-[#a9564d]">반려</button>
              <button type="button" onClick={() => openModal({ kind: "approve-education", item })} className="rounded-xl bg-[#7fa443] py-2.5 text-sm font-medium text-white">승인</button>
            </div>
          </article>
        )) : null}
      </div>

      {!loading && !error && section === "participation" && pageCount > 1 ? (
        <nav className={styles.pagination} aria-label="신청 목록 페이지">
          {Array.from({ length: pageCount }, (_, index) => (
            <button key={index} type="button" aria-label={`${index + 1}페이지`} aria-current={currentPage === index ? "page" : undefined} onClick={() => setPage(index)}>
              <span aria-hidden="true" />
            </button>
          ))}
        </nav>
      ) : null}
      <p className="sr-only" role="status">{loading ? "불러오는 중" : error ? error : section === "participation" ? `신청 ${filteredParticipation.length}건, ${pageCount ? currentPage + 1 : 0}/${pageCount}페이지` : `교육 증빙 ${filteredEducation.length}건`}</p>
      <button type="button" className={styles.educationToggle} disabled={submitting !== null} onClick={() => { setLoading(true); setSection(section === "participation" ? "education" : "participation"); setKeyword(""); setPage(0); }}>
        {section === "participation" ? "교육 증빙 검토" : "참여 신청 목록으로 돌아가기"}
      </button>

      {modal ? (
        <CenterModal
          variant={modal.kind === "approve-education" ? "default" : "review"}
          title={modal.kind === "approve-participation" ? "승인 처리" : modal.kind === "approve-education" ? "교육 이수 승인" : "반려 처리"}
          description={modal.kind === "approve-participation" ? undefined : modal.kind === "approve-education" ? "증빙을 확인하고 최종 인정 시간을 입력해 주세요." : "반려 사유를 입력해주세요. 사유는 도시 농부에게 전달됩니다."}
          confirmLabel={modal.kind === "approve-participation" ? "네" : modal.kind === "approve-education" ? "승인 확정" : "반려 확정"}
          cancelLabel={modal.kind === "approve-participation" ? "아니오" : "취소"}
          confirmFirst={modal.kind === "approve-participation"}
          submitting={submitting === modal.item.id}
          destructive={modal.kind === "reject-participation" || modal.kind === "reject-education"}
          onCancel={() => { if (!mutationInFlight.current) setModal(null); }}
          onConfirm={() => void confirmModal()}
        >
          {modal.kind === "approve-participation" ? (
            <div className={styles.approvalMessage}>
              <p>선택한 도시 농부 신청을 승인 하시겠습니까?</p>
              <p className={styles.approvalHint}>승인 후 도시농부 상태가 참여 가능으로 변경됩니다.</p>
            </div>
          ) : modal.kind === "approve-education" ? (
            <label className="block text-sm text-[#59676b]">인정 시간
              <input type="number" min={Math.max(8, modal.item.requiredHoursSnapshot)} max={modal.item.completionHours} value={recognizedHours} onChange={(event) => setRecognizedHours(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#d8dfd2] px-3 text-base outline-none focus:border-[#88a84f]" />
            </label>
          ) : (
            <label className={styles.reasonLabel}>반려 사유
              <textarea aria-invalid={Boolean(modalError)} aria-describedby={modalError ? "review-error" : undefined} value={reason} onChange={(event) => { setReason(event.target.value); setModalError(null); }} maxLength={500} rows={3} className={styles.reasonInput} />
            </label>
          )}
          {modalError ? <p id="review-error" role="alert" className="mt-2 text-sm text-[#9e4c43]">{modalError}</p> : null}
        </CenterModal>
      ) : null}
      </section>
    </main>
  );
}
