/*
 * How smoothly message-like rows scroll in VirtualList, against the same rows in a plain scroller (no
 * virtualization). Run it with bench/virtual-list/run.mjs or vite.config.ts (see there for the options).
 *
 * Each run mounts one list of BENCH_COUNT rows (default 320) in a 640 x 720 frame, settles, then scrolls
 * it by 160px a frame from requestAnimationFrame (`scrollBy`, so a correction the list makes to
 * scrollTop is kept) until it reaches the end or 390 frames (320 rows are about 390 frames end to end):
 * "down" from the top of a freshly mounted list, "up" from the bottom of one (a chat opening at its
 * newest message, then reading back through rows not measured yet). Per run: the frame intervals while
 * scrolling (rAF deltas: p50, p95, max, frames over 33ms and 50ms), what the mount cost (time to the
 * render, commit and layout, and to the frame after the first paint; DOM nodes and rows mounted; the JS heap it added, after a GC), and with BENCH_TRACE a Chrome trace
 * summary. The median of the runs is reported per case.
 */
/* oxlint-disable react-perf/jsx-no-new-function-as-prop -- the harness renders each list once per run */
import "./bench.css";
import { useCallback } from "react";
import type { ReactNode } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vite-plus/test";
import { commands } from "vite-plus/test/browser";

import { VirtualList } from "../../src/components/virtual-list";
import type { VirtualListApi, VirtualListItemRenderProps } from "../../src/components/virtual-list";
import { createMessages, MessageRow } from "./messages";
import type { BenchMessage } from "./messages";

declare const __BENCH__: {
  cpu: number;
  runs: number;
  count: number;
  lists: ("native" | "virtual")[];
  dirs: ("down" | "up")[];
  trace: boolean;
  traceCategories: string;
  profile: boolean;
  label: string;
};

declare module "vite-plus/test/browser" {
  interface BrowserCommands {
    benchCdp: (action: string, arg?: unknown) => Promise<unknown>;
  }
}

const it = test.skipIf(typeof window === "undefined");

const STEP_PX = 160;
const MAX_FRAMES = 390;
const getKey = (message: BenchMessage) => message.key;

function NativeList({
  messages,
  onReady,
}: {
  messages: BenchMessage[];
  onReady: (el: HTMLDivElement) => void;
}) {
  return (
    <div className="bench-frame">
      <div className="bench-native" ref={(el) => void (el && onReady(el))}>
        <div className="bench-native__rows">
          {messages.map((message: BenchMessage) => (
            <MessageRow key={message.key} message={message} domRef={null} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BenchVirtualList({
  messages,
  onReady,
}: {
  messages: BenchMessage[];
  onReady: (el: HTMLDivElement, api: VirtualListApi) => void;
}) {
  const renderRow = useCallback(
    ({ item, domRef, style }: VirtualListItemRenderProps<BenchMessage>) => (
      <MessageRow key={item.key} message={item} domRef={domRef} style={style} />
    ),
    [],
  );
  return (
    <div className="bench-frame">
      <VirtualList<BenchMessage>
        componentRef={(api: VirtualListApi | null) => {
          const el = api?.listElRef.current;
          if (api && el) {
            onReady(el, api);
          }
        }}
        items={messages}
        getKey={getKey}
        itemEstimatedSize={72}
        itemMinSize={20}
        itemResizable
        keepAnchorOnItemsChange
        showScrollbar
      >
        {renderRow}
      </VirtualList>
    </div>
  );
}

const nextFrame = () => new Promise<number>((resolve) => requestAnimationFrame(resolve));
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface RunResult {
  frames: number;
  p50: number;
  p95: number;
  max: number;
  over33: number;
  over50: number;
  mountMs: number;
  firstFrameMs: number;
  domNodes: number;
  mountedRows: number;
  heapMB: number;
  scrollHeight: number;
  trace?: unknown;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) {
    return 0;
  }
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))]!;
}

// Not @testing-library/react: its `act` does not exist in React's production build, which the bench uses.
let root: ReturnType<typeof createRoot> | null = null;
let container: HTMLDivElement | null = null;
function render(node: ReactNode) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  flushSync(() => root!.render(node));
}
function cleanup() {
  root?.unmount();
  container?.remove();
  root = null;
  container = null;
}

const usedHeap = async () => (await commands.benchCdp("heap")) as number;

async function mount(list: "native" | "virtual", messages: BenchMessage[]) {
  let scroller: HTMLDivElement | null = null;
  let api: VirtualListApi | null = null;
  const start = performance.now();
  render(
    list === "native" ? (
      <NativeList messages={messages} onReady={(el) => (scroller = el)} />
    ) : (
      <BenchVirtualList
        messages={messages}
        onReady={(el, listApi) => {
          scroller = el;
          api = listApi;
        }}
      />
    ),
  );
  expect(scroller).not.toBeNull();
  // Rendering, committing and laying out what mounted (the list's own measuring included).
  // (The virtual list mounts its rows in a microtask, once it has read its height.)
  for (let i = 0; i < 8; ++i) {
    await Promise.resolve();
  }
  void (scroller as unknown as HTMLDivElement).scrollHeight;
  const mountMs = performance.now() - start;
  // To the frame after the first paint.
  await nextFrame();
  await nextFrame();
  const firstFrameMs = performance.now() - start;
  for (let i = 0; i < 3; ++i) {
    await nextFrame();
  }
  const heapMounted = await usedHeap();
  return {
    scroller: scroller as unknown as HTMLDivElement,
    api: api as VirtualListApi | null,
    mountMs,
    firstFrameMs,
    heapMounted,
  };
}

async function scrollToBottom(scroller: HTMLDivElement, api: VirtualListApi | null) {
  // The virtual list's height is an estimate until the rows near the end are measured: repeat.
  for (let i = 0; i < 20; ++i) {
    if (api) {
      api.scrollTo({ position: "bottom" });
    } else {
      scroller.scrollTop = scroller.scrollHeight;
    }
    await nextFrame();
    await nextFrame();
    if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1 && i >= 3) {
      break;
    }
  }
}

async function runOnce(
  list: "native" | "virtual",
  dir: "down" | "up",
  messages: BenchMessage[],
  trace = false,
): Promise<RunResult> {
  const { scroller, api, mountMs, firstFrameMs, heapMounted } = await mount(list, messages);
  const domNodes = scroller.getElementsByTagName("*").length;
  const mountedRows = scroller.querySelectorAll("[data-message]").length;
  if (dir === "up") {
    await scrollToBottom(scroller, api);
  }
  await sleep(300);
  await nextFrame();
  if (trace) {
    await commands.benchCdp("traceStart", __BENCH__.traceCategories);
  }

  const step = dir === "down" ? STEP_PX : -STEP_PX;
  const deltas: number[] = [];
  let last = await nextFrame();
  let stuck = 0;
  let previousTop = scroller.scrollTop;
  while (deltas.length < MAX_FRAMES) {
    scroller.scrollBy(0, step);
    const now = await nextFrame();
    deltas.push(now - last);
    last = now;
    const top = scroller.scrollTop;
    stuck = Math.abs(top - previousTop) < 1 ? stuck + 1 : 0;
    previousTop = top;
    if (stuck >= 3) {
      deltas.splice(deltas.length - 3);
      break;
    }
  }

  const traceSummary = trace ? await commands.benchCdp("traceStop") : undefined;
  const scrollHeight = scroller.scrollHeight;
  cleanup();
  await sleep(200);
  // What the mounted list held: the heap with it against the heap once it is gone (both after a GC).
  const heapMB = (heapMounted - (await usedHeap())) / 1024 / 1024;
  const sorted = [...deltas].sort((a, b) => a - b);
  return {
    frames: deltas.length,
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    max: sorted[sorted.length - 1] ?? 0,
    over33: deltas.filter((d) => d > 33.4).length,
    over50: deltas.filter((d) => d > 50).length,
    mountMs,
    firstFrameMs,
    domNodes,
    mountedRows,
    heapMB,
    scrollHeight,
    trace: traceSummary,
  };
}

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)]!;
};
const round = (n: number) => Math.round(n * 10) / 10;

it("scrolls message rows", async () => {
  await commands.benchCdp("throttle", __BENCH__.cpu);
  // Warm up: the first mount pays for compiling and the font.
  const warmUp = createMessages(320);
  await runOnce("virtual", "down", warmUp);
  await runOnce("native", "down", warmUp);
  const messages = createMessages(__BENCH__.count);
  const report: Record<string, unknown> = {
    cpu: __BENCH__.cpu,
    count: __BENCH__.count,
    step: STEP_PX,
  };
  const lines: string[] = [];
  const profiles: Record<string, unknown> = {};
  report.profiles = profiles;
  for (const dir of __BENCH__.dirs) {
    for (const list of __BENCH__.lists) {
      if (__BENCH__.profile) {
        await commands.benchCdp("profileStart");
      }
      const runs: RunResult[] = [];
      for (let i = 0; i < __BENCH__.runs; ++i) {
        runs.push(await runOnce(list, dir, messages, __BENCH__.trace));
      }
      if (__BENCH__.profile) {
        profiles[`${list}/${dir}`] = await commands.benchCdp("profileStop");
      }
      const pick = (f: (r: RunResult) => number) => round(median(runs.map(f)));
      const summary = {
        frames: pick((r) => r.frames),
        p50: pick((r) => r.p50),
        p95: pick((r) => r.p95),
        max: pick((r) => r.max),
        over33: pick((r) => r.over33),
        over50: pick((r) => r.over50),
        mountMs: pick((r) => r.mountMs),
        firstFrameMs: pick((r) => r.firstFrameMs),
        domNodes: pick((r) => r.domNodes),
        mountedRows: pick((r) => r.mountedRows),
        heapMB: pick((r) => r.heapMB),
      };
      report[`${list}/${dir}`] = { summary, runs };
      lines.push(
        [
          `${list}/${dir}`.padEnd(14),
          `frames ${String(summary.frames).padStart(4)}`,
          `p50 ${summary.p50.toFixed(1).padStart(5)}`,
          `p95 ${summary.p95.toFixed(1).padStart(5)}`,
          `max ${summary.max.toFixed(1).padStart(6)}`,
          `>33ms ${String(summary.over33).padStart(3)}`,
          `>50ms ${String(summary.over50).padStart(3)}`,
          `(runs >33: ${runs.map((r) => r.over33).join("/")})`,
          `mount ${summary.mountMs.toFixed(0)}ms (first frame ${summary.firstFrameMs.toFixed(0)}ms)`,
          `DOM ${summary.domNodes}`,
          `rows ${summary.mountedRows}`,
          `heap ${summary.heapMB.toFixed(1)}MB`,
        ].join("  "),
      );
    }
  }
  await commands.benchCdp("throttle", 1);
  report.lines = lines;
  await commands.benchCdp("write", { path: `${__BENCH__.label}.json`, data: report });
});
