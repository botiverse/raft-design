import type { StatusProps } from "raft-ui";

import type { PlaygroundPresence } from "../mock/index.ts";

export const PLAYGROUND_PRESENCE_STATUS = {
  online: { label: "Online", variant: "success" },
  working: { label: "Working…", variant: "success" },
  idle: { label: "Idle", variant: "warning" },
  offline: { label: "Offline", variant: "default" },
} satisfies Record<
  PlaygroundPresence,
  {
    label: string;
    variant: NonNullable<StatusProps["variant"]>;
  }
>;
