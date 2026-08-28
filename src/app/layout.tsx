import type { Metadata } from "next";
import "./globals.css";
import logo from "../assets/images/login/chungbuk-farmer-logo.svg";
import AuthBoundary from "../components/auth/AuthBoundary";

export const metadata: Metadata = {
  title: "도시농부+",
  description: "도시농부플러스 서비스",
  icons: {
    icon: logo.src,
    shortcut: logo.src,
    apple: logo.src,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body><AuthBoundary>{children}</AuthBoundary></body>
    </html>
  );
}
