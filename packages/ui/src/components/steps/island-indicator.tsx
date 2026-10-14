import type { ComponentPropsWithRef } from "react";
import { cn } from "../../lib/cn";
import { RaftLogo } from "../logo";
import type { StepStatus } from "./steps";
import "./island-indicator.css";

const SAND = "oklch(0.9 0.07 85)";
const SAND_SHADE = "oklch(0.8 0.08 75)";
const SHALLOWS = "oklch(0.88 0.06 215)";
const PALM_TRUNK = "oklch(0.55 0.07 60)";
const PALM_LEAF = "oklch(0.62 0.13 145)";
const PALM_LEAF_DARK = "oklch(0.52 0.12 150)";
const POLE = "oklch(0.35 0.03 50)";
const INK = "oklch(0.2 0.02 60)";
const WHITE = "oklch(1 0 0)";

/** A short palm leaning over the island's left shoulder. */
function Palm() {
  return (
    <g>
      <path
        d="M14.5 29q-0.6-6.5 1.6-12.5"
        fill="none"
        stroke={PALM_TRUNK}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M16.1 16.5q-5-2.6-8.6 1.2q4.4-1.2 8.6-1.2Z" fill={PALM_LEAF_DARK} />
      <path d="M16.1 16.5q-2.4-4.6-7.2-4q3.6 1.2 7.2 4Z" fill={PALM_LEAF} />
      <path d="M16.1 16.5q2.6-4.4 7.4-3.4q-4 0.8-7.4 3.4Z" fill={PALM_LEAF} />
      <path d="M16.1 16.5q5.2-0.6 7.4 3.6q-3.4-2.4-7.4-3.6Z" fill={PALM_LEAF_DARK} />
      <circle cx="16.6" cy="17.6" r="0.9" fill="oklch(0.45 0.07 55)" />
    </g>
  );
}

/** The flag over a finished step: the Raft mark on Raft yellow, waving. */
function RaftFlag() {
  return (
    <g>
      <path d="M30 29V6" stroke={POLE} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="30" cy="5.6" r="1.1" fill="oklch(0.78 0.13 85)" />
      <g className="r-island-indicator__flag">
        <path
          d="M30.7 6.6h14.6q-1.6 4.6 0 9.6H30.7Z"
          fill="oklch(0.87 0.16 90)"
          stroke={INK}
          strokeWidth="0.7"
          strokeLinejoin="round"
        />
        <RaftLogo x="34" y="7.9" width="8.2" height="7.5" />
      </g>
    </g>
  );
}

export interface IslandIndicatorProps extends Omit<ComponentPropsWithRef<"svg">, "children"> {
  status: StepStatus;
}

/**
 * A small island for a step marker on a river track, one look per status:
 * - `wait`: a quiet island ahead, its shallows dry.
 * - `process`: the island the water is heading for, its shore ringed.
 * - `finish`: reached, with the Raft flag planted.
 * - `error`: a plain island; the river says the step failed.
 *
 * Made for `<Steps track="river" renderIndicator>` with room to show it, e.g.
 * `--r-steps-indicator-size: 48px` and `--r-steps-connector-gap: 0px`, so the
 * channel runs into the shallows. Pair it with a traveler such as
 * `OtterIndicator` in `renderTraveler`. On a vertical track set
 * `--r-steps-river-overlap-start` and `--r-steps-river-overlap-end` to about
 * 14px so the channel meets the shallows.
 */
export function IslandIndicator({ status, className, ...props }: IslandIndicatorProps) {
  const dry = status === "wait";
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      width="100%"
      height="100%"
      data-slot="island-indicator"
      {...props}
      className={cn("r-island-indicator", `r-island-indicator--${status}`, className)}
    >
      {/* The shallows, level with a river track through the marker's middle. */}
      <ellipse
        cx="24"
        cy="29"
        rx="23"
        ry="8"
        fill={dry ? SAND_SHADE : SHALLOWS}
        opacity={dry ? 0.45 : 1}
      />
      {status === "process" && (
        <ellipse
          className="r-island-indicator__ring"
          cx="24"
          cy="29"
          rx="20"
          ry="6.6"
          fill="none"
          stroke={WHITE}
          strokeWidth="1"
        />
      )}
      <path d="M5 29.5Q8 20.5 24 20Q40 20.5 43 29.5Q24 34.5 5 29.5Z" fill={SAND} />
      <path d="M5 29.5Q24 34.5 43 29.5Q40 32.8 24 33.2Q8 32.8 5 29.5Z" fill={SAND_SHADE} />
      <ellipse cx="34.5" cy="25" rx="1.3" ry="0.7" fill={SAND_SHADE} />
      <ellipse cx="22" cy="27.5" rx="1" ry="0.55" fill={SAND_SHADE} />
      <Palm />
      {status === "finish" && <RaftFlag />}
    </svg>
  );
}
