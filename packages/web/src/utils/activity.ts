import type { AgentActivity } from "@slock-ai/shared";

/**
 * Maps agent activity state → Tailwind CSS classes for the status dot.
 */
export function getActivityDotClass(activity: AgentActivity): string {
  switch (activity) {
    case "online":
      return "bg-brutal-lime";
    case "thinking":
      return "bg-brutal-yellow animate-pulse";
    case "working":
      return "bg-brutal-yellow animate-pulse";
    case "error":
      return "bg-brutal-orange";
    case "offline":
    default:
      return "bg-gray-400";
  }
}

/**
 * Maps agent activity state → short display label for sidebar etc.
 * Returns null for "online" (the default/idle state needs no label).
 */
export function getActivityLabel(activity: AgentActivity, detail?: string): string | null {
  switch (activity) {
    case "thinking":
      return "Thinking\u2026";
    case "working":
      return detail || "Working\u2026";
    case "error":
      return "Error";
    case "offline":
      return detail === "Stopped" ? "Stopped" : "Offline";
    default:
      return null;
  }
}

/**
 * Maps agent activity state → full display text (always returns a string).
 * When detail is provided and applicable, shows the granular label.
 */
export function getActivityText(activity: AgentActivity, detail?: string): string {
  switch (activity) {
    case "online":
      return "Online";
    case "thinking":
      return "Thinking\u2026";
    case "working":
      return detail || "Working\u2026";
    case "error":
      return detail ? `Error: ${detail}` : "Error";
    case "offline":
      return detail === "Stopped" ? "Stopped — won't receive messages until restarted" : "Offline";
    default:
      return activity;
  }
}
