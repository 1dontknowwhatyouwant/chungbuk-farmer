"use client";
import { useRouter } from "next/navigation";
import Register from "../Register/Register";
export default function RegisterPage() { const router = useRouter(); return <Register onLoginClick={() => router.push("/login")} onRegisterComplete={() => router.push("/register/detail")} />; }
