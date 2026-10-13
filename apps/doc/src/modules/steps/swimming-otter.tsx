import { useId, useLayoutEffect, useRef } from "react";

const OTTER_STYLES = `
.swimming-otter { overflow: visible; }
.swimming-otter * { transform-box: view-box; }
.swimming-otter__body { transform-origin: 24px 28px; }
.swimming-otter__arm { transform-origin: 29px 27px; }
.swimming-otter__ripple { opacity: 0; transform-origin: 6px 30.5px; }
@media (prefers-reduced-motion: no-preference) {
  .swimming-otter__body { animation: swimming-otter-bob 1.8s ease-in-out infinite alternate; }
  .swimming-otter__arm { animation: swimming-otter-paddle 0.9s ease-in-out infinite alternate; }
  .swimming-otter__wave { animation: swimming-otter-wave 1.2s linear infinite; }
  .swimming-otter__wave--back { animation-duration: 2s; }
  .swimming-otter__ripple { animation: swimming-otter-ripple 1.8s ease-out infinite; }
  .swimming-otter__ripple--late { animation-delay: 0.9s; }
  .swimming-otter--resting .swimming-otter__arm { animation: none; }
}
@keyframes swimming-otter-bob {
  from { transform: translateY(-0.6px) rotate(-3deg); }
  to { transform: translateY(1.2px) rotate(2deg); }
}
@keyframes swimming-otter-paddle {
  from { transform: rotate(-35deg); }
  to { transform: rotate(30deg); }
}
@keyframes swimming-otter-wave {
  to { transform: translateX(-12px); }
}
@keyframes swimming-otter-ripple {
  from { opacity: 0.8; transform: scale(0.4); }
  to { opacity: 0; transform: scale(1.6); }
}
`;

const WAVE_PATH = "M-12 30q3-1.6 6 0t6 0t6 0t6 0t6 0t6 0t6 0t6 0t6 0t6 0t6 0t6 0V48H-12Z";

/**
 * Where the last otter was when it left, so the next one to appear swims over
 * from there instead of popping up: the otter moves to another step by
 * unmounting from one marker and mounting in the next.
 */
let departure: { rect: DOMRect; time: number } | undefined;

const SWIM_MS = 900;

/** Swims the otter in from where the previous one left within the same update. */
function useSwimFromDeparture() {
  const ref = useRef<SVGSVGElement>(null);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const from = departure;
    departure = undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const to = node.getBoundingClientRect();
    const dx = from ? from.rect.left - to.left : 0;
    const dy = from ? from.rect.top - to.top : 0;
    // A remount in place (StrictMode replays effects) must not cancel the swim.
    const moved = Math.abs(dx) + Math.abs(dy) > 1;
    if (from && moved && performance.now() - from.time < 100 && !reduced) {
      node.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }],
        { duration: SWIM_MS, easing: "cubic-bezier(0.45, 0, 0.25, 1)" },
      );
    }
    return () => {
      departure = { rect: node.getBoundingClientRect(), time: performance.now() };
    };
  }, []);
  return ref;
}

/**
 * An otter floating on its back with a parcel on its belly, paddling with one
 * arm. `resting` stops the paddling once the parcel has arrived.
 */
export function SwimmingOtter({ resting = false }: { resting?: boolean }) {
  const ref = useSwimFromDeparture();
  const pondId = useId();
  const pond = `url(#${CSS.escape(pondId)})`;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      width="100%"
      height="100%"
      ref={ref}
      className={resting ? "swimming-otter swimming-otter--resting" : "swimming-otter"}
    >
      <style>{OTTER_STYLES}</style>
      <defs>
        <clipPath id={pondId}>
          <ellipse cx="24" cy="35" rx="23.5" ry="8" />
        </clipPath>
      </defs>
      {/* Lifted so the water line meets a river track through the marker's middle. */}
      <g transform="translate(0 -5)">
        <g clipPath={pond}>
          <path
            className="swimming-otter__wave swimming-otter__wave--back"
            d={WAVE_PATH}
            fill="oklch(0.88 0.07 215)"
            transform="translate(0 -1.5)"
          />
        </g>
        <ellipse
          className="swimming-otter__ripple"
          cx="6"
          cy="30.5"
          rx="5"
          ry="1.4"
          fill="none"
          stroke="oklch(1 0 0)"
          strokeWidth="0.8"
        />
        <ellipse
          className="swimming-otter__ripple swimming-otter__ripple--late"
          cx="6"
          cy="30.5"
          rx="5"
          ry="1.4"
          fill="none"
          stroke="oklch(1 0 0)"
          strokeWidth="0.8"
        />
        <g className="swimming-otter__body">
          <path d="M13 26.5Q6 26.5 1.5 30.5Q7 32 13 31Z" fill="oklch(0.42 0.06 55)" />
          <ellipse
            cx="11"
            cy="21.5"
            rx="1.9"
            ry="3"
            fill="oklch(0.42 0.06 55)"
            transform="rotate(-25 11 21.5)"
          />
          <ellipse
            cx="14.5"
            cy="20.5"
            rx="1.9"
            ry="3"
            fill="oklch(0.42 0.06 55)"
            transform="rotate(-10 14.5 20.5)"
          />
          <g className="swimming-otter__arm">
            <path
              d="M29 27q4 3.5 2.5 8"
              fill="none"
              stroke="oklch(0.42 0.06 55)"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </g>
          <ellipse cx="22" cy="28" rx="12" ry="6.5" fill="oklch(0.5 0.07 55)" />
          <ellipse cx="22" cy="25" rx="9" ry="3.6" fill="oklch(0.8 0.06 70)" />
          <rect
            x="16.5"
            y="16.5"
            width="9"
            height="7"
            rx="0.8"
            fill="oklch(0.78 0.12 75)"
            stroke="oklch(0.42 0.06 55)"
            strokeWidth="0.8"
          />
          <path d="M21 16.5v7M16.5 19.5h9" stroke="oklch(0.63 0.11 65)" strokeWidth="0.8" />
          <ellipse
            cx="26.5"
            cy="21"
            rx="1.7"
            ry="2.4"
            fill="oklch(0.42 0.06 55)"
            transform="rotate(30 26.5 21)"
          />
          <circle cx="31.5" cy="17.3" r="1.8" fill="oklch(0.42 0.06 55)" />
          <circle cx="35" cy="23" r="7" fill="oklch(0.5 0.07 55)" />
          <ellipse cx="39" cy="25" rx="4.2" ry="3.2" fill="oklch(0.87 0.05 75)" />
          <circle cx="36.3" cy="20.6" r="1.1" fill="oklch(0.22 0.03 45)" />
          <circle cx="36.7" cy="20.2" r="0.35" fill="oklch(1 0 0)" />
          <ellipse cx="42.6" cy="23.6" rx="1.4" ry="1.1" fill="oklch(0.22 0.03 45)" />
          <path
            d="M39.6 26.6q1 0.9 2.1 0"
            fill="none"
            stroke="oklch(0.22 0.03 45)"
            strokeWidth="0.7"
            strokeLinecap="round"
          />
          <path
            d="M41 25.2l4.2-0.8M41 26l4.2 0.6"
            stroke="oklch(0.42 0.06 55)"
            strokeWidth="0.4"
            strokeLinecap="round"
          />
        </g>
        <g clipPath={pond}>
          <path
            className="swimming-otter__wave"
            d={WAVE_PATH}
            fill="oklch(0.78 0.11 220)"
            fillOpacity="0.9"
          />
        </g>
      </g>
    </svg>
  );
}
