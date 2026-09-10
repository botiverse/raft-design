import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
  Separator,
  Text,
} from "raft-ui";

import {
  AGENT_ROWS,
  RANGES,
  RUNTIME_LABEL,
  STATUS_LABEL,
  summarize,
} from "#/dashboard/dashboard-data.ts";
import type { AgentRow, Range, RunStatus } from "#/dashboard/dashboard-data.ts";

/**
 * A data-dense example app, deliberately NOT Raft-shaped.
 *
 * Playground is one coherent chat/collaboration product, so every composition in
 * it is validated against that single shape. This exists to exercise the axis
 * that shape cannot reach — many rows, numeric comparison, and status at
 * density — and to make visible which primitives raft-ui does not yet have.
 *
 * ⚠️ HAND-ROLLED, and the point of the exercise: raft-ui ships 78 components and
 * none of them is a table, data grid, stat, or chart. The table below is a
 * semantic <table> styled with theme tokens, and the KPI strip is Cards. This is
 * NOT reimplementing a raft-ui component — there is no table component to
 * reimplement. Each such spot is marked GAP: so the list stays evidenced rather
 * than remembered.
 */

const STATUS_VARIANT: Record<RunStatus, "success" | "warning" | "danger"> = {
  healthy: "success",
  degraded: "warning",
  failing: "danger",
};

const usd = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export function DashboardApp() {
  const [range, setRange] = useState<Range>("7d");
  const [runtime, setRuntime] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(
    () => (runtime === "all" ? AGENT_ROWS : AGENT_ROWS.filter((r) => r.runtime === runtime)),
    [runtime],
  );
  const totals = useMemo(() => summarize(rows), [rows]);
  const selected = rows.find((r) => r.id === selectedId) ?? null;

  const runtimeItems = useMemo(
    () => [
      { value: "all", label: "All runtimes" },
      ...Object.entries(RUNTIME_LABEL).map(([value, label]) => ({ value, label })),
    ],
    [],
  );

  return (
    // No min-h-screen / max-width / page padding: this renders inside the docs
    // article, which already owns the page frame. Standalone sizing here would
    // fight it and reintroduce a second scroll context.
    <div className="flex w-full flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        {/* No title here: the DocSection wrapper already renders "Agent usage"
            as the section heading. Keeping both printed it twice. */}
        <Text.Sans size="small">
          Runs, latency, and spend across every agent on this server.
        </Text.Sans>
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl value={range} onValueChange={(v) => v && setRange(v as Range)}>
            {RANGES.map((r) => (
              <SegmentedControlItem key={r} value={r}>
                <SegmentedControlLabel>{r}</SegmentedControlLabel>
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
          <Select
            chrome="field"
            value={runtime}
            onValueChange={(v) => v != null && setRuntime(String(v))}
            items={runtimeItems}
          >
            <SelectTrigger className="w-44" aria-label="Runtime">
              <SelectValue />
              <SelectIcon />
            </SelectTrigger>
            <SelectContent>
              <SelectList>
                {runtimeItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    <SelectItemText>{item.label}</SelectItemText>
                    <SelectItemIndicator />
                  </SelectItem>
                ))}
              </SelectList>
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* GAP: no Stat / Metric primitive. A KPI strip is the most common
          dashboard element there is, and it has to be assembled from Card +
          Text every time, with the number's type scale chosen by hand. */}
      <section aria-label="Summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Runs",
            value: totals.runs.toLocaleString("en-US"),
            hint: `${rows.length} agents`,
          },
          { label: "Avg p95", value: `${totals.p95} ms`, hint: `over ${range}` },
          { label: "Error rate", value: pct(totals.errorRate), hint: `${totals.failing} failing` },
          { label: "Spend", value: usd(totals.spend), hint: `over ${range}` },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader>
              <CardDescription>{kpi.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{kpi.value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Text.Sans size="caption">{kpi.hint}</Text.Sans>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <Card className="min-w-0 flex-1">
          <CardHeader>
            <CardTitle>By agent</CardTitle>
            <CardDescription>Select a row to inspect it.</CardDescription>
          </CardHeader>
          {/* GAP: no Table / DataGrid primitive. Semantic <table> with theme
              tokens; row selection, sticky header, numeric alignment, and zebra
              density are all hand-rolled here. */}
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-layer-panel">
                <tr className="border-b border-line-muted">
                  {["Agent", "Runtime", "Runs", "p95", "Errors", "Spend", "Status"].map((h, i) => (
                    <th
                      key={h}
                      scope="col"
                      className={`px-3 py-2 font-sans text-xs font-medium text-foreground-muted ${i >= 2 && i <= 5 ? "text-right" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <DashboardRow
                    key={row.id}
                    row={row}
                    selected={row.id === selectedId}
                    onSelect={() => setSelectedId(row.id === selectedId ? null : row.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="w-full shrink-0 lg:w-80">
          <CardHeader>
            <CardTitle>{selected ? selected.agent : "No agent selected"}</CardTitle>
            <CardDescription>
              {selected ? `Owned by ${selected.owner}` : "Pick a row to see its detail."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {selected ? (
              <>
                <DetailRow label="Runtime" value={RUNTIME_LABEL[selected.runtime]} />
                <Separator />
                <DetailRow label="Runs" value={selected.runs.toLocaleString("en-US")} />
                <DetailRow label="p95 latency" value={`${selected.p95Ms} ms`} />
                <DetailRow label="Error rate" value={pct(selected.errorRate)} />
                <DetailRow label="Spend" value={usd(selected.spendUsd)} />
                <Separator />
                <div className="flex items-center justify-between gap-2">
                  <Text.Sans size="small">Status</Text.Sans>
                  <Badge variant={STATUS_VARIANT[selected.status]}>
                    {STATUS_LABEL[selected.status]}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
                  Clear selection
                </Button>
              </>
            ) : (
              <Text.Sans size="caption">
                The detail panel stays mounted so the layout does not jump when a row is chosen.
              </Text.Sans>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <Text.Sans size="small">{label}</Text.Sans>
      <Text.Sans className="tabular-nums">{value}</Text.Sans>
    </div>
  );
}

function DashboardRow({
  row,
  selected,
  onSelect,
}: {
  row: AgentRow;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <tr
      onClick={onSelect}
      aria-selected={selected}
      className={`cursor-pointer border-b border-line-muted last:border-b-0 hover:bg-fill-muted ${selected ? "bg-fill-muted" : ""}`}
    >
      <th scope="row" className="px-3 py-2 text-left font-sans text-sm font-normal">
        {row.agent}
      </th>
      <td className="px-3 py-2 text-sm text-foreground-muted">{RUNTIME_LABEL[row.runtime]}</td>
      <td className="px-3 py-2 text-right text-sm tabular-nums">
        {row.runs.toLocaleString("en-US")}
      </td>
      <td className="px-3 py-2 text-right text-sm tabular-nums">{row.p95Ms}</td>
      <td className="px-3 py-2 text-right text-sm tabular-nums">{pct(row.errorRate)}</td>
      <td className="px-3 py-2 text-right text-sm tabular-nums">{usd(row.spendUsd)}</td>
      <td className="px-3 py-2">
        <Badge variant={STATUS_VARIANT[row.status]}>{STATUS_LABEL[row.status]}</Badge>
      </td>
    </tr>
  );
}
