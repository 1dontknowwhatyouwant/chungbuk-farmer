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

  const handleLogout = () => {
    // 서버 응답을 기다리는 동안 새로고침해도 자동 로그인되지 않도록 먼저 삭제한다.
    logout();
    // 클라이언트 토큰은 이미 삭제했으므로 서버 로그아웃 실패가 화면 오류가 되지 않게 처리한다.
    void authApi.logout().catch(() => undefined);
    router.push("/login");
  };

  return (
    <Mypage
      onDeleteAccount={handleDeleteAccount}
      onLogout={handleLogout}
      onGoHome={() => router.push("/home")}
    />
  );
}
