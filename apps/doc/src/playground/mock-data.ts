export const PLAYGROUND_CHANNEL_IDS = [
  "proj-uiux",
  "incident-alerts",
  "release",
  "component-matrix",
  "dm-atlas",
  "new-channel",
] as const;

export type PlaygroundChannelId = (typeof PLAYGROUND_CHANNEL_IDS)[number];

export const DEFAULT_CHANNEL_ID: PlaygroundChannelId = "proj-uiux";

export type PlaygroundChannelKind = "channel" | "joint" | "private" | "dm-human" | "dm-agent";

export type PlaygroundChannel = {
  id: PlaygroundChannelId;
  /** Display name without the # prefix for channels; person/agent name for DMs. */
  name: string;
  kind: PlaygroundChannelKind;
  /** Header subtitle rendered under the main panel title. */
  subtitle: string;
  hasThread: boolean;
};

export const PLAYGROUND_CHANNELS: Record<PlaygroundChannelId, PlaygroundChannel> = {
  "proj-uiux": {
    id: "proj-uiux",
    name: "proj-uiux",
    kind: "channel",
    subtitle: "Design system migration",
    hasThread: true,
  },
  "incident-alerts": {
    id: "incident-alerts",
    name: "incident-alerts",
    kind: "channel",
    subtitle: "Delivery degraded — retries queued",
    hasThread: false,
  },
  release: {
    id: "release",
    name: "release",
    kind: "channel",
    subtitle: "Release coordination",
    hasThread: false,
  },
  "component-matrix": {
    id: "component-matrix",
    name: "component-matrix",
    kind: "channel",
    subtitle: "Message item state matrix",
    hasThread: false,
  },
  "dm-atlas": {
    id: "dm-atlas",
    name: "Atlas",
    kind: "dm-agent",
    subtitle: "planning",
    hasThread: true,
  },
  "new-channel": {
    id: "new-channel",
    name: "new-channel",
    kind: "channel",
    subtitle: "Just created",
    hasThread: false,
  },
};

export function isPlaygroundChannelId(value: string): value is PlaygroundChannelId {
  return (PLAYGROUND_CHANNEL_IDS as readonly string[]).includes(value);
}
