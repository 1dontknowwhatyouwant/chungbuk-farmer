"use client";

import { useState } from "react";
import Button from "../../components/common/button/Button";
import {
  completePendingRegisterUser,
  MockUserRole,
} from "../../services/mockAuth";

const pageClass =
  "min-h-screen bg-[#1f1f1f] text-[#251f1f] sm:flex sm:items-center sm:justify-center sm:px-4 sm:py-8";
const screenClass =
  "relative mx-auto h-[874px] w-full max-w-[402px] overflow-hidden bg-gradient-to-b from-[#d9e9ed] to-white to-[95%] px-[25px] pt-[57px] shadow-2xl";

const roleButtons: MockUserRole[] = ["농가", "교육이수자", "중개 센터"];
const roleButtonProps = {
  width: "138px",
  height: "138px",
  borderRadius: "33px",
  backgroundColor: "#cfea89",
  hoverColor: "#c4e675",
  hoverFontColor: "#000000",
  border: "1px solid #b7e04d",
  fontColor: "#000000",
  fontSize: "24px",
};

interface RegisterDetailProps {
  onComplete?: () => void;
  onBackToRegister?: () => void;
}

function RegisterDetail({ onComplete, onBackToRegister }: RegisterDetailProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleRoleClick = async (role: MockUserRole) => {
    setErrorMessage("");
    setIsSaving(true);

    try {
      await completePendingRegisterUser(role);
      onComplete?.();
    } catch {
      setErrorMessage("회원 정보를 저장하지 못했습니다. 처음부터 다시 시도해 주세요.");
      window.setTimeout(() => {
        onBackToRegister?.();
      }, 1200);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className={pageClass}>
      <section className={screenClass} aria-labelledby="register-detail-title">
        <div
          className="absolute right-[25px] top-[57px] h-[63px] w-[71px] bg-[#d9d9d9]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-0 top-[129px] h-[24px] w-[25px] bg-[#d9d9d9]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-0 top-[129px] h-[24px] w-[25px] bg-[#d9d9d9]"
          aria-hidden="true"
        />

        <h1
          id="register-detail-title"
          className="mt-[51px] whitespace-pre-line text-[28px] font-medium leading-[1.18] text-[#484f51]"
        >
          안녕하세요{"\n"}도시농부 플러스* 입니다.
        </h1>

        <p className="mt-[22px] w-[273px] text-[14px] leading-normal text-[#41b3e0]">
          교육이수자,농가,중개센터 중에 선택해주세요
          <br />
          <span className="font-medium text-[#269dcd]">
            교육 이수자 제외 인증이 필요합니다.
          </span>
        </p>
        <div className="mt-[2px] h-px w-[198px] bg-[#269dcd]" />

        <div className="mt-[45px] flex flex-col items-center gap-[41px]">
          {roleButtons.map((role) => (
            <Button
              key={role}
              type="button"
              disabled={isSaving}
              onClick={() => handleRoleClick(role)}
              {...roleButtonProps}
            >
              {role}
            </Button>
          ))}
        </div>

        {errorMessage ? (
          <p className="mt-6 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
            {errorMessage}
          </p>
        ) : null}
      </section>
    </main>
  );
}

export default RegisterDetail;
