import { tv } from "../../lib/tv";
import type { PullToRefreshState } from "./pull-to-refresh-gesture";

/**
 * Android's own pull-to-refresh progress, drawn as Material 3 draws it
 * (Compose's `PullToRefreshDefaults.Indicator`, the one Chrome on Android
 * shows too): a 2.5px arc of radius 7.5px in a 40px disc. While pulling the
 * arc grows to 0.8 of the circle and turns a little with the pull, with an
 * arrowhead at its end, at 0.3 opacity until the pull is armed and fully
 * opaque from then on. While refreshing it is Material's indeterminate arc,
 * which grows and shrinks as it turns. Internal: `PullToRefreshIndicator`
 * renders it on Android.
 */

/** The disc's centre, in its 40px box. */
const CENTER = 20;
export const MATERIAL_ARC_RADIUS = 7.5;
export const MATERIAL_STROKE_WIDTH = 2.5;
const ARROW_WIDTH = 10;
const ARROW_HEIGHT = 5;
/** The longest the arc gets while pulling, as a share of the circle. */
export const MATERIAL_MAX_ARC = 0.8;
/** The arc's opacity while the pull isn't armed: before the threshold, or after moving back above it. */
export const MATERIAL_DISARMED_OPACITY = 0.3;
const CIRCUMFERENCE = 2 * Math.PI * MATERIAL_ARC_RADIUS;

export type MaterialArc = {
  /** Where the arc starts and ends, in degrees clockwise from 3 o'clock. */
  startAngle: number;
  endAngle: number;
  /** The arrowhead's scale, from 0 to 1. */
  arrowScale: number;
};

/**
 * The arc for a pull's progress (0 to 1), as Material computes it: nothing
 * for the first 40%, then the arc grows to `MATERIAL_MAX_ARC` of the circle
 * and its start turns from -45° to +27° (12 o'clock is -90°), and the
 * arrowhead grows with it.
 */
export function materialArc(progress: number): MaterialArc {
  const adjusted = (Math.max(Math.min(1, progress) - 0.4, 0) * 5) / 3;
  const rotation = (-0.25 + 0.4 * adjusted) * 0.5;
  const startAngle = rotation * 360;
  const endAngle = (rotation + adjusted * MATERIAL_MAX_ARC) * 360;
  return { startAngle, endAngle, arrowScale: Math.min(1, adjusted) };
}

const point = (degrees: number) => {
  const radians = (degrees * Math.PI) / 180;
  return `${CENTER + MATERIAL_ARC_RADIUS * Math.cos(radians)} ${CENTER + MATERIAL_ARC_RADIUS * Math.sin(radians)}`;
};

/** An SVG path for the arc, clockwise from `startAngle` to `endAngle`. */
function arcPath({ startAngle, endAngle }: MaterialArc) {
  const sweep = endAngle - startAngle;
  if (sweep <= 0.01) return "";
  const large = sweep > 180 ? 1 : 0;
  return `M ${point(startAngle)} A ${MATERIAL_ARC_RADIUS} ${MATERIAL_ARC_RADIUS} 0 ${large} 1 ${point(endAngle)}`;
}

/**
 * The arrowhead: a triangle whose base straddles the arc at 3 o'clock and
 * whose tip points clockwise, turned to the arc's end.
 */
function arrowPoints(scale: number) {
  const half = (ARROW_WIDTH * scale) / 2;
  const base = CENTER - MATERIAL_STROKE_WIDTH;
  const x = CENTER + MATERIAL_ARC_RADIUS;
  return `${x - half},${base} ${x + half},${base} ${x},${base + ARROW_HEIGHT * scale}`;
}

// Material's indeterminate circular progress: the arc turns once every 1.4s
// while its length grows from a dot to about 0.7 of the circle and its tail
// catches up, every 1.4s. With reduced motion it holds still at 0.75 of the
// circle.
const MATERIAL_STYLE = `
@keyframes raft-ptr-material-rotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes raft-ptr-material-dash {
  0% {
    stroke-dasharray: 0.4 ${CIRCUMFERENCE};
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: ${CIRCUMFERENCE * 0.7} ${CIRCUMFERENCE};
    stroke-dashoffset: ${-CIRCUMFERENCE * 0.1};
  }
  100% {
    stroke-dasharray: ${CIRCUMFERENCE * 0.7} ${CIRCUMFERENCE};
    stroke-dashoffset: ${-CIRCUMFERENCE * 0.99};
  }
}

[data-slot="pull-to-refresh-material-progress"][data-state="refreshing"] {
  animation: raft-ptr-material-rotate 1.4s linear infinite;
}

[data-slot="pull-to-refresh-material-progress"][data-state="refreshing"] [data-material-indeterminate] {
  animation: raft-ptr-material-dash 1.4s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  [data-slot="pull-to-refresh-material-progress"][data-state="refreshing"],
  [data-slot="pull-to-refresh-material-progress"][data-state="refreshing"] [data-material-indeterminate] {
    animation: none;
  }

  [data-slot="pull-to-refresh-material-progress"][data-state="refreshing"] [data-material-indeterminate] {
    stroke-dasharray: ${CIRCUMFERENCE * 0.75} ${CIRCUMFERENCE};
  }
}
`;

const materialStyle = (
  <style href="raft-ui-pull-to-refresh-material" precedence="default">
    {MATERIAL_STYLE}
  </style>
);

const materialProgress = tv({
  slots: {
    root: ["size-10 shrink-0 overflow-visible", "text-info-strong"],
    determinate: [
      "transition-opacity duration-150 ease-out motion-reduce:transition-none",
      "opacity-30 data-armed:opacity-100",
    ],
    arc: ["fill-none stroke-current [stroke-linecap:butt]"],
    arrow: ["fill-current"],
    indeterminate: ["fill-none stroke-current [stroke-linecap:round]"],
  },
});

export type PullToRefreshMaterialProgressProps = {
  state: PullToRefreshState;
  progress: number;
};

export function PullToRefreshMaterialProgress({
  state,
  progress,
}: PullToRefreshMaterialProgressProps) {
  const { root, determinate, arc, arrow, indeterminate } = materialProgress();
  const refreshing = state === "refreshing";
  // A pull is armed exactly when its progress is 1 (no latch on Android).
  const armed = progress >= 1;
  const values = materialArc(refreshing ? 1 : progress);
  return (
    <svg
      data-slot="pull-to-refresh-material-progress"
      data-state={state}
      data-armed={!refreshing && armed ? "" : undefined}
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={root()}
    >
      {materialStyle}
      {refreshing ? (
        <circle
          data-material-indeterminate=""
          cx={CENTER}
          cy={CENTER}
          r={MATERIAL_ARC_RADIUS}
          strokeWidth={MATERIAL_STROKE_WIDTH}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
          className={indeterminate()}
        />
      ) : (
        <g data-armed={armed ? "" : undefined} className={determinate()}>
          <path
            data-material-arc=""
            d={arcPath(values)}
            strokeWidth={MATERIAL_STROKE_WIDTH}
            className={arc()}
          />
          {values.arrowScale > 0 && (
            <polygon
              data-material-arrow=""
              points={arrowPoints(values.arrowScale)}
              transform={`rotate(${values.endAngle - MATERIAL_STROKE_WIDTH} ${CENTER} ${CENTER})`}
              className={arrow()}
            />
          )}
        </g>
      )}
    </svg>
  );
}
