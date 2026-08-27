"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppIcon from "../../common/icon/AppIcon";
import { confirmedWorkApi, type ConfirmedWork } from "../../../services/api";

const getWorks = (data: ConfirmedWork[] | { content: ConfirmedWork[] } | { data: ConfirmedWork[] }) =>
  Array.isArray(data) ? data : "content" in data ? data.content : data.data;
const PAGE_SIZE = 4;

const formatDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  return `${value.slice(0, 10).replaceAll("-", ".")} (${new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(date)})`;
};

export default function Timeline() {
  const router = useRouter();
  const [jobs, setJobs] = useState<ConfirmedWork[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let disposed = false;
    confirmedWorkApi.list().then(({ data }) => {
      if (!disposed) setJobs(getWorks(data));
    }).catch(() => {
      if (!disposed) setErrorMessage("확정 근무 일정을 불러오지 못했습니다.");
    }).finally(() => {
      if (!disposed) setIsLoading(false);
    });
    return () => { disposed = true; };
  }, []);

  return (
    <main className="min-h-screen bg-[#1f1f1f] sm:flex sm:justify-center sm:px-4 sm:py-8">
      <section className="mx-auto min-h-[100svh] w-full max-w-[402px] overflow-hidden bg-[#f2fcff] pb-8 text-[#464c51] shadow-2xl">
        <header className="flex h-[115px] items-end bg-[#e9ece1] px-6 pb-[18px]">
          <button type="button" aria-label="마이페이지로 돌아가기" onClick={() => router.push("/mypage")} className="mb-0 mr-auto border-0 bg-transparent p-0">
            <AppIcon name="chevron-left" size={24} strokeWidth={1.5} />
          </button>
          <h1 className="mr-auto -translate-x-6 text-[18px] font-normal text-[#1b1e20]">확정 근무 타임라인</h1>
        </header>
        <p className="mt-[17px] text-center text-[10px] text-[#5c5c5c]">내 근무 일정을 확인하고 작업 안내를 미리 살펴보세요.</p>

        <div className="mx-auto mt-[19px] w-[302px] space-y-6">
          {isLoading ? <p className="py-8 text-center text-[12px]">일정을 불러오는 중입니다.</p> : null}
          {!isLoading && !errorMessage && jobs.length === 0 ? <p className="py-8 text-center text-[12px]">확정된 근무 일정이 없습니다.</p> : null}
          {errorMessage ? <p className="py-8 text-center text-[12px] text-red-500">{errorMessage}</p> : null}
          {jobs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((job) => {
            const completed = job.status.toUpperCase() === "COMPLETED";
            return <article key={job.id} className={`min-h-[157px] rounded-[12px] border border-[#ced6e3] px-[18px] pt-[14px] ${completed ? "bg-[#d4d3d3]" : "bg-[#f5f5f5]"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="m-0 text-[18px] font-normal">{`${job.crop} ${job.workType}`}</h2>
                  <p className="m-0 mt-[29px] text-[12px] text-[#5c6469]">{formatDate(job.workDate)}</p>
                </div>
                <span className="pt-0 text-[20px] text-[#6e7274]">{completed ? "완료" : "예정"}</span>
              </div>
              <div className="mt-[4px] grid grid-cols-4 text-[12px] text-[#5c6469]">
                <span>{job.farmName}</span><span>{job.meetingPlace}</span><span>{job.startTime}</span><span>모집&nbsp;&nbsp;{job.recruitmentCapacity ?? "-"}</span>
              </div>
              {!completed && <button type="button" onClick={() => router.push(`/mypage/timeline/${job.id}`)} className="mt-[10px] h-[32px] w-full rounded-[27px] border-0 bg-[#d1e895] text-[16px] text-[#464c51]">작업 안내사항</button>}
            </article>;
          })}
          {!isLoading && !errorMessage && jobs.length > PAGE_SIZE ? (
            <nav className="flex items-center justify-center gap-4 pt-1 text-[12px]" aria-label="확정 근무 일정 페이지 이동">
              <button type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)} className="border-0 bg-transparent p-1 text-[#5c6469] disabled:opacity-30" aria-label="이전 페이지">‹</button>
              <span>{page + 1} / {Math.ceil(jobs.length / PAGE_SIZE)}</span>
              <button type="button" disabled={(page + 1) * PAGE_SIZE >= jobs.length} onClick={() => setPage((current) => current + 1)} className="border-0 bg-transparent p-1 text-[#5c6469] disabled:opacity-30" aria-label="다음 페이지">›</button>
            </nav>
          ) : null}
        </div>
      </section>
    </main>
  );
}
