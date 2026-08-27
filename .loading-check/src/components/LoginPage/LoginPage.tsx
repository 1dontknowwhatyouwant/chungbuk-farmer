"use client";
import { useRouter } from "next/navigation";
import Login from "../Login/Login";
import { useAuthStore } from "../../stores/useAuthStore";
export default function LoginPage() {
  const router = useRouter();
  return (
    <Login
      onSignupClick={() => router.push("/register")}
      onLoginSuccess={() => {
        const user = useAuthStore.getState().user;
        if (user?.userType === "CENTER_ADMIN") {
          router.push("/center-home");
          return;
        }

        router.push(user?.userType === "FARM" ? "/farmer-home" : "/home");
      }}
    />
  );
}
