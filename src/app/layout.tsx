import type { Metadata } from "next";
import "./globals.css";
import logo from "../assets/images/login/chungbuk-farmer-logo.svg";

export const metadata: Metadata = {
  title: "도시농부+",
  description: "도시농부플러스 서비스",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
