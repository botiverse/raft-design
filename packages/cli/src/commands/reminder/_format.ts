// Canonical reminder formatting for agent-facing output.
// Must match the MCP chat-bridge's formatReminder output exactly —
// this is an AX contract, not an implementation detail.

import type { ReminderEventSummary, ReminderSummary } from "@slock-ai/shared";

const MODIFY_HINT = "(to modify: snooze/update/cancel; slock reminder --help)";

export function formatReminder(r: ReminderSummary): string {
  const ref = r.msgRef ? ` ref=${r.msgRef}` : "";
  const timeField = r.status === "fired"
    ? `fired_at=${r.firedAt ?? r.fireAt}`
    : `next=${r.fireAt}`;
  return `#${r.reminderId.slice(0, 8)} [${r.status}] ${formatReminderType(r)} ${timeField} "${r.title}"${ref}`;
}

export function formatReminderScheduled(r: ReminderSummary, warning?: string | null): string {
  const lines = [
    `Reminder scheduled: #${r.reminderId.slice(0, 8)} ${formatReminderType(r)} "${r.title}"`,
    `Next: ${r.fireAt}`,
    MODIFY_HINT,
  ];
  if (warning) lines.push(`Warning: ${warning}`);
  return lines.join("\n");
}

export function formatReminderList(reminders: ReminderSummary[]): string {
  if (reminders.length === 0) return "No reminders.";
  return reminders.map(formatReminder).join("\n");
}

export function formatReminderCanceled(r: ReminderSummary): string {
  return `Reminder canceled: #${r.reminderId.slice(0, 8)} [${r.status}] "${r.title}"`;
}

export function formatReminderSnoozed(r: ReminderSummary): string {
  return [
    `Reminder snoozed: #${r.reminderId.slice(0, 8)} ${formatReminderType(r)} "${r.title}"`,
    `Next: ${r.fireAt}`,
    MODIFY_HINT,
  ].join("\n");
}

export function formatReminderUpdated(r: ReminderSummary, warning?: string | null): string {
  const lines = [
    `Reminder updated: #${r.reminderId.slice(0, 8)} ${formatReminderType(r)} "${r.title}"`,
    `Next: ${r.fireAt}`,
    MODIFY_HINT,
  ];
  if (warning) lines.push(`Warning: ${warning}`);
  return lines.join("\n");
}

export function formatReminderLog(events: ReminderEventSummary[]): string {
  if (events.length === 0) return "No reminder events.";
  return events.map((event) => {
    const next = event.nextFireAt ? ` next=${event.nextFireAt}` : " next=none";
    return `${event.occurredAt} ${event.eventType.toUpperCase()} by ${event.actorType}${event.actorId ? `:${event.actorId}` : ""}${next}`;
  }).join("\n");
}

function formatReminderType(r: ReminderSummary): string {
  if (!r.recurrence) return "(one-time)";
  return `(recurring · ${r.recurrence.description})`;
}
