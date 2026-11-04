// ScrollArea in real layout, in the arrangements slock renders (sticky gutters on a plain box and on
// a VirtualList timeline, absolute gutters, the composer's textarea), resized and grown over many
// frames: no "ResizeObserver loop completed with undelivered notifications." error. Chromium
// reports it on `window` (an `error` event) and the test runner logs it; slock's desktop render
// smoke fails on that console error.
//
// Revert to fail: use-scrollbars.ts, `observedFor` (watch VirtualList's items element itself): the
// timeline scenes where a row grows fail.
/* oxlint-disable react-perf/jsx-no-new-object-as-prop, react-perf/jsx-no-new-function-as-prop --
   each scene renders once. */
import "../virtual-list/tests/virtual-list.test.css";
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vite-plus/test";

import { VirtualList } from "../virtual-list/index";
import type { VirtualListItemRenderProps } from "../virtual-list/index";
import { ScrollArea, ScrollAreaGutters, ScrollAreaTextarea, useScrollAreaContainer } from "./index";
import { FramedScrollArea } from "./test-scenes";

const it = test.skipIf(typeof window === "undefined");

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
/** `count` frames, then a task: every ResizeObserver notification of those frames has been delivered. */
async function frames(count: number) {
  for (let index = 0; index < count; index += 1) await nextFrame();
  await new Promise<void>((resolve) => setTimeout(resolve));
}

const loopMessage = "ResizeObserver loop";

/** Collects `error` events on `window` and `console.error` calls until `stop()`. */
function collectErrors() {
  const errors: string[] = [];
  const onError = (event: ErrorEvent) => {
    errors.push(String(event.message));
    // Caught here, so the runner doesn't fail the file on it before the assertion names the scene.
    if (String(event.message).includes(loopMessage)) event.preventDefault();
  };
  window.addEventListener("error", onError, true);
  const consoleError = console.error.bind(console);
  const spy = vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    errors.push(args.map(String).join(" "));
    consoleError(...args);
  });
  return {
    loops: () => errors.filter((message) => message.includes(loopMessage)),
    stop() {
      window.removeEventListener("error", onError, true);
      spy.mockRestore();
    },
  };
}

type Row = { key: string; text: string };
const ROWS: Row[] = Array.from({ length: 60 }, (_, index) => ({
  key: `row-${index}`,
  text: "word ".repeat(5 + ((index * 7) % 40)),
}));

/** slock's message timeline: the list is the container, the sticky gutters its header. */
function Timeline({ rows }: { rows: Row[] }) {
  const { containerProps, guttersProps } = useScrollAreaContainer<HTMLDivElement>({
    overscroll: "auto",
    trigger: "scroll",
  });
  return (
    <VirtualList<Row>
      domRef={containerProps.ref}
      header={<ScrollAreaGutters {...guttersProps} />}
      items={rows}
      getKey={(row) => row.key}
      itemEstimatedSize={40}
      itemMinSize={20}
      itemResizable
      keepAnchorOnItemsChange
      footer={({ domRef }) => (
        <div ref={domRef} style={{ padding: 4 }}>
          typing…
        </div>
      )}
      className={`${containerProps.className} flex flex-col`}
      style={{ height: "100%", ...containerProps.style }}
      itemsClassName="mt-auto shrink-0"
    >
      {({ domRef, item, style }: VirtualListItemRenderProps<Row>) => (
        <div key={item.key} ref={domRef} style={style}>
          {item.text}
          {/* What an image loading or a reaction added does to a row. */}
          <div data-testid="growth" style={{ height: 0 }} />
        </div>
      )}
    </VirtualList>
  );
}

const growths = (root: Element) => [
  ...root.querySelectorAll<HTMLElement>('[data-testid="growth"]'),
];

const scenes: Record<string, () => Promise<void>> = {
  "sticky gutters: content grows past a max-height (the gutter appears), then the width shrinks":
    async () => {
      const { container } = render(
        <div data-testid="host" style={{ width: 300 }}>
          <ScrollArea style={{ maxHeight: 200 }} trigger="none">
            <div data-testid="content" style={{ height: 50 }} />
          </ScrollArea>
        </div>,
      );
      const host = container.querySelector<HTMLElement>('[data-testid="host"]')!;
      const content = container.querySelector<HTMLElement>('[data-testid="content"]')!;
      await frames(2);
      for (let height = 50; height <= 600; height += 37) {
        content.style.height = `${height}px`;
        await frames(1);
      }
      expect(container.querySelector(".r-scroll-area__gutter--vertical")).not.toBeNull();
      for (let width = 300; width >= 150; width -= 13) {
        host.style.width = `${width}px`;
        await frames(1);
      }
    },
  "sticky gutters with a content box: wrapped text, the box narrowed and heightened": async () => {
    const { container } = render(
      <div
        data-testid="host"
        style={{ display: "flex", flexDirection: "column", height: 200, width: 400 }}
      >
        <ScrollArea contentStyle={{ padding: 8 }} style={{ flex: "1 1 auto", minHeight: 0 }}>
          {Array.from({ length: 8 }, (_, index) => (
            <p key={index}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do.</p>
          ))}
        </ScrollArea>
      </div>,
    );
    const host = container.querySelector<HTMLElement>('[data-testid="host"]')!;
    await frames(2);
    for (let width = 400; width >= 80; width -= 9) {
      host.style.width = `${width}px`;
      await frames(1);
    }
    for (let height = 200; height <= 1200; height += 47) {
      host.style.height = `${height}px`;
      await frames(1);
    }
  },
  "sticky gutters scrolling sideways, padded (a markdown table), the width changing": async () => {
    const { container } = render(
      <div data-testid="host" style={{ width: 600 }}>
        <ScrollArea orientation="horizontal" style={{ padding: "4px 8px" }}>
          <table>
            <tbody>
              <tr>
                {Array.from({ length: 10 }, (_, index) => (
                  <td key={index} style={{ whiteSpace: "nowrap" }}>
                    column number {index}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </ScrollArea>
      </div>,
    );
    const host = container.querySelector<HTMLElement>('[data-testid="host"]')!;
    await frames(2);
    for (let width = 1600; width >= 100; width -= 61) {
      host.style.width = `${width}px`;
      await frames(1);
    }
  },
  "absolute gutters: content grows, then the frame shrinks": async () => {
    const { container } = render(
      <div
        data-testid="host"
        style={{ display: "flex", flexDirection: "column", height: 300, width: 300 }}
      >
        <FramedScrollArea style={{ flex: "1 1 auto", minHeight: 0 }}>
          <div data-testid="content" style={{ height: 100 }} />
        </FramedScrollArea>
      </div>,
    );
    const host = container.querySelector<HTMLElement>('[data-testid="host"]')!;
    const content = container.querySelector<HTMLElement>('[data-testid="content"]')!;
    await frames(2);
    for (let height = 100; height <= 900; height += 53) {
      content.style.height = `${height}px`;
      await frames(1);
    }
    for (let height = 300; height >= 40; height -= 19) {
      host.style.height = `${height}px`;
      await frames(1);
    }
  },
  "the composer's textarea: lines typed past its cap, then narrowed": async () => {
    const { container } = render(
      <div data-testid="host" style={{ width: 300 }}>
        <ScrollAreaTextarea
          aria-label="Message"
          style={{ fieldSizing: "content", maxHeight: 128 }}
        />
      </div>,
    );
    const host = container.querySelector<HTMLElement>('[data-testid="host"]')!;
    const textarea = container.querySelector("textarea")!;
    await frames(2);
    for (let lines = 1; lines < 20; lines += 1) {
      textarea.value = Array.from({ length: lines }, (_, index) => `line ${index}`).join("\n");
      textarea.dispatchEvent(new InputEvent("input", { bubbles: true }));
      await frames(1);
    }
    for (let width = 300; width >= 60; width -= 11) {
      host.style.width = `${width}px`;
      await frames(1);
    }
  },
  "a VirtualList timeline: the window narrowed and widened": async () => {
    const { container } = render(
      <div data-testid="host" style={{ height: 400, width: 500 }}>
        <Timeline rows={ROWS} />
      </div>,
    );
    const host = container.querySelector<HTMLElement>('[data-testid="host"]')!;
    await frames(3);
    for (let width = 500; width >= 120; width -= 23) {
      host.style.width = `${width}px`;
      await frames(1);
    }
    for (let width = 120; width <= 900; width += 41) {
      host.style.width = `${width}px`;
      host.style.height = `${300 + width / 3}px`;
      await frames(1);
    }
  },
  "a VirtualList timeline: a row in view grows (an image loads)": async () => {
    const { container } = render(
      <div style={{ height: 400, width: 500 }}>
        <Timeline rows={ROWS} />
      </div>,
    );
    await frames(3);
    for (let step = 1; step <= 12; step += 1) {
      const rows = growths(container);
      rows[rows.length - 1 - (step % 4)]!.style.height = `${step * 13}px`;
      await frames(1);
    }
  },
  "a short VirtualList timeline: its rows grow until it scrolls (the gutter appears)": async () => {
    const { container } = render(
      <div style={{ height: 400, width: 500 }}>
        <Timeline rows={ROWS.slice(0, 3)} />
      </div>,
    );
    await frames(3);
    for (let step = 1; step <= 30; step += 1) {
      growths(container)[step % 3]!.style.height = `${step * 13}px`;
      await frames(1);
    }
    expect(container.querySelector(".r-scroll-area__gutter--vertical")).not.toBeNull();
  },
};

it("sees a ResizeObserver loop when there is one", async () => {
  const collected = collectErrors();
  const element = document.createElement("div");
  element.style.height = "10px";
  document.body.append(element);
  let resizes = 0;
  // Resizes what it observes from its own notification, a few times.
  const observer = new ResizeObserver(() => {
    resizes += 1;
    if (resizes < 5) element.style.height = `${10 + resizes * 10}px`;
  });
  observer.observe(element);
  try {
    await frames(4);
  } finally {
    observer.disconnect();
    element.remove();
    collected.stop();
  }
  expect(collected.loops().length).toBeGreaterThan(0);
});

it.each(Object.keys(scenes))("causes no ResizeObserver loop: %s", async (name) => {
  const collected = collectErrors();
  try {
    await scenes[name]!();
    await frames(3);
  } finally {
    collected.stop();
  }
  expect(collected.loops()).toEqual([]);
});
