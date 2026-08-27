"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { farmJobPostingApi, type FarmJobPosting } from "../../../services/api";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function formatWorkDate(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${DAY_LABELS[date.getDay()]})요일`;
}

function formatStartTime(timeStr: string) {
  const [hStr, mStr] = timeStr.split(":");
  const hour = Number(hStr);
  const minute = Number(mStr ?? 0);
  if (Number.isNaN(hour)) return timeStr;
  const period = hour < 12 ? "오전" : "오후";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return minute === 0 ? `${period} ${hour12}시` : `${period} ${hour12}시 ${minute}분`;
}

export default function JobPostingResult() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [posting, setPosting] = useState<FarmJobPosting | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void farmJobPostingApi
      .get(params.id)
      .then(({ data }) => setPosting(data))
      .catch(() => setMessage("공고 정보를 불러오지 못했습니다."));
  }, [params.id]);

  const handleSubmitReview = async () => {
    setIsSubmitting(true);
    setMessage("");
    try {
      await farmJobPostingApi.submitReview(params.id);
      router.push("/farmer-announcements");
    } catch {
      setMessage("발송 신청에 실패했습니다. 작업 일정이 지나지 않았는지 확인해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1f1f1f] sm:flex sm:justify-center sm:px-4 sm:py-8">
      <section className="relative mx-auto min-h-[1023px] w-full max-w-[402px] overflow-hidden bg-[#f2fcff] text-[#2c3234]">
        <div className="absolute left-0 top-0 h-[115px] w-full bg-[#e9ece1]" />
        <button
          type="button"
          onClick={() => router.push("/farmer-announcements")}
          className="absolute left-[26px] top-[75px] border-0 bg-transparent text-2xl text-[#2c3234]"
          aria-label="뒤로 가기"
        >
          ‹
        </button>
        <h1 className="absolute left-1/2 top-[78px] -translate-x-1/2 text-[18px] leading-[21px] text-[#1b1e20]">
          공고 결과
        </h1>

        {posting && (
          <>
            <div className="absolute left-[25px] top-[139px] h-[378px] w-[352px] rounded-xl bg-white shadow-[inset_0px_3px_12.9px_rgba(124,129,118,0.25)]" />
            <p className="absolute left-[45px] top-[169px] w-[245px] text-[22px] leading-[26px] text-[#2c3234]">
              {posting.title}
            </p>

            <p className="absolute left-[45px] top-[214px] text-[12px] font-medium text-[#1c2225]">작업일시</p>
            <p className="absolute left-[45px] top-[239px] text-[12px] text-[#424242]">
              {formatWorkDate(posting.workDate)}
            </p>
            <p className="absolute left-[214px] top-[239px] text-[12px] text-[#424242]">
              {formatStartTime(posting.startTime)}
            </p>

            <p className="absolute left-[45px] top-[272px] text-[12px] font-medium text-[#1c2225]">집결 장소</p>
            <p className="absolute left-[45px] top-[297px] w-[280px] break-keep text-[12px] text-[#424242]">
              {posting.meetingPlace}
            </p>

            <p className="absolute left-[45px] top-[326px] text-[12px] font-medium text-[#1c2225]">모집인원</p>
            <p className="absolute left-[45px] top-[351px] text-[12px] text-[#424242]">{posting.capacity}</p>

            <p className="absolute left-[45px] top-[380px] text-[12px] font-medium text-[#1c2225]">준비물</p>
            <p className="absolute left-[45px] top-[405px] w-[280px] break-keep text-[12px] text-[#424242]">
              {posting.supplies || "-"}
            </p>

            <p className="absolute left-[45px] top-[434px] text-[12px] font-medium text-[#1c2225]">작업 내용</p>
            <p className="absolute left-[45px] top-[459px] w-[274px] break-keep text-[12px] leading-[14px] text-[#424242]">
              {posting.description}
            </p>

            <div className="absolute left-[25px] top-[552px] h-[75px] w-[352px] rounded-xl bg-[rgba(238,238,238,0.55)]" />
            <p className="absolute left-[45px] top-[527px] text-[12px] text-black">안전 주의 사항</p>
            <p className="absolute left-[45px] top-[575px] w-[300px] break-keep text-[12px] text-[#424242]">
              {posting.precautions || "특별한 주의 사항이 없습니다."}
            </p>
          </>
        )}

        <p className="absolute left-1/2 top-[647px] w-[297px] -translate-x-1/2 break-keep text-center text-[10px] leading-[12px] text-[#5c5c5c]">
          위 내용은 입력하신 정보를 바탕으로 ai가 생성한 공고문입니다. 내용을 확인 후에 클릭해서 수정한뒤 발송 신청 바랍니다.
        </p>

        <div className="absolute left-[25px] top-[698px] h-[104px] w-[352px] rounded-xl border border-[#a4a6a3]" />
        <span className="absolute left-[33px] top-[714px] flex h-[24px] w-[24px] items-center justify-center rounded-full border-2 border-[#fc6767] text-[14px] text-[#fc6767]">
          !
        </span>
        <p className="absolute left-[62px] top-[717px] text-[15px] font-medium leading-[18px] text-[#5c5c5c]">
          공식 확인 안내
        </p>
        <p className="absolute left-[45px] top-[750px] w-[290px] break-keep text-[10px] leading-[12px] text-[#5c5c5c]">
          Ai가 생성한 내용은 참고용이며, 실제 현장 안내가 우선합니다. 작업 장소와 집결시간 등 주요 정보는 중개 센터를 검토 후 최종 확정됩니다.
        </p>

        {message && (
          <p className="absolute left-1/2 top-[817px] w-[352px] -translate-x-1/2 text-center text-xs text-red-600">
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={() => router.push(`/farmer-announcements/new?edit=${params.id}`)}
          className="absolute left-[62px] top-[837px] flex h-[48px] w-[267px] items-center justify-center rounded-xl bg-[#d1f7af] text-[20px] font-medium text-[#2c3234] shadow-[0_4px_4px_#a8cb89]"
        >
          공고문 다시 생성
        </button>
        <button
          type="button"
          onClick={handleSubmitReview}
          disabled={isSubmitting}
          className="absolute left-[62px] top-[906px] flex h-[68px] w-[267px] items-center justify-center rounded-xl bg-[#fffdfd] text-2xl font-medium text-[#242a2d] shadow-[0_4px_4px_rgba(0,0,0,0.25)] disabled:opacity-70"
        >
          발송 신청
        </button>
      </section>
    </main>
  );
}
