"use client";
import { useRouter } from "next/navigation";
import Home from "../Home/Home";
export default function HomePage() {
  const router = useRouter();
  return (
    <Home
      onGoToMypage={() => router.push("/mypage")}
      onGoToAnnouncement={() => router.push("/announcement")}
    />
  );
}
