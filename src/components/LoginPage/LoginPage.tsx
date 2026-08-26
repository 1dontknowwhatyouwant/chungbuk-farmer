"use client";
import { useRouter } from "next/navigation";
import Login from "../Login/Login";
export default function LoginPage() { const router = useRouter(); return <Login onSignupClick={() => router.push("/register")} onLoginSuccess={() => router.push("/home")} />; }
