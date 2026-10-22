/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Ellipsis, EllipsisToggle } from "./ellipsis";
import type { EllipsisState } from "./ellipsis";
import { measureTruncation, observeTruncation, scheduleMeasure } from "./ellipsis-measure";
import type { EllipsisMeasureTarget } from "./ellipsis-measure";

afterEach(() => {
  cleanup();
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

describe("measureTruncation", () => {
  it("compares fractional widths with a half-pixel tolerance on one line", () => {
    const box = rect(0, 0, 100, 18);
    expect(measureTruncation(element(box), element(box, [rect(0, 1, 100.4, 15)]), 1)).toBe(false);
    expect(measureTruncation(element(box), element(box, [rect(0, 1, 100.6, 15)]), 1)).toBe(true);
  });

  it("counts a line as hidden when its middle is below the box", () => {
    const box = rect(0, 0, 200, 36);
    const visible = [rect(0, 1, 180, 15), rect(0, 19, 120, 15)];
    expect(measureTruncation(element(box), element(box, visible), 2)).toBe(false);
    // A glyph box a little taller than the line still belongs to line 2.
    const tall = [rect(0, 0, 180, 18), rect(0, 17, 120, 20)];
    expect(measureTruncation(element(box), element(box, tall), 2)).toBe(false);
    const third = [...visible, rect(0, 37, 60, 15)];
    expect(measureTruncation(element(box), element(box, third), 2)).toBe(true);
  });

  it("does not know about a box that is not laid out", () => {
    const hidden = rect(0, 0, 0, 0);
    expect(measureTruncation(element(hidden), element(hidden, []), 1)).toBeUndefined();
    const detached = document.createElement("span");
    expect(measureTruncation(detached, detached, 1)).toBeUndefined();
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
    const make = (name: string): EllipsisMeasureTarget => {
      const box = rect(0, 0, 100, 18);
      const text = element(box);
      const content = element(box, [rect(0, 1, 50, 15)]);
      text.getBoundingClientRect = () => {
        log.push(`read ${name}`);
        return box;
      };
      return {
        text,
        content,
        extra: () => [],
        lines: () => 1,
        commit: (truncated) => log.push(`write ${name} ${String(truncated)}`),
      };
    };
    return { frames, runFrame, log, make };
  }

  it("reads every instance before writing any, in one frame", () => {
    const { frames, runFrame, log, make } = setup();
    const stops = [observeTruncation(make("a")), observeTruncation(make("b"))];
    expect(frames).toHaveLength(1);
    runFrame();
    expect(log).toEqual(["read a", "read b", "write a false", "write b false"]);
    stops.forEach((stop) => stop());
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

  it("measures every instance again when a font finishes loading", () => {
    const { runFrame, log, make } = setup();
    // jsdom has no FontFaceSet; a browser has a real one.
    if (!("fonts" in document)) {
      Object.defineProperty(document, "fonts", { value: new EventTarget(), configurable: true });
    }
    const fonts = document.fonts as unknown as EventTarget;
    // The listener is added once, by the first instance after fonts exist.
    const stops = [observeTruncation(make("a")), observeTruncation(make("b"))];
    runFrame();
    log.length = 0;
    fonts.dispatchEvent(new Event("loadingdone"));
    runFrame();
    expect(log).toEqual(["read a", "read b", "write a false", "write b false"]);
    stops.forEach((stop) => stop());
  });

  it("stops measuring an instance once it is cleaned up", () => {
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

function moreLess({ expanded }: EllipsisState) {
  return <EllipsisToggle>{expanded ? "Less" : "More"}</EllipsisToggle>;
}

describe("Ellipsis", () => {
  it("keeps the expand control hidden and out of reach until it knows the text is cut", () => {
    render(
      <Ellipsis lines={2} after={moreLess}>
        Some text
      </Ellipsis>,
    );
    const after = document.querySelector('[data-slot="ellipsis-after"]')!;
    expect(after.hasAttribute("data-hidden")).toBe(true);
    expect(after.hasAttribute("inert")).toBe(true);
  });

  it("wires the toggle to the text with aria-expanded and aria-controls", () => {
    render(
      <Ellipsis expanded lines={3} after={<EllipsisToggle>Less</EllipsisToggle>}>
        Some text
      </Ellipsis>,
    );
    const toggle = screen.getByRole("button", { name: "Less" });
    const text = document.querySelector('[data-slot="ellipsis-text"]')!;
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(toggle.getAttribute("aria-controls")).toBe(text.id);
    // Shown while expanded, so it can collapse the text again.
    const after = document.querySelector('[data-slot="ellipsis-after"]')!;
    expect(after.hasAttribute("data-hidden")).toBe(false);
  });

  it("passes the lines to the clamp and has no clamp when expanded", () => {
    const { rerender } = render(<Ellipsis lines={3}>Some text</Ellipsis>);
    const root = document.querySelector<HTMLElement>('[data-slot="ellipsis"]')!;
    const text = () => document.querySelector('[data-slot="ellipsis-text"]')!;
    expect(root.style.getPropertyValue("--ellipsis-lines")).toBe("3");
    expect(text().className).toContain("line-clamp-(--ellipsis-lines)");
    rerender(
      <Ellipsis lines={3} expanded>
        Some text
      </Ellipsis>,
    );
    expect(text().className).toContain("line-clamp-none");
  });

  it("is not a button before it is measured", () => {
    render(<Ellipsis expandOnClick>Some text</Ellipsis>);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("refuses an EllipsisToggle outside an Ellipsis", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<EllipsisToggle>More</EllipsisToggle>)).toThrow(/inside an Ellipsis/);
  });
});
