"use client";

import { useRouter } from "next/navigation";
import Mypage from "../../src/views/mypage/Mypage";
import { deleteMockUser } from "../../src/services/mockAuth";
import { useAuthStore } from "../../src/stores/useAuthStore";

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
