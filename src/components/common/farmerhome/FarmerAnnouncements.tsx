"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { farmJobPostingApi, type FarmJobPosting, type JobPostingDisplayStatus } from "../../../services/api";

const filters: { key: "ALL" | JobPostingDisplayStatus; label: string }[] = [
  { key: "ALL", label: "전체" },
  { key: "PENDING", label: "대기중" },
  { key: "APPROVED", label: "승인됨" },
  { key: "CLOSED", label: "마감" },
  { key: "REJECTED", label: "거절됨" },
];

const statusStyle: Record<JobPostingDisplayStatus, { label: string; color: string }> = {
  DRAFT: { label: "임시저장", color: "#7A7F82" },
  PENDING: { label: "대기중", color: "#7A7F82" },
  APPROVED: { label: "승인됨", color: "#7DCB35" },
  CLOSED: { label: "마감", color: "#7A7F82" },
  REJECTED: { label: "거절됨", color: "#6E7274" },
  CANCELLED: { label: "취소됨", color: "#6E7274" },
};

export default function FarmerAnnouncements() {
  const router = useRouter();
  const [selected, setSelected] = useState<"ALL" | JobPostingDisplayStatus>("ALL");
  const [postings, setPostings] = useState<FarmJobPosting[]>([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadError(false);
    void farmJobPostingApi
      .list({ displayStatus: selected === "ALL" ? undefined : selected })
      .then(({ data }) => {
        if (!cancelled) setPostings(data.content);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const handleDelete = async (posting: FarmJobPosting) => {
    if (posting.status !== "DRAFT") {
      window.alert("임시저장 상태의 공고만 삭제할 수 있습니다.");
      return;
    }
    if (!window.confirm("이 공고를 삭제할까요?")) return;
    try {
      await farmJobPostingApi.remove(posting.id);
      setPostings((prev) => prev.filter((p) => p.id !== posting.id));
    } catch {
      window.alert("공고 삭제에 실패했습니다.");
    }
  };

  return (
    <main className="min-h-screen bg-[#1f1f1f] sm:flex sm:justify-center sm:px-4 sm:py-8">
      <section className="relative mx-auto min-h-[881px] w-full max-w-[402px] overflow-hidden bg-[#f2fcff] text-black">
        <div className="absolute left-0 top-0 h-[72px] w-full bg-[#e9ece1]" />
        <button
          type="button"
          onClick={() => router.push("/farmer-home")}
          className="absolute left-[26px] top-[32px] border-0 bg-transparent text-2xl text-[#2c3234]"
          aria-label="뒤로 가기"
        >
          ‹
        </button>
        <h1 className="absolute left-1/2 top-[35px] -translate-x-1/2 text-[18px] leading-[21px] text-[#1b1e20]">
          내 공고 목록
        </h1>

        <div className="absolute left-[32px] top-[95px] flex h-[24px] w-[338px] items-center gap-[6px]">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setSelected(filter.key)}
              className={`flex h-[24px] items-center justify-center whitespace-nowrap rounded-xl border px-3 text-[12px] text-[#1b1e20] ${
                selected === filter.key ? "border-[#d9eda5] bg-[#d9eda5]" : "border-[#ced6e1] bg-transparent"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="absolute left-0 top-[131px] w-full border-t border-[#d3d3d3]" />

        <div className="absolute left-[45px] top-[147px] flex w-[312px] flex-col gap-[14px]">
          {loadError && (
            <p className="py-10 text-center text-sm text-[#7a7f82]">공고 목록을 불러오지 못했습니다.</p>
          )}
          {!loadError &&
            postings.map((posting) => (
              <div
                key={posting.id}
                className="relative h-[138px] w-[312px] rounded-xl border border-[#e6e6e6] bg-[#fffffe]"
              >
                <span className="absolute left-[21px] top-[22px] w-[154px] truncate whitespace-nowrap text-[18px] text-black">
                  {posting.title}
                </span>
                <span className="absolute left-[21px] top-[55px] text-[12px] text-black">작업일</span>
                <span className="absolute left-[58px] top-[55px] text-[12px] text-black">
                  {posting.workDate.replaceAll("-", ".")}
                </span>
                <span className="absolute left-[136px] top-[55px] text-[12px] text-black">모집</span>
                <span className="absolute left-[162px] top-[55px] text-[12px] text-black">{posting.capacity}</span>
                <span className="absolute left-[21px] top-[86px] text-[12px] text-black">집결</span>
                <span className="absolute left-[58px] top-[86px] text-[12px] text-black">
                  {posting.startTime.slice(0, 5)}
                </span>
                <span className="absolute left-[106px] top-[86px] w-[100px] truncate text-[12px] text-black">
                  {posting.meetingPlace}
                </span>
                <span
                  className="absolute left-[214px] top-[102px] text-[20px] leading-[24px]"
                  style={{ color: statusStyle[posting.displayStatus].color }}
                >
                  {statusStyle[posting.displayStatus].label}
                </span>
                <button
                  type="button"
                  onClick={() => router.push(`/farmer-announcements/new?edit=${posting.id}`)}
                  disabled={posting.status !== "DRAFT"}
                  className="absolute left-[204px] top-[20px] flex h-[26px] w-[42px] items-center justify-center rounded-[7px] bg-[#d9eda5] text-[12px] text-[#1b1e20] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(posting)}
                  disabled={posting.status !== "DRAFT"}
                  className="absolute left-[255px] top-[20px] flex h-[26px] w-[42px] items-center justify-center rounded-[7px] bg-[#e3e3e3] text-[12px] text-[#1b1e20] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  삭제
                </button>
              </div>
            ))}
          {!loadError && postings.length === 0 && (
            <p className="py-10 text-center text-sm text-[#7a7f82]">해당 상태의 공고가 없습니다.</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => router.push("/farmer-announcements/new")}
          className="absolute left-[67px] top-[767px] flex h-[68px] w-[267px] items-center justify-center rounded-xl bg-[#d1f7af] text-2xl font-medium text-[#2c3234] shadow-[0_4px_4px_#a8cb89]"
        >
          공고문 생성
        </button>
      </section>
    </main>
  );
}
