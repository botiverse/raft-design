/**
 * Deterministic mock data for the dashboard example.
 *
 * Fixed literals, not generated: doc routes are prerendered, so anything derived
 * from `Date.now()` or `Math.random()` would bake a different value into the
 * build than the one a reader sees, and visual diffs would churn on every run.
 */

export type RunStatus = "healthy" | "degraded" | "failing";

export interface AgentRow {
  id: string;
  agent: string;
  runtime: "claude" | "codex" | "builtin";
  runs: number;
  p95Ms: number;
  errorRate: number;
  spendUsd: number;
  status: RunStatus;
  owner: string;
}

export const RUNTIME_LABEL: Record<AgentRow["runtime"], string> = {
  claude: "Claude Code",
  codex: "Codex",
  builtin: "Built-in",
};

export const STATUS_LABEL: Record<RunStatus, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  failing: "Failing",
};

const NAMES = [
  "product-qa-bot",
  "release-notes",
  "triage-owl",
  "spec-reader",
  "cost-watch",
  "doc-linter",
  "flaky-hunter",
  "perf-scout",
  "intake-router",
  "changelog-bot",
  "schema-guard",
  "i18n-sweeper",
  "deploy-sentry",
  "review-pair",
  "usage-roll",
  "alert-dedupe",
  "seat-auditor",
  "token-warden",
  "trace-digest",
  "sla-timer",
  "backfill-runner",
  "index-rebuilder",
  "webhook-relay",
  "quota-notifier",
  "log-compactor",
  "sandbox-reaper",
  "cache-primer",
  "digest-mailer",
];

const OWNERS = ["ada", "kai", "Mai", "Leo", "Bugen", "Atlas"];
const RUNTIMES: AgentRow["runtime"][] = ["claude", "codex", "builtin"];

/** Spread deterministically so the table exercises real density and sorting. */
export const AGENT_ROWS: AgentRow[] = NAMES.map((agent, i) => {
  const runs = 180 + ((i * 137) % 4200);
  const p95Ms = 240 + ((i * 311) % 5400);
  const errorRate = ((i * 7) % 90) / 1000;
  const status: RunStatus =
    errorRate > 0.055 ? "failing" : errorRate > 0.028 ? "degraded" : "healthy";
  return {
    id: `agent-${String(i + 1).padStart(2, "0")}`,
    agent,
    runtime: RUNTIMES[i % RUNTIMES.length]!,
    runs,
    p95Ms,
    errorRate,
    spendUsd: Math.round(runs * (0.6 + (i % 5) * 0.35) * 100) / 100,
    status,
    owner: OWNERS[i % OWNERS.length]!,
  };
});

export const RANGES = ["24h", "7d", "30d"] as const;
export type Range = (typeof RANGES)[number];

/** Totals recomputed from the rows so the KPI strip can never drift from the table. */
export function summarize(rows: AgentRow[]) {
  const runs = rows.reduce((n, r) => n + r.runs, 0);
  const spend = rows.reduce((n, r) => n + r.spendUsd, 0);
  const weightedErr = rows.reduce((n, r) => n + r.errorRate * r.runs, 0);
  const p95 = rows.length ? Math.round(rows.reduce((n, r) => n + r.p95Ms, 0) / rows.length) : 0;
  return {
    runs,
    spend: Math.round(spend * 100) / 100,
    errorRate: runs ? weightedErr / runs : 0,
    p95,
    failing: rows.filter((r) => r.status === "failing").length,
  };
}
