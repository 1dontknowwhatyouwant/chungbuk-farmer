"use client";

import { usePathname } from "next/navigation";
import RouteGuard from "./RouteGuard";
import type { ReactNode } from "react";
import type { UserType } from "../../services/api";

const publicPaths = new Set(["/", "/login", "/register", "/register/detail"]);
const centerPaths = ["/center-home", "/center-applications", "/center-postings", "/center-matching", "/center-data", "/center-statistics"];
const farmerPaths = ["/farmer-home", "/farmer-mypage", "/farmer-announcements"];

const startsWithRoute = (path: string, routes: string[]) => routes.some((route) => path === route || path.startsWith(`${route}/`));

export default function AuthBoundary({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (publicPaths.has(pathname)) return children;

  let allowedRoles: UserType[] | undefined;
  if (startsWithRoute(pathname, centerPaths)) allowedRoles = ["CENTER_ADMIN"];
  else if (startsWithRoute(pathname, farmerPaths)) allowedRoles = ["FARM"];
  else allowedRoles = ["URBAN_FARMER"];

  return <RouteGuard allowedRoles={allowedRoles}>{children}</RouteGuard>;
}
