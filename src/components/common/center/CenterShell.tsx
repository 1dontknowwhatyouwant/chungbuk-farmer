"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { centerHomeLogo } from "../../../assets/assets";

type CenterShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  backHref?: string;
};

export default function CenterShell({ title, description, children, backHref = "/center-home" }: CenterShellProps) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#1f1f1f] sm:flex sm:justify-center sm:px-4 sm:py-8">
      <section
        className="min-h-screen w-full max-w-[402px] bg-[linear-gradient(180deg,#CDF2FB_0%,#EEF7EB_54%,#FFFFFF_96%)] text-[#475559] shadow-2xl sm:min-h-[955px]"
        style={{ fontFamily: "Pretendard, Inter, ui-sans-serif, system-ui, sans-serif" }}
      >
        <header className="px-[25px] pb-5 pt-[52px]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push(backHref)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/70 text-[25px] leading-none shadow-sm"
              aria-label="이전 화면"
            >
              ‹
            </button>
            <img src={centerHomeLogo.src} alt="도시농부+" className="h-[38px] w-[86px] object-contain" />
          </div>
          <h1 className="mt-7 text-[24px] font-semibold leading-[30px] text-[#3f4d51]">{title}</h1>
          {description ? <p className="mt-2 text-[13px] leading-5 text-[#67777b]">{description}</p> : null}
        </header>
        <div className="px-[25px] pb-12">{children}</div>
      </section>
    </main>
  );
}

