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
import { marketPriceApi, type MarketPrice } from "../../services/api";

type CropItem = {
  name: string;
  image: string;
  today: string;
  yesterday: string;
};
type WorkCondition = { appliedAt: string; regionName: string; days: string[]; status?: "PENDING" | "APPROVED" };

const cropImages = [homeTomato.src, homeCorn.src, homeCarrot.src, homePotato.src];

const cropItems: CropItem[] = [
  { name: "토마토", image: homeTomato.src, today: "1,120", yesterday: "1,100" },
  { name: "옥수수", image: homeCorn.src, today: "1,450", yesterday: "1,420" },
  { name: "당근", image: homeCarrot.src, today: "980", yesterday: "970" },
  { name: "감자", image: homePotato.src, today: "1,010", yesterday: "1,030" },
];

interface HomeProps {
  onGoToMypage?: () => void;
  onGoToAnnouncement?: () => void;
  onGoToWorkCondition?: () => void;
}

function Home({ onGoToMypage, onGoToAnnouncement, onGoToWorkCondition }: HomeProps) {
  const [priceIndex, setPriceIndex] = useState(0);
  const [marketItems, setMarketItems] = useState<CropItem[]>(cropItems);
  const [hasApplication, setHasApplication] = useState(false);
  const [workCondition, setWorkCondition] = useState<WorkCondition>({ appliedAt: "2025.06.25", regionName: "충북 청주시", days: ["화", "금"], status: "PENDING" });

  useEffect(() => {
    const saved = window.localStorage.getItem("chungbuk-farmer-work-condition");
    if (saved) {
      try { setWorkCondition(JSON.parse(saved) as WorkCondition); setHasApplication(true); } catch { /* ignore malformed local data */ }
    }
    const priceTimer = window.setInterval(() => {
      setPriceIndex((current) => (current + 1) % cropItems.length);
    }, 2400);

    void marketPriceApi.list(cropItems.map((crop) => crop.name)).then(({ data }) => {
      if (!Array.isArray(data) || data.length === 0) return;
      const pricesByCrop = new Map(data.map((item: MarketPrice) => [item.crop, item]));
      const syncedItems = cropItems.map((item) => {
        const price = pricesByCrop.get(item.name);
        return price
          ? { ...item, today: String(price.today), yesterday: String(price.yesterday) }
          : item;
      });
      setMarketItems(syncedItems);
    }).catch(() => {
      // 시세 API가 일시적으로 unavailable해도 홈은 기본 시세로 표시한다.
    });

    return () => {
    window.clearInterval(priceTimer);
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

        <div
          className="box-border absolute left-[6.2%] top-[608px] h-[151px] w-[32.3%] rounded-[12px] border border-[#E3E3E3] bg-[#FFFCF9] shadow-[0_14px_10.8px_rgba(156,164,142,0.25)]"
        >
          <div className="absolute left-[18px] top-[12px] rounded-[9px] bg-[#ECF1F3] px-[10px] py-[2px] text-[12px] leading-[14px] text-[#243E45]">
            필수
          </div>
          <div className="absolute left-[16px] top-[43px] text-[18px] font-light leading-[21px] text-black">
            농업안전 기초
          </div>
          <a
            href="https://agriedu.net/"
            className="absolute left-[24px] top-[118px] text-[16px] font-normal leading-[19px] text-[#3F4433]"
          >
            이수 받기
          </a>
        </div>

        <div
          className="box-border absolute left-[42.5%] top-[608px] h-[151px] w-[32.3%] rounded-[12px] border border-[#E3E3E3] bg-[#FFFCF9] shadow-[0_14px_10.8px_rgba(156,164,142,0.25)]"
        >
          <div className="absolute left-[18px] top-[12px] rounded-[9px] bg-[#ECF1F3] px-[10px] py-[2px] text-[12px] leading-[14px] text-[#243E45]">
            필수
          </div>
          <div className="absolute left-[16px] top-[43px] w-[88px] text-[18px] font-light leading-[21px] text-black">
            도시 농업 이해와 기초
          </div>
          <a
            href="https://agriedu.net/"
            className="absolute left-[24px] top-[118px] text-[16px] font-normal leading-[19px] text-[#3F4433]"
          >
            이수 받기
          </a>
        </div>

        <div
          className="absolute left-[317px] top-[743px] text-[12px] font-normal leading-[14px] text-[#7F7C78]"
        >
          더보기
        </div>

        <BottomNav
          onGoToMypage={onGoToMypage}
          onGoToAnnouncement={onGoToAnnouncement}
        />
      </section>
    </main>
  );
}

export default Home;
