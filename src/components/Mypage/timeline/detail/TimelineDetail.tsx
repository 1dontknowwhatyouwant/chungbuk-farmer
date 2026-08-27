"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppIcon from "../../../common/icon/AppIcon";
import { confirmedWorkApi, type WorkAssignment, type WorkAssignmentGuide } from "../../../../services/api";

const splitLines = (value: string | null | undefined) =>
  value?.split(/\r?\n|•|,/).map((line) => line.trim()).filter(Boolean) ?? [];

export default function TimelineDetail({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [job, setJob] = useState<WorkAssignment | null>(null);
  const [guide, setGuide] = useState<WorkAssignmentGuide | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([confirmedWorkApi.get(jobId), confirmedWorkApi.guide(jobId)]).then(([work, guideResponse]) => {
      setJob(work.data);
      setGuide(guideResponse.data);
    }).catch(() => setError(true));
  }, [jobId]);

  const supplies = splitLines(guide?.preparationChecklist || job?.supplies);
  const methods = splitLines(guide?.workSteps || guide?.workSummary);

  return <main className="min-h-screen bg-[#1f1f1f] sm:flex sm:justify-center sm:px-4 sm:py-8">
    <section className="mx-auto min-h-[100svh] w-full max-w-[402px] overflow-hidden bg-white pb-8 text-[#5c5c5c] shadow-2xl">
      <header className="flex h-[115px] items-end bg-[#e9ece1] px-6 pb-[18px]">
        <button type="button" aria-label="타임라인으로 돌아가기" onClick={() => router.back()} className="mr-auto border-0 bg-transparent p-0"><AppIcon name="chevron-left" size={24} strokeWidth={1.5} /></button>
        <h1 className="mr-auto -translate-x-6 text-[18px] font-normal text-[#1b1e20]">작업 안내사항</h1>
      </header>
      {error ? <p className="p-8 text-center text-[12px] text-red-500">작업 정보를 불러오지 못했습니다.</p> : <>
        <section className="mx-[25px] mt-[21px] h-[104px] rounded-[12px] border border-[#a4a6a3] px-3 py-[14px]">
          <h2 className="m-0 flex items-center gap-2 text-[15px] font-normal text-[#5c5c5c]"><AppIcon name="alert" size={24} strokeWidth={1.5} className="text-[#ff5b62]" />공식 확인 안내</h2>
          <p className="m-0 mt-[14px] text-[10px] leading-[14px]">Ai가 생성한 내용은 참고용이며, 실제 현장 안내가 우선합니다.<br />작업 장소와 집결시간 등 주요 정보는 중개 센터를 검토 후 최종 확정됩니다.</p>
        </section>
        <h2 className="mx-[43px] mt-[18px] text-[14px] font-normal text-[#333232]">작업 준비 체크 리스트</h2>
        <div className="mx-[43px] mt-[14px] min-h-[213px] rounded-[17px] bg-[#e4fcb5] px-6 py-[12px] shadow-[inset_0_1px_14.3px_#cfdfe8]"><p className="m-0 text-[10px] text-[#807e7e]">복장 및 준비물</p>{supplies.slice(0, 5).map((item) => <label key={item} className="flex h-[33px] items-center justify-between text-[12px]"><span>{item}</span><input type="checkbox" className="h-[26px] w-[26px] appearance-none rounded-[2px] border border-[#e5e5e5] bg-white" /></label>)}{!supplies.length && <p className="mt-4 text-[12px] text-[#807e7e]">등록된 준비물이 없습니다.</p>}</div>
        <h2 className="mx-[43px] mt-[17px] text-[14px] font-normal text-[#333232]"><span className="mr-2 text-[18px]">🟤</span>작업 방법 안내</h2>
        <ol className="mx-[43px] mt-[9px] space-y-[10px] pl-6 text-[14px] leading-[19px]">{methods.slice(0, 5).map((item) => <li key={item} className="pl-1">{item}</li>)}</ol>
        <section className="mx-[25px] mt-[25px] min-h-[202px] rounded-[19px] border-[9px] border-[rgba(177,199,234,0.38)] px-5 py-[14px] text-[14px]"><h2 className="m-0 text-[#333232]">작업장 정보 요약</h2><dl className="mt-[12px] grid grid-cols-[113px_1fr] gap-y-[13px]"><dt>예상 작업 시간</dt><dd className="m-0">{job?.startTime && job?.endTime ? `오전 ${job.startTime} ~ 오후 ${job.endTime}` : "정보 없음"}</dd><dt>집결 시간</dt><dd className="m-0">{job?.startTime ? `오전 ${job.startTime}` : "정보 없음"}</dd><dt>집결 장소</dt><dd className="m-0">{job?.meetingPlace || "정보 없음"}</dd><dt>담당자 연락처</dt><dd className="m-0">정보 없음</dd></dl></section>
      </>}
    </section>
  </main>;
}
