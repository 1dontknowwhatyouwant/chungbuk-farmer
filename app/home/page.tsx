"use client";

import { useRouter } from "next/navigation";
import Home from "../../src/views/home/Home";

export default function HomePage() {
  const router = useRouter();

  return <Home onGoToMypage={() => router.push("/mypage")} />;
}
