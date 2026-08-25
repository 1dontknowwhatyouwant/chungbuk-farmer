import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "충북 농부",
  description: "충북 농부 서비스",
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
