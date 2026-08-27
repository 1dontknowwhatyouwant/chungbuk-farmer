"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { farmJobPostingApi, type JobPostingRequest } from "../../../services/api";

const workTypes = ["모내기", "수확", "제초", "방제", "선별 및 포장", "기타"] as const;

const initial: JobPostingRequest = {
  crop: "",
  workType: "수확",
  workDate: "",
  startTime: "",
  endTime: "",
  capacity: 1,
  meetingPlace: "",
  wageAmount: 0,
  wageUnit: "DAILY",
  supplies: "",
  precautions: "",
  title: "",
  description: "",
};

export default function JobPostingCreate() {
  const router = useRouter();
  const [postingId, setPostingId] = useState<string | null>(null);
  const [form, setForm] = useState<JobPostingRequest>(initial);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const editId = new URLSearchParams(window.location.search).get("edit");
    if (!editId) return;
    setPostingId(editId);
    void farmJobPostingApi
      .get(editId)
      .then(({ data }) => {
        setForm({
          crop: data.crop,
          workType: data.workType,
          workDate: data.workDate,
          startTime: data.startTime.slice(0, 5),
          endTime: data.endTime.slice(0, 5),
          capacity: data.capacity,
          meetingPlace: data.meetingPlace,
          wageAmount: data.wageAmount,
          wageUnit: data.wageUnit,
          supplies: data.supplies ?? "",
          precautions: data.precautions ?? "",
          title: data.title,
          description: data.description,
        });
      })
      .catch(() => setMessage("공고 정보를 불러오지 못했습니다."));
  }, []);

  const set = <K extends keyof JobPostingRequest>(key: K, value: JobPostingRequest[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    const payload: JobPostingRequest = {
      ...form,
      supplies: form.supplies || null,
      precautions: form.precautions || null,
    };
    try {
      const { data } = postingId
        ? await farmJobPostingApi.update(postingId, payload)
        : await farmJobPostingApi.create(payload, false);
      router.push(`/farmer-announcements/${data.id}/result`);
    } catch {
      setMessage("공고문 생성에 실패했습니다. 입력값을 확인해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1f1f1f] sm:flex sm:justify-center sm:px-4 sm:py-8">
      <form
        onSubmit={submit}
        className="relative mx-auto min-h-[1245px] w-full max-w-[402px] bg-[#f2fcff] text-[#2f373a]"
      >
        <div className="absolute left-0 top-0 h-[115px] w-full bg-[#e9ece1]" />
        <button
          type="button"
          onClick={() => router.push("/farmer-announcements")}
          className="absolute left-[26px] top-[75px] border-0 bg-transparent text-2xl text-[#2c3234]"
          aria-label="뒤로 가기"
        >
          ‹
        </button>
        <h1 className="absolute left-1/2 top-[78px] -translate-x-1/2 text-[18px] leading-[21px] text-[#1b1e20]">
          공고 작성
        </h1>
        <p className="absolute left-1/2 top-[124px] w-[217px] -translate-x-1/2 break-keep text-center text-[10px] leading-[12px] text-[#5c5c5c]">
          아래 정보 입력시 Ai가 자동으로 공고문을 만들어줍니다.
        </p>

        <label className="absolute left-[25px] top-[160px] text-[12px] text-[#2c3234]">작업 종류</label>
        <div className="absolute left-[25px] top-[184px] flex w-[347px] flex-wrap gap-[6px]">
          {workTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => set("workType", type)}
              className={`flex h-[24px] w-[79px] items-center justify-center whitespace-nowrap rounded-xl border border-[#ced6e1] text-[12px] text-black ${
                form.workType === type ? "bg-[#e0e6ef]" : "bg-[#fdfdfd]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <label className="absolute left-[25px] top-[249px] text-[12px] text-[#2c3234]">작물</label>
        <input
          value={form.crop}
          onChange={(e) => set("crop", e.target.value)}
          placeholder="예: 감자"
          required
          className="absolute left-[25px] top-[270px] h-[34px] w-[347px] rounded-xl border-0 bg-[#e4e9f1] px-3 outline-none"
        />

        <label className="absolute left-[25px] top-[315px] text-[12px] text-[#2c3234]">작업 날짜</label>
        <input
          type="date"
          value={form.workDate}
          onChange={(e) => set("workDate", e.target.value)}
          required
          className="absolute left-[25px] top-[336px] h-[34px] w-[347px] rounded-xl border-0 bg-[#e4e9f1] px-3 outline-none"
        />

        <label className="absolute left-[25px] top-[381px] text-[12px] text-[#2c3234]">작업 시작 · 종료 시간</label>
        <div className="absolute left-[25px] top-[402px] flex w-[347px] gap-[8px]">
          <input
            type="time"
            value={form.startTime}
            onChange={(e) => set("startTime", e.target.value)}
            required
            className="h-[34px] w-1/2 rounded-xl border-0 bg-[#e4e9f1] px-3 outline-none"
          />
          <input
            type="time"
            value={form.endTime}
            onChange={(e) => set("endTime", e.target.value)}
            required
            className="h-[34px] w-1/2 rounded-xl border-0 bg-[#e4e9f1] px-3 outline-none"
          />
        </div>

        <label className="absolute left-[25px] top-[447px] text-[12px] text-[#2c3234]">집결 장소</label>
        <input
          value={form.meetingPlace}
          onChange={(e) => set("meetingPlace", e.target.value)}
          required
          className="absolute left-[25px] top-[468px] h-[34px] w-[347px] rounded-xl border-0 bg-[#e4e9f1] px-3 outline-none"
        />

        <label className="absolute left-[25px] top-[513px] text-[12px] text-[#2c3234]">모집 인원 (명)</label>
        <input
          type="number"
          min={1}
          value={form.capacity}
          onChange={(e) => set("capacity", Number(e.target.value))}
          required
          className="absolute left-[25px] top-[534px] h-[34px] w-[347px] rounded-xl border-0 bg-[#e4e9f1] px-3 outline-none"
        />

        <label className="absolute left-[25px] top-[579px] text-[12px] text-[#2c3234]">임금</label>
        <div className="absolute left-[25px] top-[600px] flex w-[347px] gap-[8px]">
          <input
            type="number"
            min={1}
            value={form.wageAmount}
            onChange={(e) => set("wageAmount", Number(e.target.value))}
            placeholder="예: 100000"
            required
            className="h-[34px] flex-1 rounded-xl border-0 bg-[#e4e9f1] px-3 outline-none"
          />
          <select
            value={form.wageUnit}
            onChange={(e) => set("wageUnit", e.target.value as JobPostingRequest["wageUnit"])}
            className="h-[34px] w-[90px] rounded-xl border-0 bg-[#e4e9f1] px-3 outline-none"
          >
            <option value="DAILY">일급</option>
            <option value="HOURLY">시급</option>
          </select>
        </div>

        <label className="absolute left-[25px] top-[645px] text-[12px] text-[#2c3234]">준비물</label>
        <input
          value={form.supplies ?? ""}
          onChange={(e) => set("supplies", e.target.value)}
          className="absolute left-[25px] top-[666px] h-[34px] w-[347px] rounded-xl border-0 bg-[#e4e9f1] px-3 outline-none"
        />

        <label className="absolute left-[25px] top-[711px] text-[12px] text-[#2c3234]">공고 제목</label>
        <input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="예: 감자 수확 보조 작업자를 모집합니다"
          required
          className="absolute left-[25px] top-[732px] h-[34px] w-[347px] rounded-xl border-0 bg-[#e4e9f1] px-3 outline-none"
        />

        <label className="absolute left-[25px] top-[777px] text-[12px] text-[#2c3234]">공고 설명</label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="모집 내용을 자세히 적어주세요."
          required
          className="absolute left-[25px] top-[798px] h-[100px] w-[347px] resize-none rounded-xl border-0 bg-[#e4e9f1] p-4 text-[14px] outline-none"
        />

        <label className="absolute left-[25px] top-[913px] text-[12px] text-[#2c3234]">특이사항 또는 안내 사항</label>
        <textarea
          value={form.precautions ?? ""}
          onChange={(e) => set("precautions", e.target.value)}
          placeholder="특이사항 또는 안내 사항에 대해 적어주세요."
          className="absolute left-[25px] top-[934px] h-[144px] w-[347px] resize-none rounded-xl border border-[#c2c7c8] bg-transparent p-4 text-[14px] text-[#2f373a] outline-none placeholder:text-[#5c5c5c]"
        />

        <p className="absolute left-1/2 top-[1089px] w-[254px] -translate-x-1/2 break-keep text-center text-[10px] leading-[12px] text-[#5c5c5c]">
          농가 프로필에서 등록한 정보는 자동으로 정보가 업데이트 됩니다.
        </p>
        <p className="absolute left-1/2 top-[1122px] w-[253px] -translate-x-1/2 break-keep text-center text-[10px] leading-[12px] text-[#5c5c5c]">
          Ai가 생성한 공고문은 참고용이며, 중개 센터 검토 후 승인 됩니다.
        </p>

        {message && (
          <p className="absolute left-1/2 top-[1155px] w-[347px] -translate-x-1/2 text-center text-xs text-red-600">
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="absolute left-[68px] top-[1170px] flex h-[68px] w-[267px] items-center justify-center rounded-xl bg-[#d1f7af] text-2xl font-medium text-[#2c3234] shadow-[0_4px_4px_#a8cb89] disabled:opacity-70"
        >
          {postingId ? "공고 수정하기" : "공고문 생성"}
        </button>
      </form>
    </main>
  );
}
