/*
 * Node-side browser commands for the VirtualList scroll benchmark: CPU throttling, a Chrome trace and a
 * CPU profile over CDP, summarized here so only small JSON objects go back to the page, and writing the
 * results to disk.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import type { BrowserCommand } from "vite-plus/test/node";

type Context = Parameters<BrowserCommand>[0];
type Cdp = Awaited<ReturnType<ReturnType<Context["page"]["context"]>["newCDPSession"]>>;

let session: Cdp | null = null;
let traceEvents: TraceEvent[] = [];
let traceDone: Promise<void> | null = null;
const listening = new WeakSet<object>();
type Emitter = { on: (event: string, listener: (payload: unknown) => void) => void };

interface TraceEvent {
  name: string;
  cat: string;
  ph: string;
  ts: number;
  dur?: number;
  pid: number;
  tid: number;
  args?: {
    name?: string;
    beginData?: { stackTrace?: unknown[] };
    data?: { stackTrace?: unknown[] };
  };
}

async function getSession(context: Context): Promise<Cdp> {
  if (session === null) {
    session = await context.page.context().newCDPSession(context.page);
  }
  return session;
}

/** A top-level task of the event loop (its name differs between Chrome versions). */
const isTask = (event: TraceEvent) =>
  event.name === "RunTask" || event.name === "ThreadControllerImpl::RunTask";

/** Per-thread totals of the main-thread work in a trace, and how much of the layout was forced by script. */
function summarizeTrace(events: TraceEvent[]) {
  const mainThreads = new Set<string>();
  for (const event of events) {
    if (event.ph === "M" && event.name === "thread_name" && event.args?.name === "CrRendererMain") {
      mainThreads.add(`${event.pid}:${event.tid}`);
    }
  }
  const main = events.filter(
    (event: TraceEvent) => mainThreads.has(`${event.pid}:${event.tid}`) && event.ph === "X",
  );
  const totals: Record<string, { count: number; ms: number }> = {};
  for (const event of main) {
    const entry = (totals[event.name] ??= { count: 0, ms: 0 });
    entry.count += 1;
    entry.ms += (event.dur ?? 0) / 1000;
  }
  // A layout or style recalc inside a script event was forced by that script (read after a write).
  const scripts = main
    .filter((event: TraceEvent) =>
      [
        "FunctionCall",
        "EventDispatch",
        "FireAnimationFrame",
        "RunMicrotasks",
        "TimerFire",
      ].includes(event.name),
    )
    .map((event: TraceEvent) => [event.ts, event.ts + (event.dur ?? 0)] as const)
    .sort((a, b) => a[0] - b[0]);
  const inScript = (ts: number) => {
    let lo = 0;
    let hi = scripts.length - 1;
    let found = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (scripts[mid]![0] <= ts) {
        found = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    // Script events nest; check the few that start before `ts`.
    for (let i = found; i >= 0 && i > found - 8; --i) {
      if (scripts[i]![1] >= ts) {
        return true;
      }
    }
    return false;
  };
  const forced = { layoutCount: 0, layoutMs: 0, styleCount: 0, styleMs: 0 };
  for (const event of main) {
    if (event.name === "Layout" && inScript(event.ts)) {
      forced.layoutCount += 1;
      forced.layoutMs += (event.dur ?? 0) / 1000;
    } else if (event.name === "UpdateLayoutTree" && inScript(event.ts)) {
      forced.styleCount += 1;
      forced.styleMs += (event.dur ?? 0) / 1000;
    }
  }
  const longTasks = main.filter(
    (event: TraceEvent) => isTask(event) && (event.dur ?? 0) > 50_000,
  ).length;
  const pick = [
    "RunTask",
    "ThreadControllerImpl::RunTask",
    "FunctionCall",
    "EventDispatch",
    "FireAnimationFrame",
    "RunMicrotasks",
    "Layout",
    "UpdateLayoutTree",
    "PrePaint",
    "Paint",
    "Layerize",
    "Commit",
    "MajorGC",
    "MinorGC",
    "V8.GC_SCAVENGER",
  ];
  const round = (n: number) => Math.round(n * 10) / 10;
  // Frames: from one rAF tick to the next. Per frame, the main thread's busy time (top-level tasks) and,
  // for the busiest frames, what the time went to.
  const ticks = main
    .filter((event: TraceEvent) => event.name === "FireAnimationFrame")
    .map((event: TraceEvent) => event.ts)
    .sort((a, b) => a - b);
  const tasks = main.filter(isTask);
  const frameOf = (ts: number) => {
    let lo = 0;
    let hi = ticks.length - 1;
    let found = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (ticks[mid]! <= ts) {
        found = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return found;
  };
  const frames = ticks.map(() => ({ busy: 0, parts: {} as Record<string, number> }));
  for (const task of tasks) {
    const frame = frames[frameOf(task.ts)];
    if (frame) {
      frame.busy += (task.dur ?? 0) / 1000;
    }
  }
  for (const event of main) {
    if (isTask(event) || event.name === "FireAnimationFrame") {
      continue;
    }
    const frame = frames[frameOf(event.ts)];
    if (frame) {
      frame.parts[event.name] = (frame.parts[event.name] ?? 0) + (event.dur ?? 0) / 1000;
    }
  }
  const busy = frames.map((frame) => frame.busy).sort((a, b) => a - b);
  const busiest = frames
    .map((frame, index) => ({ index, ...frame }))
    .sort((a, b) => b.busy - a.busy)
    .slice(0, 6)
    .map(
      ({ index, busy: ms, parts }) =>
        `#${index} ${round(ms)}ms: ${Object.entries(parts)
          .filter(([, v]) => v >= 0.5)
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => `${k} ${round(v)}`)
          .join(", ")}`,
    );
  return {
    busyPerFrame: {
      p50: round(busy[Math.floor(busy.length / 2)] ?? 0),
      p95: round(busy[Math.floor(busy.length * 0.95)] ?? 0),
      max: round(busy[busy.length - 1] ?? 0),
      over12: busy.filter((ms) => ms > 12).length,
    },
    busiest,
    totals: Object.fromEntries(
      pick
        .filter((name: string) => totals[name] !== undefined)
        .map((name: string) => [name, { count: totals[name]!.count, ms: round(totals[name]!.ms) }]),
    ),
    forced: {
      layoutCount: forced.layoutCount,
      layoutMs: round(forced.layoutMs),
      styleCount: forced.styleCount,
      styleMs: round(forced.styleMs),
    },
    longTasks,
  };
}

interface ProfileNode {
  id: number;
  callFrame: { functionName: string; url: string; lineNumber: number };
  hitCount?: number;
  children?: number[];
}

const sources = new Map<string, Promise<string[]>>();

/** The text of line `line` (0-based) of the module served at `url`, to name anonymous functions. */
async function sourceLine(url: string, line: number): Promise<string> {
  if (!url.startsWith("http")) {
    return "";
  }
  let lines = sources.get(url);
  if (lines === undefined) {
    lines = fetch(url)
      .then((response: Response) => response.text())
      .then((text: string) => text.split("\n"))
      .catch(() => []);
    sources.set(url, lines);
  }
  return ((await lines)[line] ?? "").trim().slice(0, 70);
}

/**
 * Self time per function (name, file, line) of a CPU profile, the heaviest first, and the total time
 * (self plus callees, counted once per stack) of the list's own functions. Anonymous functions are
 * named by their first source line.
 */
async function summarizeProfile(profile: {
  nodes: ProfileNode[];
  samples: number[];
  timeDeltas: number[];
}) {
  const parent = new Map<number, number>();
  for (const node of profile.nodes) {
    for (const child of node.children ?? []) {
      parent.set(child, node.id);
    }
  }
  const labels = new Map<number, string>();
  for (const node of profile.nodes) {
    const { functionName, url, lineNumber } = node.callFrame;
    const file = url.split("/").pop()?.split("?")[0] ?? "";
    const name = functionName || `(anon: ${await sourceLine(url, lineNumber)})`;
    labels.set(node.id, `${name} ${file}:${lineNumber + 1}`);
  }
  const self = new Map<string, number>();
  const total = new Map<string, number>();
  profile.samples.forEach((id: number, i: number) => {
    const us = profile.timeDeltas[i] ?? 0;
    const label = labels.get(id)!;
    self.set(label, (self.get(label) ?? 0) + us);
    const seen = new Set<string>();
    for (let node: number | undefined = id; node !== undefined; node = parent.get(node)) {
      const nodeLabel = labels.get(node)!;
      if (!seen.has(nodeLabel)) {
        seen.add(nodeLabel);
        total.set(nodeLabel, (total.get(nodeLabel) ?? 0) + us);
      }
    }
  });
  const format = (
    entries: Map<string, number>,
    filter: (label: string) => boolean,
    count: number,
  ) =>
    [...entries.entries()]
      .filter(([label]) => filter(label))
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([label, us]) => `${(us / 1000).toFixed(1).padStart(8)}ms  ${label}`);
  return {
    self: format(self, () => true, 40),
    total: format(
      total,
      (label: string) =>
        /VirtualList|measure|resize-observer|ResizeObserver|use-|fenwick|range/.test(label),
      40,
    ),
  };
}

export const benchCdp: BrowserCommand<[action: string, arg?: unknown]> = async (
  context,
  action,
  arg,
) => {
  const cdp = await getSession(context);
  switch (action) {
    case "throttle": {
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: Number(arg ?? 1) });
      return null;
    }
    case "traceStart": {
      traceEvents = [];
      if (!listening.has(cdp)) {
        listening.add(cdp);
        (cdp as unknown as Emitter).on("Tracing.dataCollected", (payload: unknown) => {
          traceEvents.push(...(payload as { value: TraceEvent[] }).value);
        });
      }
      traceDone = new Promise<void>((done) => {
        cdp.once("Tracing.tracingComplete", () => done());
      });
      await cdp.send("Tracing.start", {
        traceConfig: {
          includedCategories: [
            // Light categories: "v8" or the disabled-by-default timeline ones slow every call down.
            "devtools.timeline",
            "toplevel",
            "__metadata",
          ],
        },
        transferMode: "ReportEvents",
      });
      return null;
    }
    case "traceStop": {
      await cdp.send("Tracing.end");
      await traceDone;
      const summary = summarizeTrace(traceEvents);
      if (typeof arg === "string") {
        writeJson(arg, { traceEvents });
      }
      traceEvents = [];
      return summary;
    }
    case "profileStart": {
      await cdp.send("Profiler.enable");
      await cdp.send("Profiler.setSamplingInterval", { interval: 100 });
      await cdp.send("Profiler.start");
      return null;
    }
    case "profileStop": {
      const { profile } = (await cdp.send("Profiler.stop")) as {
        profile: { nodes: ProfileNode[]; samples: number[]; timeDeltas: number[] };
      };
      await cdp.send("Profiler.disable");
      return summarizeProfile(profile);
    }
    case "heap": {
      // Collects garbage first: the live heap, not what is waiting to be collected.
      await cdp.send("HeapProfiler.collectGarbage");
      const { usedSize } = (await cdp.send("Runtime.getHeapUsage")) as { usedSize: number };
      return usedSize;
    }
    case "write": {
      const { path, data } = arg as { path: string; data: unknown };
      writeJson(path, data);
      return null;
    }
    default:
      throw new Error(`unknown benchCdp action ${action}`);
  }
};

function writeJson(path: string, data: unknown) {
  const file = resolve(import.meta.dirname, "results", path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2));
}
