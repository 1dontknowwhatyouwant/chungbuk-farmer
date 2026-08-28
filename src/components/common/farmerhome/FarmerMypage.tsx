"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { farmProfileApi, type FarmProfile, type FarmProfilePayload } from "../../../services/api";

const emptyForm: FarmProfilePayload = {
  farmName: "",
  representativeName: "",
  contactNumber: "",
  farmAddress: "",
  cityCounty: "CHUNGJU",
  crops: [],
  mainActivities: "",
  businessRegistrationNumber: "",
  farmAreaPyeong: 1,
};
const cityCountyOptions = [
  ["CHEONGJU", "청주시"],
  ["CHUNGJU", "충주시"],
  ["JECHEON", "제천시"],
  ["BOEUN", "보은군"],
  ["OKCHEON", "옥천군"],
  ["YEONGDONG", "영동군"],
  ["JEUNGPYEONG", "증평군"],
  ["JINCHEON", "진천군"],
  ["GOESAN", "괴산군"],
  ["EUMSEONG", "음성군"],
  ["DANYANG", "단양군"],
] as const;
const CONTACT_NUMBER_PATTERN = /^0\d{1,2}-?\d{3,4}-?\d{4}$/;
const statusBanner: Record<FarmProfile["status"], { tone: string; text: (profile: FarmProfile) => string }> = {
  DRAFT: { tone: "bg-[#eef1f4] text-[#475559]", text: () => "아직 저장 중인 초안입니다. 정보를 마저 입력해 주세요." },
  PENDING_REVIEW: { tone: "bg-[#fff6da] text-[#8a6d1a]", text: () => "소유 심사가 진행 중이라 지금은 수정할 수 없습니다." },
  APPROVED: {
    tone: "bg-[#e8f6e0] text-[#3f7d2c]",
    text: () => "승인된 농가입니다. 농가명·대표자명·주소·시/군·사업자번호·농지 면적을 바꾸면 재심사를 위해 임시저장 상태로 돌아갑니다.",
  },
  REJECTED: {
    tone: "bg-[#fdecec] text-[#b3261e]",
    text: (p) => `반려된 프로필입니다${p.rejectionReason ? `: ${p.rejectionReason}` : "."} 정보를 수정한 뒤 다시 저장해 주세요.`,
  },
  INACTIVE: { tone: "bg-[#fdecec] text-[#b3261e]", text: () => "비활성화된 계정입니다. 고객센터에 문의해 주세요." },
};

function resolveErrorMessage(error: unknown): string {
  const data = axios.isAxiosError<{ code?: string; message?: string }>(error) ? error.response?.data : undefined;
  switch (data?.code) {
    case "VALIDATION_ERROR":
      return data.message ? `입력값을 다시 확인해 주세요. (${data.message})` : "입력값을 다시 확인해 주세요.";
    case "INVALID_REQUEST":
      return "요청 형식이 올바르지 않습니다. 시/군 선택을 확인해 주세요.";
    case "FARM_PROFILE_ALREADY_EXISTS":
      return "이미 농가 프로필이 등록되어 있습니다.";
    case "FARM_PROFILE_UPDATE_NOT_ALLOWED":
      return "진행 중인 공고가 있어 핵심 정보를 지금은 수정할 수 없습니다.";
    case "FARM_ROLE_REQUIRED":
    case "ACCESS_DENIED":
      return "농가 계정만 프로필을 등록할 수 있습니다.";
    case "INACTIVE_ACCOUNT":
      return "비활성화된 계정입니다.";
    case "UNAUTHORIZED":
    case "INVALID_AUTHENTICATION":
      return "로그인이 만료됐습니다. 다시 로그인해 주세요.";
    default:
      return data?.message ?? "프로필 저장에 실패했습니다. 입력값을 확인해 주세요.";
  }
}

export default function FarmerMypage() {
  const router = useRouter();
  const [form, setForm] = useState<FarmProfilePayload>(emptyForm);
  const [existingProfile, setExistingProfile] = useState<FarmProfile | null>(null);
  const [cropsText, setCropsText] = useState("");
  const [farmAreaPyeongText, setFarmAreaPyeongText] = useState("1");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isFromRegistration, setIsFromRegistration] = useState(false);

  useEffect(() => {
    // read via window.location instead of useSearchParams to avoid a Suspense boundary requirement
    setIsFromRegistration(new URLSearchParams(window.location.search).get("from") === "register");
  }, []);
  useEffect(() => {
    void farmProfileApi
      .get()
      .then(({ data }) => {
        setExistingProfile(data);
        setForm({
          farmName: data.farmName,
          representativeName: data.representativeName,
          contactNumber: data.contactNumber,
          farmAddress: data.farmAddress,
          cityCounty: data.cityCounty,
          crops: data.crops,
          mainActivities: data.mainActivities,
          businessRegistrationNumber: data.businessRegistrationNumber ?? "",
          farmAreaPyeong: data.farmAreaPyeong,
        });
        setCropsText(data.crops.join(", "));
        setFarmAreaPyeongText(String(data.farmAreaPyeong));
      })
      .catch(() => undefined)
      .finally(() => setIsProfileLoading(false));
  }, []);

  const isLocked = existingProfile?.status === "PENDING_REVIEW" || existingProfile?.status === "INACTIVE";
  const set = (key: keyof FarmProfilePayload, value: string | number) =>
    setForm((p) => ({ ...p, [key]: value }));

  const validate = (): string | null => {
    if (!form.farmName.trim() || !form.representativeName.trim() || !form.farmAddress.trim() || !form.mainActivities.trim()) {
      return "공백만 입력된 필드가 없는지 확인해 주세요.";
    }
    if (!CONTACT_NUMBER_PATTERN.test(form.contactNumber.trim())) {
      return "연락처 형식을 확인해 주세요. 예: 010-1234-5678";
    }
    const cropList = cropsText.split(",").map((v) => v.trim()).filter(Boolean);
    if (cropList.length < 1 || cropList.length > 20) {
      return "재배 작물은 1개 이상 20개 이하로 입력해 주세요.";
    }
    if (cropList.some((crop) => crop.length > 50)) {
      return "작물명은 최대 50자까지 입력할 수 있습니다.";
    }
    const area = Number(farmAreaPyeongText);
    if (!Number.isFinite(area) || area < 1 || area > 100000000) {
      return "농지 면적은 1~100,000,000평 사이로 입력해 주세요.";
    }
    const businessRegistrationDigits = (form.businessRegistrationNumber ?? "").replace(/\D/g, "");
    if (businessRegistrationDigits.length > 0 && businessRegistrationDigits.length !== 10) {
      return "사업자등록번호는 숫자 10자리로 입력해 주세요.";
    }
    return null;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setMessage("");
    const validationError = validate();
    if (validationError) {
      setMessage(validationError);
      return;
    }
    const payload: FarmProfilePayload = {
      ...form,
      crops: cropsText.split(",").map((v) => v.trim()).filter(Boolean),
      farmAreaPyeong: Number(farmAreaPyeongText),
      businessRegistrationNumber: form.businessRegistrationNumber || undefined,
    };
    setIsSaving(true);
    try {
      const { data } = existingProfile
        ? await farmProfileApi.update(payload)
        : await farmProfileApi.create(payload);
      setExistingProfile(data);
      router.refresh();
      router.push("/farmer-home");
    } catch (error) {
      setMessage(resolveErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1f1f1f] sm:flex sm:justify-center sm:px-4 sm:py-8">
      <form
        onSubmit={submit}
        className="relative mx-auto min-h-screen w-full max-w-[402px] bg-[#f2fcff] text-[#2f373a]"
      >
        <header className="relative flex h-[72px] items-center justify-center bg-[#e9ece1] px-[50px]">
          <button
            type="button"
            onClick={() => {
              router.refresh();
              router.push("/farmer-home");
            }}
            className="absolute left-[25px] border-0 bg-transparent text-2xl text-[#1b1e20]"
          >
            ‹
          </button>
          <h1 className="text-[18px] leading-[21px] text-[#1b1e20]">농가 프로필 등록</h1>
          {isFromRegistration && (
            <button
              type="button"
              onClick={() => router.push("/home")}
              className="absolute right-[16px] whitespace-nowrap border-0 bg-transparent text-[11px] text-[#2c3234] underline"
            >
              교육 이수자로 전환
            </button>
          )}
        </header>
        <p className="break-keep px-[29px] pt-[16px] text-[10px] leading-[12px] text-[#6e6e6e]">
          입력한 정보는 공고 작성과 매칭에 사용됩니다. 정확하게 입력해 주세요.
        </p>

        {existingProfile && (
          <p className={`mx-[25px] mt-[14px] break-keep rounded-xl px-4 py-3 text-xs ${statusBanner[existingProfile.status].tone}`}>
            {statusBanner[existingProfile.status].text(existingProfile)}
          </p>
        )}
        {isProfileLoading && (
          <p className="mx-[25px] mt-[14px] break-keep rounded-xl bg-[#eef1f4] px-4 py-3 text-xs text-[#475559]">
            기존 등록된 정보를 불러오는 중입니다...
          </p>
        )}

        <fieldset disabled={isLocked || isProfileLoading} className="space-y-5 px-[25px] py-[20px] disabled:opacity-60">
          <div>
            <h2 className="text-[18px] text-[#2c3234]">기본 정보</h2>
            <div className="mt-3 space-y-3">
              <label className="block text-xs text-[#2f373a]">
                농가명
                <input
                  value={form.farmName}
                  onChange={(e) => set("farmName", e.target.value)}
                  maxLength={100}
                  required
                  className="mt-2 h-[34px] w-full rounded-xl border-0 bg-[#e4e9f1] px-3 outline-none"
                />
              </label>
              <label className="block text-xs text-[#2f373a]">
                농가주 이름
                <input
                  value={form.representativeName}
                  onChange={(e) => set("representativeName", e.target.value)}
                  maxLength={50}
                  required
                  className="mt-2 h-[34px] w-full rounded-xl border-0 bg-[#e4e9f1] px-3 outline-none"
                />
              </label>
              <label className="block text-xs text-[#2f373a]">
                사업자등록번호 (선택)
                <input
                  value={form.businessRegistrationNumber ?? ""}
                  onChange={(e) => set("businessRegistrationNumber", e.target.value)}
                  placeholder="숫자 10자리"
                  className="mt-2 h-[34px] w-full rounded-xl border-0 bg-[#e4e9f1] px-3 outline-none"
                />
              </label>
            </div>
          </div>

          <div>
            <h2 className="text-[18px] text-[#2c3234]">연락처</h2>
            <label className="mt-3 block text-xs text-[#2f373a]">
              대표 연락처
              <input
                value={form.contactNumber}
                onChange={(e) => set("contactNumber", e.target.value)}
                placeholder="010-1234-5678"
                required
                className="mt-2 h-[34px] w-full rounded-xl border-0 bg-[#e4e9f1] px-3 outline-none"
              />
            </label>
            <p className="mt-2 break-keep text-[10px] leading-[12px] text-[#5c5c5c]">
              연락처는 공고 담당자 확인 및 매칭에 사용됩니다.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] text-[#2c3234]">농지 정보</h2>
            <div className="mt-3 space-y-3">
              <label className="block text-xs text-[#2f373a]">
                시/군/구
                <select
                  value={form.cityCounty}
                  onChange={(e) => set("cityCounty", e.target.value)}
                  required
                  className="mt-2 h-[34px] w-full rounded-xl border-0 bg-[#e4e9f1] px-3 outline-none"
                >
                  {cityCountyOptions.map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-[#2f373a]">
                상세 주소
                <input
                  value={form.farmAddress}
                  onChange={(e) => set("farmAddress", e.target.value)}
                  maxLength={255}
                  required
                  className="mt-2 h-[34px] w-full rounded-xl border-0 bg-[#e4e9f1] px-3 outline-none"
                />
              </label>
              <label className="block text-xs text-[#2f373a]">
                농지 면적 (평)
                <input
                  type="number"
                  min={1}
                  max={100000000}
                  value={farmAreaPyeongText}
                  onChange={(e) => setFarmAreaPyeongText(e.target.value)}
                  required
                  className="mt-2 h-[34px] w-full rounded-xl border-0 bg-[#e4e9f1] px-3 outline-none"
                />
              </label>
            </div>
            <p className="mt-2 break-keep text-[10px] leading-[12px] text-[#5c5c5c]">
              주소는 집결장소 안내에 활용됩니다.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] text-[#2c3234]">농업 활동 정보</h2>
            <div className="mt-3 space-y-3">
              <label className="block text-xs text-[#475559]">
                주요 재배 작물
                <input
                  value={cropsText}
                  onChange={(e) => setCropsText(e.target.value)}
                  placeholder="예: 토마토, 감자"
                  required
                  className="mt-2 h-[34px] w-full rounded-xl border-0 bg-[#e4e9f1] px-3 text-sm outline-none"
                />
              </label>
              <textarea
                value={form.mainActivities}
                onChange={(e) => set("mainActivities", e.target.value)}
                required
                maxLength={2000}
                placeholder="주요 재배 작물과 활동 내용을 입력해주세요."
                className="h-36 w-full resize-none rounded-xl border-0 bg-[#e4e9f1] p-4 text-sm outline-none"
              />
            </div>
          </div>

          <p className="break-keep text-center text-[10px] leading-[12px] text-[#5c5c5c]">
            저장된 프로필은 공고 작성시 자동으로 입력 됩니다.
          </p>
          {message && <p className="text-center text-xs text-red-600">{message}</p>}
          <button
            type="submit"
            disabled={isSaving}
            className="mx-auto block h-[68px] w-[267px] rounded-xl bg-[#d1f7af] text-2xl shadow-[0_4px_4px_#a8cb89] disabled:opacity-70"
          >
            {isSaving ? "저장 중..." : "프로필 저장하기"}
          </button>
        </fieldset>
      </form>
    </main>
  );
}
