"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import submitCheckPin from "../../assets/images/work-condition/pin.svg";

const fieldClass = "mt-2 h-[31px] rounded-[12px] bg-[#f1f3f6] px-3 text-[14px] text-[#5c5c5c] shadow-[0_3px_3.8px_rgba(0,0,0,0.14)] outline-none";
const weekDays = ["월", "화", "수", "목", "금", "토", "일"];
const workRegions = [
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
const WORK_CONDITION_STORAGE_KEY = "chungbuk-farmer-work-condition";
type SavedWorkCondition = { region?: string; days?: string[]; startDate?: string; endDate?: string; experience?: string; vehicle?: boolean; notes?: string };

export default function WorkConditionPage() {
  const router = useRouter();
  const [vehicle, setVehicle] = useState(true);
  const [selectedDays, setSelectedDays] = useState<string[]>(["월"]);
  const [isDayPickerOpen, setIsDayPickerOpen] = useState(false);
  const [isExperiencePickerOpen, setIsExperiencePickerOpen] = useState(false);
  const [region, setRegion] = useState("CHEONGJU");
  const [startDate, setStartDate] = useState("2026-08-27");
  const [endDate, setEndDate] = useState("2026-12-31");
  const [experience, setExperience] = useState("NONE");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(WORK_CONDITION_STORAGE_KEY) ?? "null") as SavedWorkCondition | null;
      if (saved) {
        if (saved.region) setRegion(saved.region);
        if (saved.days) setSelectedDays(saved.days);
        if (saved.startDate) setStartDate(saved.startDate);
        if (saved.endDate) setEndDate(saved.endDate);
        if (saved.experience) setExperience(saved.experience);
        if (typeof saved.vehicle === "boolean") setVehicle(saved.vehicle);
        if (saved.notes) setNotes(saved.notes);
      }
    } catch { /* ignore malformed local data */ }
  }, []);

  const toggleDay = (day: string) => {
    setSelectedDays((days) =>
      days.includes(day) ? days.filter((selected) => selected !== day) : [...days, day],
    );
  };
  const orderedSelectedDays = weekDays.filter((day) => selectedDays.includes(day));
  const experienceOptions = [
    ["NONE", "없음"],
    ["1_TO_3", "1~3"],
    ["4_TO_10", "4~10"],
    ["11_OR_MORE", "11 이상"],
  ] as const;
  const selectedExperience = experienceOptions.find(([value]) => value === experience)?.[1] ?? "없음";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    localStorage.setItem(WORK_CONDITION_STORAGE_KEY, JSON.stringify({
      appliedAt: new Date().toISOString().slice(0, 10).replace(/-/g, "."),
      region: formData.get("region"),
      regionName: workRegions.find(([value]) => value === formData.get("region"))?.[1] ?? "",
      days: orderedSelectedDays,
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      experience: formData.get("experience"),
      vehicle,
      notes: formData.get("notes"),
    }));
    window.alert("신청서가 제출되었습니다.");
    router.push("/home");
  };

  return (
    <main className="min-h-screen bg-[#1f1f1f] sm:flex sm:justify-center sm:px-4 sm:py-8">
      <section className="min-h-screen w-full max-w-[402px] overflow-hidden bg-[linear-gradient(180deg,#f2fcff_0%,#fff_100%)] text-[#5c5c5c]" style={{ fontFamily: "Pretendard, Inter, sans-serif" }}>
        <header className="relative h-[115px] bg-[#e9ece1] pt-[75px]">
          <button type="button" onClick={() => router.back()} aria-label="뒤로가기" className="absolute left-5 top-[73px] text-[28px] leading-none text-[#1b1e20]">‹</button>
          <h1 className="text-center text-[18px] font-normal text-[#1b1e20]">희망 근무 조건 신청</h1>
        </header>
        <form onSubmit={submit} className="px-[20px] pb-8 pt-[17px]">
          <p className="text-center text-[10px]">신청 후 중개센터 검토까지 1~2일 소요 될 수 있습니다.</p>
          <div className="mt-[17px] rounded-[12px] border border-[#ced6e3] bg-[#f5f5f5] px-3 py-4">
            <div className="text-[18px]">현재 신청 상태</div>
            <div className="mt-2 text-[14px]">승인 대기</div>
          </div>

          <label className="mt-5 block text-[14px]">희망 근무 지역<select name="region" value={region} onChange={(event) => setRegion(event.target.value)} className={`block w-full ${fieldClass}`}><option value="" disabled>지역을 선택해주세요</option>{workRegions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <div className="mt-5 grid grid-cols-[96px_96px] gap-[56px] text-[14px]">
            <label className="whitespace-nowrap">
            희망 요일
            <div className="relative mt-2">
              <button type="button" onClick={() => { setIsDayPickerOpen(!isDayPickerOpen); setIsExperiencePickerOpen(false); }} aria-expanded={isDayPickerOpen} className="flex h-[31px] w-full items-center justify-between rounded-[12px] bg-[#f1f3f6] px-3 text-left text-[14px] text-[#5c5c5c] shadow-[0_3px_3.8px_rgba(0,0,0,0.14)]">
                <span>{orderedSelectedDays.length ? orderedSelectedDays.join(", ") : "요일을 선택해주세요"}</span>
                <span className="mb-1 h-1.5 w-1.5 rotate-45 border-b border-r border-[#777]" />
              </button>
              {isDayPickerOpen && (
                <div className="absolute left-0 top-[36px] z-20 max-h-[180px] w-full overflow-y-auto rounded-[12px] bg-[#fff] p-1.5 shadow-[0_4px_10px_rgba(0,0,0,0.18)] [scrollbar-color:#cfcfcf_transparent]">
                  {weekDays.map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button key={day} type="button" onClick={() => toggleDay(day)} aria-pressed={isSelected} className={`mb-1 block h-[30px] w-full rounded-[7px] text-[14px] last:mb-0 ${isSelected ? "bg-[#e5edf8] text-[#5c5c5c]" : "bg-[#f1f4f9] text-[#5c5c5c]"}`}>
                        {day}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            </label>
            <label className="whitespace-nowrap">
              농업 작업 경험 횟수
              <div className="relative mt-2">
                <input type="hidden" name="experience" value={experience} />
                <button type="button" onClick={() => { setIsExperiencePickerOpen(!isExperiencePickerOpen); setIsDayPickerOpen(false); }} aria-expanded={isExperiencePickerOpen} className="flex h-[31px] w-full items-center justify-between rounded-[12px] bg-[#f1f3f6] px-3 text-left text-[14px] text-[#5c5c5c] shadow-[0_3px_3.8px_rgba(0,0,0,0.14)]">
                  <span>{selectedExperience}</span><span className="mb-1 h-1.5 w-1.5 rotate-45 border-b border-r border-[#777]" />
                </button>
                {isExperiencePickerOpen && <div className="absolute left-0 top-[36px] z-20 w-full rounded-[12px] bg-white p-1.5 shadow-[0_4px_10px_rgba(0,0,0,0.18)]">
                  {experienceOptions.map(([value, label]) => <button key={value} type="button" onClick={() => { setExperience(value); setIsExperiencePickerOpen(false); }} className={`mb-1 block h-[30px] w-full rounded-[7px] text-[14px] last:mb-0 ${experience === value ? "bg-[#e5edf8]" : "bg-[#f1f4f9]"}`}>{label}</button>)}
                </div>}
              </div>
            </label>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3"><label className="text-[14px]">희망 시작일<input name="startDate" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className={`block w-full ${fieldClass}`} /></label><label className="text-[14px]">희망 종료일<input name="endDate" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className={`block w-full ${fieldClass}`} /></label></div>
          <div className="mt-5 flex items-center justify-between text-[14px]">이동 수단 여부<button type="button" onClick={() => setVehicle(!vehicle)} aria-pressed={vehicle} className={`relative h-[23px] w-[46px] rounded-[14px] ${vehicle ? "bg-[#5e5c59]" : "bg-[#c8cdcf]"}`}><span className={`absolute top-[1px] size-5 rounded-full bg-white shadow transition-all ${vehicle ? "right-1" : "left-1"}`} /></button></div>
          <label className="mt-5 block text-[12px]">특이사항 또는 안내 사항<textarea name="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="특이사항 또는 안내 사항에 대해 적어주세요." className="mt-2 h-[144px] w-full resize-none rounded-[12px] border border-[#c2c7c8] bg-transparent p-3 text-[14px] outline-none" /></label>
          <div className="mt-14 rounded-[8px] bg-[#f4f6f8] px-4 py-3 text-center"><p className="flex items-center justify-center gap-2 text-[14px]"><img src={submitCheckPin.src} alt="" aria-hidden="true" className="h-[15px] w-[14px]" />제출 전 확인해주세요</p><p className="mt-2 text-[12px]">승인 처리 이후에는 내용 변경이 제한 됩니다.<br />정확한 정보를 입력해주시길 바랍니다.</p></div>
          <button type="submit" className="mt-7 h-[68px] w-full rounded-[12px] bg-[#d1f7af] text-[24px] text-[#2c3234] shadow-[0_4px_4px_#a8cb89]">신청서 제출</button>
        </form>
      </section>
    </main>
  );
}
