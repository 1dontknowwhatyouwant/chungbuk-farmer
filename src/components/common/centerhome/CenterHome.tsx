"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  centerHomeApplicationDocument,
  centerHomeApplicationGear,
  centerHomeData,
  centerHomeHome,
  centerHomeLogo,
  centerHomeOperations,
  centerHomePostingReview,
} from "../../../assets/assets";
import { authApi, centerAdminApi, type AdminDashboard } from "../../../services/api";
import { useAuthStore } from "../../../stores/useAuthStore";

type MenuCardProps = {
  label: string;
  icon: "applications" | "posting" | "operations" | "data";
  onClick: () => void;
};

function MenuCard({ label, icon, onClick }: MenuCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center border-0 bg-transparent p-0 text-[#475559]"
      aria-label={label}
    >
      <span className="relative flex h-[98px] w-[122px] items-center justify-center rounded-[12px] bg-white shadow-[0_4px_4px_rgba(162,169,146,0.25)] transition-transform group-hover:-translate-y-0.5 group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-[#91ad43]">
        {icon === "applications" ? (
          <span className="relative h-[65px] w-[60px]">
            <img
              src={centerHomeApplicationDocument.src}
              alt=""
              className="absolute right-0 top-0 h-[65px] w-[53px]"
            />
            <img
              src={centerHomeApplicationGear.src}
              alt=""
              className="absolute bottom-0 left-0 h-[33px] w-[33px]"
            />
          </span>
        ) : null}
        {icon === "posting" ? (
          <img src={centerHomePostingReview.src} alt="" className="h-[59px] w-[64px]" />
        ) : null}
        {icon === "operations" ? (
          <img src={centerHomeOperations.src} alt="" className="h-[65px] w-[52px]" />
        ) : null}
        {icon === "data" ? (
          <img src={centerHomeData.src} alt="" className="h-[59px] w-[64px]" />
        ) : null}
      </span>
      <span className="mt-[8px] text-[16px] font-medium leading-[19px]">{label}</span>
    </button>
  );
}

export default function CenterHome() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);
  const dashboardRequest = useRef<Promise<void> | null>(null);

  const loadDashboard = useCallback(() => {
    // Strict Mode can replay the effect while its first request is still pending.
    if (dashboardRequest.current) return dashboardRequest.current;

    setLoading(true);
    setError(null);
    dashboardRequest.current = (async () => {
      try {
        const { data } = await centerAdminApi.dashboard();
        if (mounted.current) setDashboard(data);
      } catch {
        if (mounted.current) {
          setError("업무 현황을 불러오지 못했습니다. 서버 연결과 센터 계정을 확인해 주세요.");
        }
      } finally {
        dashboardRequest.current = null;
        if (mounted.current) setLoading(false);
      }
    })();
    return dashboardRequest.current;
  }, []);

  useEffect(() => {
    mounted.current = true;
    void loadDashboard();
    return () => { mounted.current = false; };
  }, [loadDashboard]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      logout();
      router.replace("/login");
    }
  };

  const summaryItems = [
    { label: "신규신청", value: dashboard?.submittedParticipationApplications ?? 0 },
    { label: "공고검토", value: dashboard?.pendingJobPostings ?? 0 },
    { label: "매칭대기", value: dashboard?.pendingJobApplications ?? 0 },
  ];

  const pendingItems = [
    {
      id: "participation",
      title: "도시 농부 신청 대기",
      firstLabel: "승인 대기",
      firstValue: dashboard?.submittedParticipationApplications ?? 0,
      secondLabel: "교육 미확인",
      secondValue: dashboard?.pendingEducationSubmissions ?? 0,
      href: "/center-applications",
    },
    {
      id: "posting",
      title: "농가 공고 검토 대기",
      firstLabel: "공고 검토",
      firstValue: dashboard?.pendingJobPostings ?? 0,
      secondLabel: "매칭 대기",
      secondValue: dashboard?.pendingJobApplications ?? 0,
      href: "/center-postings",
    },
  ];

  return (
    <main className="min-h-screen bg-[#1f1f1f] sm:flex sm:justify-center sm:px-4 sm:py-8">
      <section
        className="relative mx-auto min-h-[964px] w-full max-w-[402px] overflow-hidden bg-[linear-gradient(180deg,#CDF2FB_0%,#EEF7EB_53.79%,#FFFFFF_95.25%)] text-[#475559] shadow-2xl"
        style={{ fontFamily: "Pretendard, Inter, ui-sans-serif, system-ui, sans-serif" }}
        aria-labelledby="center-home-title"
      >
        <img
          src={centerHomeLogo.src}
          alt="도시농부+"
          className="absolute left-[28px] top-[66px] h-[41px] w-[93px] object-contain object-left"
        />

        <h1
          id="center-home-title"
          className="absolute left-[25px] top-[137px] text-[24px] font-medium leading-[29px]"
        >
          업무 현황
        </h1>

        <section
          className="absolute left-[25px] top-[177px] h-[138px] w-[calc(100%-50px)] max-w-[352px] rounded-[12px] bg-[#fefffa] px-[40px] pt-[17px] shadow-[inset_0_4px_4px_rgba(0,0,0,0.2)]"
          aria-labelledby="processing-summary-title"
        >
          <div className="flex items-center justify-between">
            <h2 id="processing-summary-title" className="text-[16px] font-normal leading-[19px]">
              처리 현황 요약
            </h2>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="h-[29px] rounded-[9px] border-0 bg-[#dee8f7] px-[12px] text-[14px] text-[#475559]"
            >
              로그아웃
            </button>
          </div>
          <dl className="mt-[17px] grid grid-cols-3 text-center" aria-busy={loading}>
            {summaryItems.map((item) => (
              <div key={item.label}>
                <dt className="text-[12px] leading-[15px] text-[#637277]">{item.label}</dt>
                <dd className="mt-[7px] text-[22px] leading-[27px] text-[#242f33]">{item.value}건</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="absolute left-[58px] top-[331px] grid grid-cols-2 gap-x-[43px] gap-y-[11px]">
          <MenuCard label="신청 관리" icon="applications" onClick={() => router.push("/center-applications")} />
          <MenuCard label="공고 검토" icon="posting" onClick={() => router.push("/center-postings")} />
          <MenuCard label="운영 통계" icon="operations" onClick={() => router.push("/center-statistics")} />
          <MenuCard label="데이터" icon="data" onClick={() => router.push("/center-data")} />
        </div>

        <section className="absolute left-[25px] top-[611px] w-[calc(100%-50px)]" aria-labelledby="pending-title">
          <h2 id="pending-title" className="text-[24px] font-medium leading-[29px]">
            처리 항목
          </h2>
          <div className="ml-[13px] mt-[14px] min-h-[207px] max-w-[325px] space-y-[10px] rounded-[12px] border border-[#dbe1ca] bg-[#f4f7eb] px-[22px] py-[19px]">
            {error ? (
              <div className="flex h-[169px] flex-col items-center justify-center text-center text-[13px] leading-5 text-[#9b4941]">
                <span>{error}</span>
                <button type="button" onClick={() => void loadDashboard()} className="mt-3 rounded-full bg-white px-4 py-2 text-[#385784]">
                  다시 시도
                </button>
              </div>
            ) : null}
            {!error && loading ? <div className="flex h-[169px] items-center justify-center text-sm">업무 현황을 불러오는 중입니다.</div> : null}
            {!error && !loading ? pendingItems.map((item) => (
              <article key={item.id} className="relative h-[78px] rounded-[12px] bg-white px-[12px] pt-[12px]">
                <h3 className="text-[16px] font-normal leading-[19px]">{item.title}</h3>
                <div className="text-[14px] leading-[17px]">
                  <span className="absolute left-[12px] top-[52px] text-[#5e6e72]">{item.firstLabel}</span>
                  <span className="absolute left-[74px] top-[52px] text-[#242f33]">{item.firstValue}</span>
                  <span className="absolute left-[102px] top-[52px] text-[#5e6e72]">{item.secondLabel}</span>
                  <span className="absolute left-[177px] top-[52px] text-[#242f33]">{item.secondValue}</span>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(item.href)}
                  className="absolute right-[10px] top-[18px] h-[32px] w-[68px] rounded-[16px] border-0 bg-[#e8effb] text-[14px] font-medium text-[#263033]"
                  aria-label={`${item.title} ${item.id} 확인`}
                >
                  확인
                </button>
              </article>
            )) : null}
          </div>
        </section>

        <nav
          className="absolute bottom-0 left-0 flex h-[87px] w-full justify-center border border-[#f2f8e1] bg-[linear-gradient(180deg,rgba(248,253,234,0.2)_25%,rgba(199,232,115,0.2)_100%)] pt-[21px]"
          aria-label="중개센터 하단 메뉴"
        >
          <button type="button" className="flex flex-col items-center border-0 bg-transparent p-0 text-[#4672b9]" aria-current="page">
            <img src={centerHomeHome.src} alt="" className="h-[27px] w-[26px]" />
            <span className="mt-[3px] text-[14px] leading-[17px]">홈</span>
          </button>
        </nav>
      </section>
    </main>
  );
}
