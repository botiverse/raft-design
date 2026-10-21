// Prints the results of the VirtualList scroll benchmark: `node bench/virtual-list/report.mjs [label...]`
// (default: every file in bench/virtual-list/results).
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(import.meta.dirname, "results");
const labels = process.argv.slice(2);
const files = labels.length
  ? labels.map((label) => `${label}.json`)
  : readdirSync(dir).filter((file) => file.endsWith(".json"));
const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
for (const file of files) {
  const report = JSON.parse(readFileSync(join(dir, file), "utf8"));
  console.log(
    `=== ${file}: ${report.count ?? 320} rows, CPU x${report.cpu}, ${report.step ?? 160}px a frame`,
  );
  for (const line of report.lines ?? []) console.log(line);
  for (const [name, value] of Object.entries(report)) {
    if (!value || !Array.isArray(value.runs)) continue;
    if (value.topLoafScripts?.length)
      console.log(`  LoAF scripts ${name}:\n  ${value.topLoafScripts.join("\n  ")}`);
    const traces = value.runs.map((run) => run.trace).filter(Boolean);
    if (traces.length) {
      const keys = new Set(traces.flatMap((t) => Object.keys(t.totals)));
      const parts = [...keys].map(
        (key) =>
          `${key} ${median(traces.map((t) => t.totals[key]?.count ?? 0))}x/${median(traces.map((t) => t.totals[key]?.ms ?? 0))}ms`,
      );
      const forced = ["layoutCount", "layoutMs", "styleCount", "styleMs"].map(
        (key) => `${key} ${median(traces.map((t) => t.forced[key]))}`,
      );
      const t0 = traces[0];
      for (const [thread, top] of Object.entries(t0.threads ?? {}))
        console.log(`  thread ${thread}: ${top}`);
      console.log(
        `  busy/frame ${name}: ${JSON.stringify(t0.busyPerFrame)}\n    ${t0.busiest.join("\n    ")}`,
      );
      console.log(
        `  trace ${name}: ${parts.join(", ")}\n  forced: ${forced.join(", ")}, long tasks ${median(traces.map((t) => t.longTasks))}`,
      );
    }
  }
  for (const [name, top] of Object.entries(report.profiles ?? {})) {
    console.log(`  profile ${name} (self time):\n  ${top.self.slice(0, 25).join("\n  ")}`);
    console.log(
      `  profile ${name} (total time, the list's functions):\n  ${top.total.join("\n  ")}`,
    );
  }
}
