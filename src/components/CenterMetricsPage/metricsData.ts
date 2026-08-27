import type { WorkAssignment } from "../../services/api";

export const REGIONS = ["청주시", "충주시", "제천시", "보은군", "옥천군", "영동군", "증평군", "진천군", "괴산군", "음성군", "단양군"];
export const FILTER_REGIONS = ["충주시", "서산시", "인천시", "부산시", "제천시"];
export type MetricPeriod = "ALL" | "MONTH" | "LAST_MONTH" | "THREE_MONTHS_AGO" | "SIX_MONTHS_AGO" | "YEAR" | "LAST_YEAR";
export const PERIOD_OPTIONS: { value: MetricPeriod; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "MONTH", label: "이번달" },
  { value: "LAST_MONTH", label: "지난달" },
  { value: "THREE_MONTHS_AGO", label: "3개월 전" },
  { value: "SIX_MONTHS_AGO", label: "6개월 전" },
];
const MONTH_OFFSETS: Partial<Record<MetricPeriod, number>> = { MONTH: 0, LAST_MONTH: 1, THREE_MONTHS_AGO: 3, SIX_MONTHS_AGO: 6 };

export function selectedMonth(period: MetricPeriod, today: string, extraOffset = 0): string | null {
  const offset = MONTH_OFFSETS[period];
  if (offset === undefined || !/^\d{4}-\d{2}-\d{2}$/.test(today)) return null;
  const month = Number(today.slice(5, 7));
  if (month < 1 || month > 12) return null;
  const index = Number(today.slice(0, 4)) * 12 + month - 1 - offset - extraOffset;
  return `${Math.floor(index / 12)}-${String(index % 12 + 1).padStart(2, "0")}`;
}

function addressMatchesRegion(address: string | undefined, region: string) {
  if (region !== "인천시" && region !== "부산시") return address?.includes(region) ?? false;
  const names = region === "인천시" ? ["인천시", "인천광역시", "인천"] : region === "부산시" ? ["부산시", "부산광역시", "부산"] : [region];
  return address?.split(/\s+/).some(part => names.includes(part)) ?? false;
}
export type MetricFilters = { period: MetricPeriod; region: string };
export type MetricSeries = { successRate: number | null; matches: number | null; newFarmers: number | null; monthlySupply: (number | null)[]; successRange: (number | null)[]; regionCounts: Record<string, number | null>; regionChanges: Record<string, number | null> };

export function koreaToday() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function inPeriod(date: string, period: MetricPeriod, today: string) {
  if (period === "ALL") return true;
  if (!/^\d{4}-\d{2}-\d{2}/.test(date)) return false;
  if (MONTH_OFFSETS[period] !== undefined) return date.slice(0, 7) === selectedMonth(period, today);
  return Number(date.slice(0, 4)) === Number(today.slice(0, 4)) - (period === "LAST_YEAR" ? 1 : 0);
}

export function unavailableMetrics(): MetricSeries {
  return { successRate: null, matches: null, newFarmers: null, monthlySupply: Array(12).fill(null), successRange: Array(3).fill(null), regionCounts: Object.fromEntries(REGIONS.map(name => [name, null])), regionChanges: Object.fromEntries(REGIONS.map(name => [name, null])) };
}

export function assignmentMetrics(assignments: WorkAssignment[], filters: MetricFilters, today: string) {
  const unique = [...new Map(assignments.map(item => [item.id, item])).values()];
  const eligible = unique.filter(item => ["SCHEDULED", "IN_PROGRESS", "COMPLETED"].includes(item.status));
  const included = eligible.filter(item => inPeriod(item.workDate, filters.period, today));
  const counts = Object.fromEntries(REGIONS.map(name => [name, 0]));
  let unknownRegions = 0;
  for (const item of included) {
    const region = REGIONS.find(name => item.farmAddress?.includes(name));
    if (region) counts[region] += 1;
    else unknownRegions += 1;
  }
  const changes: Record<string, number | null> = Object.fromEntries(REGIONS.map(name => [name, null]));
  // Only compare monthly counts with the preceding month; yearly/all-time totals are not comparable.
  const previousMonth = selectedMonth(filters.period, today, 1);
  if (previousMonth) {
    const previousCounts = Object.fromEntries(REGIONS.map(name => [name, 0]));
    for (const item of eligible) {
      const name = REGIONS.find(region => item.farmAddress?.includes(region));
      if (name && item.workDate.slice(0, 7) === previousMonth) previousCounts[name] += 1;
    }
    for (const name of REGIONS) changes[name] = counts[name] - previousCounts[name];
  }
  return {
    ...unavailableMetrics(),
    matches: filters.region === "전체" ? included.length : included.filter(item => addressMatchesRegion(item.farmAddress, filters.region)).length,
    regionCounts: counts,
    regionChanges: changes,
    unknownRegions,
  };
}

// Explicit preview fixtures only. Never substitute these for a failed API response.
export function exampleMetrics(filters: MetricFilters): MetricSeries {
  const regionIndex = [...new Set([...REGIONS, ...FILTER_REGIONS])].indexOf(filters.region);
  const monthOffset = MONTH_OFFSETS[filters.period];
  const periodFactor = monthOffset !== undefined ? 0.4 - monthOffset * 0.02 : filters.period === "LAST_YEAR" ? 0.85 : 1;
  const factor = (regionIndex < 0 ? 1 : 0.3 + regionIndex * 0.045) * periodFactor;
  const successRate = Number((56.9 + (regionIndex < 0 ? 0 : regionIndex - 4) + (filters.period === "LAST_YEAR" ? -1.8 : 0)).toFixed(1));
  return {
    successRate, matches: Math.round(145 * factor), newFarmers: Math.round(48 * factor),
    monthlySupply: [80, 80, 26, 80, 80, 48, 80, 56, 64, 73, 80, 80].map(value => Math.round(value * factor)),
    successRange: [successRate - 2.3, successRate, successRate + 21],
    regionCounts: Object.fromEntries(REGIONS.map((name, index) => [name, Math.round([238, 224, 44, 62, 36, 48, 168, 203, 159, 182, 245][index] * periodFactor)])),
    regionChanges: Object.fromEntries(REGIONS.map((name, index) => [name, Math.round([18, 13, -3, 4, 0, 2, 9, 12, -5, 7, 16][index] * periodFactor)])),
  };
}
