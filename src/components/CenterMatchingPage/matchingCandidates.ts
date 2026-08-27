import type { ParticipationApplication } from "../../services/api";

export type MatchingCandidate = {
  id: number;
  name: string;
  preferredRegion: string | null;
  availableMonths: number[] | null;
  educationCompleted: boolean | null;
  experienceYears: number | null;
  transportationAvailable: boolean | null;
};

export type CandidateFilters = { region: string; month: string; keyword: string };

// Participation approval is not proof of availability or matching eligibility.
// The existing endpoint has no profile/schedule fields, so leave them unknown.
export function fromApprovedParticipants(applications: ParticipationApplication[]): MatchingCandidate[] {
  const approved = applications.filter((item) => item.status === "APPROVED");
  return Array.from(new Map(approved.map((item) => [item.urbanFarmerId, {
    id: item.urbanFarmerId, name: item.urbanFarmerName,
    preferredRegion: null, availableMonths: null, educationCompleted: null,
    experienceYears: null, transportationAvailable: null,
  }])).values());
}

export function searchCandidates(candidates: MatchingCandidate[], filters: CandidateFilters) {
  const query = filters.keyword.trim().toLowerCase();
  let unknownCount = 0;
  const results = candidates.filter((candidate) => {
    if (((filters.region !== "전체" || query) && candidate.preferredRegion === null) || (filters.month !== "전체" && candidate.availableMonths === null)) {
      unknownCount += 1;
      return false;
    }
    return (filters.region === "전체" || candidate.preferredRegion?.includes(filters.region))
      && (filters.month === "전체" || candidate.availableMonths?.includes(Number(filters.month)))
      && (!query || candidate.preferredRegion?.toLowerCase().includes(query));
  });
  return { results, unknownCount };
}
