/** @vitest-environment jsdom */
import { afterEach, expect, it, vi } from "vite-plus/test";

import { getResizeObserverDelegate } from "../resize-observer/resize-observer-delegate";

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

/** A ResizeObserver that records what it is made for and what it observes. */
function fakeObserver(created: string[], observed: Element[], name: string) {
  return class {
    constructor() {
      created.push(name);
    }
    observe(element: Element) {
      observed.push(element);
    }
    unobserve() {}
    disconnect() {}
  };
}

it("creates one ResizeObserver per window, from that window", () => {
  const created: string[] = [];
  const pageObserved: Element[] = [];
  const otherObserved: Element[] = [];
  vi.stubGlobal("ResizeObserver", fakeObserver(created, pageObserved, "page"));
  const frame = document.createElement("iframe");
  document.body.append(frame);
  const other = frame.contentWindow!;
  Object.defineProperty(other, "ResizeObserver", {
    value: fakeObserver(created, otherObserved, "other"),
    configurable: true,
  });
  const doc = frame.contentDocument!;

  const pageRows = [document.createElement("div"), document.createElement("div")];
  const otherRows = [doc.createElement("div"), doc.createElement("div")];
  document.body.append(...pageRows);
  doc.body.append(...otherRows);
  for (const row of [...pageRows, ...otherRows]) {
    getResizeObserverDelegate(row).observe(row, () => {});
  }

  expect(created.toSorted()).toEqual(["other", "page"]);
  expect(pageObserved).toEqual(pageRows);
  expect(otherObserved).toEqual(otherRows);
  expect(getResizeObserverDelegate(otherRows[0])).toBe(getResizeObserverDelegate(doc.body));
  expect(getResizeObserverDelegate(pageRows[0])).toBe(getResizeObserverDelegate());
  expect(getResizeObserverDelegate(otherRows[0])).not.toBe(getResizeObserverDelegate());
});
