// Runs the VirtualList scroll benchmark with React's production build at each CPU throttling rate
// (BENCH_CPUS, default "1,4") and row count (BENCH_COUNTS, default "320"), then prints the results:
// `node bench/virtual-list/run.mjs [label-prefix]` from packages/ui. Other BENCH_* variables (see
// vite.config.ts) pass through. One vitest run per rate and count, each under BENCH_TIMEOUT_S (default
// 290s): a case that does not finish in time is recorded as such.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { loadavg } from "node:os";
import { join } from "node:path";

const prefix = process.argv[2] ?? "run";
const packageDir = join(import.meta.dirname, "..", "..");
const timeout = Number(process.env.BENCH_TIMEOUT_S ?? 290) * 1000;
const labels = [];
for (const count of (process.env.BENCH_COUNTS ?? "320").split(",")) {
  for (const cpu of (process.env.BENCH_CPUS ?? "1,4").split(",")) {
    const label = `${prefix}-n${count}-cpu${cpu}`;
    const load = loadavg()
      .map((n) => n.toFixed(1))
      .join(" ");
    console.log(`${count} rows, CPU x${cpu}: load average ${load}`);
    const result = spawnSync(
      "pnpm",
      ["exec", "vp", "test", "--run", "--config", "bench/virtual-list/vite.config.ts"],
      {
        cwd: packageDir,
        stdio: ["ignore", "ignore", "inherit"],
        timeout,
        killSignal: "SIGKILL",
        env: {
          ...process.env,
          NODE_ENV: "production",
          BENCH_CPU: cpu,
          BENCH_COUNT: count,
          BENCH_LABEL: label,
        },
      },
    );
    const file = join(import.meta.dirname, "results", `${label}.json`);
    if (result.status !== 0 && !existsSync(file)) {
      mkdirSync(join(import.meta.dirname, "results"), { recursive: true });
      writeFileSync(
        file,
        JSON.stringify({
          cpu: Number(cpu),
          count: Number(count),
          lines: [`did not finish (${result.error?.message ?? `exit ${result.status}`})`],
          load,
        }),
      );
    }
    labels.push(label);
  }
}
spawnSync("node", [join(import.meta.dirname, "report.mjs"), ...labels], { stdio: "inherit" });
