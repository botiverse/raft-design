import { Badge, type BadgeProps } from "@slock/ui";

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
      appearance="soft"
      variant={STATUS[status].variant as BadgeProps["variant"]}
      uppercase
      className="shrink-0"
    >
      {STATUS[status].label}
    </Badge>
  );
}
