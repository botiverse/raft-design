import { useId } from "react";
import type { StepStatus } from "raft-ui";

const OTTER_STYLES = `
.otter-indicator { overflow: visible; }
.otter-indicator * { transform-box: view-box; }
.otter-indicator__body { transform-origin: 24px 28px; }
.otter-indicator__arm { transform-origin: 29px 27px; }
.otter-indicator__ripple { opacity: 0; transform-origin: 6px 30.5px; }
.otter-indicator__z { opacity: 0; }
.otter-indicator__parcel--adrift { transform-origin: 6px 25px; }
@media (prefers-reduced-motion: no-preference) {
  .otter-indicator__wave { animation: otter-indicator-wave 1.2s linear infinite; }
  .otter-indicator__wave--back { animation-duration: 2s; }
  .otter-indicator--process .otter-indicator__body { animation: otter-indicator-bob 1.8s ease-in-out infinite alternate; }
  .otter-indicator--process .otter-indicator__arm { animation: otter-indicator-paddle 0.9s ease-in-out infinite alternate; }
  .otter-indicator--process .otter-indicator__ripple { animation: otter-indicator-ripple 1.8s ease-out infinite; }
  .otter-indicator--process .otter-indicator__ripple--late { animation-delay: 0.9s; }
  .otter-indicator--finish .otter-indicator__wave { animation-duration: 3s; }
  .otter-indicator--finish .otter-indicator__body { animation: otter-indicator-bob 3.2s ease-in-out infinite alternate; }
  .otter-indicator--wait .otter-indicator__body { animation: otter-indicator-breathe 2.4s ease-in-out infinite alternate; }
  .otter-indicator--wait .otter-indicator__z { animation: otter-indicator-z 2.4s ease-out infinite; }
  .otter-indicator--wait .otter-indicator__z--late { animation-delay: 1.2s; }
  .otter-indicator--error .otter-indicator__body { animation: otter-indicator-shiver 0.18s linear infinite alternate; }
  .otter-indicator--error .otter-indicator__parcel--adrift { animation: otter-indicator-drift 2s ease-in-out infinite alternate; }
}
@media (prefers-reduced-motion: reduce) {
  .otter-indicator__z { opacity: 1; }
}
@keyframes otter-indicator-bob {
  from { transform: translateY(-0.6px) rotate(-3deg); }
  to { transform: translateY(1.2px) rotate(2deg); }
}
@keyframes otter-indicator-paddle {
  from { transform: rotate(-35deg); }
  to { transform: rotate(30deg); }
}
@keyframes otter-indicator-wave {
  to { transform: translateX(-12px); }
}
@keyframes otter-indicator-ripple {
  from { opacity: 0.8; transform: scale(0.4); }
  to { opacity: 0; transform: scale(1.6); }
}
@keyframes otter-indicator-breathe {
  from { transform: scale(1, 1); }
  to { transform: scale(1.02, 1.05); }
}
@keyframes otter-indicator-z {
  from { opacity: 0; transform: translate(0, 0); }
  30% { opacity: 1; }
  to { opacity: 0; transform: translate(4px, -7px); }
}
@keyframes otter-indicator-shiver {
  from { transform: translateX(-0.4px); }
  to { transform: translateX(0.4px); }
}
@keyframes otter-indicator-drift {
  from { transform: translate(0, 0) rotate(-18deg); }
  to { transform: translate(-1.5px, 1.2px) rotate(-8deg); }
}
`;

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

/**
 * An otter on its back for a step marker, one pose per status:
 * - `wait`: asleep on the dry bank, the parcel still on its belly.
 * - `process`: afloat, paddling with one arm, the parcel on its belly.
 * - `finish`: drifting at ease, hugging the delivered parcel.
 * - `error`: shivering in the water; the parcel has slipped away.
 */
export function OtterIndicator({ status }: { status: StepStatus }) {
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
      className={`otter-indicator otter-indicator--${status}`}
    >
      <style>{OTTER_STYLES}</style>
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
              className="otter-indicator__wave otter-indicator__wave--back"
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
          ["", " otter-indicator__ripple--late"].map((late) => (
            <ellipse
              key={late}
              className={`otter-indicator__ripple${late}`}
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
          <g className="otter-indicator__parcel--adrift">
            <Parcel x={1.5} y={22} />
          </g>
        )}
        <g className="otter-indicator__body">
          <path d="M13 26.5Q6 26.5 1.5 30.5Q7 32 13 31Z" fill={FUR_DARK} />
          <ellipse
            cx="11"
            cy="21.5"
            rx="1.9"
            ry="3"
            fill={FUR_DARK}
            transform="rotate(-25 11 21.5)"
          />
          <ellipse
            cx="14.5"
            cy="20.5"
            rx="1.9"
            ry="3"
            fill={FUR_DARK}
            transform="rotate(-10 14.5 20.5)"
          />
          {/* Paddles while working; rests on the belly otherwise. */}
          <g className="otter-indicator__arm">
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
          <ellipse
            cx="26.5"
            cy="21"
            rx="1.7"
            ry="2.4"
            fill={FUR_DARK}
            transform="rotate(30 26.5 21)"
          />
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
        {wet && (
          <g clipPath={pond}>
            <path
              className="otter-indicator__wave"
              d={WAVE_PATH}
              fill="oklch(0.78 0.11 220)"
              fillOpacity="0.9"
            />
          </g>
        )}
        {status === "wait" &&
          ["", " otter-indicator__z--late"].map((late, i) => (
            <text
              key={late}
              className={`otter-indicator__z${late}`}
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
