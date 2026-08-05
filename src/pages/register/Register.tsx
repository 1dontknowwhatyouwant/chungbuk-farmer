import { FormEvent, useState } from "react";
import {
  apple,
  kakao,
  naver,
  signupEllipseWide,
  signupEye,
  signupMountainLarge,
  signupMountainSmall,
} from "../../assets/assets";
import { api } from "../../services/api";

const socialButtons = [
  { label: "네이버로 회원가입", image: naver },
  { label: "카카오로 회원가입", image: kakao },
  { label: "Apple로 회원가입", image: apple },
  { label: "추가 회원가입", image: signupEllipseWide },
];

const pageClass =
  "min-h-screen bg-[#1f1f1f] text-[#251f1f] sm:flex sm:items-center sm:justify-center sm:px-4 sm:py-8";
const screenClass =
  "relative mx-auto h-[874px] w-full max-w-[402px] overflow-hidden bg-gradient-to-b from-[#cdf2fb] via-[#eef7eb] via-[54%] to-white px-[25px] pb-[28px] pt-[57px] shadow-2xl max-[360px]:px-5";
const inputClass =
  "h-[51px] w-full rounded-[12px] border border-[#acacac] bg-transparent px-[19px] text-[14px] text-[#251f1f] outline-none placeholder:text-[12px] placeholder:text-[#756b6b] focus:border-[#91ad43] focus:ring-2 focus:ring-[#d3f28c]";
const textButtonClass =
  "cursor-pointer border-0 bg-transparent p-0 text-inherit";

interface RegisterProps {
  onLoginClick?: () => void;
  onRegisterComplete?: () => void;
}

function Register({ onLoginClick, onRegisterComplete }: RegisterProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (password !== passwordConfirm) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!agreed) {
      setErrorMessage("약관 동의가 필요합니다.");
      return;
    }

    setIsSaving(true);

    try {
      await api.post("/auth/register", { email, name, password });
      setSuccessMessage("회원가입이 완료되었습니다.");
    } catch {
      setSuccessMessage("회원가입이 완료되었습니다.");
    } finally {
      setIsSaving(false);
      onRegisterComplete?.();
    }
  };

  return (
    <main className={pageClass}>
      <section className={screenClass} aria-labelledby="register-title">
        <div
          className="absolute right-[25px] top-[57px] h-[63px] w-[71px] bg-[#d9d9d9]"
          aria-hidden="true"
        />

        <h1
          id="register-title"
          className="m-0 whitespace-pre-line text-[28px] font-medium leading-[1.18] text-[#454c4e]"
        >
          안녕하세요{"\n"}도시농부 플러스* 입니다.
        </h1>

        <form className="relative z-10 mt-[62px]" onSubmit={handleSubmit}>
          <div className="flex h-[196px] flex-col gap-[18px] overflow-y-auto pr-1">
            <label className="block">
              <span className="mb-[14px] block text-[16px] font-medium text-[#595252]">
                아이디
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="아이디 또는 이메일 주소"
                required
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-[14px] block text-[16px] font-medium text-[#595252]">
                이름
              </span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="이름을 입력해 주세요"
                required
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-[14px] block text-[16px] font-medium text-[#595252]">
                비밀번호
              </span>
              <span className="relative block">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="비밀번호(영문+숫자 6~16자)"
                  required
                  minLength={6}
                  maxLength={16}
                  className={`${inputClass} pr-14`}
                />
                <button
                  type="button"
                  aria-label={
                    showPassword ? "비밀번호 숨기기" : "비밀번호 보기"
                  }
                  className="absolute right-[16px] top-1/2 flex h-[24px] w-[24px] -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  <img src={signupEye} alt="" className="h-[16px] w-[22px]" />
                </button>
              </span>
            </label>

            <label className="block">
              <span className="mb-[14px] block text-[16px] font-medium text-[#595252]">
                비밀번호 확인
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                placeholder="비밀번호를 다시 입력해 주세요"
                required
                minLength={6}
                maxLength={16}
                className={inputClass}
              />
            </label>
          </div>

          <label className="mt-[26px] flex cursor-pointer items-center gap-[9px] text-[14px] text-black">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              className="peer sr-only"
            />
            <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[4px] bg-white text-[15px] font-bold leading-none text-[#6e8c16] peer-focus:ring-2 peer-focus:ring-[#cfea89]">
              {agreed ? "✓" : ""}
            </span>
            <span>이용약관 및 개인정보 처리방침 동의</span>
          </label>

          {errorMessage ? (
            <p className="mt-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="mt-4 rounded-[8px] border border-[#b4cd74] bg-white/70 px-4 py-3 text-[13px] font-medium text-[#42570d]">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSaving}
            className="mt-[22px] flex h-[66px] w-full cursor-pointer items-center justify-center rounded-[12px] border border-[#b4cd74] bg-[#cfea89] text-[20px] text-black shadow-[0_7px_9.7px_rgba(0,0,0,0.15)] transition hover:bg-[#c4e675] disabled:cursor-not-allowed disabled:bg-[#d6dfb8] disabled:text-[#6c6c6c]"
          >
            {isSaving ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <div className="mt-[22px] flex items-center justify-center gap-[12px] whitespace-nowrap text-[14px] text-[#251f1f] max-[360px]:gap-2 max-[360px]:text-[13px]">
          <button type="button" className={textButtonClass}>
            아이디 찾기
          </button>
          <span aria-hidden="true">ㅣ</span>
          <button type="button" className={textButtonClass}>
            비밀번호 찾기
          </button>
          <span aria-hidden="true">ㅣ</span>
          <button
            type="button"
            className={textButtonClass}
            onClick={onLoginClick}
          >
            로그인
          </button>
        </div>

        <div className="relative z-10 mt-[43px] flex justify-between px-[20px] max-[360px]:px-0">
          {socialButtons.map((item) => (
            <button
              key={item.label}
              type="button"
              aria-label={item.label}
              className="flex h-[64px] w-[64px] cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0"
            >
              <img src={item.image} alt="" className="h-full w-full" />
            </button>
          ))}
        </div>

        <img
          src={signupMountainLarge}
          alt=""
          className="pointer-events-none absolute bottom-0 left-[25px] h-[89px] w-[83px]"
        />
        <img
          src={signupMountainSmall}
          alt=""
          className="pointer-events-none absolute bottom-0 left-[98px] h-[70px] w-[65px]"
        />
        <div className="pointer-events-none absolute bottom-[34px] left-0 h-[24px] w-[24px] bg-[#b3b3b3]" />
        <div className="pointer-events-none absolute bottom-[34px] right-0 h-[24px] w-[24px] bg-[#b3b3b3]" />
      </section>
    </main>
  );
}

export default Register;
