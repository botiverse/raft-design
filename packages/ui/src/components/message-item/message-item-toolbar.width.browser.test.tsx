import "./message-item.avatar-align.test.css";
import { Profiler, useState } from "react";
import { afterAll, afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { MessageItem } from "./message-item-root";
import { MessageItemBody, MessageItemContent } from "./message-item-content";
import { MessageItemHeader, MessageItemSender, MessageItemTime } from "./message-item-header";
import { MessageItemToolbar, MessageItemToolbarButton } from "./message-item-toolbar";

// Every row of a timeline renders a MessageItemToolbar, so the toolbar writes
// its width onto the row (`--mi-toolbar-width`, read by the header's fade)
// only as it shows: mounting takes one commit and no ResizeObserver per row
// (message-item.md, "The hover toolbar"). Measured in a real browser:
// - the first frame that shows the toolbar already fades the right width,
// - a button added while it shows is measured again,
// - a show that came without pointerenter or focusin still fades: the row
//   holds five buttons' width (164px) from mount.
// Touch lives apart, in message-item-toolbar.width.phone.browser.test.tsx.

const it = test.skipIf(typeof window === "undefined");

/**
 * ResizeObservers constructed, those watching a toolbar and not yet
 * disconnected, and the toolbars watched right now.
 */
const constructed: ResizeObserver[] = [];
const toolbarObservers = new Set<ResizeObserver>();
const watching = new Set<Element>();
let NativeResizeObserver: typeof ResizeObserver;

beforeAll(() => {
  if (typeof window === "undefined") return;
  NativeResizeObserver = window.ResizeObserver;
  window.ResizeObserver = class extends NativeResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      super(callback);
      constructed.push(this);
    }
    override observe(target: Element, options?: ResizeObserverOptions) {
      if (target.matches("[data-slot=message-item-toolbar]")) {
        watching.add(target);
        toolbarObservers.add(this);
      }
      super.observe(target, options);
    }
    override unobserve(target: Element) {
      watching.delete(target);
      super.unobserve(target);
    }
    override disconnect() {
      toolbarObservers.delete(this);
      super.disconnect();
    }
  };
});

afterAll(() => {
  if (typeof window === "undefined") return;
  window.ResizeObserver = NativeResizeObserver;
});

afterEach(cleanup);

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

// Chromium resolves `transparent` to rgba(0, 0, 0, 0) and the calc to px.
const CLEAR_STOP = /^linear-gradient\(to left, (?:transparent|rgba\(0, 0, 0, 0\)) ([\d.]+)px/;

/** Where the header's fade turns fully clear, from its end; null without a mask. */
function clearStop(header: HTMLElement): number | null {
  const match = CLEAR_STOP.exec(getComputedStyle(header).maskImage);
  return match ? Number(match[1]) : null;
}

function Buttons({ count }: { count: number }) {
  return Array.from({ length: count }, (_, index) => (
    <MessageItemToolbarButton key={index} aria-label={`Action ${index + 1}`}>
      <svg viewBox="0 0 24 24" />
    </MessageItemToolbarButton>
  ));
}

function Row({ index = 0, buttons = 3 }: { index?: number; buttons?: number }) {
  return (
    <MessageItem data-testid={`row-${index}`}>
      <MessageItemToolbar data-testid={`toolbar-${index}`}>
        <Buttons count={buttons} />
      </MessageItemToolbar>
      <MessageItemContent>
        <MessageItemHeader data-testid={`header-${index}`}>
          <MessageItemSender>
            Release Coordinator for the Northstar Partner Workspace
          </MessageItemSender>
          <MessageItemTime>2:33 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>v0.30.1 passed its smoke test on staging.</MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}

let commits = 0;
const countCommit = () => {
  commits += 1;
};

function Timeline({ rows }: { rows: number }) {
  return (
    <ThemeProvider>
      <Profiler id="timeline" onRender={countCommit}>
        <div className="pt-6" style={{ width: 360 }}>
          {Array.from({ length: rows }, (_, index) => (
            <Row key={index} index={index} />
          ))}
        </div>
      </Profiler>
    </ThemeProvider>
  );
}

it("mounting a timeline of rows with toolbars takes one commit and constructs no ResizeObserver", async () => {
  commits = 0;
  const before = constructed.length;
  render(<Timeline rows={100} />);
  await nextFrame();
  await nextFrame();

  expect(commits).toBe(1);
  expect(constructed.length - before).toBe(0);
  expect(watching.size).toBe(0);
  // Nothing was measured: every row holds the fallback until its toolbar shows.
  for (const row of document.querySelectorAll<HTMLElement>("[data-message-item]")) {
    expect(row.style.getPropertyValue("--mi-toolbar-width")).toBe("164px");
  }
});

it("the first frame that shows the toolbar already fades its width, written by pointerenter", async () => {
  render(
    <ThemeProvider>
      <div className="pt-6" style={{ width: 360 }}>
        <Row />
      </div>
    </ThemeProvider>,
  );
  const { page, userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.unhover(document.body);
  const row = screen.getByTestId("row-0");
  const toolbar = screen.getByTestId("toolbar-0");
  const header = screen.getByTestId("header-0");
  // Laid out at rest (only its opacity is 0), so it has its width to measure.
  expect(getComputedStyle(toolbar).opacity).toBe("0");
  expect(toolbar.offsetWidth).toBeGreaterThan(0);
  expect(clearStop(header)).toBeNull();
  // A stale width from an earlier show: pointerenter must replace it.
  row.style.setProperty("--mi-toolbar-width", "1px");

  // Registered after the toolbar's own listener, so it runs after it, in the
  // same task, before the browser renders a frame.
  const seen = new Promise<{ written: string; opacity: string; clear: number | null }>(
    (resolve) => {
      row.addEventListener(
        "pointerenter",
        () => {
          const written = row.style.getPropertyValue("--mi-toolbar-width");
          // rAF callbacks run before that frame's style and paint: what they
          // read is what the first frame with :hover paints.
          requestAnimationFrame(() =>
            resolve({
              written,
              opacity: getComputedStyle(toolbar).opacity,
              clear: clearStop(header),
            }),
          );
        },
        { once: true },
      );
    },
  );
  await page.getByTestId("row-0").hover();
  const first = await seen;

  expect(first.written).toBe(`${toolbar.offsetWidth}px`);
  expect(first.opacity).toBe("1");
  // The toolbar's width plus the 4px it sits inside the header's end and a 4px gap.
  expect(first.clear).toBe(toolbar.offsetWidth + 8);
});

it("a button added while the toolbar shows is measured again, by one shared observer", async () => {
  function Growing() {
    const [buttons, setButtons] = useState(3);
    return (
      <ThemeProvider>
        <div className="pt-6" style={{ width: 360 }}>
          <Row buttons={buttons} />
        </div>
        <button type="button" data-testid="grow" onClick={() => setButtons((n) => n + 1)} />
      </ThemeProvider>
    );
  }
  render(<Growing />);
  const { page, userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.unhover(document.body);
  const row = screen.getByTestId("row-0");
  const toolbar = screen.getByTestId("toolbar-0");
  const header = screen.getByTestId("header-0");
  const constructedBefore = constructed.length;

  await page.getByTestId("row-0").hover();
  const narrow = toolbar.offsetWidth;
  expect(row.style.getPropertyValue("--mi-toolbar-width")).toBe(`${narrow}px`);
  expect([...watching]).toEqual([toolbar]);
  expect(toolbarObservers.size).toBe(1);

  // Add a button while the row stays hovered (a popup that adds one).
  screen.getByTestId("grow").click();
  await nextFrame();
  await nextFrame();
  const wide = toolbar.offsetWidth;
  expect(wide).toBe(narrow + 32);
  expect(row.style.getPropertyValue("--mi-toolbar-width")).toBe(`${wide}px`);
  expect(clearStop(header)).toBe(wide + 8);

  // Leaving lets it go: no observer watches a toolbar that doesn't show,
  // and none is left once no toolbar shows.
  await userEvent.unhover(document.body);
  expect(watching.size).toBe(0);
  expect(toolbarObservers.size).toBe(0);
  expect(constructed.length - constructedBefore).toBe(1);
});

it("focus moving into the row writes the width, and leaving with focus lets the observer go", async () => {
  render(
    <ThemeProvider>
      <div className="pt-6" style={{ width: 360 }}>
        <Row />
      </div>
      <button type="button" data-testid="outside" />
    </ThemeProvider>,
  );
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.unhover(document.body);
  const row = screen.getByTestId("row-0");
  const toolbar = screen.getByTestId("toolbar-0");
  const header = screen.getByTestId("header-0");

  screen.getByRole("button", { name: "Action 1" }).focus();
  expect(row.style.getPropertyValue("--mi-toolbar-width")).toBe(`${toolbar.offsetWidth}px`);
  expect(getComputedStyle(toolbar).opacity).toBe("1");
  expect(clearStop(header)).toBe(toolbar.offsetWidth + 8);
  expect([...watching]).toEqual([toolbar]);

  screen.getByTestId("outside").focus();
  expect(getComputedStyle(toolbar).opacity).toBe("0");
  expect(clearStop(header)).toBeNull();
  expect(watching.size).toBe(0);
  expect(toolbarObservers.size).toBe(0);
});

it("a show that came without pointerenter or focusin still fades: five buttons' width", async () => {
  render(
    <ThemeProvider>
      <div className="pt-6" style={{ width: 360 }}>
        <Row />
      </div>
    </ThemeProvider>,
  );
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.unhover(document.body);
  const row = screen.getByTestId("row-0");
  const toolbar = screen.getByTestId("toolbar-0");
  const header = screen.getByTestId("header-0");
  expect(row.style.getPropertyValue("--mi-toolbar-width")).toBe("164px");

  // An open popup shows the toolbar with no pointer or focus event on the row.
  screen.getByRole("button", { name: "Action 1" }).setAttribute("data-popup-open", "");

  expect(getComputedStyle(toolbar).opacity).toBe("1");
  expect(clearStop(header)).toBe(164 + 8);
});

it("a row without a toolbar gets no width and masks nothing on hover", async () => {
  render(
    <ThemeProvider>
      <div className="pt-6" style={{ width: 360 }}>
        <MessageItem data-testid="bare">
          <MessageItemContent>
            <MessageItemHeader data-testid="bare-header">
              <MessageItemSender>
                Release Coordinator for the Northstar Partner Workspace
              </MessageItemSender>
            </MessageItemHeader>
          </MessageItemContent>
        </MessageItem>
      </div>
    </ThemeProvider>,
  );
  const { page } = await import("vite-plus/test/browser/context");
  await page.getByTestId("bare").hover();

  expect(getComputedStyle(screen.getByTestId("bare-header")).maskImage).toBe("none");
});
