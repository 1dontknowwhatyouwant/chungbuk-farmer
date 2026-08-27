"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { centerAdminApi, type AdminDashboard, type WorkAssignment } from "../../services/api";
import CenterFeedback from "../common/center/CenterFeedback";
import CenterShell from "../common/center/CenterShell";

type CenterMetricsPageProps = { mode: "statistics" | "data" };

const metricGroups = [
  {
    title: "신청 심사",
    color: "bg-[#eaf2d6]",
    items: [
      ["참여 신청 대기", "submittedParticipationApplications"],
      ["교육 증빙 대기", "pendingEducationSubmissions"],
      ["농지 소유 증빙", "pendingFarmOwnershipSubmissions"],
    ],
  },
  {
    title: "공고·매칭",
    color: "bg-[#e8effb]",
    items: [
      ["공고 검토 대기", "pendingJobPostings"],
      ["모집 중 공고", "openJobPostings"],
      ["매칭 대기", "pendingJobApplications"],
    ],
  },
  {
    title: "작업 운영",
    color: "bg-[#faefd7]",
    items: [
      ["예정 작업", "scheduledWorkAssignments"],
      ["완료 작업", "completedWorkAssignments"],
    ],
  },
] as const;

function labelStatus(status: string) {
  const labels: Record<string, string> = { SCHEDULED: "예정", IN_PROGRESS: "진행", COMPLETED: "완료", CANCELLED: "취소" };
  return labels[status] ?? status;
}

export default function CenterMetricsPage({ mode }: CenterMetricsPageProps) {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [assignments, setAssignments] = useState<WorkAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === "statistics") {
        const { data } = await centerAdminApi.dashboard();
        setDashboard(data);
      } else {
        const [dashboardResult, assignmentResult] = await Promise.all([
          centerAdminApi.dashboard(),
          centerAdminApi.workAssignments({ page: 0, size: 20 }),
        ]);
        setDashboard(dashboardResult.data);
        setAssignments(assignmentResult.data.content);
      }
    } catch {
      setError(mode === "statistics" ? "운영 통계를 불러오지 못했습니다." : "센터 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => { void load(); }, [load]);

  const completionRate = useMemo(() => {
    if (!dashboard) return 0;
    const total = dashboard.scheduledWorkAssignments + dashboard.completedWorkAssignments;
    return total ? Math.round((dashboard.completedWorkAssignments / total) * 100) : 0;
  }, [dashboard]);

  if (mode === "statistics") {
    return (
      <CenterShell title="운영 통계" description="신청부터 공고 검토, 매칭, 작업 완료까지의 현재 처리 현황입니다.">
        <CenterFeedback loading={loading} error={error} onRetry={() => void load()} />
        {!loading && !error && dashboard ? (
          <div className="space-y-4">
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-end justify-between"><div><p className="text-xs text-[#829093]">작업 완료율</p><strong className="mt-1 block text-[32px] font-semibold text-[#435055]">{completionRate}%</strong></div><p className="text-right text-xs leading-5 text-[#748184]">완료 {dashboard.completedWorkAssignments}건<br />예정 {dashboard.scheduledWorkAssignments}건</p></div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#edf0ea]"><div className="h-full rounded-full bg-[#80a245]" style={{ width: `${completionRate}%` }} /></div>
            </section>
            {metricGroups.map((group) => (
              <section key={group.title} className="rounded-2xl bg-white p-4 shadow-sm">
                <h2 className="text-[16px] font-semibold text-[#435055]">{group.title}</h2>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {group.items.map(([label, key]) => (
                    <div key={key} className={`rounded-xl p-3 ${group.color}`}><p className="text-xs leading-5 text-[#6d7a7e]">{label}</p><strong className="mt-1 block text-[22px] font-semibold text-[#3f4d51]">{dashboard[key]}<span className="ml-1 text-xs font-normal">건</span></strong></div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : null}
      </CenterShell>
    );
  }

  return (
    <CenterShell title="센터 데이터" description="현재 활동 중인 이용자 규모와 최근 작업 배정 데이터를 확인할 수 있습니다.">
      <CenterFeedback loading={loading} error={error} onRetry={() => void load()} />
      {!loading && !error && dashboard ? (
        <>
          <section className="grid grid-cols-3 gap-2">
            {[
              ["도시농부", dashboard.activeUrbanFarmerCount],
              ["농가", dashboard.activeFarmCount],
              ["센터", dashboard.activeCenterAdminCount],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white px-2 py-5 text-center shadow-sm"><strong className="text-[24px] font-semibold text-[#435055]">{value}</strong><p className="mt-1 text-xs text-[#7b878a]">{label}</p></div>
            ))}
          </section>
          <section className="mt-5">
            <div className="flex items-end justify-between"><h2 className="text-[18px] font-semibold text-[#435055]">최근 작업 배정</h2><span className="text-xs text-[#7b878a]">{assignments.length}건 조회</span></div>
            <div className="mt-3 space-y-3">
              {assignments.length === 0 ? <CenterFeedback empty="조회된 작업 배정이 없습니다." /> : assignments.map((item) => (
                <article key={item.id} className="rounded-2xl border border-[#dce3d5] bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-[#435055]">{item.farmName}</h3><p className="mt-1 text-sm text-[#657276]">{item.urbanFarmerName} · {item.workType}</p></div><span className="rounded-full bg-[#e8effb] px-3 py-1 text-xs text-[#385784]">{labelStatus(item.status)}</span></div>
                  <div className="mt-3 flex justify-between rounded-xl bg-[#f6f8f2] p-3 text-xs text-[#5f6c70]"><span>{item.workDate}</span><span>{item.startTime.slice(0, 5)}~{item.endTime.slice(0, 5)}</span><span>{item.crop}</span></div>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </CenterShell>
  );
}

