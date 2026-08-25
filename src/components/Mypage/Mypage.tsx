"use client";

import {
  homeAccountOn,
  homeAnnouncementOff,
  homeHomeOff,
  mypageProfileAvatar,
} from "../../assets/assets";
import { useAuthStore } from "../../stores/useAuthStore";

const pageClass =
  "min-h-screen bg-[#1f1f1f] text-black sm:flex sm:items-center sm:justify-center sm:px-4 sm:py-8";
const screenClass =
  "relative mx-auto flex min-h-[100svh] w-full max-w-[402px] flex-col overflow-hidden bg-white px-[24px] pb-[106px] pt-[64px] shadow-2xl";

const quickMenus = [
  "내 신청 현황",
  "정산 상태",
  "교육이수",
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
            className="m-0 text-[16px] font-normal leading-[19px]"
          >
            {userName}
          </h1>
          <span className="mt-[2px] text-[8px] leading-[10px] text-[#5db6ff]">
            교육이수자
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
          className="mt-[43px] grid grid-cols-3 place-items-center gap-[45px]"
          aria-label="마이페이지 빠른 메뉴"
        >
          {quickMenus.map((menu) => (
            <button
              key={menu}
              type="button"
              className="flex w-[58px] cursor-pointer flex-col items-center gap-[11px] border-0 bg-transparent p-0 text-[8px] leading-[10px] text-black"
            >
              <span className="h-[42px] w-[42px] bg-[#d9d9d9]" aria-hidden />
              <span className="whitespace-nowrap">{menu}</span>
            </button>
          ))}
        </nav>

        <section className="mt-[18px]" aria-labelledby="my-info-title">
          <h2
            id="my-info-title"
            className="m-0 text-[16px] font-normal leading-[19px]"
          >
            내 정보
          </h2>
          <div className="mt-[17px] flex h-[57px] items-center gap-[24px] rounded-[12px] bg-[#d9d9d9] px-[30px]">
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
            className="m-0 text-[16px] font-normal leading-[19px]"
          >
            참여 자격 확인
          </h2>
          <div className="mt-[12px] h-[140px] rounded-[12px] bg-[#d9d9d9] px-[18px] py-[17px]">
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
              className="mx-auto mt-[18px] block h-[48px] w-[290px] max-w-full cursor-pointer rounded-[12px] border-0 bg-[#a3a3a3] text-[16px] leading-[19px] text-black"
            >
              신청 정보 확인 하기
            </button>
          </div>
        </section>

        <section className="mt-[26px]" aria-labelledby="education-title">
          <h2
            id="education-title"
            className="m-0 text-[16px] font-normal leading-[19px]"
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
                <div className="h-[18px] w-[84px] rounded-l-[19px] bg-[#787777]" />
                <span className="absolute left-[64px] top-[5px] text-[8px] leading-[10px] text-[#424242]">
                  50%
                </span>
              </div>
            </div>
            <button
              type="button"
              className="mx-auto mt-[9px] block h-[39px] w-[220px] cursor-pointer rounded-[12px] border-0 bg-[#a3a3a3] text-[12px] leading-[15px] text-[#424242]"
            >
              교육 들으러 바로 가기
            </button>
          </div>
        </section>

        <section className="mt-[28px] rounded-[12px] bg-[#a3a3a3] px-[35px] py-[18px]">
          <div className="flex items-center justify-between gap-4 text-[12px] leading-[15px]">
            <span>교육 수료증 인증 상태</span>
            <span className="text-[#424242]">확인 대기중</span>
          </div>
        </section>

        <nav
          className="absolute bottom-[16px] left-[24px] right-[16px] h-[70px] rounded-[35px] bg-[#d9d9d9]"
          aria-label="하단 메뉴"
        >
          <button
            type="button"
            className="absolute left-[48px] top-[12px] flex flex-col items-center border-0 bg-transparent p-0"
            onClick={onGoHome}
          >
            <img src={homeHomeOff.src} alt="" className="h-[38px] w-[38px]" />
            <span className="mt-[6px] text-[14px] font-normal leading-[17px] text-[#97ABB1]">
              홈
            </span>
          </button>
          <button
            type="button"
            className="absolute left-[160px] top-[12px] flex flex-col items-center border-0 bg-transparent p-0"
            onClick={onGoHome}
          >
            <img
              src={homeAnnouncementOff.src}
              alt=""
              className="h-[38px] w-[38px]"
            />
            <span className="mt-[6px] text-[14px] font-normal leading-[17px] text-[#97ABB1]">
              공고
            </span>
          </button>
          <button
            type="button"
            className="absolute left-[272px] top-[12px] flex flex-col items-center border-0 bg-transparent p-0"
            onClick={() => onGoHome?.()}
          >
            <img src={homeAccountOn.src} alt="" className="h-[38px] w-[38px]" />
            <span className="mt-[6px] text-[14px] font-normal leading-[17px] text-[#4672B9]">
              내 정보
            </span>
          </button>
        </nav>
      </section>
    </main>
  );
}

export default Mypage;
