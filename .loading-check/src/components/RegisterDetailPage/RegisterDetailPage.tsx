"use client";
import { useRouter } from "next/navigation";
import RegisterDetail from "../RegisterDetail/RegisterDetail";
export default function RegisterDetailPage() {
  const router = useRouter();
  return <RegisterDetail onComplete={(userType) => router.push(userType === "FARM" ? "/farmer-home" : "/home")} onBackToRegister={() => router.push("/register")} />;
}
