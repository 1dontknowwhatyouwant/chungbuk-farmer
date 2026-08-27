import type { WorkAssignment } from "../../services/api";

export const REGIONS = ["청주시", "충주시", "제천시", "보은군", "옥천군", "영동군", "증평군", "진천군", "괴산군", "음성군", "단양군"];
export type MetricPeriod = "ALL" | "MONTH" | "YEAR" | "LAST_YEAR";
export type MetricFilters = { period: MetricPeriod; region: string };
export type MetricSeries = { successRate: number | null; matches: number | null; newFarmers: number | null; monthlySupply: (number | null)[]; successRange: (number | null)[]; regionCounts: Record<string, number | null> };

export function koreaToday() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function inPeriod(date: string, period: MetricPeriod, today: string) {
  if (period === "ALL") return true;
  if (!/^\d{4}-\d{2}-\d{2}/.test(date)) return false;
  if (period === "MONTH") return date.slice(0, 7) === today.slice(0, 7);
  return Number(date.slice(0, 4)) === Number(today.slice(0, 4)) - (period === "LAST_YEAR" ? 1 : 0);
}

export function unavailableMetrics(): MetricSeries {
  return { successRate: null, matches: null, newFarmers: null, monthlySupply: Array(12).fill(null), successRange: Array(3).fill(null), regionCounts: Object.fromEntries(REGIONS.map(name => [name, null])) };
}

export function assignmentMetrics(assignments: WorkAssignment[], filters: MetricFilters, today: string) {
  const unique = [...new Map(assignments.map(item => [item.id, item])).values()];
  const included = unique.filter(item => ["SCHEDULED", "IN_PROGRESS", "COMPLETED"].includes(item.status) && inPeriod(item.workDate, filters.period, today));
  const counts = Object.fromEntries(REGIONS.map(name => [name, 0]));
  let unknownRegions = 0;
  for (const item of included) {
    const region = REGIONS.find(name => item.farmAddress?.includes(name));
    if (region) counts[region] += 1;
    else unknownRegions += 1;
  }
  return {
    ...unavailableMetrics(),
    matches: filters.region === "전체" ? included.length : counts[filters.region] ?? 0,
    regionCounts: counts,
    unknownRegions,
  };
}

// Explicit preview fixtures only. Never substitute these for a failed API response.
export function exampleMetrics(filters: MetricFilters): MetricSeries {
  const regionIndex = REGIONS.indexOf(filters.region);
  const factor = (regionIndex < 0 ? 1 : 0.3 + regionIndex * 0.045) * (filters.period === "MONTH" ? 0.4 : filters.period === "LAST_YEAR" ? 0.85 : 1);
  const successRate = Number((56.9 + (regionIndex < 0 ? 0 : regionIndex - 4) + (filters.period === "LAST_YEAR" ? -1.8 : 0)).toFixed(1));
  return {
    successRate, matches: Math.round(145 * factor), newFarmers: Math.round(48 * factor),
    monthlySupply: [80, 80, 26, 80, 80, 48, 80, 56, 64, 73, 80, 80].map(value => Math.round(value * factor)),
    successRange: [successRate - 2.3, successRate, successRate + 21],
    regionCounts: Object.fromEntries(REGIONS.map((name, index) => [name, Math.round([238, 168, 44, 62, 36, 48, 168, 203, 159, 182, 245][index] * (filters.period === "MONTH" ? 0.4 : 1))])),
  };
}
