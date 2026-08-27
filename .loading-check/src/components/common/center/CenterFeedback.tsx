import LoadingIndicator from "../LoadingIndicator";

type CenterFeedbackProps = {
  loading?: boolean;
  loadingLabel?: string;
  error?: string | null;
  empty?: string;
  onRetry?: () => void;
};

export default function CenterFeedback({ loading, loadingLabel, error, empty, onRetry }: CenterFeedbackProps) {
  if (loading) {
    return <LoadingIndicator label={loadingLabel} className="rounded-2xl bg-white/80 px-5 py-10" />;
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-[#efc8c3] bg-white px-5 py-7 text-center">
        <p className="text-sm leading-5 text-[#9b4941]">{error}</p>
        {onRetry ? (
          <button type="button" onClick={onRetry} className="mt-4 rounded-full bg-[#e8effb] px-5 py-2 text-sm text-[#385784]">
            다시 시도
          </button>
        ) : null}
      </div>
    );
  }
  if (empty) {
    return <div className="rounded-2xl bg-white/80 px-5 py-10 text-center text-sm text-[#6d7a7e]">{empty}</div>;
  }
  return null;
}

