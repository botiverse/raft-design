import type { ComponentProps } from "react";
import { tv } from "../../lib/tv";
import { Spinner } from "../spinner/spinner";
import { pullStep } from "./pull-to-refresh-gesture";
import type { PullToRefresh } from "./use-pull-to-refresh";

// While pulling, the spinner stands still and its lit pixel walks clockwise
// with the pull (pullStep); while refreshing it runs as usual; once idle, as
// it goes back, it stops. Pixels in DOM order are top left, top right, bottom
// left, bottom right.
const PULL_STEP_STYLE = `
[data-slot="pull-to-refresh-indicator"][data-pull-step] [data-spinner-pixel],
[data-slot="pull-to-refresh-indicator"][data-state="idle"] [data-spinner-pixel] {
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

// The snap-back (PULL_TO_REFRESH_SNAP_BACK_MS): 300ms of `ease-slide`, an
// ease-out whose curve never passes its end, so the indicator settles without
// overshoot or bounce. It follows the finger with no transition, and with
// reduced motion it snaps at once.
const SNAP_BACK = [
  "duration-300 ease-slide motion-reduce:transition-none",
  "data-[state=pulling]:transition-none",
];

const pullToRefreshIndicator = tv({
  slots: {
    root: ["flex w-full shrink-0 justify-center", "text-foreground-icon"],
    surface: ["flex items-center justify-center"],
    spinner: [
      "transition-opacity duration-300 ease-slide motion-reduce:transition-none",
      "in-data-[state=pulling]:transition-none",
      "in-data-[state=pulling]:opacity-(--pull-progress) in-data-[state=idle]:opacity-0",
    ],
    status: ["sr-only"],
  },
  variants: {
    platform: {
      // The content moves down with the pull: the root is the space it opens.
      default: {
        root: ["relative items-center overflow-hidden", "transition-[height]", ...SNAP_BACK],
        surface: ["size-full"],
      },
      // Material 3: the content stays still and the indicator travels down
      // over it, on a surface so it reads over the rows. The root takes no
      // space and sticks to the top, so the surface stays put while the list
      // scrolls under a refresh.
      android: {
        root: ["sticky top-0 z-10 h-0 overflow-visible"],
        surface: [
          "absolute inset-x-0 top-0 mx-auto size-10 rounded-md bg-layer-popover shadow-float ring-1 ring-line-seam",
          "translate-y-[calc(var(--pull-distance)-100%)]",
          "transition-[translate,opacity]",
          ...SNAP_BACK,
          "data-[state=idle]:opacity-0",
        ],
      },
    },
  },
  defaultVariants: { platform: "default" },
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
 * The pull's indicator, with the DS Spinner in it. Render it as the
 * scroller's first child: by default it is the space the pull opens, so the
 * content moves down with the pull; on Android it travels down over the
 * content instead (Material 3). It holds a polite live region that announces
 * `label` while refreshing.
 */
export function PullToRefreshIndicator({
  pull,
  label,
  className,
  style,
  ...props
}: PullToRefreshIndicatorProps) {
  const { state, distance, progress, platform } = pull;
  const { root, surface, spinner, status } = pullToRefreshIndicator({ platform });
  const android = platform === "android";
  return (
    <div
      data-slot="pull-to-refresh-indicator"
      data-state={state}
      data-platform={platform}
      data-pull-step={state === "pulling" ? pullStep(progress) : undefined}
      className={root({ className })}
      style={{
        ...style,
        height: android ? undefined : distance,
        ["--pull-progress" as string]: progress,
        ["--pull-distance" as string]: `${distance}px`,
      }}
      {...props}
    >
      {pullStepStyle}
      <div data-slot="pull-to-refresh-surface" data-state={state} className={surface()}>
        <Spinner
          aria-hidden="true"
          role="presentation"
          aria-label={undefined}
          className={spinner()}
        />
      </div>
      <span role="status" aria-live="polite" className={status()}>
        {state === "refreshing" ? label : ""}
      </span>
    </div>
  );
}
