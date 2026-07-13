type SourceProgressBarTone = "pink" | "cyan" | "lime" | "orange";

const SOURCE_PROGRESS_STYLE = `
@keyframes doc-source-progress-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(300%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .doc-source-progress-indeterminate {
    animation: none;
  }
}
`;

const sourceProgressStyle = (
  <style href="doc-progress-source-comparison" precedence="default">
    {SOURCE_PROGRESS_STYLE}
  </style>
);

const SOURCE_TONE_CLASS: Record<SourceProgressBarTone, string> = {
  pink: "bg-brutal-pink",
  cyan: "bg-brutal-cyan",
  lime: "bg-brutal-lime",
  orange: "bg-brutal-orange",
};

export function SourceProgressBar({
  value,
  tone = "pink",
  label,
  showPercent,
}: {
  value?: number | null;
  tone?: SourceProgressBarTone;
  label?: string;
  showPercent?: boolean;
}) {
  const indeterminate = value === null || value === undefined || Number.isNaN(value);
  const pct = indeterminate ? 0 : Math.max(0, Math.min(100, value));

  return (
    <div className="w-64">
      {(label || (showPercent && !indeterminate)) && (
        <div className="mb-1 flex items-center justify-between text-xs font-mono text-black/60">
          {label ? <span className="truncate">{label}</span> : <span />}
          {showPercent && !indeterminate ? (
            <span className="shrink-0">{Math.round(pct)}%</span>
          ) : null}
        </div>
      )}
      <div className="h-4 w-full overflow-hidden border-2 border-black bg-white shadow-brutal-sm">
        {sourceProgressStyle}
        <div
          className={`h-full ${SOURCE_TONE_CLASS[tone]} ${
            indeterminate
              ? "doc-source-progress-indeterminate w-2/5 [animation:doc-source-progress-indeterminate_1.1s_ease-in-out_infinite]"
              : "transition-all duration-100"
          }`}
          style={indeterminate ? undefined : { width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
