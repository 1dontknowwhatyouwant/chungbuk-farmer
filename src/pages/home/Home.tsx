import { useEffect, useState } from "react";
import {
  homeAccountOff,
  homeAnnouncementOff,
  homeAlarm,
  homeLogo,
  homeHomeOn,
  homeCarrot,
  homeCorn,
  homePotato,
  homeTomato,
} from "../../assets/assets";

type CropItem = {
  name: string;
  image: string;
  today: string;
  yesterday: string;
};

const cropImages = [homeTomato, homeCorn, homeCarrot, homePotato];

const cropItems: CropItem[] = [
  { name: "토마토", image: homeTomato, today: "1,120", yesterday: "1,100" },
  { name: "옥수수", image: homeCorn, today: "1,450", yesterday: "1,420" },
  { name: "당근", image: homeCarrot, today: "980", yesterday: "970" },
  { name: "감자", image: homePotato, today: "1,010", yesterday: "1,030" },
];

interface HomeProps {
  onGoToMypage?: () => void;
}

function Home({ onGoToMypage }: HomeProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [priceIndex, setPriceIndex] = useState(0);

  useEffect(() => {
    const imageTimer = window.setInterval(() => {
      setImageIndex((current) => (current + 1) % cropImages.length);
    }, 2400);

    const priceTimer = window.setInterval(() => {
      setPriceIndex((current) => (current + 1) % cropItems.length);
    }, 3200);

    return () => {
      window.clearInterval(imageTimer);
      window.clearInterval(priceTimer);
    };
  }, []);

  const currentCrop = cropItems[priceIndex];

  return (
    <main className="min-h-screen bg-[#1f1f1f] sm:flex sm:items-center sm:justify-center sm:px-4 sm:py-8">
      <section
        className="relative mx-auto h-[874px] w-full max-w-[402px] overflow-hidden bg-[linear-gradient(180deg,#CDF2FB_0%,#EEF7EB_53.79%,#FFFFFF_95.25%)]"
        style={{ fontFamily: "Pretendard, Inter, ui-sans-serif, system-ui, sans-serif" }}
      >
        <img
          src={homeLogo}
          alt="도시농부+"
          className="pointer-events-none absolute left-[26px] top-[78px] h-[38px] w-[111px]"
        />
        <button
          type="button"
          className="absolute right-[49px] top-[78px] border-0 bg-transparent p-0"
          aria-label="알림"
        >
          <img src={homeAlarm} alt="" className="h-[54px] w-[54px]" />
        </button>

        <h1
          className="absolute left-[25px] top-[137px] text-[24px] font-medium leading-[29px] text-[#475559]"
        >
          농작물 시세 현황
        </h1>

        <div
          className="absolute left-[60px] top-[180px] box-border h-[108px] w-[298px] rounded-[12px] border border-[#96B3E2] bg-[radial-gradient(63.89%_63.89%_at_50%_52.31%,#6FA3F6_0%,#2068DE_100%)]"
        >
          <div className="pointer-events-none absolute left-[-32px] top-[-12px] h-[112px] w-[112px] overflow-visible">
            {cropImages.map((image, index) => (
              <img
                key={image}
                src={image}
                alt=""
                className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 drop-shadow-[0_14px_12px_rgba(0,0,0,0.26)] ${
                  index === imageIndex ? "opacity-100" : "opacity-0"
                }`}
                />
              ))}
          </div>

          <div className="absolute left-[162px] top-[200px] text-[10px] leading-[12px] text-[#DBE3F2] opacity-65">
            개당
          </div>
          <div className="absolute left-[199px] top-[200px] text-[10px] leading-[12px] text-[#DBE3F2] opacity-65">
            1
          </div>
          <div className="absolute left-[162px] top-[219px] text-[14px] font-medium leading-[17px] text-[#EFF5FF]">
            어제 시세
          </div>
          <div className="absolute left-[266px] top-[219px] text-[14px] font-medium leading-[17px] text-[#EFF5FF]">
            오늘 시세
          </div>

          <div className="absolute left-[162px] top-[241px] text-[23px] font-medium leading-[27px] text-white">
            {currentCrop.yesterday}
          </div>
          <div className="absolute left-[218px] top-[245px] text-[16px] font-normal leading-[19px] text-[#DDDEE0]">
            원
          </div>
          <div className="absolute left-[266px] top-[241px] text-[23px] font-medium leading-[27px] text-white">
            {currentCrop.today}
          </div>
          <div className="absolute left-[322px] top-[245px] text-[16px] font-normal leading-[19px] text-[#DDDEE0]">
            원
          </div>
        </div>

        <div
          className="absolute left-[25px] top-[317px] text-[24px] font-medium leading-[29px] text-[#475559]"
        >
          내 신청 현황
        </div>

        <div
          className="box-border absolute left-[25px] top-[362px] h-[174px] w-[352px] rounded-[12px] border border-[rgba(215,228,183,0.42)] bg-[#FFFDFD] shadow-[0_2px_10.4px_rgba(0,0,0,0.28)]"
        >
          <div
            className="box-border absolute left-[20px] top-[12px] h-[26px] w-[126px] rounded-[8px] border border-[#E8EAEC] bg-[rgba(217,217,217,0.22)]"
          />
          <div className="absolute left-[32px] top-[18px] text-[12px] font-normal leading-[14px] text-[#757575]">
            희망 근무 조건 신청중
          </div>

          <div className="absolute left-[277px] top-[15px] text-[18px] font-medium leading-[21px] bg-[linear-gradient(0deg,#D9D9D9_-61.9%,#373737_173.81%)] bg-clip-text text-transparent">
            승인 대기
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
            2025.06.25
          </div>
          <div className="absolute left-[122px] top-[81px] text-[12px] font-medium leading-[14px] text-[#2A84C4]">
            충남 서산시
          </div>
          <div className="absolute left-[224px] top-[81px] text-[12px] font-medium leading-[14px] text-[#2A84C4]">
            화
          </div>
          <div className="absolute left-[244px] top-[81px] text-[12px] font-medium leading-[14px] text-[#2A84C4]">
            금
          </div>

          <button
            type="button"
            className="absolute left-[95px] top-[117px] box-border h-[34px] w-[162px] rounded-[12px] bg-[#D1E895] text-[14px] font-medium leading-[17px] text-[#30322B]"
          >
            내용 수정하기
          </button>
        </div>

        <div className="absolute left-[25px] top-[557px] text-[24px] font-medium leading-[29px] text-[#475559]">
          교육 이수 상태
        </div>

        <div
          className="box-border absolute left-[25px] top-[608px] h-[151px] w-[130px] rounded-[12px] border border-[#E3E3E3] bg-[#FFFCF9] shadow-[0_14px_10.8px_rgba(156,164,142,0.25)]"
        >
          <div className="absolute left-[18px] top-[12px] rounded-[9px] bg-[#ECF1F3] px-[10px] py-[2px] text-[12px] leading-[14px] text-[#243E45]">
            필수
          </div>
          <div className="absolute left-[16px] top-[43px] text-[18px] font-light leading-[21px] text-black">
            농업안전 기초
          </div>
          <button
            type="button"
            className="absolute left-[24px] top-[118px] text-[16px] font-normal leading-[19px] text-[#3F4433]"
          >
            이수 받기
          </button>
        </div>

        <div
          className="box-border absolute left-[171px] top-[608px] h-[151px] w-[130px] rounded-[12px] border border-[#E3E3E3] bg-[#FFFCF9] shadow-[0_14px_10.8px_rgba(156,164,142,0.25)]"
        >
          <div className="absolute left-[18px] top-[12px] rounded-[9px] bg-[#ECF1F3] px-[10px] py-[2px] text-[12px] leading-[14px] text-[#243E45]">
            필수
          </div>
          <div className="absolute left-[16px] top-[43px] w-[88px] text-[18px] font-light leading-[21px] text-black">
            도시 농업 이해와 기초
          </div>
          <button
            type="button"
            className="absolute left-[24px] top-[118px] text-[16px] font-normal leading-[19px] text-[#3F4433]"
          >
            이수 받기
          </button>
        </div>

        <div
          className="absolute left-[317px] top-[743px] text-[12px] font-normal leading-[14px] text-[#7F7C78]"
        >
          더보기
        </div>

        <nav
          className="absolute left-[25px] top-[785px] box-border h-[77px] w-[352px] rounded-[35px] border border-[#F2F8E1] bg-[linear-gradient(180deg,rgba(248,253,234,0.44)_-25.32%,rgba(199,232,115,0.44)_100%)]"
          aria-label="하단 메뉴"
        >
          <button
            type="button"
            className="absolute left-[48px] top-[12px] flex flex-col items-center border-0 bg-transparent p-0"
          >
            <img src={homeHomeOn} alt="" className="h-[38px] w-[38px]" />
            <span className="mt-[6px] text-[14px] font-normal leading-[17px] text-[#4672B9]">
              홈
            </span>
          </button>
          <button
            type="button"
            className="absolute left-[160px] top-[12px] flex flex-col items-center border-0 bg-transparent p-0"
          >
            <img
              src={homeAnnouncementOff}
              alt=""
              className="h-[38px] w-[38px]"
            />
            <span className="mt-[6px] text-[14px] font-normal leading-[17px] text-[#97ABB1]">
              공고
            </span>
          </button>
          <button
            type="button"
            onClick={onGoToMypage}
            className="absolute left-[272px] top-[12px] flex flex-col items-center border-0 bg-transparent p-0"
          >
            <img src={homeAccountOff} alt="" className="h-[38px] w-[38px]" />
            <span className="mt-[6px] text-[14px] font-normal leading-[17px] text-[#97ABB1]">
              내 정보
            </span>
          </button>
        </nav>
      </section>
    </main>
  );
}

export default Home;
