"use client";

import { useId } from "react";
import mapRegions from "./chungbuk-map.json";
import styles from "./CenterMetricsPage.module.css";

export function MonthlySupplyChart({ values }: { values: (number | null)[] }) {
  const id = useId();
  const hasData = values.some(value => value !== null);
  const maximum = Math.max(100, ...values.map(value => value ?? 0));
  return <div className={styles.chartFrame}>
    <svg viewBox="0 0 354 190" role="img" aria-labelledby={id}>
      <title id={id}>월별 인력 공급 추이{hasData ? " (명)" : " — 통계 미제공"}</title>
      <line x1="0" y1="168" x2="354" y2="168" className={styles.axis} />
      {values.map((value, index) => <g key={index}>
        {value !== null ? <rect x={7 + index * 29} y={168 - value / maximum * 130} width="18" height={value / maximum * 130} fill="#d7e1ee"><title>{index + 1}월: {value}명</title></rect> : null}
        <text x={16 + index * 29} y="184" textAnchor="middle">{index + 1}월</text>
      </g>)}
      {!hasData ? <text x="177" y="94" textAnchor="middle" className={styles.chartEmpty}>월별 인력 공급 통계가 제공되지 않습니다.</text> : null}
    </svg>
    <table className="sr-only"><caption>월별 인력 공급 인원</caption><tbody>{values.map((value, index) => <tr key={index}><th>{index + 1}월</th><td>{value === null ? "미제공" : `${value}명`}</td></tr>)}</tbody></table>
  </div>;
}

export function SuccessRateChart({ values }: { values: (number | null)[] }) {
  const id = useId();
  const x = [52, 177, 313];
  const labels = ["최저", "평균", "최고"];
  const hasData = values.every(value => value !== null);
  const points = values.map((value, index) => `${x[index]},${174 - (value ?? 0) * 1.5}`).join(" ");
  return <div className={styles.chartFrame}>
    <svg viewBox="0 0 354 190" role="img" aria-labelledby={id}>
      <title id={id}>농가 구인 성공률 추이{hasData ? " (%)" : " — 통계 미제공"}</title>
      <line x1="0" y1="174" x2="354" y2="174" className={styles.axis} />
      {[52, 177].map(value => <line key={value} x1={value} x2={value} y1="0" y2="174" className={styles.axis} />)}
      {hasData ? <polyline points={`0,158 ${points}`} fill="none" stroke="#ff5964" strokeWidth="2.5" strokeLinejoin="round" /> : <text x="177" y="94" textAnchor="middle" className={styles.chartEmpty}>구인 성공률 통계가 제공되지 않습니다.</text>}
      {labels.map((label, index) => <text key={label} x={x[index]} y="187" textAnchor="middle">{label}</text>)}
    </svg>
    <table className="sr-only"><caption>농가 구인 성공률</caption><tbody>{values.map((value, index) => <tr key={index}><th>{labels[index]}</th><td>{value === null ? "미제공" : `${value.toFixed(1)}%`}</td></tr>)}</tbody></table>
  </div>;
}

function mapColor(value: number | null) { return value === null ? "#e1e7eb" : value < 50 ? "#ffc3c7" : value < 200 ? "#ff8e94" : "#ff5b64"; }

export function RegionMap({ values, selected, onSelect, preview }: { values: Record<string, number | null>; selected: string; onSelect: (region: string) => void; preview: boolean }) {
  return <figure className={styles.mapFigure}>
    <svg viewBox="0 0 365 400" role="group" aria-label="충북 시군별 운영 지표 지도">
      {mapRegions.map(region => {
        const value = values[region.name] ?? null;
        const active = selected === region.name;
        return <g key={region.name} className={styles.mapRegion} role="button" tabIndex={0} aria-pressed={active} aria-label={`${region.name}: ${value === null ? "미제공" : `${value}${preview ? "명 (예시)" : "건"}`}`} onClick={() => onSelect(active ? "전체" : region.name)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(active ? "전체" : region.name); } }}>
          <title>{region.name}: {value === null ? "미제공" : value}{preview ? " (예시)" : "건"}</title>
          {region.paths.map((d, index) => <path key={index} d={d} fill={mapColor(value)} fillRule="evenodd" stroke={active ? "#4b617c" : "white"} strokeWidth={active ? 2 : 0.7} opacity={selected === "전체" || active ? 1 : 0.35} />)}
          <text x={region.label[0]} y={region.label[1]} textAnchor="middle" dominantBaseline="middle">{region.name}</text>
        </g>;
      })}
      <g className={styles.legend} transform="translate(268 285)">
        {[['#ffc3c7', '50 미만'], ['#ff8e94', '50~199'], ['#ff5b64', '200 이상'], ['#e1e7eb', '미제공']].map(([color, label], index) => <g key={label} transform={`translate(0 ${index * 25})`}><rect width="16" height="16" fill={color} /><text x="23" y="12">{label}</text></g>)}
      </g>
    </svg>
    <figcaption>{preview ? "시군별 인력 공급 예시 (명)" : "시군별 작업 배정 (건) · 작업일 기준"}<br /><a href="https://github.com/southkorea/southkorea-maps#copyright-and-license" target="_blank" rel="noreferrer">지도: KOSTAT 2018 / southkorea-maps</a></figcaption>
  </figure>;
}
