import { Badge } from "raft-ui";

export type ComponentStatus = "experimental" | "stable" | "deprecated";

const STATUS_LABEL: Record<
  ComponentStatus,
  { label: string; variant: "information" | "success" | "muted" }
> = {
  experimental: { label: "Experimental", variant: "information" },
  stable: { label: "Stable", variant: "success" },
  deprecated: { label: "Deprecated", variant: "muted" },
};

/**
 * Lifecycle label. Colors reuse the task status meanings: cyan is in
 * progress, lime is done, stone is closed. Stable is the default and is only
 * labelled on the page itself, never in lists.
 */
export function StatusLabel({ status }: { status: ComponentStatus }) {
  const { label, variant } = STATUS_LABEL[status];
  return (
    <Badge appearance="soft" variant={variant}>
      {label}
    </Badge>
  );
}
