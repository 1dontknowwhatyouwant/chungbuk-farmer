import type { AdminJobPosting } from "../../services/api";

export type PostingStatus = "pending" | "approved" | "rejected" | "edited" | "other";
export const statusOptions = [
  { value: "ALL", label: "전체" },
  { value: "pending", label: "승인대기" },
  { value: "approved", label: "승인완료" },
  { value: "rejected", label: "거절" },
  { value: "edited", label: "직접수정" },
] as const;
export const workOptions = ["전체", "수확", "파종", "제초", "기타"].map((label) => ({ value: label, label }));

const statusMap: Record<string, PostingStatus> = {
  PENDING_REVIEW: "pending", PENDING_APPROVAL: "pending", REVIEW_REQUESTED: "pending",
  APPROVED: "approved", PUBLISHED: "approved", REJECTED: "rejected", EDITED: "edited",
  승인대기: "pending", 대기: "pending", 검토대기: "pending", 승인: "approved", 승인완료: "approved",
  거절: "rejected", 반려: "rejected", 직접수정: "edited",
};

export function postingStatus(posting: AdminJobPosting): PostingStatus {
  // Unknown backend statuses stay read-only instead of being treated as pending.
  const rawStatus = posting.status.trim().toUpperCase();
  if (["DRAFT", "CLOSED", "CANCELLED", "ARCHIVED"].includes(rawStatus)) return "other";
  return statusMap[rawStatus] ?? statusMap[posting.displayStatus.replace(/\s/g, "").toUpperCase()] ?? "other";
}

export function postingStatusLabel(posting: AdminJobPosting) {
  return { pending: "대기", approved: "승인", rejected: "반려", edited: "직접수정", other: posting.displayStatus || posting.status }[postingStatus(posting)];
}

export function workCategory(value: string) {
  const normalized = value.trim().toUpperCase();
  if (normalized === "HARVEST" || normalized.includes("수확")) return "수확";
  if (normalized === "SOWING" || normalized.includes("파종")) return "파종";
  if (normalized === "WEEDING" || normalized.includes("제초")) return "제초";
  return "기타";
}

export function formatWorkDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00+09:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short", timeZone: "Asia/Seoul" }).format(date);
}
