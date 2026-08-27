"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { centerAdminApi, type AdminJobPosting } from "../../services/api";
import CenterFeedback from "../common/center/CenterFeedback";
import CenterModal from "../common/center/CenterModal";
import CenterShell from "../common/center/CenterShell";

function formatWage(posting: AdminJobPosting) {
  return `${posting.wageAmount.toLocaleString("ko-KR")}원 / ${posting.wageUnit === "HOURLY" ? "시간" : "일"}`;
}

export default function CenterPostingsPage() {
  const [postings, setPostings] = useState<AdminJobPosting[]>([]);
  const [keyword, setKeyword] = useState("");
  const [workType, setWorkType] = useState("ALL");
  const [selected, setSelected] = useState<AdminJobPosting | null>(null);
  const [rejecting, setRejecting] = useState<AdminJobPosting | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await centerAdminApi.jobPostings({ page: 0, size: 100 });
      setPostings(data.content);
    } catch {
      setError("농가 공고 검토 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const workTypes = useMemo(() => Array.from(new Set(postings.map((item) => item.workType))).sort(), [postings]);
  const filtered = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    return postings.filter((item) => {
      const matchesType = workType === "ALL" || item.workType === workType;
      const matchesKeyword = !normalized || item.title.toLowerCase().includes(normalized) || item.farmName.toLowerCase().includes(normalized) || item.crop.toLowerCase().includes(normalized);
      return matchesType && matchesKeyword;
    });
  }, [keyword, postings, workType]);

  const approve = async (posting: AdminJobPosting) => {
    setSubmitting(posting.id);
    try {
      await centerAdminApi.approveJobPosting(posting.id);
      setPostings((current) => current.filter((item) => item.id !== posting.id));
      setSelected(null);
    } catch {
      window.alert("공고를 승인하지 못했습니다. 현재 공고 상태를 확인해 주세요.");
    } finally {
      setSubmitting(null);
    }
  };

  const reject = async () => {
    if (!rejecting || !reason.trim()) {
      window.alert("반려 사유를 입력해 주세요.");
      return;
    }
    setSubmitting(rejecting.id);
    try {
      await centerAdminApi.rejectJobPosting(rejecting.id, reason.trim());
      setPostings((current) => current.filter((item) => item.id !== rejecting.id));
      setRejecting(null);
      setSelected(null);
    } catch {
      window.alert("공고를 반려하지 못했습니다. 현재 공고 상태를 확인해 주세요.");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <CenterShell title="농가 공고 검토 목록" description="농가에서 검토 요청한 일자리 공고의 작업 조건과 안내 내용을 확인해 주세요.">
      <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="농가명, 공고명, 작물을 검색해주세요" className="h-11 w-full rounded-xl border border-[#d8dfd2] bg-white px-4 text-sm outline-none placeholder:text-[#a1aaac] focus:border-[#88a84f]" />
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
        <span className="shrink-0 text-xs text-[#7b878a]">작업 종류</span>
        {["ALL", ...workTypes].map((value) => (
          <button key={value} type="button" onClick={() => setWorkType(value)} className={`shrink-0 rounded-full px-4 py-2 text-xs ${workType === value ? "bg-[#526166] text-white" : "bg-white text-[#6b777a]"}`}>{value === "ALL" ? "전체" : value}</button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <CenterFeedback loading={loading} error={error} onRetry={() => void load()} />
        {!loading && !error && filtered.length === 0 ? <CenterFeedback empty="검토 대기 중인 농가 공고가 없습니다." /> : null}
        {!loading && !error ? filtered.map((posting) => (
          <article key={posting.id} className="rounded-2xl border border-[#dce3d5] bg-white p-4 shadow-[0_3px_10px_rgba(91,110,72,0.08)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><p className="text-xs text-[#78904b]">{posting.farmName}</p><h2 className="mt-1 truncate text-[17px] font-semibold text-[#3f4d51]">{posting.title}</h2></div>
              <span className="shrink-0 rounded-full bg-[#fff0c9] px-3 py-1 text-xs text-[#8d6717]">검토 대기</span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 rounded-xl bg-[#f6f8f2] p-3 text-xs">
              <div><dt className="text-[#829093]">작업일</dt><dd className="mt-1 text-[#435055]">{posting.workDate} {posting.startTime.slice(0, 5)}</dd></div>
              <div><dt className="text-[#829093]">작업·작물</dt><dd className="mt-1 text-[#435055]">{posting.workType} · {posting.crop}</dd></div>
              <div><dt className="text-[#829093]">모집 인원</dt><dd className="mt-1 text-[#435055]">{posting.capacity}명</dd></div>
              <div><dt className="text-[#829093]">임금</dt><dd className="mt-1 text-[#435055]">{formatWage(posting)}</dd></div>
            </dl>
            <button type="button" onClick={() => setSelected(posting)} className="mt-3 w-full rounded-xl bg-[#e8effb] py-2.5 text-sm text-[#385784]">상세 검토</button>
          </article>
        )) : null}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-[#edf5e8] px-4 py-8">
          <article className="mx-auto w-full max-w-[402px] rounded-[24px] bg-white p-5 shadow-xl">
            <button type="button" onClick={() => setSelected(null)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef2ec] text-xl" aria-label="상세 닫기">×</button>
            <p className="mt-5 text-sm text-[#78904b]">{selected.farmName} · {selected.cityCounty}</p>
            <h2 className="mt-2 text-[22px] font-semibold text-[#3f4d51]">{selected.title}</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#59676b]">{selected.description}</p>
            <dl className="mt-5 space-y-3 rounded-2xl bg-[#f6f8f2] p-4 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-[#829093]">작업일시</dt><dd className="text-right">{selected.workDate} {selected.startTime.slice(0, 5)}~{selected.endTime.slice(0, 5)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[#829093]">장소</dt><dd className="text-right">{selected.meetingPlace}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[#829093]">농가 주소</dt><dd className="text-right">{selected.farmAddress}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[#829093]">임금</dt><dd className="text-right">{formatWage(selected)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[#829093]">준비물</dt><dd className="text-right">{selected.supplies || "별도 안내 없음"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[#829093]">주의사항</dt><dd className="text-right">{selected.precautions || "없음"}</dd></div>
            </dl>
            {selected.beginnerGuide ? <section className="mt-4 rounded-2xl border border-[#dce3d5] p-4"><h3 className="font-medium text-[#435055]">초보자 안내</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#657276]">{selected.beginnerGuide}</p></section> : null}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => { setReason(""); setRejecting(selected); }} className="rounded-xl border border-[#d98e85] py-3 text-sm text-[#a9564d]">반려</button>
              <button type="button" disabled={submitting === selected.id} onClick={() => void approve(selected)} className="rounded-xl bg-[#7fa443] py-3 text-sm font-medium text-white disabled:opacity-50">{submitting === selected.id ? "처리 중" : "승인"}</button>
            </div>
          </article>
        </div>
      ) : null}

      {rejecting ? (
        <CenterModal title="반려 사유" description="입력한 사유는 공고를 등록한 농가에 전달됩니다." confirmLabel="반려 확정" destructive submitting={submitting === rejecting.id} onCancel={() => setRejecting(null)} onConfirm={() => void reject()}>
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} rows={5} placeholder="수정이 필요한 내용을 구체적으로 입력해 주세요." className="w-full resize-none rounded-xl border border-[#d8dfd2] p-3 text-sm outline-none focus:border-[#c9695e]" />
          <p className="mt-1 text-right text-xs text-[#9aa3a5]">{reason.length}/1000</p>
        </CenterModal>
      ) : null}
    </CenterShell>
  );
}

