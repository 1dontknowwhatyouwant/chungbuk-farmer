import type { AdminFarmProfile } from "../../services/api";
import { ownershipReviewState, ownershipStatusDescription, ownershipStatusLabel } from "../../services/farmOwnership";
import styles from "./CenterApplicationsPage.module.css";

type ApplicationCardProps = {
  item: AdminFarmProfile;
  submitting: boolean;
  disabled: boolean;
  onApprove: () => void;
  onReject: () => void;
};

export default function ApplicationCard({ item, submitting, disabled, onApprove, onReject }: ApplicationCardProps) {
  const state = ownershipReviewState(item);
  const pending = state === "pending";
  const rejected = state === "rejected";
  const tone = state === "approved" ? styles.approved : rejected ? styles.rejected : pending ? styles.pending : styles.unreviewable;
  const rejectionReason = item.rejectionReason;

  return (
    <article className={`${styles.card} ${tone}`} aria-label={`${item.farmName} ${ownershipStatusLabel(item)}`} aria-busy={submitting}>
      <span className={styles.status} title={ownershipStatusDescription(item)}>{ownershipStatusLabel(item)}</span>
      <div className={styles.identity}>
        <h2>{item.farmName}</h2>
        <span>{item.contactNumber || "연락처 미제공"}</span>
      </div>
      <dl className={styles.profile}>
        <div><dt>대표자:</dt><dd>{item.representativeName || "미제공"}</dd></div>
        <div><dt>농장 주소:</dt><dd>{item.farmAddress || item.cityCounty || "미제공"}</dd></div>
        <div><dt>작물:</dt><dd>{item.crops?.join(", ") || "미제공"}</dd></div>
        <div><dt>농장 면적:</dt><dd>{item.farmAreaPyeong == null ? "미제공" : `${item.farmAreaPyeong}평`}</dd></div>
      </dl>
      {state === "draft" || state === "inactive" || rejected ? <p className={styles.stateDescription}>{ownershipStatusDescription(item)}</p> : null}
      {pending || rejected ? (
        <div className={styles.actions}>
          <button type="button" disabled={!pending || disabled} onClick={onReject}>반려</button>
          <button type="button" disabled={!pending || disabled} onClick={onApprove}>{submitting ? "처리 중" : "승인"}</button>
        </div>
      ) : null}
      {item.mainActivities || rejectionReason ? (
        <details className={styles.note}>
          <summary>농장 정보{rejectionReason ? " 및 반려 사유" : ""}</summary>
          {item.mainActivities ? <p>{item.mainActivities}</p> : null}
          {rejectionReason ? <p>반려 사유: {rejectionReason}</p> : null}
        </details>
      ) : null}
    </article>
  );
}
