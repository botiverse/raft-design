/**
 * The five status lights of the design system. Each colour is a fixed
 * meaning: online green, busy (an agent at work) yellow, error orange,
 * offline stone, an external agent cyan. One map, read by Status and by the
 * avatar's dot through the same `--status-color`.
 */
export const PRESENCE_COLOR = {
  online: "[--status-color:var(--presence-online)]",
  busy: "[--status-color:var(--presence-busy)]",
  error: "[--status-color:var(--presence-error)]",
  offline: "[--status-color:var(--presence-offline)]",
  external: "[--status-color:var(--presence-external)]",
} as const;

export type Presence = keyof typeof PRESENCE_COLOR;
