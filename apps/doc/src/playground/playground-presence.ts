import type { StatusProps } from "raft-ui";

import type { PlaygroundPresence } from "./mock/index.ts";

export const PLAYGROUND_PRESENCE_STATUS = {
  online: { label: "Online", variant: "success", pulse: false },
  working: { label: "Working…", variant: "success", pulse: true },
  idle: { label: "Idle", variant: "warning", pulse: false },
  offline: { label: "Offline", variant: "default", pulse: false },
} satisfies Record<
  PlaygroundPresence,
  {
    label: string;
    variant: NonNullable<StatusProps["variant"]>;
    pulse?: boolean;
  }
>;
