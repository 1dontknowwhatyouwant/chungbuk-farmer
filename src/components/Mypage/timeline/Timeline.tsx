"use client";

import { useRouter } from "next/navigation";
import AppIcon from "../../common/icon/AppIcon";

const jobs = [
  { status: "예정", date: "2026.08.16", day: "토", tone: "bg-[#f5f5f5]", guide: true },
  { status: "예정", date: "2026.08.16", day: "토", tone: "bg-[#f5f5f5]", guide: true },
  { status: "완료", date: "2026.08.16", day: "토", tone: "bg-[#d4d3d3]", guide: false },
  { status: "예정", date: "2026.08.16", day: "토", tone: "bg-[#f5f5f5]", guide: true },
];

export default function Timeline() {
  const router = useRouter();

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
          {jobs.map((job, index) => (
            <article key={`${job.date}-${index}`} className={`h-[157px] rounded-[12px] border border-[#ced6e3] px-[18px] pt-[14px] ${job.tone}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="m-0 text-[18px] font-normal">감자 수확 보조 작업</h2>
                  <p className="m-0 mt-[29px] text-[12px] text-[#5c6469]">{job.date}</p>
                </div>
                <span className="pt-0 text-[20px] text-[#6e7274]">{job.status}</span>
              </div>
              <div className="mt-[4px] grid grid-cols-4 text-[12px] text-[#5c6469]">
                <span>청주시 홍덕구</span><span>집결</span><span>9:00</span><span>모집&nbsp;&nbsp;4</span>
              </div>
              {job.guide && <button type="button" className="mt-[10px] h-[32px] w-full rounded-[27px] border-0 bg-[#d1e895] text-[16px] text-[#464c51]">작업 안내사항</button>}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
