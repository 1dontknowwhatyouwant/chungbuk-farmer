"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { centerAdminApi, type WorkAssignment } from "../../services/api";
import CenterFilterDropdown from "../common/center/CenterFilterDropdown";
import CenterFeedback from "../common/center/CenterFeedback";
import AppIcon from "../common/icon/AppIcon";
import { assignmentMetrics, exampleMetrics, koreaToday, REGIONS, unavailableMetrics, type MetricPeriod } from "./metricsData";
import { MonthlySupplyChart, RegionMap, SuccessRateChart } from "./MetricsCharts";
import styles from "./CenterMetricsPage.module.css";

type Props = { mode: "statistics" | "data" };
const periodOptions = [{ value: "ALL", label: "전체" }, { value: "MONTH", label: "이번 달" }, { value: "YEAR", label: "올해" }, { value: "LAST_YEAR", label: "작년" }];
const regionOptions = ["전체", ...REGIONS].map(value => ({ value, label: value }));

async function loadAllAssignments() {
  const { data } = await centerAdminApi.workAssignments({ page: 0, size: 100 });
  const all = [...data.content];
  for (let page = 1; page < data.totalPages; page += 1) {
    const result = await centerAdminApi.workAssignments({ page, size: 100 });
    all.push(...result.data.content);
  }
  return all;
}

function MetricsContent({ mode }: Props) {
  const router = useRouter();
  const [period, setPeriod] = useState<MetricPeriod>("ALL");
  const [region, setRegion] = useState("전체");
  const [preview, setPreview] = useState(false);
  const [assignments, setAssignments] = useState<WorkAssignment[]>([]);
  const [loading, setLoading] = useState(mode === "statistics");
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const request = useRef<Promise<WorkAssignment[]> | null>(null);
  const [today, setToday] = useState("");

  useEffect(() => { setToday(koreaToday()); }, []);
  useEffect(() => {
    if (mode !== "statistics") return;
    let active = true;
    setLoading(true); setError(null);
    // Reuse the pending request when Strict Mode replays this effect.
    const pending = request.current ?? loadAllAssignments();
    request.current = pending;
    void pending.then(data => {
      if (active) setAssignments(data);
    }, cause => {
      if (!active) return;
      const status = isAxiosError(cause) ? cause.response?.status : undefined;
      setError(status === 401 ? "로그인이 필요하거나 만료되었습니다. 다시 로그인해 주세요." : status === 403 ? "센터 관리자 권한이 필요합니다." : "작업 배정 통계를 불러오지 못했습니다.");
    }).finally(() => {
      if (request.current === pending) request.current = null;
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [mode, retry]);

  const filters = useMemo(() => ({ period, region }), [period, region]);
  const real = useMemo(() => assignmentMetrics(assignments, filters, today), [assignments, filters, today]);
  const metrics = preview ? exampleMetrics(filters) : mode === "statistics" && !loading && !error ? real : unavailableMetrics();
  const title = mode === "statistics" ? "운영 통계" : "데이터 통계";
  const periodLabel = periodOptions.find(option => option.value === period)?.label;
  const number = (value: number | null, suffix: string) => value === null ? "—" : `${value.toLocaleString("ko-KR")}${suffix}`;

  return <main className="min-h-screen bg-[#1f1f1f] sm:flex sm:justify-center sm:px-4 sm:py-8">
    <section className={styles.screen}>
      <header className={styles.header}>
        <button type="button" className={styles.back} aria-label="센터 홈으로 돌아가기" onClick={() => router.push("/center-home")}><AppIcon name="chevron-left" size={24} strokeWidth={1.5} /></button>
        <h1>{title}</h1>
      </header>
      <p className={styles.description}>농가와 도시 농부의 운영 현황을 확인합니다.</p>
      <div className={styles.filters}>
        <CenterFilterDropdown label="기간" value={period} options={periodOptions} onChange={value => setPeriod(value as MetricPeriod)} />
        <CenterFilterDropdown label="시군" value={region} options={regionOptions} onChange={setRegion} />
      </div>
      <div className={`${styles.sourceBar} ${preview ? styles.previewBar : ""}`}>
        <p role="status">{preview ? "예시 통계 · 실제 운영 데이터가 아닙니다." : "일부 통계는 API 연결 후 제공됩니다."}</p>
        <button type="button" aria-pressed={preview} onClick={() => setPreview(value => !value)}>{preview ? "실제 현황" : "예시 보기"}</button>
      </div>
      <p className="sr-only" role="status">{periodLabel} · {region} · {preview ? "예시 통계" : "실제 현황"}</p>

      {mode === "statistics" ? <>
        <section className={styles.operations} aria-labelledby="metrics-participation-title" aria-busy={!preview && loading}>
          <h2 id="metrics-participation-title">시군별 참여 목록</h2>
          {!preview ? <CenterFeedback loading={loading} loadingLabel="시군별 참여 현황을 불러오는 중입니다." error={error} onRetry={() => setRetry(value => value + 1)} /> : null}
          <div className={styles.cards}>
            <article className={styles.card}><h3>농가 구인 성공률</h3><strong>{number(metrics.successRate, " %")}</strong><dl><div><dt>목표</dt><dd>{preview ? "60%" : "미제공"}</dd></div><div><dt>대비</dt><dd>{preview ? "-1.8%p" : "미제공"}</dd></div></dl></article>
            <article className={styles.card}><h3>매칭 확정 건수</h3><strong>{number(metrics.matches, " 건")}</strong><p>{preview ? "예시 누적" : `${periodLabel} · 작업일 기준`}</p></article>
            <article className={styles.card}><h3>도시 농부 매칭 성공률</h3><strong>{number(metrics.successRate, " %")}</strong><dl><div><dt>목표</dt><dd>{preview ? "60%" : "미제공"}</dd></div><div><dt>대비</dt><dd>{preview ? "-1.8%p" : "미제공"}</dd></div></dl></article>
            <article className={styles.card}><h3>신규 도시 농부</h3><strong>{number(metrics.newFarmers, " 명")}</strong><p>{preview ? "예시 신규 승인" : "가입·승인 통계 미제공"}</p></article>
          </div>
          {!preview ? <p className={styles.note}>성공률·목표·신규 인원은 미제공입니다. 매칭 건수는 취소를 제외한 예정·진행·완료 배정 기준입니다.{real.unknownRegions > 0 && !error && !loading ? ` 주소에서 충북 시군을 확인하지 못한 ${real.unknownRegions}건은 지도 집계에서 제외했습니다.` : ""}</p> : null}
        </section>
        <section className={styles.mapSection} aria-labelledby="metrics-map-title">
          <h2 id="metrics-map-title">핵심 운영 지표</h2>
          <RegionMap values={metrics.regionCounts} selected={region} onSelect={setRegion} preview={preview} />
        </section>
      </> : <div className={styles.dataSections}>
        <section aria-labelledby="metrics-supply-title"><h2 id="metrics-supply-title">월별 인력 공급 추이</h2><MonthlySupplyChart values={metrics.monthlySupply} /></section>
        <section aria-labelledby="metrics-success-title"><h2 id="metrics-success-title">농가 구인 성공률 추이</h2><SuccessRateChart values={metrics.successRange} /></section>
        <p className={styles.note}>{preview ? "레이아웃 확인용 예시입니다. 기간·시군 선택에 따라 예시 수치가 변경됩니다." : "현재 API에는 월별 공급 인원과 구인 성공률이 없습니다. 통계 API 연결 후 실제 추이를 표시합니다."}</p>
      </div>}
    </section>
  </main>;
}

export default function CenterMetricsPage({ mode }: Props) { return <MetricsContent key={mode} mode={mode} />; }
