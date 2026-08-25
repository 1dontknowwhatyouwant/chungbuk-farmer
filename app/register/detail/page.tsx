"use client";

import { useRouter } from "next/navigation";
import RegisterDetail from "../../../src/views/register/RegisterDetail";

export default function RegisterDetailPage() {
  const router = useRouter();

  return (
    <RegisterDetail
      onComplete={() => router.push("/home")}
      onBackToRegister={() => router.push("/register")}
    />
  );
}
