"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  carrotHero,
  cornHero,
  farmerHomeHero,
  homeHomeOn,
  homeLogo,
  logoutIcon,
  marketCarrot,
  marketCorn,
  marketPotato,
  marketTomato,
  potatoHero,
} from "../../../assets/assets";
import {
  farmHomeApi,
  authApi,
  marketPriceApi,
  type FarmJobPosting,
  type FarmProfile,
  type JobPostingDisplayStatus,
  type MarketPriceItem,
  type User,
} from "../../../services/api";
import { useAuthStore } from "../../../stores/useAuthStore";

const noticeBadge: Record<JobPostingDisplayStatus, { label: string; color: string }> = {
  DRAFT: { label: "임시저장", color: "#eef1f4" },
  PENDING: { label: "대기중", color: "#dadbd5" },
  APPROVED: { label: "승인 완료", color: "#dfffc2" },
  CLOSED: { label: "마감", color: "#c8c8c8" },
  REJECTED: { label: "승인 거절", color: "#a1a1a1" },
  CANCELLED: { label: "취소됨", color: "#e0b8b8" },
};
const stats: { label: string; key: JobPostingDisplayStatus; left: number }[] = [
  { label: "대기중", key: "PENDING", left: 43 },
  { label: "승인완료", key: "APPROVED", left: 149 },
  { label: "마감", key: "CLOSED", left: 255 },
];

const crops = [
  { keyword: "토마토", hero: farmerHomeHero, icon: marketTomato },
  { keyword: "옥수수", hero: cornHero, icon: marketCorn },
  { keyword: "당근", hero: carrotHero, icon: marketCarrot },
  { keyword: "감자", hero: potatoHero, icon: marketPotato },
];
const CROP_ROTATE_INTERVAL_MS = 5000;

export default function FarmerHome() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const storedUser = useAuthStore((state) => state.user);
  const [user, setUser] = useState<User | null>(storedUser);
  const [profile, setProfile] = useState<FarmProfile | null>(null);
  const [displayCounts, setDisplayCounts] = useState<Partial<Record<JobPostingDisplayStatus, number>>>({});
  const [recentPostings, setRecentPostings] = useState<FarmJobPosting[]>([]);
  const [marketPrice, setMarketPrice] = useState<MarketPriceItem | null>(null);
  const [marketPriceStale, setMarketPriceStale] = useState<{ observedDate: string } | null>(null);
  const [cropIndex, setCropIndex] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCropIndex((index) => (index + 1) % crops.length);
    }, CROP_ROTATE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    let cancelled = false;

    const loadUserData = async () => {
      const [userResult, homeResult] = await Promise.allSettled([
        authApi.me(),
        farmHomeApi.get(),
      ]);

      if (cancelled) return;
      if (userResult.status === "fulfilled") setUser(userResult.value.data);
      if (homeResult.status === "fulfilled") {
        setProfile(homeResult.value.data.farmProfile);
        setDisplayCounts(homeResult.value.data.displayPostingCounts);
        setRecentPostings(homeResult.value.data.recentPostings);
      }
    };

    void loadUserData();
    window.addEventListener("focus", loadUserData);
    window.addEventListener("pageshow", loadUserData);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", loadUserData);
      window.removeEventListener("pageshow", loadUserData);
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    void marketPriceApi
      .latest({ keyword: crops[cropIndex].keyword, size: 1 })
      .then(({ data }) => {
        if (cancelled) return;
        setMarketPrice(data.items[0] ?? null);
        setMarketPriceStale(data.stale ? { observedDate: data.observedDate } : null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [cropIndex]);
  const handleLogout = () => {
    logout();
    void authApi.logout().catch(() => undefined);
    router.push("/login");
  };
  const directionArrow =
    marketPrice?.direction === "UP" ? "▲" : marketPrice?.direction === "DOWN" ? "▼" : "";
  return (
    <main className="min-h-screen bg-[#1f1f1f] sm:flex sm:justify-center sm:px-4 sm:py-8">
      <section
        className="relative mx-auto min-h-[1056px] w-full max-w-[402px] overflow-hidden bg-[linear-gradient(180deg,#cdf2fb_0%,#eef7eb_53.79%,#fff_95.25%)] text-[#475559]"
        style={{ fontFamily: "Pretendard, sans-serif" }}
      >
        <img
          src={homeLogo.src}
          alt="도시농부+"
          className="absolute left-[28px] top-[26px] h-[41px] w-[92px] object-contain"
        />

        <img
          key={crops[cropIndex].hero.src}
          src={crops[cropIndex].hero.src}
          alt="농장 일러스트"
          className="animate-crop-fade absolute left-[37px] top-[111px] h-[130px] w-[327px] object-contain"
        />

        <div className="absolute left-[42px] top-[257px] h-[104px] w-[316px] rounded-xl border border-[#e4e4e4] bg-[#fefefe] px-[18px] py-[19px] text-black">
          <div className="flex items-start justify-between">
            <span className="text-[18px] leading-[21px]">
              {profile?.farmName || (user?.name ? `${user.name} 농가` : "농가 정보 없음")}
            </span>
            <div className="flex items-center gap-[11px]">
              <button
                type="button"
                onClick={() => router.push("/farmer-mypage")}
                className="flex h-[29px] w-[92px] items-center justify-center rounded-[14.5px] bg-[#d6eba1] text-[14px]"
              >
                {profile ? "수정하기" : "등록하기"}
              </button>
              <button type="button" onClick={handleLogout} aria-label="로그아웃">
                <img src={logoutIcon.src} alt="" className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
          <div className="mt-1 text-[12px] text-[#424242]">
            {profile?.farmAddress || user?.address || "주소 정보 없음"}
          </div>
          <div className="mt-1 flex items-center justify-between text-[12px] text-[#424242]">
            <span>{profile?.contactNumber || user?.phoneNumber || "연락처 정보 없음"}</span>
            <span>
              주요 작물　
              <span className="text-[14px] font-medium">
                {profile?.crops?.length ? profile.crops.join(", ") : "등록된 작물 없음"}
              </span>
            </span>
          </div>
        </div>

        <h1 className="absolute left-[42px] top-[375px] text-[24px] font-normal">공고현황</h1>

        <div className="absolute left-0 top-[410px] h-[76px] w-full">
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{ left: stat.left }}
              className="absolute top-0 flex h-[76px] w-[82px] flex-col items-center justify-center gap-2 rounded-xl border border-[#e4e4e4] bg-[#fdfffb] text-black"
            >
              <span className="text-[14px] text-[#424242]">{stat.label}</span>
              <span className="text-[16px]">{displayCounts[stat.key] ?? 0}</span>
            </div>
          ))}
        </div>

        <div className="absolute left-[25px] top-[500px] flex w-[352px] flex-col gap-[22px] text-black">
          {recentPostings.length === 0 && (
            <p className="py-6 text-center text-sm text-[#939292]">아직 등록된 공고가 없습니다.</p>
          )}
          {recentPostings.map((posting) => (
            <div
              key={posting.id}
              className="flex items-center justify-between rounded-xl border border-[#dfe0df] bg-white px-[17px] py-3"
            >
              <div>
                <div className="text-[14px]">{posting.title}</div>
                <div className="mt-2 text-[12px]">
                  작업일 {posting.workDate.replaceAll("-", ".")}　 모집 {posting.capacity}
                </div>
              </div>
              <span
                style={{ backgroundColor: noticeBadge[posting.displayStatus].color }}
                className="flex h-[37px] w-[114px] items-center justify-center rounded-xl text-[14px]"
              >
                {noticeBadge[posting.displayStatus].label}
              </span>
            </div>
          ))}
        </div>

        <div
          onClick={() => router.push("/farmer-announcements")}
          className="absolute right-[25px] top-[772px] cursor-pointer whitespace-nowrap text-[14px] text-[#939292]"
        >
          전체 공고 보기
        </div>

        <h2 className="absolute left-[25px] top-[801px] text-[24px] font-medium">농작물 시세 현황</h2>

        <div
          className="absolute left-[58px] top-[845px] h-[108px] w-[298px] rounded-xl border border-[#96b3e2] text-white"
          style={{
            background:
              "radial-gradient(63.89% 63.89% at 50% 52.31%, #6FA3F6 0%, #2068DE 100%)",
          }}
        >
          <span className="absolute left-[104px] top-[22px] text-[10px] text-[#dbe3f2] opacity-65">
            {marketPrice?.itemName ?? crops[cropIndex].keyword}·{marketPrice?.unit ?? "1kg"} 기준
          </span>
          <span className="absolute left-[104px] top-[41px] text-[14px] font-medium text-[#eff5ff]">
            어제 시세
          </span>
          <span className="absolute left-[104px] top-[63px] flex items-baseline gap-1 whitespace-nowrap text-[23px] font-medium text-white">
            {marketPrice ? marketPrice.previousDayPrice.toLocaleString("ko-KR") : "-"}
            <span className="text-[16px] text-[#dddee0]">원</span>
          </span>
          <span className="absolute left-[208px] top-[41px] text-[14px] font-medium text-[#eff5ff]">
            오늘 시세 <span className="text-white">{directionArrow}</span>
          </span>
          <span className="absolute left-[208px] top-[63px] flex items-baseline gap-1 whitespace-nowrap text-[23px] font-medium text-white">
            {marketPrice ? marketPrice.currentPrice.toLocaleString("ko-KR") : "-"}
            <span className="text-[16px] text-[#dddee0]">원</span>
          </span>
        </div>
        <img
          key={crops[cropIndex].icon.src}
          src={crops[cropIndex].icon.src}
          alt="농작물"
          className="animate-crop-fade absolute left-[25px] top-[852px] h-[103px] w-[125px] object-contain"
        />
        {marketPriceStale && (
          <div className="absolute left-[58px] top-[956px] w-[298px] text-right text-[10px] text-[#b3752e]">
            시세 갱신이 지연되고 있습니다 ({marketPriceStale.observedDate} 기준)
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 flex h-[87px] flex-col items-center justify-center gap-1 border-t border-[#f2f8e1] bg-[linear-gradient(180deg,rgba(248,253,234,0.2)_-25.32%,rgba(199,232,115,0.2)_100%)]">
          <img src={homeHomeOn.src} alt="" className="h-[38px] w-[38px]" />
          <span className="text-[14px] text-[#4672b9]">홈</span>
        </div>
      </section>
    </main>
  );
}
