import { Badge } from "raft-ui";
import type { BadgeProps } from "raft-ui";

// Progress badges. An item carries its status until it drops the badge once done.
const STATUS = {
  "in-progress": { label: "WIP", variant: "primary" },
  review: { label: "Review", variant: "information" },
} as const;

export type StatusKey = keyof typeof STATUS;

export function StatusBadge({ status }: { status?: StatusKey }) {
  if (!status) return null;
  return (
    <Badge
      appearance="solid"
      variant={STATUS[status].variant as BadgeProps["variant"]}
      className="h-4 shrink-0 px-1.5 text-[9px]"
    >
      {STATUS[status].label}
    </Badge>
  );
}
