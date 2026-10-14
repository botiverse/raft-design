import { useId } from "react";
import type { ComponentPropsWithRef } from "react";
import { cn } from "../../lib/cn";
import type { StepStatus } from "./steps";
import "./otter-indicator.css";

const WAVE_PATH = "M-12 30q3-1.6 6 0t6 0t6 0t6 0t6 0t6 0t6 0t6 0t6 0t6 0t6 0t6 0V48H-12Z";

const FUR = "oklch(0.5 0.07 55)";
const FUR_DARK = "oklch(0.42 0.06 55)";
const INK = "oklch(0.22 0.03 45)";
const WHITE = "oklch(1 0 0)";

function Parcel({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        width="9"
        height="7"
        rx="0.8"
        fill="oklch(0.78 0.12 75)"
        stroke={FUR_DARK}
        strokeWidth="0.8"
      />
      <path d="M4.5 0v7M0 3h9" stroke="oklch(0.63 0.11 65)" strokeWidth="0.8" />
    </g>
  );
}

/** The face changes with the step: asleep, paddling, pleased or upset. */
function Face({ status }: { status: StepStatus }) {
  const line = { fill: "none", stroke: INK, strokeWidth: 0.8, strokeLinecap: "round" } as const;
  return (
    <>
      {status === "process" && (
        <>
          <circle cx="36.3" cy="20.6" r="1.1" fill={INK} />
          <circle cx="36.7" cy="20.2" r="0.35" fill={WHITE} />
        </>
      )}
      {/* Closed, sleeping. */}
      {status === "wait" && <path d="M35.2 20.6q1.1 0.9 2.2 0" {...line} />}
      {/* Closed, smiling: ^ */}
      {status === "finish" && (
        <>
          <path d="M35.2 21.2q1.1-1.3 2.2 0" {...line} />
          <ellipse cx="38.6" cy="22.4" rx="1.3" ry="0.8" fill="oklch(0.8 0.1 20)" opacity="0.8" />
        </>
      )}
      {/* Wide-eyed under a worried brow. */}
      {status === "error" && (
        <>
          <circle cx="36.3" cy="20.8" r="1.2" fill={WHITE} stroke={INK} strokeWidth="0.5" />
          <circle cx="36.5" cy="21" r="0.55" fill={INK} />
          <path d="M34.6 18.2l2.8 0.8" {...line} />
        </>
      )}
      <ellipse cx="42.6" cy="23.6" rx="1.4" ry="1.1" fill={INK} />
      <path
        d={status === "error" ? "M39.6 27.2q1-0.9 2.1 0" : "M39.6 26.6q1 0.9 2.1 0"}
        {...line}
        strokeWidth={0.7}
      />
      <path
        d="M41 25.2l4.2-0.8M41 26l4.2 0.6"
        stroke={FUR_DARK}
        strokeWidth="0.4"
        strokeLinecap="round"
      />
    </>
  );
}

/** A small badge above the head: ✓ when done, ! when failed. */
function Badge({ status }: { status: StepStatus }) {
  if (status !== "finish" && status !== "error") return null;
  const color = status === "finish" ? "var(--success)" : "var(--danger)";
  return (
    <g transform="translate(43 9)">
      <circle r="4.6" fill={color} stroke={WHITE} strokeWidth="1" />
      {status === "finish" ? (
        <path
          d="M-2 0l1.4 1.5L2.1-1.4"
          fill="none"
          stroke={WHITE}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path d="M0-2.4v2.6M0 2.1v0.1" stroke={WHITE} strokeWidth="1.3" strokeLinecap="round" />
      )}
    </g>
  );
}

/** The otter on its back, posed by the step: paddling, at ease, upset or asleep. */
function OtterBody({ status }: { status: StepStatus }) {
  return (
    <g className="r-otter-indicator__body">
      <path d="M13 26.5Q6 26.5 1.5 30.5Q7 32 13 31Z" fill={FUR_DARK} />
      <ellipse cx="11" cy="21.5" rx="1.9" ry="3" fill={FUR_DARK} transform="rotate(-25 11 21.5)" />
      <ellipse
        cx="14.5"
        cy="20.5"
        rx="1.9"
        ry="3"
        fill={FUR_DARK}
        transform="rotate(-10 14.5 20.5)"
      />
      {/* Paddles while working; rests on the belly otherwise. */}
      <g className="r-otter-indicator__arm">
        <path
          d={status === "process" ? "M29 27q4 3.5 2.5 8" : "M29 26q3 0.5 4-2"}
          fill="none"
          stroke={FUR_DARK}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      </g>
      <ellipse cx="22" cy="28" rx="12" ry="6.5" fill={FUR} />
      <ellipse cx="22" cy="25" rx="9" ry="3.6" fill="oklch(0.8 0.06 70)" />
      {status !== "error" && <Parcel x={16.5} y={16.5} />}
      <ellipse cx="26.5" cy="21" rx="1.7" ry="2.4" fill={FUR_DARK} transform="rotate(30 26.5 21)" />
      {/* Hugging the delivered parcel with the other paw too. */}
      {status === "finish" && (
        <ellipse
          cx="16"
          cy="21.5"
          rx="1.6"
          ry="2.2"
          fill={FUR_DARK}
          transform="rotate(-30 16 21.5)"
        />
      )}
      <circle cx="31.5" cy="17.3" r="1.8" fill={FUR_DARK} />
      <circle cx="35" cy="23" r="7" fill={FUR} />
      <ellipse cx="39" cy="25" rx="4.2" ry="3.2" fill="oklch(0.87 0.05 75)" />
      <Face status={status} />
      {status === "error" && (
        <path d="M37.4 22.3q-0.8 1.4 0 1.9q0.8-0.5 0-1.9Z" fill="oklch(0.8 0.08 230)" />
      )}
    </g>
  );
}

export interface OtterIndicatorProps extends Omit<ComponentPropsWithRef<"svg">, "children"> {
  status: StepStatus;
}

/**
 * An otter on its back for a step marker, one pose per status:
 * - `wait`: asleep on the dry bank, the parcel still on its belly.
 * - `process`: afloat, paddling with one arm, the parcel on its belly.
 * - `finish`: drifting at ease, hugging the delivered parcel.
 * - `error`: shivering in the water; the parcel has slipped away.
 *
 * Made for `<Steps renderIndicator>` with room to show it, e.g.
 * `--r-steps-indicator-size: 48px`; on a vertical river track set
 * `--r-steps-river-overlap-start: 12px` and `--r-steps-river-overlap-end: 28px`
 * so the channel meets the ponds.
 */
export function OtterIndicator({ status, className, ...props }: OtterIndicatorProps) {
  // `useId` may contain characters that are not valid in a `url(#…)` reference.
  const pondId = `otter-pond${useId().replace(/[^\w-]/g, "")}`;
  const pond = `url(#${pondId})`;
  const wet = status !== "wait";
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      width="100%"
      height="100%"
      data-slot="otter-indicator"
      {...props}
      className={cn("r-otter-indicator", `r-otter-indicator--${status}`, className)}
    >
      <defs>
        <clipPath id={pondId}>
          <ellipse cx="24" cy="35" rx="23.5" ry="8" />
        </clipPath>
      </defs>
      {/* Lifted so the water line meets a river track through the marker's middle. */}
      <g transform="translate(0 -5)">
        {wet ? (
          <g clipPath={pond}>
            <path
              className="r-otter-indicator__wave r-otter-indicator__wave--back"
              d={WAVE_PATH}
              fill="oklch(0.88 0.07 215)"
              transform="translate(0 -1.5)"
            />
          </g>
        ) : (
          // The dry bank, with a pebble or two.
          <g>
            <ellipse cx="24" cy="34" rx="22" ry="5.5" fill="oklch(0.9 0.06 85)" />
            <ellipse cx="7" cy="34.5" rx="1.6" ry="1" fill="oklch(0.78 0.06 75)" />
            <ellipse cx="41" cy="35.5" rx="1.2" ry="0.8" fill="oklch(0.78 0.06 75)" />
          </g>
        )}
        {status === "process" &&
          ["", " r-otter-indicator__ripple--late"].map((late) => (
            <ellipse
              key={late}
              className={`r-otter-indicator__ripple${late}`}
              cx="6"
              cy="30.5"
              rx="5"
              ry="1.4"
              fill="none"
              stroke={WHITE}
              strokeWidth="0.8"
            />
          ))}
        {status === "error" && (
          <g className="r-otter-indicator__parcel--adrift">
            <Parcel x={1.5} y={22} />
          </g>
        )}
        <OtterBody status={status} />
        {wet && (
          <g clipPath={pond}>
            <path
              className="r-otter-indicator__wave"
              d={WAVE_PATH}
              fill="oklch(0.78 0.11 220)"
              fillOpacity="0.9"
            />
          </g>
        )}
        {status === "wait" &&
          ["", " r-otter-indicator__z--late"].map((late, i) => (
            <text
              key={late}
              className={`r-otter-indicator__z${late}`}
              x={i === 0 ? 38 : 43}
              y={i === 0 ? 15 : 9}
              fontSize={i === 0 ? 9 : 7}
              fontWeight="700"
              fill="var(--foreground-muted, currentColor)"
            >
              z
            </text>
          ))}
      </g>
      <Badge status={status} />
    </svg>
  );
}

export interface OtterTravelerProps extends Omit<ComponentPropsWithRef<"svg">, "children"> {
  /** The status of the step the otter is heading for. */
  status: StepStatus;
}

/**
 * The otter afloat in the river itself, for `<Steps track="river"
 * renderTraveler>`: a splash of the channel's own water laps over its belly, red when the
 * step ahead failed. Posed like `OtterIndicator`: paddling toward the step in
 * progress, shivering with the parcel adrift short of a failed step, hugging
 * the parcel at ease once every step is done.
 *
 * Fits `--r-steps-traveler-size` around 40–48px with a 12px channel.
 */
export function OtterTraveler({ status, className, ...props }: OtterTravelerProps) {
  // `useId` may contain characters that are not valid in a `url(#…)` reference.
  const bandId = `otter-band${useId().replace(/[^\w-]/g, "")}`;
  const water =
    status === "error"
      ? "var(--r-steps-river-error-color, var(--danger))"
      : "var(--r-steps-river-water-color, oklch(0.78 0.11 220))";
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      width="100%"
      height="100%"
      data-slot="otter-traveler"
      {...props}
      className={cn(
        "r-otter-indicator",
        "r-otter-traveler",
        `r-otter-indicator--${status}`,
        className,
      )}
    >
      <defs>
        {/* A splash around the otter, level with a channel through the box's middle. */}
        <clipPath id={bandId}>
          <ellipse cx="23" cy="26" rx="17" ry="5" />
        </clipPath>
      </defs>
      <g transform="translate(0 -3)">
        {status === "process" &&
          ["", " r-otter-indicator__ripple--late"].map((late) => (
            <ellipse
              key={late}
              className={`r-otter-indicator__ripple${late}`}
              cx="6"
              cy="30.5"
              rx="5"
              ry="1.4"
              fill="none"
              stroke={WHITE}
              strokeWidth="0.8"
            />
          ))}
        {status === "error" && (
          <g className="r-otter-indicator__parcel--adrift">
            <Parcel x={1.5} y={22} />
          </g>
        )}
        <OtterBody status={status} />
      </g>
      {status !== "wait" && (
        <g clipPath={`url(#${bandId})`}>
          <path
            className="r-otter-indicator__wave"
            d={WAVE_PATH}
            fill={water}
            transform="translate(0 -6)"
          />
        </g>
      )}
      <Badge status={status} />
    </svg>
  );
}
