"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import styles from "./CenterModal.module.css";

type CenterModalProps = {
  title: string;
  description?: string;
  children?: ReactNode;
  confirmLabel: string;
  submitting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  destructive?: boolean;
  variant?: "default" | "review";
  cancelLabel?: string;
  confirmFirst?: boolean;
};

export default function CenterModal({
  title,
  description,
  children,
  confirmLabel,
  submitting,
  onCancel,
  onConfirm,
  destructive,
  variant = "default",
  cancelLabel = "취소",
  confirmFirst = false,
}: CenterModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (variant !== "review") return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    // Focus the dialog, not the textarea, so opening it does not summon the keyboard.
    dialog.focus({ preventScroll: true });
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [variant]);

  if (variant === "review") {
    const confirmButton = <button key="confirm" type="button" disabled={submitting} onClick={onConfirm}>{submitting ? "처리 중" : confirmLabel}</button>;
    const cancelButton = <button key="cancel" type="button" disabled={submitting} onClick={onCancel}>{cancelLabel}</button>;

    return (
      <dialog ref={dialogRef} tabIndex={-1} className={styles.dialog} aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} aria-busy={submitting} onCancel={(event) => { event.preventDefault(); if (!submitting) onCancel(); }} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); if (!submitting) onCancel(); } }}>
        <div className={styles.header}>
          <h2 id={titleId}>{title}</h2>
          <button type="button" className={styles.close} aria-label="팝업 닫기" disabled={submitting} onClick={onCancel}>×</button>
        </div>
        {description ? <p id={descriptionId} className={styles.description}>{description}</p> : null}
        {children}
        <div className={styles.actions}>{confirmFirst ? [confirmButton, cancelButton] : [cancelButton, confirmButton]}</div>
      </dialog>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 px-4 pb-5 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="center-modal-title">
      <div className="w-full max-w-[352px] rounded-[22px] bg-white p-5 shadow-2xl">
        <h2 id="center-modal-title" className="text-[20px] font-semibold text-[#3f4d51]">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-5 text-[#6d7a7e]">{description}</p> : null}
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={onCancel} disabled={submitting} className="rounded-xl border border-[#d8dfd2] bg-white py-3 text-sm text-[#647074] disabled:opacity-50">
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className={`rounded-xl py-3 text-sm font-medium text-white disabled:opacity-50 ${destructive ? "bg-[#c9695e]" : "bg-[#789d3b]"}`}
          >
            {submitting ? "처리 중" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

