"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { farmProfileApi, type FarmProfilePayload } from "../../../services/api";

const initial: FarmProfilePayload = {
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
const fields: [keyof FarmProfilePayload, string][] = [
  ["farmName", "농가명"],
  ["representativeName", "농가주 이름"],
  ["contactNumber", "대표 연락처"],
  ["farmAddress", "농지 주소"],
];

export default function FarmerMypage() {
  const router = useRouter();
  const [profile, setProfile] = useState(initial);
  const [exists, setExists] = useState(false);
  const [crops, setCrops] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    void farmProfileApi
      .get()
      .then(({ data }) => {
        setProfile(data);
        setCrops(data.crops.join(", "));
        setExists(true);
      })
      .catch(() => undefined);
  }, []);
  const set = (key: keyof FarmProfilePayload, value: string | number) =>
    setProfile((p) => ({ ...p, [key]: value }));
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      ...profile,
      crops: crops
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
      farmAreaPyeong: Number(profile.farmAreaPyeong),
    };
    try {
      if (exists) await farmProfileApi.update(payload);
      else await farmProfileApi.create(payload);
      setExists(true);
      router.push("/farmer-home");
    } catch {
      setMessage("프로필 저장에 실패했습니다. 입력값을 확인해 주세요.");
    }
  };
  return (
    <main className="min-h-screen bg-[#f2fcff] sm:flex sm:justify-center sm:px-4 sm:py-8">
      <form
        onSubmit={submit}
        className="min-h-screen w-full max-w-[402px] bg-[#f2fcff] text-[#2f373a]"
      >
        <header className="relative flex h-[100px] items-end justify-center bg-[#e9ece1] pb-4 text-[18px]">
          <button
            type="button"
            onClick={() => {
              window.location.assign("/farmer-home");
            }}
            className="absolute bottom-4 left-6 border-0 bg-transparent text-2xl"
          >
            ‹
          </button>
          농가 프로필 등록
        </header>
        <p className="px-12 pt-4 text-[10px] text-[#6e6e6e]">
          입력한 정보는 공고 작성과 매칭에 사용됩니다. 정확하게 입력해 주세요.
        </p>
        <div className="space-y-4 px-[25px] pb-6 pt-5">
          <h2 className="text-[18px]">기본 정보</h2>
          {fields.map(([key, label]) => (
            <label key={key} className="block text-xs">
              {label}
              <input
                value={String(profile[key] ?? "")}
                onChange={(e) => set(key, e.target.value)}
                required={key !== "cityCounty"}
                className="mt-2 h-[34px] w-full rounded-xl border-0 bg-[#e0e6ef] px-3 outline-none"
              />
            </label>
          ))}
          <label className="block text-xs">
            시/군/구
            <select
              value={profile.cityCounty}
              onChange={(e) => set("cityCounty", e.target.value)}
              required
              className="mt-2 h-[34px] w-full rounded-xl border-0 bg-[#e0e6ef] px-3 outline-none"
            >
              <option value="" disabled>
                지역을 선택해 주세요
              </option>
              {cityCountyOptions.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <h2 className="pt-3 text-[18px]">농업 활동 정보</h2>
          <input
            value={crops}
            onChange={(e) => setCrops(e.target.value)}
            placeholder="주요 재배 작물 (쉼표로 구분)"
            required
            className="h-[34px] w-full rounded-xl border-0 bg-[#e0e6ef] px-3 text-sm outline-none"
          />
          <textarea
            value={profile.mainActivities}
            onChange={(e) => set("mainActivities", e.target.value)}
            required
            placeholder="주요 재배 작물과 활동 내용을 입력해주세요."
            className="h-36 w-full resize-none rounded-xl border-0 bg-[#e0e6ef] p-4 text-sm outline-none"
          />
          {message && <p className="text-center text-xs">{message}</p>}
          <button
            type="submit"
            className="mx-auto mt-4 block rounded-xl bg-[#d1f7af] px-12 py-4 text-2xl shadow-[0_4px_4px_#a8cb89]"
          >
            프로필 저장하기
          </button>
        </div>
      </form>
    </main>
  );
}
