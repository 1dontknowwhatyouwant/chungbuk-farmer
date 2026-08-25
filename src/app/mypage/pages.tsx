"use client";

import { useRouter } from "next/navigation";
import Mypage from "../../components/Mypage/Mypage";
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

  return (
    <Mypage
      onDeleteAccount={handleDeleteAccount}
      onLogout={() => {
        void authApi.logout().finally(logout);
        router.push("/login");
      }}
      onGoHome={() => router.push("/home")}
    />
  );
}
