export function SourceLiveAgentActivityBar({
  variant = "sidebar",
}: {
  variant?: "sidebar" | "mobile";
}) {
  return (
    <div
      data-testid="source-live-agent-activity-bar"
      className={`border-t-2 border-black px-3 py-2 ${
        variant === "mobile" ? "bg-white" : "bg-brutal-cream"
      }`}
      aria-live="polite"
    >
      <div className="flex min-h-8 items-center gap-2">
        <div className="flex size-5 shrink-0 items-center justify-center overflow-hidden border border-black bg-brutal-cyan">
          <SourceAgentPixelAvatar />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="size-2.5 shrink-0 animate-pulse rounded-full border border-black bg-primary" />
          <span className="min-w-0 truncate font-mono text-sm text-black/60" title="Thinking…">
            Thinking…
          </span>
        </div>
      </div>
    </div>
  );
}

function SourceAgentPixelAvatar() {
  return (
    <svg viewBox="0 0 8 8" className="size-full" shapeRendering="crispEdges" aria-hidden="true">
      <path
        fill="var(--source-ink)"
        d="M1 0h6v1H1zM0 1h1v1H0zM2 1h1v1H2zM5 1h1v1H5zM7 1h1v1H7zM0 2h1v1H0zM2 2h1v1H2zM5 2h1v1H5zM7 2h1v1H7zM0 3h8v1H0zM1 4h1v1H1zM3 4h2v1H3zM6 4h1v1H6zM1 5h6v1H1zM1 6h2v1H1zM5 6h2v1H5zM1 7h2v1H1zM5 7h2v1H5z"
      />
      <path
        fill="var(--color-white)"
        d="M3 1h2v1H3zM1 2h1v1H1zM3 2h2v1H3zM6 2h1v1H6zM2 4h1v1H2zM5 4h1v1H5z"
      />
    </svg>
  );
}
