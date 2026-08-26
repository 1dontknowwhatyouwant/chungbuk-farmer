"use client";

import {
  mypageCheck,
  mypageMoney,
  mypageProfileAvatar,
  mypageStudy,
} from "../../assets/assets";
import BottomNav from "../common/BottomNav/BottomNav";
import { useAuthStore } from "../../stores/useAuthStore";

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
}

function Mypage({
  deleteErrorMessage = "",
  onDeleteAccount,
  onLogout,
  onGoHome,
}: MypageProps) {
  const user = useAuthStore((state) => state.user);
  const userName = user?.name || "유저 이름";

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
          <span className="mt-[1px] text-[10px] leading-[12px] text-[#2e89d4]">교육이수자</span>
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
                수박바
              </p>
              <p className="m-0 mt-[4px] text-[8px] leading-[10px] text-[#858282]">
                010 - 3456 - 7890
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
                충북형 도시농부 필수 교육
              </span>
              <span className="text-[8px] leading-[10px] text-[#424242]">
                8시간
              </span>
            </div>
            <div className="mt-[13px] grid grid-cols-[110px_minmax(0,171px)] items-center gap-[10px]">
              <span className="text-right text-[12px] leading-[15px] text-[#424242]">
                4시간 미이수
              </span>
              <div className="relative h-[22px] overflow-hidden rounded-[19px] bg-[#d9d9d9]">
                <div className="h-[18px] w-[84px] rounded-l-[19px] bg-[#3477e4]" />
                <span className="absolute left-[64px] top-[5px] text-[8px] leading-[10px] text-white">
                  50%
                </span>
              </div>
            </div>
            <button
              type="button"
              className="mx-auto mt-[9px] block h-[39px] w-[220px] cursor-pointer rounded-[12px] border-0 bg-[#c2e762] text-[12px] leading-[15px] text-[#424242] shadow-[0_2px_4px_rgba(0,0,0,.25)]"
            >
              교육 들으러 바로 가기
            </button>
          </div>
        </section>

        <section className="mt-[28px] rounded-[12px] bg-[#e8e7e7] px-[35px] py-[18px]">
          <div className="flex items-center justify-between gap-4 text-[12px] leading-[15px]">
            <span>교육 수료증 인증 상태</span>
            <span className="text-[#424242]">확인 대기중</span>
          </div>
        </section>

        <BottomNav activePage="mypage" variant="mypage" onGoHome={onGoHome} onGoToAnnouncement={onGoHome} />
      </section>
    </main>
  );
}

export default Mypage;
