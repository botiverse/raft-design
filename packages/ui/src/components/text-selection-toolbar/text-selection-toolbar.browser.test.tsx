import "./text-selection-toolbar.test.css";
/**
 * The toolbar over selected text, in real layout (#98).
 *
 * 1. A whole-line selection (a triple-click: from the start of a paragraph to
 *    the start of the next block) puts the toolbar over the line where the
 *    selection's focus end is, not over the middle of the whole range's
 *    bounding box, and the toolbar stays inside the viewport near an edge.
 * 2. Chinese labels stay on one line: CJK text may break between any two
 *    characters, so a shrunk toolbar wrapped 引用 / 复制 onto two lines.
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Popover, PopoverContent } from "../popover/popover";
import { ScrollArea } from "../scroll-area/scroll-area";
import {
  TextSelectionToolbar,
  TextSelectionToolbarButton,
  TextSelectionToolbarSeparator,
} from "./text-selection-toolbar";
import { createTextSelectionAnchor } from "./text-selection-anchor";
import type { TextSelectionAnchor } from "./text-selection-anchor";

const it = test.skipIf(typeof window === "undefined");
afterEach(() => {
  window.getSelection()?.removeAllRanges();
  cleanup();
});

const COLLISION_AVOIDANCE = { side: "flip", align: "shift", fallbackAxisSide: "none" } as const;

const TEXT =
  "The release train leaves on Thursday, so every pull request that should ride it needs a green build and one approval before Wednesday evening.";

function Icon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" />
    </svg>
  );
}

function Toolbar({ quote, copy }: { quote: string; copy: string }) {
  return (
    <>
      <TextSelectionToolbarButton data-testid="quote">
        <Icon />
        {quote}
      </TextSelectionToolbarButton>
      <TextSelectionToolbarSeparator />
      <TextSelectionToolbarButton data-testid="copy">
        <Icon />
        {copy}
      </TextSelectionToolbarButton>
    </>
  );
}

function Harness({
  anchor,
  style,
  children,
}: {
  anchor: TextSelectionAnchor | null;
  style: React.CSSProperties;
  children?: ReactNode;
}) {
  return (
    <ThemeProvider>
      <div style={{ position: "fixed", width: 320, ...style }}>
        <p data-testid="p" style={{ margin: 0, fontSize: 14, lineHeight: "20px" }}>
          {TEXT}
        </p>
        <p data-testid="next" style={{ margin: 0, fontSize: 14, lineHeight: "20px" }}>
          Next paragraph.
        </p>
      </div>
      <Popover open={Boolean(anchor)}>
        {anchor ? (
          <TextSelectionToolbar
            data-testid="toolbar"
            aria-label="Text selection actions"
            render={
              <PopoverContent
                align="center"
                anchor={anchor}
                collisionAvoidance={COLLISION_AVOIDANCE}
                collisionPadding={8}
                initialFocus={false}
                finalFocus={false}
                side="top"
                sideOffset={8}
              />
            }
          >
            {children}
          </TextSelectionToolbar>
        ) : null}
      </Popover>
    </ThemeProvider>
  );
}

function selectWholeParagraph() {
  const p = document.querySelector<HTMLElement>("[data-testid=p]")!;
  const next = document.querySelector<HTMLElement>("[data-testid=next]")!;
  const selection = window.getSelection()!;
  selection.setBaseAndExtent(p.firstChild!, 0, next, 0);
  return selection;
}

function lastLineOf(element: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(element);
  const rects = Array.from(range.getClientRects()).filter((r) => r.width > 0);
  return rects[rects.length - 1]!;
}

async function mount(style: React.CSSProperties) {
  const view = render(<Harness anchor={null} style={style} />);
  const selection = selectWholeParagraph();
  const anchor = createTextSelectionAnchor(selection);
  view.rerender(
    <Harness anchor={anchor} style={style}>
      <Toolbar quote="Quote" copy="Copy" />
    </Harness>,
  );
  const toolbar = await waitFor(() => {
    const el = document.querySelector<HTMLElement>("[data-testid=toolbar]");
    expect(el).not.toBeNull();
    return el!;
  });
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  return toolbar;
}

it("a whole-line selection anchors over the focus line, not the whole range", async () => {
  const toolbarEl = await mount({ top: 200, left: 40 });
  const p = document.querySelector<HTMLElement>("[data-testid=p]")!;
  const lastLine = lastLineOf(p);
  const pRect = p.getBoundingClientRect();
  expect(lastLine.top - pRect.top).toBeGreaterThanOrEqual(40);

  await waitFor(() => {
    const toolbar = toolbarEl.getBoundingClientRect();
    expect(toolbar.bottom).toBeLessThanOrEqual(lastLine.top);
    expect(lastLine.top - toolbar.bottom).toBeLessThanOrEqual(12);
    const center = (toolbar.left + toolbar.right) / 2;
    expect(center).toBeGreaterThanOrEqual(lastLine.left);
    expect(center).toBeLessThanOrEqual(lastLine.right);
  });
});

it("near the viewport's top and right edges the toolbar stays inside it", async () => {
  const toolbarEl = await mount({ top: -40, right: 0 });
  await waitFor(() => {
    const toolbar = toolbarEl.getBoundingClientRect();
    expect(toolbar.width).toBeGreaterThan(0);
    expect(toolbar.top).toBeGreaterThanOrEqual(0);
    expect(toolbar.left).toBeGreaterThanOrEqual(0);
    expect(toolbar.right).toBeLessThanOrEqual(window.innerWidth);
    expect(toolbar.bottom).toBeLessThanOrEqual(window.innerHeight);
  });
});

function lineCount(element: HTMLElement) {
  const text = Array.from(element.childNodes).find((node) => node.nodeType === Node.TEXT_NODE)!;
  const range = document.createRange();
  range.selectNodeContents(text);
  const tops = new Set(Array.from(range.getClientRects()).map((r) => Math.round(r.top)));
  return tops.size;
}

it("Chinese labels stay on one line and the toolbar matches the hover toolbar's size", () => {
  const { getByTestId } = render(
    <ThemeProvider>
      <div style={{ width: 1 }}>
        <TextSelectionToolbar data-testid="toolbar" aria-label="文本操作">
          <Toolbar quote="引用" copy="复制" />
        </TextSelectionToolbar>
      </div>
    </ThemeProvider>,
  );

  for (const id of ["quote", "copy"]) {
    const button = getByTestId(id);
    expect(lineCount(button)).toBe(1);
    expect(button.getBoundingClientRect().height).toBe(28);
    expect(button.querySelector("svg")!.getBoundingClientRect().width).toBe(16);
  }
  expect(getByTestId("toolbar").getBoundingClientRect().height).toBe(36);
});

const SCROLL_AREA_STYLE = { width: 360, height: 240, marginTop: 80 };

it("follows scrolling inside a ScrollArea with the single-argument createTextSelectionAnchor", async () => {
  function ScrollHarness({ anchor }: { anchor: TextSelectionAnchor | null }) {
    return (
      <ThemeProvider>
        <ScrollArea data-testid="scroller" style={SCROLL_AREA_STYLE}>
          <div style={{ height: 900, paddingTop: 120 }}>
            <p data-testid="p" style={{ margin: 0, fontSize: 14, lineHeight: "20px" }}>
              Selected text inside a scrolling conversation.
            </p>
          </div>
        </ScrollArea>
        <Popover open={Boolean(anchor)}>
          {anchor ? (
            <TextSelectionToolbar
              data-testid="toolbar"
              aria-label="Text selection actions"
              render={
                <PopoverContent
                  align="center"
                  anchor={anchor}
                  collisionAvoidance={COLLISION_AVOIDANCE}
                  collisionPadding={8}
                  initialFocus={false}
                  finalFocus={false}
                  side="top"
                  sideOffset={8}
                />
              }
            >
              <Toolbar quote="Quote" copy="Copy" />
            </TextSelectionToolbar>
          ) : null}
        </Popover>
      </ThemeProvider>
    );
  }

  const view = render(<ScrollHarness anchor={null} />);
  const p = document.querySelector<HTMLElement>("[data-testid=p]")!;
  const scroller = document.querySelector<HTMLElement>("[data-testid=scroller]")!;
  const range = document.createRange();
  range.selectNodeContents(p.firstChild!);
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
  const anchor = createTextSelectionAnchor(selection);
  expect(anchor?.contextElement).toBe(p);

  view.rerender(<ScrollHarness anchor={anchor} />);
  const toolbar = await waitFor(() => {
    const el = document.querySelector<HTMLElement>("[data-testid=toolbar]");
    expect(el).not.toBeNull();
    return el!;
  });
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const beforeTop = toolbar.getBoundingClientRect().top;

  scroller.scrollTop = 60;
  await waitFor(() => {
    expect(toolbar.getBoundingClientRect().top).toBeCloseTo(beforeTop - 60, 0);
  });
});

it("follows scrolling when selection spans direct children of a native scroll container", async () => {
  function MultiBlockScrollHarness({ anchor }: { anchor: TextSelectionAnchor | null }) {
    return (
      <ThemeProvider>
        <div
          data-testid="native-scroller"
          style={{ width: 360, height: 220, overflowY: "auto", marginTop: 80 }}
        >
          <p data-testid="p1" style={{ margin: "120px 0 8px", fontSize: 14, lineHeight: "20px" }}>
            First paragraph directly inside the scroll container.
          </p>
          <p data-testid="p2" style={{ margin: "0 0 600px", fontSize: 14, lineHeight: "20px" }}>
            Second paragraph directly inside the scroll container.
          </p>
        </div>
        <Popover open={Boolean(anchor)}>
          {anchor ? (
            <TextSelectionToolbar
              data-testid="toolbar"
              aria-label="Text selection actions"
              render={
                <PopoverContent
                  align="center"
                  anchor={anchor}
                  collisionAvoidance={COLLISION_AVOIDANCE}
                  collisionPadding={8}
                  initialFocus={false}
                  finalFocus={false}
                  side="top"
                  sideOffset={8}
                />
              }
            >
              <Toolbar quote="Quote" copy="Copy" />
            </TextSelectionToolbar>
          ) : null}
        </Popover>
      </ThemeProvider>
    );
  }

  const view = render(<MultiBlockScrollHarness anchor={null} />);
  const scroller = document.querySelector<HTMLElement>("[data-testid=native-scroller]")!;
  const p1 = document.querySelector<HTMLElement>("[data-testid=p1]")!;
  const p2 = document.querySelector<HTMLElement>("[data-testid=p2]")!;
  const selection = window.getSelection()!;
  selection.setBaseAndExtent(p1.firstChild!, 0, p2.firstChild!, 16);
  // commonAncestorContainer is the scroll container itself; contextElement must
  // point at a child element inside it so Floating UI hears scroller's scroll.
  expect(selection.getRangeAt(0).commonAncestorContainer).toBe(scroller);
  const anchor = createTextSelectionAnchor(selection);
  expect(anchor?.contextElement).toBe(p2);

  view.rerender(<MultiBlockScrollHarness anchor={anchor} />);
  const toolbar = await waitFor(() => {
    const el = document.querySelector<HTMLElement>("[data-testid=toolbar]");
    expect(el).not.toBeNull();
    return el!;
  });
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const beforeTop = toolbar.getBoundingClientRect().top;

  scroller.scrollTop = 60;
  await waitFor(() => {
    expect(toolbar.getBoundingClientRect().top).toBeCloseTo(beforeTop - 60, 0);
  });
});
