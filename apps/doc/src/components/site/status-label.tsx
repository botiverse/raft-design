import { Badge } from "@botiverse/raft-ui";

import { useMessages } from "#/lib/i18n/use-locale.ts";

export type ComponentStatus = "experimental" | "stable" | "deprecated";

const STATUS_VARIANT: Record<ComponentStatus, "information" | "success" | "muted"> = {
  experimental: "information",
  stable: "success",
  deprecated: "muted",
};

/**
 * Lifecycle label. Colors reuse the task status meanings: cyan is in
 * progress, lime is done, stone is closed. Stable is the default and is only
 * labelled on the page itself, never in lists.
 */
export function StatusLabel({ status }: { status: ComponentStatus }) {
  const messages = useMessages();
  return (
    <Badge appearance="soft" variant={STATUS_VARIANT[status]}>
      {messages[status]}
    </Badge>
  );
}
