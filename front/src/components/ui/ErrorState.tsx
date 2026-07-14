type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      className="card-soft border-danger/30 bg-danger/10 p-8 text-sm text-danger"
      role="alert"
    >
      <p className="leading-relaxed">{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="btn-secondary mt-4">
          Try again
        </button>
      ) : null}
    </div>
  );
}
