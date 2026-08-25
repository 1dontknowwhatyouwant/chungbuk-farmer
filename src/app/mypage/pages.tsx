"use client";

import { useRouter } from "next/navigation";
import Mypage from "../../components/Mypage/Mypage";
import { deleteMockUser } from "../../services/mockAuth";
import { useAuthStore } from "../../stores/useAuthStore";

export default function MypagePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleDeleteAccount = async () => {
    if (!user) return;

    await deleteMockUser(user.email);
    logout();
    router.push("/login");
  };

  return (
    <Mypage
      onDeleteAccount={handleDeleteAccount}
      onLogout={() => {
        logout();
        router.push("/login");
      }}
      onGoHome={() => router.push("/home")}
    />
  );
}
