"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  centerAdminApi,
  type EducationSubmission,
  type ParticipationApplication,
  type ParticipationApplicationStatus,
} from "../../services/api";
import CenterFeedback from "../common/center/CenterFeedback";
import CenterModal from "../common/center/CenterModal";
import CenterShell from "../common/center/CenterShell";

type Section = "participation" | "education";
type ParticipationFilter = "ALL" | ParticipationApplicationStatus;
type ModalState =
  | { kind: "reject-participation"; item: ParticipationApplication }
  | { kind: "approve-education"; item: EducationSubmission }
  | { kind: "reject-education"; item: EducationSubmission }
  | null;

const statusLabel: Record<ParticipationApplicationStatus, string> = {
  DRAFT: "작성 중",
  SUBMITTED: "대기",
  APPROVED: "승인",
  REJECTED: "반려",
  CANCELLED: "취소",
};

const statusStyle: Record<ParticipationApplicationStatus, string> = {
  DRAFT: "bg-[#eceeea] text-[#687174]",
  SUBMITTED: "bg-[#fff0c9] text-[#8d6717]",
  APPROVED: "bg-[#def2c7] text-[#52762b]",
  REJECTED: "bg-[#f4d4d0] text-[#a04b42]",
  CANCELLED: "bg-[#e3e6e7] text-[#737d80]",
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(value));
}

export default function CenterApplicationsPage() {
  const [section, setSection] = useState<Section>("participation");
  const [filter, setFilter] = useState<ParticipationFilter>("ALL");
  const [keyword, setKeyword] = useState("");
  const [participation, setParticipation] = useState<ParticipationApplication[]>([]);
  const [education, setEducation] = useState<EducationSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [reason, setReason] = useState("");
  const [recognizedHours, setRecognizedHours] = useState("");
  const [submitting, setSubmitting] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [participationResult, educationResult] = await Promise.all([
        centerAdminApi.participationApplications(),
        centerAdminApi.educationSubmissions({ page: 0, size: 100 }),
      ]);
      setParticipation(participationResult.data);
      setEducation(educationResult.data.content);
    } catch {
      setError("신청 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredParticipation = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    return participation.filter((item) => {
      const filterMatched = filter === "ALL" || item.status === filter;
      const keywordMatched = !normalized || item.urbanFarmerName.toLowerCase().includes(normalized) || String(item.urbanFarmerId).includes(normalized);
      return filterMatched && keywordMatched;
    });
  }, [filter, keyword, participation]);

  const filteredEducation = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    return education.filter((item) => !normalized || item.urbanFarmerName.toLowerCase().includes(normalized) || item.courseTitle.toLowerCase().includes(normalized));
  }, [education, keyword]);

  const approveParticipation = async (item: ParticipationApplication) => {
    setSubmitting(item.id);
    try {
      const { data } = await centerAdminApi.approveParticipation(item.id);
      setParticipation((current) => current.map((entry) => entry.id === item.id ? data : entry));
    } catch {
      window.alert("승인 처리에 실패했습니다. 신청 상태를 다시 확인해 주세요.");
    } finally {
      setSubmitting(null);
    }
  };

  const openModal = (next: NonNullable<ModalState>) => {
    setReason("");
    if (next.kind === "approve-education") {
      setRecognizedHours(String(next.item.completionHours));
    }
    setModal(next);
  };

  const confirmModal = async () => {
    if (!modal) return;
    if (modal.kind !== "approve-education" && !reason.trim()) {
      window.alert("반려 사유를 입력해 주세요.");
      return;
    }
    setSubmitting(modal.item.id);
    try {
      if (modal.kind === "reject-participation") {
        const { data } = await centerAdminApi.rejectParticipation(modal.item.id, reason.trim());
        setParticipation((current) => current.map((entry) => entry.id === data.id ? data : entry));
      } else if (modal.kind === "approve-education") {
        const hours = Number(recognizedHours);
        const minimumHours = Math.max(8, modal.item.requiredHoursSnapshot);
        if (!Number.isFinite(hours) || hours < minimumHours || hours > modal.item.completionHours) {
          window.alert(`인정 시간은 ${minimumHours}~${modal.item.completionHours}시간 사이여야 합니다.`);
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
      window.alert("처리하지 못했습니다. 입력값과 현재 상태를 확인해 주세요.");
    } finally {
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
    <CenterShell title="도시 농부 신청 대기 목록" description="도시농부 참여 신청과 교육 증빙을 검토하고 승인 또는 반려할 수 있습니다.">
      <div className="grid grid-cols-2 rounded-xl bg-white/70 p-1 shadow-sm" role="tablist">
        {(["participation", "education"] as Section[]).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={section === value}
            onClick={() => { setSection(value); setKeyword(""); }}
            className={`rounded-[9px] py-2.5 text-sm ${section === value ? "bg-[#7fa443] font-medium text-white shadow" : "text-[#647074]"}`}
          >
            {value === "participation" ? `참여 신청 ${participation.filter((item) => item.status === "SUBMITTED").length}` : `교육 증빙 ${education.length}`}
          </button>
        ))}
      </div>

      <label className="mt-4 block">
        <span className="sr-only">검색</span>
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder={section === "participation" ? "이름 및 신청자 번호를 검색해주세요" : "이름 및 교육 과정을 검색해주세요"}
          className="h-11 w-full rounded-xl border border-[#d8dfd2] bg-white px-4 text-sm outline-none placeholder:text-[#a1aaac] focus:border-[#88a84f]"
        />
      </label>

      {section === "participation" ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {(["ALL", "SUBMITTED", "APPROVED", "REJECTED"] as ParticipationFilter[]).map((value) => (
            <button key={value} type="button" onClick={() => setFilter(value)} className={`shrink-0 rounded-full px-4 py-2 text-xs ${filter === value ? "bg-[#526166] text-white" : "bg-white text-[#6b777a]"}`}>
              {value === "ALL" ? "전체" : statusLabel[value]}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        <CenterFeedback loading={loading} error={error} onRetry={() => void load()} />
        {!loading && !error && section === "participation" && filteredParticipation.length === 0 ? <CenterFeedback empty="조건에 맞는 참여 신청이 없습니다." /> : null}
        {!loading && !error && section === "education" && filteredEducation.length === 0 ? <CenterFeedback empty="검토할 교육 증빙이 없습니다." /> : null}

        {!loading && !error && section === "participation" ? filteredParticipation.map((item) => (
          <article key={item.id} className="rounded-2xl border border-[#dce3d5] bg-white p-4 shadow-[0_3px_10px_rgba(91,110,72,0.08)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[17px] font-semibold text-[#3f4d51]">{item.urbanFarmerName}</h2>
                <p className="mt-1 text-xs text-[#7a8689]">신청자 #{item.urbanFarmerId} · {item.programYear}년 사업</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs ${statusStyle[item.status]}`}>{statusLabel[item.status]}</span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#f6f8f2] p-3 text-xs">
              <div><dt className="text-[#829093]">농업경영체</dt><dd className="mt-1 text-[#435055]">{item.agriculturalBusinessRegistered ? "등록" : "미등록"}</dd></div>
              <div><dt className="text-[#829093]">접수일</dt><dd className="mt-1 text-[#435055]">{formatDate(item.submittedAt)}</dd></div>
            </dl>
            {item.applicationNote ? <p className="mt-3 text-sm leading-5 text-[#59676b]">{item.applicationNote}</p> : null}
            {item.rejectionReason ? <p className="mt-3 rounded-lg bg-[#fff1ef] p-3 text-xs leading-5 text-[#9e4c43]">반려 사유: {item.rejectionReason}</p> : null}
            {item.status === "SUBMITTED" ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button type="button" disabled={submitting === item.id} onClick={() => openModal({ kind: "reject-participation", item })} className="rounded-xl border border-[#d98e85] py-2.5 text-sm text-[#a9564d] disabled:opacity-50">반려</button>
                <button type="button" disabled={submitting === item.id} onClick={() => void approveParticipation(item)} className="rounded-xl bg-[#7fa443] py-2.5 text-sm font-medium text-white disabled:opacity-50">{submitting === item.id ? "처리 중" : "승인"}</button>
              </div>
            ) : null}
          </article>
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

      {modal ? (
        <CenterModal
          title={modal.kind === "approve-education" ? "교육 이수 승인" : "반려 사유"}
          description={modal.kind === "approve-education" ? "증빙을 확인하고 최종 인정 시간을 입력해 주세요." : "입력한 사유는 신청자에게 전달됩니다."}
          confirmLabel={modal.kind === "approve-education" ? "승인 확정" : "반려 확정"}
          submitting={submitting === modal.item.id}
          destructive={modal.kind !== "approve-education"}
          onCancel={() => setModal(null)}
          onConfirm={() => void confirmModal()}
        >
          {modal.kind === "approve-education" ? (
            <label className="block text-sm text-[#59676b]">인정 시간
              <input type="number" min={Math.max(8, modal.item.requiredHoursSnapshot)} max={modal.item.completionHours} value={recognizedHours} onChange={(event) => setRecognizedHours(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#d8dfd2] px-3 outline-none focus:border-[#88a84f]" />
            </label>
          ) : (
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} rows={4} placeholder="반려 사유를 입력해 주세요." className="w-full resize-none rounded-xl border border-[#d8dfd2] p-3 text-sm outline-none focus:border-[#c9695e]" />
          )}
        </CenterModal>
      ) : null}
    </CenterShell>
  );
}
