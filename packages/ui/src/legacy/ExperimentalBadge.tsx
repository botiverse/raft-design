import type { HTMLAttributes } from "react";
import { Badge } from "./Badge";

export interface ExperimentalBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  // Callers can add positional tweaks (e.g. `-translate-y-px` inside a
  // PanelHeader title row) — but the visual identity (lime tone +
  // brutal Badge's label typography) is owned by Badge so every
  // Experimental surface stays visually identical.
}

export function ExperimentalBadge({ className = "", ...props }: ExperimentalBadgeProps) {
  return (
    <Badge tone="lime" className={className} {...props}>
      Experimental
    </Badge>
  );
}

export default ExperimentalBadge;
