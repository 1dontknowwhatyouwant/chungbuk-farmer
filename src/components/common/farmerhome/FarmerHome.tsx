"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { homeLogo, homeTomato } from "../../../assets/assets";
import { farmProfileApi, authApi, type FarmProfile, type User } from "../../../services/api";
import { useAuthStore } from "../../../stores/useAuthStore";

const notices = [
  ["옥수수 수확 인력 모집", "승인 완료", "bg-[#dfffc2]"],
  ["토마토 봉지 씌우기 작업", "대기중", "bg-[#dadbd5]"],
  ["감자 수확 보조 인력", "승인 거절", "bg-[#a1a1a1]"],
];

export default function FarmerHome() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const storedUser = useAuthStore((state) => state.user);
  const [user, setUser] = useState<User | null>(storedUser);
  const [profile, setProfile] = useState<FarmProfile | null>(null);
  useEffect(() => {
    let cancelled = false;

    const loadUserData = async () => {
      const [userResult, profileResult] = await Promise.allSettled([
        authApi.me(),
        farmProfileApi.get(),
      ]);

      if (cancelled) return;
      if (userResult.status === "fulfilled") setUser(userResult.value.data);
      if (profileResult.status === "fulfilled") setProfile(profileResult.value.data);
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
  const handleLogout = () => {
    logout();
    void authApi.logout().catch(() => undefined);
    router.push("/login");
  };
  const handleDeleteAccount = async () => {
    const password = window.prompt(
      "탈퇴를 진행하려면 현재 비밀번호를 입력해 주세요.",
    );
    if (!password) return;
    try {
      await authApi.withdrawal(password);
      logout();
      router.push("/login");
    } catch {
      window.alert("계정 삭제에 실패했습니다. 비밀번호를 확인해 주세요.");
    }
  };
  return (
    <main className="min-h-screen bg-[#1f1f1f] sm:flex sm:justify-center sm:px-4 sm:py-8">
      <section
        className="relative mx-auto min-h-[1170px] w-full max-w-[402px] overflow-hidden bg-[linear-gradient(180deg,#cdf2fb_0%,#eef7eb_54%,#fff_95%)] px-[22px] pt-[58px] text-[#475559]"
        style={{ fontFamily: "Pretendard, sans-serif" }}
      >
        <img
          src={homeLogo.src}
          alt="도시농부+"
          className="absolute left-6 top-[58px] h-[38px] w-[86px] object-contain"
        />
        <div className="absolute right-5 top-[66px] flex gap-3 text-[11px] text-[#424242]">
          <button
            type="button"
            className="border-0 bg-transparent p-0"
            onClick={handleLogout}
          >
            로그아웃
          </button>
          <button
            type="button"
            className="border-0 bg-transparent p-0 text-[#858282]"
            onClick={handleDeleteAccount}
          >
            계정 삭제
          </button>
        </div>
        <div
          className="mx-auto mt-[92px] h-[104px] w-[242px] rounded-xl bg-[#4e3a29] shadow-inner"
          aria-label="농장 일러스트"
        >
          <img
            src={homeTomato.src}
            alt=""
            className="mx-auto h-full w-[145px] object-contain"
          />
        </div>
        <div className="mx-auto mt-[18px] rounded-xl border border-[#e4e4e4] bg-white px-[14px] py-[12px] text-black">
          <div className="flex items-center justify-between">
            <span className="text-[18px]">
              {profile?.farmName || (user?.name ? `${user.name} 농가` : "농가 정보 없음")}
            </span>
            <button
              type="button"
              onClick={() => router.push("/farmer-mypage")}
              className="rounded-full bg-[#d6eba1] px-7 py-2 text-sm"
            >
              수정하기
            </button>
          </div>
          <div className="mt-1 text-xs text-[#424242]">
            {profile?.farmAddress || user?.address || "주소 정보 없음"}
          </div>
          <div className="mt-3 flex justify-between text-xs text-[#424242]">
            <span>{profile?.contactNumber || user?.phoneNumber || "연락처 정보 없음"}</span>
            <span>
              주요 작물　{profile?.crops?.length ? profile.crops.join(", ") : "등록된 작물 없음"}
            </span>
          </div>
        </div>
        <h1 className="mt-5 text-2xl">공고현황</h1>
        <div className="mt-6 flex justify-between text-center text-sm text-black">
          <div className="rounded-xl border bg-[#f7f7f7] px-5 py-4">
            대기중
            <br />
            <b className="mt-4 block font-normal">1</b>
          </div>
          <div className="rounded-xl border bg-[#f7f7f7] px-5 py-4">
            승인완료
            <br />
            <b className="mt-4 block font-normal">3</b>
          </div>
          <div className="rounded-xl border bg-[#f7f7f7] px-5 py-4">
            마감
            <br />
            <b className="mt-4 block font-normal">4</b>
          </div>
        </div>
        <div className="mt-6 space-y-5 text-black">
          {notices.map(([title, status, color]) => (
            <div
              key={title}
              className="flex items-center justify-between rounded-xl border border-[#dfe0df] bg-white px-4 py-3"
            >
              <div>
                <div className="text-sm">{title}</div>
                <div className="mt-2 text-xs">작업일 2026.08.16　 모집 3</div>
              </div>
              <span className={`rounded-xl ${color} px-5 py-3 text-sm`}>
                {status}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-5 text-right text-sm text-[#939292]">
          전체 공고 보기
        </div>
        <h2 className="mt-3 text-2xl">농작물 시세 현황</h2>
        <div className="mt-3 flex h-[94px] items-center justify-end gap-6 rounded-xl bg-[#2875df] px-5 text-white">
          <img
            src={homeTomato.src}
            alt="토마토"
            className="-ml-12 h-24 w-24 object-contain"
          />
          <span>
            어제 시세
            <br />
            <b className="text-2xl">1,120</b> 원
          </span>
          <span>
            오늘 시세
            <br />
            <b className="text-2xl">1,100</b> 원
          </span>
        </div>
      </section>
    </main>
  );
}
