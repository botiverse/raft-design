import type { ReactNode } from "react";

const ICON_SWAP_STYLES = `
:root {
  --icon-swap-dur: 170ms;
  --icon-swap-blur: 1px;
  --icon-swap-start-scale: 0.72;
  --icon-swap-ease: cubic-bezier(0.16, 1, 0.3, 1);
}

.t-icon-swap {
  position: relative;
  display: inline-grid;
}
.t-icon-swap .t-icon {
  grid-area: 1 / 1;
  transition:
    opacity var(--icon-swap-dur) var(--icon-swap-ease),
    filter var(--icon-swap-dur) var(--icon-swap-ease),
    transform var(--icon-swap-dur) var(--icon-swap-ease);
  will-change: opacity, filter, transform;
}
.t-icon-swap[data-state="a"] .t-icon[data-icon="a"],
.t-icon-swap[data-state="b"] .t-icon[data-icon="b"] {
  opacity: 1;
  filter: blur(0);
  transform: scale(1);
}
.t-icon-swap[data-state="a"] .t-icon[data-icon="b"],
.t-icon-swap[data-state="b"] .t-icon[data-icon="a"] {
  opacity: 0;
  filter: blur(var(--icon-swap-blur));
  transform: scale(var(--icon-swap-start-scale));
}

@media (prefers-reduced-motion: reduce) {
  .t-icon-swap .t-icon {
    transition: none !important;
  }
}
`;

const ICON_SWAP_STYLE_ID = "docs-icon-swap-styles";

if (typeof document !== "undefined" && !document.getElementById(ICON_SWAP_STYLE_ID)) {
  const style = document.createElement("style");
  style.id = ICON_SWAP_STYLE_ID;
  style.textContent = ICON_SWAP_STYLES;
  document.head.appendChild(style);
}

type IconSwapProps = {
  state: "a" | "b";
  iconA: ReactNode;
  iconB: ReactNode;
  className?: string;
  "aria-hidden"?: boolean;
};

export function IconSwap({
  state,
  iconA,
  iconB,
  className,
  "aria-hidden": ariaHidden,
}: IconSwapProps) {
  return (
    <span
      className={["t-icon-swap", className].filter(Boolean).join(" ")}
      data-state={state}
      aria-hidden={ariaHidden}
    >
      <span className="t-icon inline-flex" data-icon="a">
        {iconA}
      </span>
      <span className="t-icon inline-flex" data-icon="b">
        {iconB}
      </span>
    </span>
  );
}
