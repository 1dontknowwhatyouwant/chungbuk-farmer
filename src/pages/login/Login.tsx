import { FormEvent, useEffect, useState } from "react";
import {
  apple,
  kakao,
  chungbukFarmerLogo,
  naver,
  signupEllipseWide,
  signupEye,
  signupMountainLarge,
  signupMountainSmall,
} from "../../assets/assets";
import Button from "../../components/common/button/Button";
import { loginWithMockUser } from "../../services/mockAuth";
import { useAuthStore } from "../../stores/useAuthStore";

const socialLogins = [
  { label: "네이버 로그인", image: naver },
  { label: "카카오 로그인", image: kakao },
  { label: "Apple 로그인", image: apple },
  { label: "추가 로그인", image: signupEllipseWide },
];

const pageClass =
  "min-h-screen bg-[#1f1f1f] text-[#251f1f] sm:flex sm:items-center sm:justify-center sm:px-4 sm:py-8";
const screenClass =
  "relative mx-auto flex min-h-[100svh] w-full max-w-[402px] flex-col overflow-hidden bg-gradient-to-b from-[#cdf2fb] via-[#eef7eb] via-[54%] to-white px-[25px] pb-[28px] pt-[57px] shadow-2xl max-[360px]:px-5";
const inputClass =
  "h-[51px] w-full rounded-[12px] border border-[#acacac] bg-transparent px-[19px] text-[14px] text-[#251f1f] outline-none placeholder:text-[12px] placeholder:text-[#756b6b] focus:border-[#91ad43] focus:ring-2 focus:ring-[#d3f28c]";
const textButtonClass =
  "cursor-pointer border-0 bg-transparent p-0 text-inherit";
const introFadeMs = 1400;
const primaryButtonProps = {
  width: "100%",
  height: "66px",
  borderRadius: "12px",
  backgroundColor: "#cfea89",
  hoverColor: "#c4e675",
  hoverFontColor: "#000000",
  border: "1px solid #b4cd74",
  fontColor: "#000000",
  fontSize: "20px",
  margin: "22px 0 0",
  style: {
    boxShadow: "0 7px 9.7px rgba(0, 0, 0, 0.15)",
  },
};

interface LoginProps {
  onSignupClick?: () => void;
  onLoginSuccess?: () => void;
}

function Login({
  onSignupClick,
  onLoginSuccess,
}: LoginProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const [introActive, setIntroActive] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setIntroActive(true);
    });

    const logoTimer = window.setTimeout(() => {
      setShowLogo(true);
    }, introFadeMs);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(logoTimer);
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSaving(true);

    try {
      const registeredUser = await loginWithMockUser(email, password);

      setUser({
        email: registeredUser.email,
        name: registeredUser.name,
      });
      onLoginSuccess?.();
    } catch {
      setErrorMessage("가입한 아이디와 비밀번호를 확인해 주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className={pageClass}>
      <section className={screenClass} aria-labelledby="login-title">
        <img
          src={chungbukFarmerLogo}
          alt="충북 농부 로고"
          className={`pointer-events-none absolute right-[25px] top-[46px] h-[41px] w-[92px] transition-opacity duration-300 ${
            showLogo ? "opacity-100" : "opacity-0"
          }`}
        />

        <h1
          id="login-title"
          className={`mt-[52px] w-[286px] whitespace-pre-line text-[28px] font-medium leading-[1.08] tracking-[-0.01em] text-[#454c4e] transition-opacity duration-[1250ms] ease-out ${
            introActive ? "opacity-100" : "opacity-25"
          }`}
        >
          안녕하세요{"\n"}도시농부 플러스* 입니다.
        </h1>

        <form className="relative z-10 mt-[62px]" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-[18px]">
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
          </div>

          <label className="mt-[26px] flex cursor-pointer items-center gap-[9px] text-[14px] text-black">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="peer sr-only"
            />
            <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[4px] bg-white text-[15px] font-bold leading-none text-[#6e8c16] peer-focus:ring-2 peer-focus:ring-[#cfea89]">
              {rememberMe ? "✓" : ""}
            </span>
            <span>자동 로그인</span>
          </label>

          {errorMessage ? (
            <p className="mt-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <Button type="submit" disabled={isSaving} {...primaryButtonProps}>
            {isSaving ? "로그인 중..." : "로그인"}
          </Button>
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
            onClick={onSignupClick}
          >
            회원가입
          </button>
        </div>

        <div className="relative z-10 mt-[43px] flex justify-between px-[20px] max-[360px]:px-0">
          {socialLogins.map((item) => (
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

export default Login;
