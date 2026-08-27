"use client";

import { useEffect, useId, useRef } from "react";
import AppIcon from "../icon/AppIcon";
import styles from "./CenterFilterDropdown.module.css";

type Props = {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
  fullWidth?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

export default function CenterFilterDropdown({ label, value, options, onChange, fullWidth = false, disabled = false, placeholder = "전체" }: Props) {
  const ref = useRef<HTMLDetailsElement>(null);
  const id = useId();
  const selectedLabel = options.find((option) => option.value === value)?.label ?? placeholder;

  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) ref.current.open = false;
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);

  return (
    <div className={`${styles.field} ${fullWidth ? styles.wide : ""}`}>
      <span id={id}>{label}</span>
      <details ref={ref} className={styles.dropdown} onKeyDown={(event) => {
        if (event.key === "Escape" && ref.current) {
          ref.current.open = false;
          ref.current.querySelector("summary")?.focus();
        }
      }}>
        <summary aria-label={`${label}: ${selectedLabel}`} aria-disabled={disabled} tabIndex={disabled ? -1 : undefined} onClick={(event) => { if (disabled) event.preventDefault(); }}>
          {selectedLabel}<span aria-hidden="true"><AppIcon name="chevron-left" size={12} className={styles.arrow} /></span>
        </summary>
        <div className={styles.options} role="group" aria-labelledby={id}>
          {options.map((option) => (
            <button key={option.value} type="button" disabled={disabled} aria-pressed={value === option.value} onClick={() => {
              onChange(option.value);
              if (ref.current) {
                ref.current.open = false;
                ref.current.querySelector("summary")?.focus();
              }
            }}>{option.label}</button>
          ))}
        </div>
      </details>
    </div>
  );
}
