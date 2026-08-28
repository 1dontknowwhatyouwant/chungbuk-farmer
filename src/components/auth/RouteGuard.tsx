"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ACCESS_TOKEN_KEY, authApi, type UserType } from "../../services/api";
import { useAuthStore } from "../../stores/useAuthStore";

type RouteGuardProps = { children: ReactNode; allowedRoles?: UserType[] };

export default function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const setUser = useAuthStore((state) => state.setUser);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = window.localStorage.getItem(ACCESS_TOKEN_KEY) ?? window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    void authApi.me().then(({ data }) => {
      if (cancelled) return;
      setUser(data);
      if (allowedRoles && !allowedRoles.includes(data.userType)) {
        router.replace(data.userType === "CENTER_ADMIN" ? "/center-home" : data.userType === "FARM" ? "/farmer-home" : "/home");
        return;
      }
      setChecking(false);
    }).catch(() => {
      if (!cancelled) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    });
    return () => { cancelled = true; };
  }, [allowedRoles, pathname, router, setUser]);

  if (checking) return <main className="flex min-h-screen items-center justify-center text-sm text-gray-500">확인 중입니다...</main>;
  return children;
}
