"use client";

import { useEffect, useState } from "react";

import {
  mypageCheck,
  mypageMoney,
  mypageProfileAvatar,
  mypageStudy,
} from "../../assets/assets";
import BottomNav from "../common/BottomNav/BottomNav";
import { useAuthStore } from "../../stores/useAuthStore";
import { educationApi, type EducationCertification } from "../../services/api";

const pageClass =
  "min-h-screen bg-[#1f1f1f] text-black sm:flex sm:items-center sm:justify-center sm:px-4 sm:py-8";
const screenClass =
  "relative mx-auto flex min-h-[100svh] w-full max-w-[402px] flex-col overflow-hidden bg-[linear-gradient(180deg,#cdf2fb_0%,#eef7eb_54%,#fff_95%)] px-[25px] pb-[106px] pt-[72px] shadow-2xl";

const quickMenus = [
  { label: "신청현황", icon: mypageCheck },
  { label: "정산상태", icon: mypageMoney },
  { label: "교육이수", icon: mypageStudy },
  { label: "타임라인", icon: mypageMoney },
];

interface MypageProps {
  deleteErrorMessage?: string;
  onDeleteAccount?: () => void;
  onLogout?: () => void;
  onGoHome?: () => void;
  onGoAnnouncement?: () => void;
  onGoTimeline?: () => void;
}

function Mypage({
  deleteErrorMessage = "",
  onDeleteAccount,
  onLogout,
  onGoHome,
  onGoAnnouncement,
  onGoTimeline,
}: MypageProps) {
  const user = useAuthStore((state) => state.user);
  const [education, setEducation] = useState<EducationCertification | null>(null);
  const [educationError, setEducationError] = useState("");
  const userName = user?.name || "정보 없음";
  const userTypeLabel = user?.userType === "FARM" ? "농가" : "교육이수자";

  useEffect(() => {
    let disposed = false;

    const refreshEducation = async () => {
      try {
        const response = await educationApi.getCertification();
        if (!disposed) {
          setEducation(response.data);
          setEducationError("");
        }
      } catch {
        if (!disposed) setEducationError("교육 수강 현황을 불러오지 못했습니다.");
      }
    };

    refreshEducation();
    const timer = window.setInterval(refreshEducation, 10000);
    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, []);

  const course = education?.courses.find((item) => item.mandatory) ?? education?.courses[0];
  const progress = course?.progressPercentage ?? 0;
  const remainingHours = course ? Math.ceil(course.remainingMinutes / 60) : 0;
  const progressLabel = course
    ? course.progressStatus === "COMPLETED"
      ? "이수 완료"
      : `${remainingHours}시간 미이수`
    : "교육 정보 확인 중";

  return (
    <main className={pageClass}>
      <section className={screenClass} aria-labelledby="mypage-title">
        <div className="pointer-events-none absolute left-0 top-[129px] h-[24px] w-[25px] bg-[#d9d9d9]" />
        <div className="pointer-events-none absolute right-0 top-[129px] h-[24px] w-[25px] bg-[#d9d9d9]" />

        <header className="flex items-start gap-[12px]">
          <h1
            id="mypage-title"
            className="m-0 text-[20px] font-normal leading-[24px] text-[#2c393d]"
          >
            {userName}
          </h1>
          <span className="mt-[2px] text-[8px] leading-[10px] text-[#5db6ff]">
            {userTypeLabel}
          </span>
          <div className="ml-auto flex items-center gap-[8px] text-[10px] leading-[12px]">
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 text-[#424242]"
              onClick={onLogout}
            >
              로그아웃
            </button>
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 text-[#858282]"
              onClick={onDeleteAccount}
            >
              계정 삭제
            </button>
          </div>
        </header>

        {deleteErrorMessage ? (
          <p className="absolute left-[24px] right-[24px] top-[91px] m-0 rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-600">
            {deleteErrorMessage}
          </p>
        ) : null}

        <nav
          className="mt-[33px] grid grid-cols-4 place-items-center"
          aria-label="마이페이지 빠른 메뉴"
        >
          {quickMenus.map((menu) => (
            <button
              key={menu.label}
              type="button"
              className="flex w-[64px] cursor-pointer flex-col items-center gap-[11px] border-0 bg-transparent p-0 text-[12px] leading-[15px] text-[#424242]"
              onClick={menu.label === "타임라인" ? onGoTimeline : undefined}
            >
              <span className="flex h-[42px] items-center justify-center" aria-hidden><img src={menu.icon.src} alt="" className="max-h-[32px] max-w-[38px]" /></span>
              <span className="whitespace-nowrap">{menu.label}</span>
            </button>
          ))}
        </nav>

        <section className="mt-[18px]" aria-labelledby="my-info-title">
          <h2
            id="my-info-title"
            className="m-0 text-[24px] font-medium leading-[29px] text-[#475559]"
          >
            내 정보
          </h2>
          <div className="mt-[17px] flex h-[57px] items-center gap-[24px] rounded-[12px] border border-[#c4c7c3] bg-[#f8f5f3] px-[28px]">
            <img
              src={mypageProfileAvatar.src}
              alt=""
              className="h-[36px] w-[36px] shrink-0"
            />
            <div className="min-w-0">
              <p className="m-0 text-[12px] leading-[15px] text-[#858282]">
                {user?.name || "이름 정보 없음"}
              </p>
              <p className="m-0 mt-[4px] text-[8px] leading-[10px] text-[#858282]">
                {user?.phoneNumber || "연락처 정보 없음"}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-[26px]" aria-labelledby="eligibility-title">
          <h2
            id="eligibility-title"
            className="m-0 text-[24px] font-medium leading-[29px] text-[#475559]"
          >
            참여 자격 확인
          </h2>
          <div className="mt-[12px] h-[140px] rounded-[12px] bg-white px-[18px] py-[17px] shadow-[0_4px_6.7px_rgba(0,0,0,.15)]">
            <div className="flex items-center gap-[31px]">
              <span className="text-[12px] leading-[15px]">신청 상태</span>
              <span className="text-[12px] leading-[15px] text-[#858282]">
                승인완료
              </span>
            </div>
            <p className="m-0 mt-[17px] text-[12px] leading-[15px] text-[#424242]">
              필수 교육 이수 완료시 일손 모집 공고 지원이 가능합니다.
            </p>
            <button
              type="button"
              className="mx-auto mt-[18px] block h-[48px] w-[290px] max-w-full cursor-pointer rounded-[12px] border-0 bg-[#d1e895] text-[16px] leading-[19px] text-black"
            >
              신청하러 가기
            </button>
          </div>
        </section>

        <section className="mt-[26px]" aria-labelledby="education-title">
          <h2
            id="education-title"
            className="m-0 text-[24px] font-medium leading-[29px] text-[#475559]"
          >
            교육 이수 상태
          </h2>
          <div className="mt-[28px] px-[19px]">
            <div className="flex items-center gap-[18px]">
              <span className="text-[12px] leading-[15px] text-[#424242]">
                {course?.title ?? "충북형 도시농부 필수 교육"}
              </span>
              <span className="text-[8px] leading-[10px] text-[#424242]">
                {course ? `${course.requiredHours}시간` : "-시간"}
              </span>
            </div>
            <div className="mt-[13px] grid grid-cols-[110px_minmax(0,171px)] items-center gap-[10px]">
              <span className="text-right text-[12px] leading-[15px] text-[#424242]">
                {progressLabel}
              </span>
              <div className="relative h-[22px] overflow-hidden rounded-[19px] bg-[#d9d9d9]">
                <div className="h-[18px] rounded-l-[19px] bg-[#3477e4]" style={{ width: `${progress}%` }} />
                <span className="absolute inset-0 top-[5px] text-center text-[8px] leading-[10px] text-white">
                  {progress}%
                </span>
              </div>
            </div>
            <a
              href={course?.externalApplicationUrl ?? "https://agriedu.net/"}
              target="_blank"
              rel="noreferrer"
              className="mx-auto mt-[9px] block h-[39px] w-[220px] cursor-pointer rounded-[12px] border-0 bg-[#c2e762] text-center text-[12px] leading-[39px] text-[#424242] no-underline shadow-[0_2px_4px_rgba(0,0,0,.25)]"
            >
              교육 들으러 바로 가기
            </a>
            {educationError ? <p className="mt-2 text-center text-[10px] text-red-500">{educationError}</p> : null}
          </div>
        </section>

        <section className="mt-[28px] rounded-[12px] bg-[#e8e7e7] px-[35px] py-[18px]">
          <div className="flex items-center justify-between gap-4 text-[12px] leading-[15px]">
            <span>교육 수료증 인증 상태</span>
            <span className="text-[#424242]">확인 대기중</span>
          </div>
        </section>

        <BottomNav activePage="mypage" variant="mypage" onGoHome={onGoHome} onGoToAnnouncement={onGoAnnouncement} />
      </section>
    </main>
  );
}

export default Mypage;
