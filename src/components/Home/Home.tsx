"use client";

import { useEffect, useState } from "react";
import {
  homeLogo,
  homeCarrot,
  homeCorn,
  homePotato,
  homeTomato,
} from "../../assets/assets";
import BottomNav from "../common/BottomNav/BottomNav";
import { educationApi, marketPriceApi, type EducationCertification, type EducationCourse, type MarketPriceItem } from "../../services/api";

type CropItem = {
  name: string;
  image: string;
  today: string;
  yesterday: string;
};
type WorkCondition = { appliedAt: string; regionName: string; days: string[]; status?: "PENDING" | "APPROVED" };

const cropImages = [homeTomato.src, homeCorn.src, homeCarrot.src, homePotato.src];

const cropItems: CropItem[] = [
  { name: "토마토", image: homeTomato.src, today: "-", yesterday: "-" },
  { name: "옥수수", image: homeCorn.src, today: "-", yesterday: "-" },
  { name: "당근", image: homeCarrot.src, today: "-", yesterday: "-" },
  { name: "감자", image: homePotato.src, today: "-", yesterday: "-" },
];

const progressStatusLabel: Record<EducationCourse["progressStatus"], string> = {
  NOT_STARTED: "미수강",
  IN_PROGRESS: "수강 중",
  COMPLETED: "수강 완료",
};

interface HomeProps {
  onGoToMypage?: () => void;
  onGoToAnnouncement?: () => void;
  onGoToWorkCondition?: () => void;
}

function Home({ onGoToMypage, onGoToAnnouncement, onGoToWorkCondition }: HomeProps) {
  const [priceIndex, setPriceIndex] = useState(0);
  const [marketItems, setMarketItems] = useState<CropItem[]>(cropItems);
  const [marketMeta, setMarketMeta] = useState<{ observedDate: string; stale: boolean } | null>(null);
  const [hasApplication, setHasApplication] = useState(false);
  const [educationCourses, setEducationCourses] = useState<EducationCourse[]>([]);
  const [educationLoading, setEducationLoading] = useState(true);
  const [showAllEducation, setShowAllEducation] = useState(false);
  const [workCondition, setWorkCondition] = useState<WorkCondition>({ appliedAt: "2025.06.25", regionName: "충북 청주시", days: ["화", "금"], status: "PENDING" });

  useEffect(() => {
    let disposed = false;
    const saved = window.localStorage.getItem("chungbuk-farmer-work-condition");
    if (saved) {
      try { setWorkCondition(JSON.parse(saved) as WorkCondition); setHasApplication(true); } catch { /* ignore malformed local data */ }
    }
    const loadEducation = async () => {
      if (!window.localStorage.getItem("chungbuk-farmer-access-token") && !window.sessionStorage.getItem("chungbuk-farmer-access-token")) {
        setEducationLoading(false);
        return;
      }
      setEducationLoading(true);
      try {
        let response;
        try {
          response = await educationApi.getCertification();
        } catch {
          // 재진입 직후 인증 상태가 반영되기 전 발생하는 일시적 실패를 한 번 재시도한다.
          await new Promise((resolve) => window.setTimeout(resolve, 500));
          response = await educationApi.getCertification();
        }
        if (disposed) return;
        const body = response.data as EducationCertification & {
          data?: EducationCertification & { courses?: EducationCourse[] };
          content?: EducationCourse[];
        };
        const payload = body.data ?? body;
        setEducationCourses(Array.isArray(payload.courses) ? payload.courses : (body.content ?? []));
      } catch {
        // 재진입 순간의 일시적인 인증/API 오류로 이미 표시된 교육을 지우지 않는다.
      } finally {
        if (!disposed) setEducationLoading(false);
      }
    };
    void loadEducation();
    const refreshOnReturn = (event: PageTransitionEvent) => {
      // 최초 진입은 위에서 이미 조회한다. 뒤로가기/앞으로가기로 복원된
      // 페이지(BFCache)에서만 최신 교육 상태를 다시 가져온다.
      if (event.persisted) void loadEducation();
    };
    window.addEventListener("pageshow", refreshOnReturn);
    const priceTimer = window.setInterval(() => {
      setPriceIndex((current) => (current + 1) % cropItems.length);
    }, 4000);

    void Promise.allSettled(
      cropItems.map((crop) => marketPriceApi.latest({
        keyword: crop.name,
        categoryCode: crop.name === "감자" ? "100" : "200",
        size: 100,
      })),
    ).then((results) => {
      const responses = results.map((result, index) => ({ result, crop: cropItems[index] }));
      const successfulResponses = responses.filter(
        (entry): entry is { result: PromiseFulfilledResult<Awaited<ReturnType<typeof marketPriceApi.latest>>>; crop: CropItem } => entry.result.status === "fulfilled",
      );
      if (successfulResponses.length === 0) return;
      const syncedItems = cropItems.map((item) => {
        const response = successfulResponses.find(({ crop }) => crop.name === item.name)?.result;
        const price = response?.value.data.items?.[0] as MarketPriceItem | undefined;
        return price
          ? { ...item, today: price.currentPrice.toLocaleString("ko-KR"), yesterday: price.previousDayPrice.toLocaleString("ko-KR") }
          : item;
      });
      setMarketItems(syncedItems);
      setMarketMeta({
        observedDate: successfulResponses[0].result.value.data.observedDate,
        stale: successfulResponses.some(({ result }) => result.value.data.stale),
      });
    }).catch(() => {
      // 시세 API가 일시적으로 unavailable해도 홈은 기본 시세로 표시한다.
    });

    return () => {
      disposed = true;
      window.clearInterval(priceTimer);
      window.removeEventListener("pageshow", refreshOnReturn);
    };
  }, []);

  const currentCrop = marketItems[priceIndex % marketItems.length] ?? cropItems[0];

  return (
    <main className="min-h-screen bg-[#1f1f1f] sm:flex sm:items-center sm:justify-center sm:px-4 sm:py-8">
      <section
        className="relative mx-auto min-h-[874px] w-full max-w-[402px] overflow-hidden bg-[linear-gradient(180deg,#CDF2FB_0%,#EEF7EB_53.79%,#FFFFFF_95.25%)]"
        style={{ fontFamily: "Pretendard, Inter, ui-sans-serif, system-ui, sans-serif" }}
      >
        <img
          src={homeLogo.src}
          alt="도시농부+"
          className="pointer-events-none absolute left-[6.5%] top-[78px] h-[38px] w-[27.6%] object-contain object-left"
        />
        <h1
          className="absolute left-[6.2%] top-[137px] text-[clamp(20px,6vw,24px)] font-medium leading-[29px] text-[#475559]"
        >
          농작물 시세 현황
        </h1>

        <div
          className="absolute left-[14.9%] top-[180px] box-border h-[108px] w-[74.1%] rounded-[12px] border border-[#96B3E2] bg-[radial-gradient(63.89%_63.89%_at_50%_52.31%,#6FA3F6_0%,#2068DE_100%)]"
        >
          <div className="pointer-events-none absolute left-[-32px] top-[-12px] h-[112px] w-[112px] overflow-visible">
            {cropImages.map((image, index) => (
              <img
                key={image}
                src={image}
                alt=""
                className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 drop-shadow-[0_14px_12px_rgba(0,0,0,0.26)] ${
                  index === priceIndex ? "opacity-100" : "opacity-0"
                }`}
                />
              ))}
          </div>

          <div className="absolute left-[102px] top-[20px] text-[10px] leading-[12px] text-[#DBE3F2] opacity-65">
            개당
          </div>
          <div className="absolute left-[139px] top-[20px] text-[10px] leading-[12px] text-[#DBE3F2] opacity-65">
            1
          </div>
          <div className="absolute left-[102px] top-[39px] text-[14px] font-medium leading-[17px] text-[#EFF5FF]">
            어제 시세
          </div>
          <div className="absolute left-[206px] top-[39px] text-[14px] font-medium leading-[17px] text-[#EFF5FF]">
            오늘 시세
          </div>

          <div className="absolute left-[102px] top-[60px] flex items-baseline whitespace-nowrap">
            <span className="text-[23px] font-medium leading-[27px] text-white">
              {currentCrop.yesterday}
            </span>
            <span className="ml-1 text-[16px] font-normal leading-[19px] text-[#DDDEE0]">
              원
            </span>
          </div>
          <div className="absolute left-[206px] top-[60px] flex items-baseline whitespace-nowrap">
            <span className="text-[23px] font-medium leading-[27px] text-white">
              {currentCrop.today}
            </span>
            <span className="ml-1 text-[16px] font-normal leading-[19px] text-[#DDDEE0]">
              원
            </span>
          </div>
          {marketMeta && (
            <div className="absolute -bottom-[25px] left-0 whitespace-nowrap text-[10px] text-[#65717A]">
              {marketMeta.stale ? "시세 갱신이 지연되고 있습니다 · " : "조사일 "}{marketMeta.observedDate}
            </div>
          )}
        </div>

        <div
          className="absolute left-[6.2%] top-[317px] text-[clamp(20px,6vw,24px)] font-medium leading-[29px] text-[#475559]"
        >
          내 신청 현황
        </div>

        <div
          className="box-border absolute left-[6.2%] top-[362px] h-[174px] w-[87.6%] rounded-[12px] border border-[rgba(215,228,183,0.42)] bg-[#FFFDFD] shadow-[0_2px_10.4px_rgba(0,0,0,0.28)]"
        >
          {hasApplication ? <>
          <div
            className="box-border absolute left-[20px] top-[12px] h-[26px] w-[126px] rounded-[8px] border border-[#E8EAEC] bg-[rgba(217,217,217,0.22)]"
          />
          <div className="absolute left-[32px] top-[18px] text-[12px] font-normal leading-[14px] text-[#757575]">
            희망 근무 조건 신청중
          </div>

          <div className="absolute left-[277px] top-[15px] text-[18px] font-medium leading-[21px] bg-[linear-gradient(0deg,#D9D9D9_-61.9%,#373737_173.81%)] bg-clip-text text-transparent">
            {workCondition.status === "APPROVED" ? "승인됨" : "승인 대기"}
          </div>

          <div className="absolute left-[20px] top-[53px] text-[16px] font-light leading-[19px] text-[#4E4F51]">
            신청일
          </div>
          <div className="absolute left-[122px] top-[53px] text-[16px] font-light leading-[19px] text-[#4E4F51]">
            희망 지역
          </div>
          <div className="absolute left-[224px] top-[53px] text-[16px] font-light leading-[19px] text-[#4E4F51]">
            희망 요일
          </div>

          <div className="absolute left-[20px] top-[81px] text-[12px] font-medium leading-[14px] text-[#2A84C4]">
            {workCondition.appliedAt}
          </div>
          <div className="absolute left-[122px] top-[81px] text-[12px] font-medium leading-[14px] text-[#2A84C4]">
            {workCondition.regionName}
          </div>
          <div className="absolute left-[224px] top-[81px] text-[12px] font-medium leading-[14px] text-[#2A84C4]">
            {workCondition.days.join(", ")}
          </div>
          <div className="absolute left-[244px] top-[81px] text-[12px] font-medium leading-[14px] text-[#2A84C4]">
            
          </div>

          <button
            type="button"
            onClick={onGoToWorkCondition}
            className="absolute left-[95px] top-[117px] box-border h-[34px] w-[162px] rounded-[12px] bg-[#D1E895] text-[14px] font-medium leading-[17px] text-[#30322B]"
          >
            내용 수정하기
          </button>
          </> : <div className="flex h-full flex-col items-center justify-center gap-4 text-[16px] text-[#757575]">
            <span>신청한 희망 근무 조건이 없습니다.</span>
            <button type="button" onClick={onGoToWorkCondition} className="h-[34px] w-[162px] rounded-[12px] bg-[#D1E895] text-[14px] font-medium text-[#30322B]">
              신청하기
            </button>
          </div>}
        </div>

        <div className="absolute left-[6.2%] top-[557px] text-[clamp(20px,6vw,24px)] font-medium leading-[29px] text-[#475559]">
          교육 이수 상태
        </div>

        <div className="absolute left-[6.2%] right-0 top-[608px] min-h-[151px] overflow-hidden">
          <div className={`flex gap-[24px] overflow-x-auto pb-2 pr-[6.2%] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${showAllEducation ? "" : "pointer-events-none"}`}>
            {educationCourses.slice(0, showAllEducation ? undefined : 2).map((course) => (
              <article key={course.courseId} className="box-border h-[151px] w-[130px] min-w-[130px] shrink-0 overflow-hidden rounded-[12px] border border-[#E3E3E3] bg-[#FFFCF9] shadow-[0_14px_10.8px_rgba(156,164,142,0.25)]">
                <div className="flex items-center justify-between px-[18px] pt-[12px]">
                  <span className="rounded-[9px] bg-[#ECF1F3] px-[10px] py-[2px] text-[12px] leading-[14px] text-[#243E45]">
                    {course.mandatory ? "필수" : "선택"}
                  </span>
                  <span className={`text-[11px] leading-[14px] ${course.progressStatus === "COMPLETED" ? "text-[#4B8B50]" : "text-[#7F7C78]"}`}>
                    {progressStatusLabel[course.progressStatus]}
                  </span>
                </div>
                <div className="ml-[16px] mr-[10px] mt-[13px] line-clamp-2 break-keep text-[18px] font-light leading-[21px] text-black">{course.title}</div>
                <div className="mx-[16px] mt-[11px]">
                  <div className="h-[5px] overflow-hidden rounded-full bg-[#E8E8E8]" aria-label={`${course.progressPercentage}% 수강`}>
                    <div className="h-full rounded-full bg-[#9BCB79]" style={{ width: `${Math.min(100, Math.max(0, course.progressPercentage))}%` }} />
                  </div>
                  <div className="mt-[4px] flex justify-between text-[10px] leading-[12px] text-[#7F7C78]">
                    <span>{course.progressPercentage}%</span>
                    <span>{course.remainingMinutes > 0 ? `${Math.ceil(course.remainingMinutes / 60)}시간 남음` : "이수 완료"}</span>
                  </div>
                </div>
                {course.externalApplicationUrl ? (
                  <a href={course.externalApplicationUrl} target="_blank" rel="noreferrer" className="ml-[24px] mt-[10px] inline-block text-[16px] font-normal leading-[19px] text-[#3F4433]">{course.progressStatus === "COMPLETED" ? "교육 페이지" : "이수 받기"}</a>
                ) : (
                  <span className="ml-[24px] mt-[10px] inline-block text-[14px] leading-[19px] text-[#9A9A9A]">링크 없음</span>
                )}
              </article>
            ))}
            {educationLoading && (
              <div className="flex h-[151px] w-full items-center justify-center text-[13px] text-[#7F7C78]">
                교육 정보를 불러오는 중입니다.
              </div>
            )}
          </div>
        </div>

        {educationCourses.length > 0 && (
          <button type="button" onClick={() => setShowAllEducation(true)} className="absolute left-[317px] top-[743px] border-0 bg-transparent p-0 text-[12px] font-normal leading-[14px] text-[#7F7C78]">
            {showAllEducation ? "좌우로 밀어보세요" : "더보기"}
          </button>
        )}

        <BottomNav
          onGoToMypage={onGoToMypage}
          onGoToAnnouncement={onGoToAnnouncement}
        />
      </section>
    </main>
  );
}

export default Home;
