/*
 * The VirtualList scroll benchmark (not run in CI: CI runs the package's own config, whose `include` does
 * not reach `bench/`). From packages/ui, `node bench/virtual-list/run.mjs` runs it at CPU x1 and x4 and prints
 * the results; one case by hand (NODE_ENV=production: React's production build, as users run it):
 *
 *   NODE_ENV=production BENCH_CPU=4 pnpm exec vp test --run --config bench/virtual-list/vite.config.ts
 *
 * Env: BENCH_CPU (CDP CPU throttling rate, default 1), BENCH_COUNT (rows, default 320), BENCH_RUNS (runs per case, default 3; the median
 * is reported), BENCH_LISTS (comma list of `native,virtual`), BENCH_DIRS (`down,up`), BENCH_TRACE=1 (add
 * a Chrome trace summary per run: layout / style recalc counts, forced ones), BENCH_PROFILE=1 (print the
 * heaviest functions of a CPU profile per case), BENCH_LABEL (the results file name under results/).
 * `node bench/virtual-list/report.mjs [label...]` prints results.
 */
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "vite-plus/test/browser-playwright";
import { defineConfig } from "vite-plus";

import { benchCdp } from "./commands";

const env = process.env;

export default defineConfig({
  plugins: [tailwindcss()],
  define: {
    __BENCH__: JSON.stringify({
      cpu: Number(env.BENCH_CPU ?? 1),
      runs: Number(env.BENCH_RUNS ?? 3),
      count: Number(env.BENCH_COUNT ?? 320),
      lists: (env.BENCH_LISTS ?? "native,virtual").split(","),
      dirs: (env.BENCH_DIRS ?? "down,up").split(","),
      trace: env.BENCH_TRACE === "1",
      profile: env.BENCH_PROFILE === "1",
      label: env.BENCH_LABEL ?? `cpu${env.BENCH_CPU ?? 1}`,
    }),
  },
  test: {
    root: import.meta.dirname,
    include: ["*.bench.tsx"],
    testTimeout: 290_000,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium", viewport: { width: 1000, height: 900 } }],
      commands: { benchCdp },
    },
  },
});
