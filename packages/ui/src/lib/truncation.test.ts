/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { measureContent, observeTruncation, readNow, scheduleMeasure } from "./truncation";
import type { TruncationTarget } from "./truncation";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function rect(left: number, top: number, width: number, height: number) {
  return DOMRect.fromRect({ x: left, y: top, width, height });
}

function element(box: DOMRect, rects: DOMRect[] = []) {
  const node = document.createElement("span");
  document.body.append(node);
  node.getBoundingClientRect = () => box;
  node.getClientRects = () => rects as unknown as DOMRectList;
  return node;
}

describe("measureContent", () => {
  it("compares fractional widths with a half-pixel tolerance", () => {
    const box = rect(0, 0, 100, 18);
    expect(measureContent(element(box), element(box, [rect(0, 1, 100.4, 15)]))).toBe(false);
    expect(measureContent(element(box), element(box, [rect(0, 1, 100.6, 15)]))).toBe(true);
  });

  it("counts a line as hidden when its middle is below the box", () => {
    const box = rect(0, 0, 200, 36);
    const visible = [rect(0, 1, 180, 15), rect(0, 19, 120, 15)];
    expect(measureContent(element(box), element(box, visible))).toBe(false);
    // A glyph box a little taller than the line still belongs to line 2.
    const tall = [rect(0, 0, 180, 18), rect(0, 17, 120, 20)];
    expect(measureContent(element(box), element(box, tall))).toBe(false);
    const third = [...visible, rect(0, 37, 60, 15)];
    expect(measureContent(element(box), element(box, third))).toBe(true);
  });

  it("does not know about a box that is not laid out", () => {
    const hidden = rect(0, 0, 0, 0);
    expect(measureContent(element(hidden), element(hidden, []))).toBeUndefined();
    const detached = document.createElement("span");
    expect(measureContent(detached, detached)).toBeUndefined();
  });
});

describe("the shared measurer", () => {
  function setup() {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    const runFrame = () => frames.splice(0).forEach((callback) => callback(0));
    const log: string[] = [];
    const make = (name: string): TruncationTarget => {
      const node = element(rect(0, 0, 100, 18));
      return {
        observe: () => [node],
        watch: () => node,
        isolate: () => {
          log.push(`isolate ${name}`);
          return () => log.push(`restore ${name}`);
        },
        read: () => {
          log.push(`read ${name}`);
          return false;
        },
        commit: (truncated) => log.push(`write ${name} ${String(truncated)}`),
      };
    };
    return { frames, runFrame, log, make };
  }

  it("isolates every target, reads them all, restores, then writes, in one frame", () => {
    const { frames, runFrame, log, make } = setup();
    const stops = [observeTruncation(make("a")), observeTruncation(make("b"))];
    expect(frames).toHaveLength(1);
    runFrame();
    expect(log).toEqual([
      "isolate a",
      "isolate b",
      "read a",
      "read b",
      "restore a",
      "restore b",
      "write a false",
      "write b false",
    ]);
    stops.forEach((stop) => stop());
  });

  it("reads one target now, isolated, for a tooltip about to open", () => {
    const { log, make } = setup();
    expect(readNow(make("a"))).toBe(false);
    expect(log).toEqual(["isolate a", "read a", "restore a"]);
  });

  it("queues a request made while a frame runs instead of dropping it", () => {
    const { frames, runFrame, log, make } = setup();
    const target = make("a");
    const commit = target.commit;
    let again = true;
    target.commit = (truncated) => {
      commit(truncated);
      if (again) {
        again = false;
        scheduleMeasure(target);
      }
    };
    const stop = observeTruncation(target);
    runFrame();
    expect(frames).toHaveLength(1);
    runFrame();
    expect(log.filter((entry) => entry.startsWith("write"))).toHaveLength(2);
    stop();
  });

  it("measures every target again when a font finishes loading", () => {
    const { runFrame, log, make } = setup();
    // jsdom has no FontFaceSet; a browser has a real one.
    if (!("fonts" in document)) {
      Object.defineProperty(document, "fonts", { value: new EventTarget(), configurable: true });
    }
    const fonts = document.fonts as unknown as EventTarget;
    const stops = [observeTruncation(make("a")), observeTruncation(make("b"))];
    runFrame();
    log.length = 0;
    fonts.dispatchEvent(new Event("loadingdone"));
    runFrame();
    expect(log.filter((entry) => entry.startsWith("read"))).toEqual(["read a", "read b"]);
    stops.forEach((stop) => stop());
  });

  it("stops measuring a target once it is cleaned up", () => {
    const { frames, runFrame, log, make } = setup();
    const target = make("a");
    const stop = observeTruncation(target);
    stop();
    runFrame();
    scheduleMeasure(target);
    expect(frames).toHaveLength(0);
    expect(log).toEqual([]);
  });
});
