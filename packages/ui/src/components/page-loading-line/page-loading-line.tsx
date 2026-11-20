import { useEffect, useState } from "react";
import type { ComponentProps } from "react";
import { tv } from "../../lib/tv";

/** A load that ends within this never draws the line, so a fast page doesn't flash. */
export const PAGE_LOADING_LINE_SHOW_AFTER_MS = 200;
/** Where the line rests while the page has reported no progress. */
export const PAGE_LOADING_LINE_START = 8;
/** How long the line takes to fill to the end, and then to fade, when the load ends. */
export const PAGE_LOADING_LINE_FINISH_MS = 200;

const pageLoadingLine = tv({
  slots: {
    root: [
      "pointer-events-none absolute inset-x-0 -bottom-px h-0.5",
      "transition-opacity duration-200 ease-linear motion-reduce:transition-none",
      "data-fading:opacity-0",
    ],
    fill: [
      "block h-full bg-info",
      "transition-[width] duration-200 ease-out motion-reduce:transition-none",
    ],
  },
});

export type PageLoadingLineProps = Omit<ComponentProps<"div">, "children"> & {
  /** True while the page loads. Turning it on again starts a new load. */
  loading: boolean;
  /** How far the page has loaded, 0 to 100. Leave it out while the page reports none. */
  value?: number | null;
  /** The load ended in an error: the line goes at once instead of filling and fading. */
  failed?: boolean;
};

type Phase = "hidden" | "waiting" | "shown" | "finishing" | "fading";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false)
  );
}

/**
 * The line along the bottom edge of a page's top bar while the page under it
 * loads (page-loading-line.md). Place it inside the bar, which must be
 * `relative`. The consumer owns the load; the line owns its timing: it shows
 * only after 200ms, only moves forward, rests at 8% while there is no
 * progress, and fills and fades when the load ends.
 */
export function PageLoadingLine({
  loading,
  value,
  failed = false,
  className,
  ...props
}: PageLoadingLineProps) {
  const { root, fill } = pageLoadingLine();
  const [prevLoading, setPrevLoading] = useState(false);
  const [phase, setPhase] = useState<Phase>("hidden");
  const [width, setWidth] = useState(0);

  // A load starting or ending, adjusted while rendering.
  let current = phase;
  let currentWidth = width;
  if (loading !== prevLoading) {
    setPrevLoading(loading);
    if (loading) {
      current = "waiting";
      currentWidth = 0;
    } else if (phase === "shown" && !failed && !prefersReducedMotion()) {
      current = "finishing";
      currentWidth = 100;
    } else {
      current = "hidden";
    }
  }
  // Forward only, from the start stub.
  if (loading) {
    const target = Math.min(
      100,
      Math.max(PAGE_LOADING_LINE_START, value ?? PAGE_LOADING_LINE_START),
    );
    currentWidth = Math.max(currentWidth, target);
  }
  if (current !== phase) setPhase(current);
  if (currentWidth !== width) setWidth(currentWidth);

  // Appear only when the load is still going after the delay; after the end,
  // fill, then fade, then go.
  useEffect(() => {
    const next: Partial<Record<Phase, [Phase, number]>> = {
      waiting: ["shown", PAGE_LOADING_LINE_SHOW_AFTER_MS],
      finishing: ["fading", PAGE_LOADING_LINE_FINISH_MS],
      fading: ["hidden", PAGE_LOADING_LINE_FINISH_MS],
    };
    const step = next[current];
    if (!step) return;
    const timer = setTimeout(() => setPhase(step[0]), step[1]);
    return () => clearTimeout(timer);
  }, [current]);

  if (current === "hidden" || current === "waiting") return null;
  return (
    <div
      data-slot="page-loading-line"
      data-fading={current === "fading" ? "" : undefined}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value != null ? Math.round(currentWidth) : undefined}
      className={root({ className })}
      {...props}
    >
      <span
        data-slot="page-loading-line-fill"
        className={fill()}
        style={{ width: `${currentWidth}%` }}
      />
    </div>
  );
}
