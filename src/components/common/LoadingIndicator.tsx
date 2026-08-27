type LoadingIndicatorProps = {
  label?: string;
  compact?: boolean;
  className?: string;
};

export default function LoadingIndicator({ label = "불러오는 중입니다.", compact = false, className = "" }: LoadingIndicatorProps) {
  return (
    <div role="status" aria-live="polite" className={`flex flex-col items-center justify-center gap-2 text-center ${className}`}>
      <span aria-hidden="true" className={`${compact ? "h-5 w-5" : "h-7 w-7"} shrink-0 rounded-full border-2 border-[#dce5d5] border-t-[#7c9952] motion-safe:animate-spin`} />
      <p className="text-[11px] font-normal leading-4 text-[#6d7a7e]">{label}</p>
    </div>
  );
}
