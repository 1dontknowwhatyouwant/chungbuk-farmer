import type { ParticipationApplication } from "../../services/api";
import styles from "./CenterApplicationsPage.module.css";

export const applicationStatusLabel = {
  DRAFT: "작성 중",
  SUBMITTED: "대기",
  APPROVED: "승인",
  REJECTED: "반려",
  CANCELLED: "취소",
} as const;

// The participation endpoint currently has no applicant profile fields.
// Keep missing profile values explicit until a profile data source is available.
export type ApplicantProfile = {
  phoneNumber?: string | null;
  preferredRegion?: string | null;
  educationCompleted?: boolean | null;
  experienceYears?: number | null;
  transportationAvailable?: boolean | null;
};

type ApplicationCardProps = {
  item: ParticipationApplication;
  profile?: ApplicantProfile;
  submitting: boolean;
  disabled: boolean;
  onApprove: () => void;
  onReject: () => void;
};

export default function ApplicationCard({ item, profile, submitting, disabled, onApprove, onReject }: ApplicationCardProps) {
  const pending = item.status === "SUBMITTED";
  const rejected = item.status === "REJECTED";
  const tone = item.status === "APPROVED" ? styles.approved : rejected ? styles.rejected : styles.pending;

  return (
    <article className={`${styles.card} ${tone}`} aria-label={`${item.urbanFarmerName} ${applicationStatusLabel[item.status]}`} aria-busy={submitting}>
      <span className={styles.status}>{applicationStatusLabel[item.status]}</span>
      <div className={styles.identity}>
        <h2>{item.urbanFarmerName}</h2>
        <span>{profile?.phoneNumber || "연락처 미제공"}</span>
      </div>
      <dl className={styles.profile}>
        <div><dt>희망지역:</dt><dd>{profile?.preferredRegion || "미제공"}</dd></div>
        <div><dt>교육</dt><dd>{profile?.educationCompleted == null ? "미제공" : profile.educationCompleted ? "이수" : "미이수"}</dd></div>
        <div><dt>경력</dt><dd>{profile?.experienceYears == null ? "미제공" : `${profile.experienceYears}년`}</dd></div>
        <div><dt>이동</dt><dd>{profile?.transportationAvailable == null ? "미제공" : profile.transportationAvailable ? "가능" : "불가"}</dd></div>
      </dl>
      {pending || rejected ? (
        <div className={styles.actions}>
          <button type="button" disabled={!pending || disabled} onClick={onReject}>반려</button>
          <button type="button" disabled={!pending || disabled} onClick={onApprove}>{submitting ? "처리 중" : "승인"}</button>
        </div>
      ) : null}
      {item.applicationNote || item.rejectionReason ? (
        <details className={styles.note}>
          <summary>신청 내용{item.rejectionReason ? " 및 반려 사유" : ""}</summary>
          {item.applicationNote ? <p>{item.applicationNote}</p> : null}
          {item.rejectionReason ? <p>반려 사유: {item.rejectionReason}</p> : null}
        </details>
      ) : null}
    </article>
  );
}
