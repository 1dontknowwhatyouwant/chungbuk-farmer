"use client";
import { useRouter } from "next/navigation";
import Mypage from "../Mypage/Mypage";
import { authApi } from "../../services/api";
import { useAuthStore } from "../../stores/useAuthStore";
export default function MypagePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleDeleteAccount = async () => {
    if (!user) return;
    const password = window.prompt("탈퇴를 진행하려면 현재 비밀번호를 입력해 주세요.");
    if (!password) return;
    await authApi.withdrawal(password);
    logout();
    router.push("/login");
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      logout();
      router.replace("/login");
    }
  };

  return (
    <Mypage
      onDeleteAccount={handleDeleteAccount}
      onLogout={() => void handleLogout()}
      onGoHome={() => router.push("/home")}
      onGoTimeline={() => router.push("/mypage/timeline")}
    />
  );
}
