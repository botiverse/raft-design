import type { ComponentProps } from "react";
import { tv } from "../../lib/tv";
import { Spinner } from "../spinner/spinner";
import { pullStep } from "./pull-to-refresh-gesture";
import type { PullToRefresh } from "./use-pull-to-refresh";

// While pulling, the spinner stands still and its lit pixel walks clockwise
// with the pull (pullStep); while refreshing it runs as usual. Pixels in DOM
// order are top left, top right, bottom left, bottom right.
const PULL_STEP_STYLE = `
[data-slot="pull-to-refresh-indicator"][data-pull-step] [data-spinner-pixel] {
  animation: none;
  opacity: 0.2;
}

[data-slot="pull-to-refresh-indicator"][data-pull-step="0"] [data-spinner-pixel]:nth-child(1),
[data-slot="pull-to-refresh-indicator"][data-pull-step="1"] [data-spinner-pixel]:nth-child(2),
[data-slot="pull-to-refresh-indicator"][data-pull-step="2"] [data-spinner-pixel]:nth-child(4),
[data-slot="pull-to-refresh-indicator"][data-pull-step="3"] [data-spinner-pixel]:nth-child(3) {
  opacity: 1;
}
`;

const pullStepStyle = (
  <style href="raft-ui-pull-to-refresh" precedence="default">
    {PULL_STEP_STYLE}
  </style>
);

const pullToRefreshIndicator = tv({
  slots: {
    root: [
      "relative flex w-full shrink-0 items-center justify-center overflow-hidden",
      "text-foreground-icon",
      "transition-[height] duration-150 ease-out motion-reduce:transition-none",
      "data-[state=pulling]:transition-none",
    ],
    spinner: ["in-data-[state=pulling]:opacity-(--pull-progress)"],
    status: ["sr-only"],
  },
});

export type PullToRefreshIndicatorProps = Omit<ComponentProps<"div">, "children"> & {
  /** The result of `usePullToRefresh`. */
  pull: PullToRefresh;
  /**
   * What a screen reader announces when the refresh starts, such as
   * "Refreshing…". Product copy, so it comes from the consumer.
   */
  label: string;
};

/**
 * The space the pull opens at the top of the scroller, with the pixel spinner
 * in it. Render it as the scroller's first child, so the content moves down
 * with the pull. It holds a polite live region that announces `label` while
 * refreshing.
 */
export function PullToRefreshIndicator({
  pull,
  label,
  className,
  style,
  ...props
}: PullToRefreshIndicatorProps) {
  const { root, spinner, status } = pullToRefreshIndicator();
  const { state, distance, progress } = pull;
  return (
    <div
      data-slot="pull-to-refresh-indicator"
      data-state={state}
      data-pull-step={state === "pulling" ? pullStep(progress) : undefined}
      className={root({ className })}
      style={{ ...style, height: distance, ["--pull-progress" as string]: progress }}
      {...props}
    >
      {pullStepStyle}
      {state !== "idle" && (
        <Spinner
          aria-hidden="true"
          role="presentation"
          aria-label={undefined}
          className={spinner()}
        />
      )}
      <span role="status" aria-live="polite" className={status()}>
        {state === "refreshing" ? label : ""}
      </span>
    </div>
  );
}
