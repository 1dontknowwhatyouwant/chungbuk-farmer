"use client";

import { useRouter } from "next/navigation";
import Register from "../../src/views/register/Register";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <Register
      onLoginClick={() => router.push("/login")}
      onRegisterComplete={() => router.push("/register/detail")}
    />
  );
}
