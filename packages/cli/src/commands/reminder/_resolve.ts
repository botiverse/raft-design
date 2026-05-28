import type { ReminderStatus, ReminderSummary } from "@slock-ai/shared";
import type { ApiClient } from "../../client.js";
import { fail } from "../../output.js";

export async function resolveReminderId(
  client: ApiClient,
  agentId: string,
  id: string,
  opts: {
    statuses?: ReminderStatus[];
    all?: boolean;
    failureCode: string;
  },
): Promise<string> {
  const trimmed = id.trim();
  if (!trimmed) fail("INVALID_ARG", "--id is required");
  if (trimmed.length >= 32) return trimmed;

  const params = new URLSearchParams();
  if (opts.all) {
    params.set("all", "true");
  } else if (opts.statuses && opts.statuses.length > 0) {
    params.set("status", opts.statuses.join(","));
  }
  const query = params.toString();
  const res = await client.request<{ reminders: ReminderSummary[] }>(
    "GET",
    `/internal/agent/${encodeURIComponent(agentId)}/reminders${query ? `?${query}` : ""}`,
  );
  if (!res.ok) {
    const code = res.status >= 500 ? "SERVER_5XX" : opts.failureCode;
    fail(code, res.error ?? `HTTP ${res.status}`);
  }

  const matches = (res.data?.reminders ?? []).filter((r) => r.reminderId.startsWith(trimmed));
  if (matches.length === 0) {
    const scope = opts.all ? "reminder" : `${opts.statuses?.join("/") ?? "active"} reminder`;
    fail("NOT_FOUND", `No ${scope} matches id prefix '${trimmed}'.`);
  }
  if (matches.length > 1) {
    fail("AMBIGUOUS", `Ambiguous id prefix '${trimmed}' matches ${matches.length} reminders; pass a longer id.`);
  }
  return matches[0].reminderId;
}
