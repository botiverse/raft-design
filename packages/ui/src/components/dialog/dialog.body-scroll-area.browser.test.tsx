import "./dialog.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "../button/index";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "../select/select";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { DialogCommit, DialogSheetContent } from "./dialog-sheet";

// DialogBody with `unstable_scrollArea` (dialog.md, "Scrolling in a
// ScrollArea"): a frame takes the body's place in the dialog and the body
// scrolls inside it, under raft-ui's scrollbar. What must not move: the
// body's padding, its own grid, a list opened from a field in it, and, in a
// phone sheet, the head above it, the inset under it and the Tab order.
// Measured in a real browser, at 1280 x 800 and at an iPhone's 390 x 844.

const it = test.skipIf(typeof window === "undefined");

async function setViewport(width: number, height: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, height);
}

// The sheet slides up over 240ms, and the area measures in the next frame.
const settle = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  await setViewport(414, 896);
});

const OPTIONS = Array.from({ length: 6 }, (_, index) => `Option ${index + 1}`);

function Rows({ rows, picker = false }: { rows: number; picker?: boolean }) {
  return (
    <>
      {Array.from({ length: rows }, (_, index) => (
        <label key={index} data-testid={`row-${index}`} className="grid gap-1">
          Field {index + 1}
          <input name={`field-${index}`} />
        </label>
      ))}
      {picker ? (
        <Select defaultValue="Option 1">
          <SelectTrigger aria-label="Picker">
            <SelectValue />
          </SelectTrigger>
          <SelectContent data-testid="picker-list">
            <SelectList>
              {OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  <SelectItemText>{option}</SelectItemText>
                </SelectItem>
              ))}
            </SelectList>
          </SelectContent>
        </Select>
      ) : null}
    </>
  );
}

function Scene({
  scrollArea = true,
  header = true,
  rows = 3,
  picker = false,
  children,
}: {
  scrollArea?: boolean;
  header?: boolean;
  rows?: number;
  picker?: boolean;
  children?: ReactNode;
}) {
  return (
    <ThemeProvider>
      <Dialog open>
        <DialogContent>
          {header ? (
            <DialogHeader>
              <DialogTitle>Create channel</DialogTitle>
              <DialogClose />
            </DialogHeader>
          ) : null}
          <DialogBody data-testid="body" className="grid gap-4" unstable_scrollArea={scrollArea}>
            <Rows rows={rows} picker={picker} />
            {children}
          </DialogBody>
          <DialogFooter data-testid="footer">
            <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
            <Button variant="primary">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}

function Sheet({
  rows = 30,
  scrollArea = true,
  children,
}: {
  rows?: number;
  scrollArea?: boolean;
  children?: ReactNode;
}) {
  return (
    <ThemeProvider>
      <Dialog open>
        <DialogSheetContent>
          <DialogHeader>
            <DialogTitle>Create channel</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <form id="body-scroll-area-form" className="contents">
            <DialogBody data-testid="body" className="grid gap-4" unstable_scrollArea={scrollArea}>
              <Rows rows={rows} />
              {children}
            </DialogBody>
            <DialogFooter data-testid="footer">
              <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
              <DialogCommit type="submit" variant="primary">
                Create
              </DialogCommit>
            </DialogFooter>
          </form>
        </DialogSheetContent>
      </Dialog>
    </ThemeProvider>
  );
}

const popup = () => document.querySelector("[data-slot=dialog-content]") as HTMLElement;
const frame = () => document.querySelector("[data-slot=dialog-body-frame]") as HTMLElement;
const rect = (element: Element) => element.getBoundingClientRect();

/** Where the first row sits in the card, and how wide it is. */
function firstRow() {
  const row = rect(screen.getByTestId("row-0"));
  const card = rect(popup());
  return {
    top: row.top - card.top,
    left: row.left - card.left,
    width: row.width,
  };
}

it("scrolls a long body between the head and the footer, under raft-ui's scrollbar", async () => {
  await setViewport(1280, 800);
  render(<Scene rows={30} />);
  await settle(100);
  const body = screen.getByTestId("body");
  const head = document.querySelector("[data-slot=dialog-header]") as HTMLElement;
  const footer = screen.getByTestId("footer");

  // The card stops 16px from the window's edges and the body takes what is left.
  expect(rect(popup()).height).toBe(800 - 32);
  expect(Math.round(rect(frame()).top)).toBe(Math.round(rect(head).bottom));
  expect(Math.round(rect(frame()).bottom)).toBe(Math.round(rect(footer).top));
  expect(rect(body).height).toBe(rect(frame()).height);
  expect(rect(body).width).toBe(rect(popup()).width);
  expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);

  // One scrollbar, raft-ui's: the platform's takes no room and is not drawn.
  expect(getComputedStyle(body).scrollbarWidth).toBe("none");
  expect(body.offsetWidth).toBe(body.clientWidth);
  await waitFor(() =>
    expect(frame().querySelector("[data-slot=scroll-area-scrollbar]")).not.toBeNull(),
  );
  const bar = frame().querySelector("[data-slot=scroll-area-scrollbar]") as HTMLElement;
  const thumb = bar.querySelector("[data-slot=scroll-area-thumb]") as HTMLElement;
  expect(bar.dataset.orientation).toBe("vertical");
  expect(rect(thumb).height).toBeGreaterThan(16);
  expect(rect(thumb).height).toBeLessThan(rect(body).height);
  expect(Math.round(rect(popup()).right - rect(bar).right)).toBeLessThanOrEqual(4);
  expect(rect(bar).top).toBeGreaterThanOrEqual(rect(body).top);
  expect(rect(bar).bottom).toBeLessThanOrEqual(rect(body).bottom);

  // It scrolls, and the thumb follows.
  const before = rect(thumb).top;
  body.scrollTop = 400;
  await settle(100);
  expect(body.scrollTop).toBe(400);
  expect(rect(thumb).top).toBeGreaterThan(before);
  expect(rect(head).top).toBe(rect(popup()).top);
  expect(Math.round(rect(footer).bottom)).toBe(Math.round(rect(popup()).bottom));
});

it("draws no scrollbar and takes its content's height when the body is short", async () => {
  await setViewport(1280, 800);
  render(<Scene rows={3} scrollArea={false} />);
  const native = { card: rect(popup()).height, body: rect(screen.getByTestId("body")).height };
  cleanup();
  render(<Scene rows={3} />);
  await settle(100);
  const body = screen.getByTestId("body");
  expect(rect(popup()).height).toBe(native.card);
  expect(rect(body).height).toBe(native.body);
  expect(body.scrollHeight).toBe(body.clientHeight);
  expect(frame().querySelector("[data-slot=scroll-area-scrollbar]")).toBeNull();
});

it("keeps the top inset of a dialog with no header", async () => {
  await setViewport(1280, 800);
  render(<Scene header={false} scrollArea={false} />);
  const native = firstRow();
  cleanup();
  render(<Scene header={false} />);
  const body = screen.getByTestId("body");
  const style = getComputedStyle(body);
  // The same inset on top as at the sides, as the body alone has it.
  expect(parseFloat(style.paddingTop)).toBeGreaterThanOrEqual(16);
  expect(style.paddingTop).toBe(style.paddingLeft);
  expect(firstRow()).toEqual(native);
});

it("keeps the first row of a grid body where it is under a header", async () => {
  await setViewport(1280, 800);
  render(<Scene scrollArea={false} />);
  const native = firstRow();
  const nativeGap =
    rect(screen.getByTestId("row-1")).top - rect(screen.getByTestId("row-0")).bottom;
  cleanup();
  render(<Scene />);
  const body = screen.getByTestId("body");
  expect(getComputedStyle(body).paddingTop).toBe("6px");
  expect(firstRow()).toEqual(native);
  // The grid holds the caller's rows only: one gap between each, none before the first.
  expect(body.firstElementChild).toBe(screen.getByTestId("row-0"));
  expect(rect(screen.getByTestId("row-0")).top - rect(body).top).toBe(6);
  expect(rect(screen.getByTestId("row-1")).top - rect(screen.getByTestId("row-0")).bottom).toBe(
    nativeGap,
  );
  expect(nativeGap).toBe(16);
});

it("opens a Select from the body on its trigger, over the card, and keeps it there as the body scrolls", async () => {
  await setViewport(1280, 800);
  const { userEvent } = await import("vite-plus/test/browser/context");
  render(<Scene rows={30} picker />);
  await settle(100);
  const body = screen.getByTestId("body");
  const trigger = screen.getByRole("combobox", { name: "Picker" });
  // The trigger in the middle of the body, with rows scrolled past both ends.
  body.scrollTop = body.scrollHeight - body.clientHeight - 300;
  await settle(100);
  await userEvent.click(trigger);
  const list = await screen.findByTestId("picker-list");
  await settle(100);

  const placed = () => {
    const at = rect(list);
    const anchor = rect(trigger);
    expect(Math.abs(at.left - anchor.left)).toBeLessThanOrEqual(2);
    // Under the trigger or flipped over it, 4px away.
    const gap = at.top >= anchor.bottom ? at.top - anchor.bottom : anchor.top - at.bottom;
    expect(Math.abs(gap - 4)).toBeLessThanOrEqual(1);
  };
  placed();
  // Not clipped by the body or drawn under the card: every corner and the middle are the list's.
  const at = rect(list);
  expect(at.height).toBeGreaterThan(100);
  expect(at.top).toBeGreaterThanOrEqual(0);
  expect(at.bottom).toBeLessThanOrEqual(window.innerHeight);
  for (const [x, y] of [
    [at.left + 4, at.top + 4],
    [at.right - 4, at.top + 4],
    [at.left + 4, at.bottom - 4],
    [at.right - 4, at.bottom - 4],
    [at.left + at.width / 2, at.top + at.height / 2],
  ] as const) {
    expect(list.contains(document.elementFromPoint(x, y)), `${x},${y}`).toBe(true);
  }

  // The body is the list's scrolling ancestor: the list follows its trigger.
  const before = rect(trigger).top;
  body.scrollTop -= 60;
  await settle(200);
  expect(Math.round(rect(trigger).top - before)).toBe(60);
  placed();
});

it("in a phone sheet scrolls the body under the head, on the 16px margin above the home indicator", async () => {
  await setViewport(390, 844);
  render(<Sheet />);
  await settle();
  const body = screen.getByTestId("body");
  const head = document.querySelector("[data-slot=dialog-header]") as HTMLElement;

  expect(Math.round(rect(frame()).top)).toBe(Math.round(rect(head).bottom));
  expect(Math.round(rect(frame()).bottom)).toBe(window.innerHeight);
  expect(rect(body).height).toBe(rect(frame()).height);
  expect(rect(body).width).toBe(390);
  expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
  const style = getComputedStyle(body);
  expect(style.paddingLeft).toBe("16px");
  expect(style.paddingRight).toBe("16px");
  expect(style.paddingTop).toBe("16px");
  expect(parseFloat(style.paddingBottom)).toBeGreaterThanOrEqual(16);
  // The bounce at the ends is kept, as in a panel.
  expect(style.overscrollBehaviorY).toBe("contain");
  expect(frame().querySelector("[data-slot=scroll-area-scrollbar]")).not.toBeNull();

  body.scrollTop = 400;
  expect(body.scrollTop).toBe(400);
  expect(rect(head).top).toBe(rect(popup()).top);
  // The last row ends the inset above the bottom edge.
  body.scrollTop = body.scrollHeight;
  const last = screen.getByTestId("row-29");
  expect(Math.round(rect(body).bottom - rect(last).bottom)).toBe(
    Math.round(parseFloat(style.paddingBottom)),
  );
  // The footer's slot stays inside the body, after the caller's rows.
  expect(body.lastElementChild?.getAttribute("data-slot")).toBe("dialog-sheet-body-end");
});

it("in a phone sheet scrolls a problem added after it opened into view", async () => {
  await setViewport(390, 844);
  const { rerender } = render(<Sheet />);
  await settle();
  const body = screen.getByTestId("body");
  const head = document.querySelector("[data-slot=dialog-header]") as HTMLElement;
  expect(body.scrollTop).toBe(0);

  rerender(
    <Sheet>
      <div role="alert">The name is taken.</div>
    </Sheet>,
  );
  const alert = await screen.findByRole("alert");
  await waitFor(() => expect(body.scrollTop).toBeGreaterThan(0));
  // To the pixel: scrollIntoView rounds the scroll position.
  expect(Math.round(rect(alert).top)).toBeGreaterThanOrEqual(Math.round(rect(head).bottom));
  expect(Math.round(rect(alert).bottom)).toBeLessThanOrEqual(Math.round(rect(body).bottom));
});

it("in a phone sheet Tab goes from the head's commit button to the first field", async () => {
  await setViewport(390, 844);
  const { userEvent } = await import("vite-plus/test/browser/context");
  render(<Sheet />);
  await settle();
  const body = screen.getByTestId("body");
  expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);

  screen.getByRole("button", { name: "Create" }).focus();
  await userEvent.keyboard("{Tab}");
  expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Field 1" }));
});

// dialog.md, "Scrolling in a ScrollArea": the body is a Tab stop only while it overflows and holds
// nothing that takes focus, as a native scroller is.
// Revert to fail: dialog.tsx, `tabIndex ?? (holdsFocusable ? -1 : containerProps.tabIndex)` back
// to a fixed `-1` (the read-only body can't be reached) or to `containerProps.tabIndex` (the form
// gains a stop).
function ReadOnly({
  lines,
  link = false,
  children,
}: {
  lines: number;
  link?: boolean;
  children?: ReactNode;
}) {
  return (
    <ThemeProvider>
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terms</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody data-testid="body" unstable_scrollArea>
            {Array.from({ length: lines }, (_, index) => (
              <p key={index}>Line {index + 1} of the terms, which is only read.</p>
            ))}
            {link ? <a href="#more">More</a> : null}
            {children}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}

it("a long body that is only read is a Tab stop and scrolls with the keyboard", async () => {
  await setViewport(1024, 500);
  const { userEvent } = await import("vite-plus/test/browser/context");
  render(<ReadOnly lines={60} />);
  await settle();
  const body = screen.getByTestId("body");
  expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
  expect(body.tabIndex).toBe(0);

  screen.getByRole("button", { name: /close/i }).focus();
  await userEvent.keyboard("{Tab}");
  expect(document.activeElement).toBe(body);
  await userEvent.keyboard("{PageDown}");
  await waitFor(() => expect(body.scrollTop).toBeGreaterThan(0));
});

it("a short body that is only read, and a long one that holds a link, are no Tab stop", async () => {
  await setViewport(1024, 500);
  const { rerender } = render(<ReadOnly lines={2} />);
  await settle();
  expect(screen.getByTestId("body").tabIndex).toBe(-1);
  expect(screen.getByTestId("body").hasAttribute("tabindex")).toBe(false);

  rerender(<ReadOnly lines={60} link />);
  await settle();
  const body = screen.getByTestId("body");
  expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
  expect(body.getAttribute("tabindex")).toBe("-1");
});

// A control that isn't rendered takes no Tab, so it must not take the body's stop away: the text
// would be out of the keyboard's reach.
// Revert to fail: lib/holds-focusable.ts, `takesTab`'s `checkVisibility` line (return true instead).
it.each([
  [
    "display: none",
    <div key="a" style={{ display: "none" }}>
      <a href="#x">Hidden</a>
    </div>,
  ],
  [
    "hidden",
    <div key="b" hidden>
      <a href="#x">Hidden</a>
    </div>,
  ],
  [
    "visibility: hidden",
    <div key="c" style={{ visibility: "hidden" }}>
      <a href="#x">Hidden</a>
    </div>,
  ],
] as const)(
  "a long read-only body with a control under %s is still a Tab stop",
  async (_name, hidden) => {
    await setViewport(1024, 500);
    const { userEvent } = await import("vite-plus/test/browser/context");
    render(<ReadOnly lines={60}>{hidden}</ReadOnly>);
    await settle();
    const body = screen.getByTestId("body");
    expect(body.tabIndex).toBe(0);
    screen.getByRole("button", { name: /close/i }).focus();
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(body);
  },
);

it("showing and hiding a control inside the body moves the Tab stop", async () => {
  await setViewport(1024, 500);
  function Toggle({ shown, how }: { shown: boolean; how: "hidden" | "class" | "style" }) {
    const props =
      how === "hidden"
        ? { hidden: !shown }
        : how === "class"
          ? { className: shown ? undefined : "hidden" }
          : { style: { display: shown ? undefined : "none" } };
    return (
      <ReadOnly lines={60}>
        <div {...props}>
          <a href="#x">More</a>
        </div>
      </ReadOnly>
    );
  }
  for (const how of ["hidden", "class", "style"] as const) {
    const { rerender, unmount } = render(<Toggle shown={false} how={how} />);
    await settle();
    expect(screen.getByTestId("body").getAttribute("tabindex"), how).toBe("0");
    rerender(<Toggle shown how={how} />);
    await waitFor(() =>
      expect(screen.getByTestId("body").getAttribute("tabindex"), how).toBe("-1"),
    );
    rerender(<Toggle shown={false} how={how} />);
    await waitFor(() => expect(screen.getByTestId("body").getAttribute("tabindex"), how).toBe("0"));
    unmount();
  }
});

it("a long body that holds an editable region is no Tab stop", async () => {
  await setViewport(1024, 500);
  render(
    <ReadOnly lines={60}>
      <div contentEditable suppressContentEditableWarning>
        Notes
      </div>
    </ReadOnly>,
  );
  await settle();
  expect(screen.getByTestId("body").getAttribute("tabindex")).toBe("-1");
});

// dialog.md, "Scrolling in a ScrollArea": the body scrolls sideways too when something in it is
// wider than it, as the native body does (`overflow-y: auto` alone computes the other axis to
// `auto`), and a body with nothing wider is as it was.

/** One line 800px wide that doesn't wrap, with a mark at its far end. */
function Wide() {
  return (
    <div data-testid="wide" style={{ width: 800, whiteSpace: "nowrap" }}>
      A line that is wider than the body and does not wrap
      <span data-testid="wide-end" style={{ float: "right" }}>
        end
      </span>
    </div>
  );
}

/** A real wheel turn over the middle of `element`, as the browser's own input. */
async function wheelOver(element: Element, deltaX: number, deltaY: number) {
  const { cdp } = await import("vite-plus/test/browser/context");
  // CDP's coordinates are the top page's; the test runs in an iframe of it.
  const outer = window.frameElement?.getBoundingClientRect() ?? { left: 0, top: 0 };
  const box = rect(element);
  await cdp().send("Input.dispatchMouseEvent", {
    type: "mouseWheel",
    x: outer.left + box.left + box.width / 2,
    y: outer.top + box.top + box.height / 2,
    deltaX,
    deltaY,
  });
  // A wheel scroll animates; let it end before anything is read.
  await settle(300);
}

const scrollbar = (orientation: "vertical" | "horizontal") =>
  frame().querySelector<HTMLElement>(
    `[data-slot=scroll-area-scrollbar][data-orientation=${orientation}]`,
  );

const SURFACES = [
  ["dialog", 1280, 800, 448],
  ["phone sheet", 390, 844, 390],
] as const;

// Revert to fail: dialog.tsx, DialogBodyScrollArea without `orientation: "both"` (the body is
// `overflow-x: hidden`: the wheel moves nothing, the end of the line stays cut off and no
// horizontal scrollbar is drawn).
it.each(SURFACES)(
  "in a %s a sideways wheel reaches the end of a child wider than the body",
  async (surface, width, height, cardWidth) => {
    await setViewport(width, height);
    render(
      surface === "dialog" ? (
        <Scene>
          <Wide />
        </Scene>
      ) : (
        <Sheet rows={3}>
          <Wide />
        </Sheet>
      ),
    );
    await settle();
    const body = screen.getByTestId("body");
    const end = screen.getByTestId("wide-end");

    // The card keeps its width: the line is wider than the body, not the dialog.
    expect(rect(popup()).width).toBe(cardWidth);
    expect(rect(body).width).toBe(cardWidth);
    expect(body.scrollWidth).toBeGreaterThan(body.clientWidth);
    expect(rect(end).left).toBeGreaterThan(rect(body).right);

    await wheelOver(body, 2000, 0);
    expect(body.scrollLeft).toBe(body.scrollWidth - body.clientWidth);
    expect(rect(end).right).toBeLessThanOrEqual(rect(body).right);
    expect(rect(end).left).toBeGreaterThanOrEqual(rect(body).left);
    expect(body.scrollTop).toBe(0);

    // raft-ui's horizontal scrollbar, along the body's bottom edge: over the footer, not under it.
    const bar = scrollbar("horizontal") as HTMLElement;
    expect(bar).not.toBeNull();
    expect(scrollbar("vertical")).toBeNull();
    expect(Math.round(rect(bar).bottom)).toBe(Math.round(rect(frame()).bottom));
    expect(rect(bar).height).toBeLessThanOrEqual(16);
    expect(rect(bar).left).toBeGreaterThanOrEqual(rect(body).left);
    expect(rect(bar).right).toBeLessThanOrEqual(rect(body).right);
    if (surface === "dialog") {
      expect(Math.round(rect(bar).bottom)).toBe(Math.round(rect(screen.getByTestId("footer")).top));
    }
    // The platform's own takes no room.
    expect(body.offsetHeight).toBe(body.clientHeight);
  },
);

// Revert to fail: the same line (no horizontal scrollbar: `across` is null).
it("with both scrollbars each stops short of the corner, and both axes scroll", async () => {
  await setViewport(1280, 800);
  render(
    <Scene rows={30}>
      <Wide />
    </Scene>,
  );
  await settle();
  const body = screen.getByTestId("body");
  const down = scrollbar("vertical") as HTMLElement;
  const across = scrollbar("horizontal") as HTMLElement;
  expect(down).not.toBeNull();
  expect(across).not.toBeNull();
  expect(rect(down).bottom).toBeLessThanOrEqual(rect(across).top);
  expect(rect(across).right).toBeLessThanOrEqual(rect(down).left);
  expect(Math.round(rect(across).bottom)).toBe(Math.round(rect(screen.getByTestId("footer")).top));

  await wheelOver(body, 2000, 0);
  await wheelOver(body, 0, 400);
  expect(body.scrollLeft).toBe(body.scrollWidth - body.clientWidth);
  expect(body.scrollTop).toBeGreaterThan(0);
  // Each axis that scrolls stops at its end; a trackpad or iOS may still bounce it.
  const style = getComputedStyle(body);
  expect(style.overscrollBehaviorX).toBe("contain");
  expect(style.overscrollBehaviorY).toBe("contain");
});

/** An element's box in the window, as plain numbers: a DOMRect has no own keys to compare. */
function box(element: Element) {
  const at = rect(element);
  return { left: at.left, top: at.top, width: at.width, height: at.height };
}

/** The boxes a body with nothing wider than itself must keep. */
function boxes() {
  const body = screen.getByTestId("body");
  return {
    card: box(popup()),
    head: box(document.querySelector("[data-slot=dialog-header]") as HTMLElement),
    footer: box(screen.getByTestId("footer")),
    body: box(body),
    first: box(screen.getByTestId("row-0")),
    last: box(body.querySelector("label:last-of-type") as HTMLElement),
    scrollHeight: body.scrollHeight,
  };
}

// The boxes are the native body's, which scrolled down only for such a body.
// Revert to fail: dialog.tsx, `orientation: "both"` to `"horizontal"` (a long body no longer
// scrolls down and draws no vertical scrollbar), or `bodyFrame` with `pb-px` (the body is a
// pixel shorter than the native one, or the card a pixel taller).
it.each([
  ["dialog", 1280, 800, 3],
  ["dialog", 1280, 800, 30],
  ["phone sheet", 390, 844, 3],
  ["phone sheet", 390, 844, 30],
] as const)(
  "in a %s (%i x %i) a body of %i rows with nothing wider than itself keeps its boxes and scrolls down only",
  async (surface, width, height, rows) => {
    await setViewport(width, height);
    const scene = (scrollArea: boolean) =>
      surface === "dialog" ? (
        <Scene rows={rows} scrollArea={scrollArea} />
      ) : (
        <Sheet rows={rows} scrollArea={scrollArea} />
      );
    render(scene(false));
    await settle();
    const native = boxes();
    cleanup();
    render(scene(true));
    await settle();
    const body = screen.getByTestId("body");
    expect(boxes()).toEqual(native);
    expect(box(frame())).toEqual(native.body);

    // Nothing to scroll sideways: no horizontal scrollbar, no room kept for one, and a sideways
    // wheel moves nothing.
    expect(body.scrollWidth).toBe(body.clientWidth);
    expect(scrollbar("horizontal")).toBeNull();
    expect(frame().querySelectorAll("[data-slot=scroll-area-scrollbar]")).toHaveLength(
      body.scrollHeight > body.clientHeight ? 1 : 0,
    );
    expect(body.offsetHeight).toBe(body.clientHeight);
    await wheelOver(body, 2000, 0);
    expect(body.scrollLeft).toBe(0);
    // The sideways axis holds nothing back, and the form is still no Tab stop.
    const style = getComputedStyle(body);
    expect(style.overscrollBehaviorX).toBe("auto");
    expect(style.overscrollBehaviorY).toBe(
      body.scrollHeight > body.clientHeight ? "contain" : "auto",
    );
    expect(body.getAttribute("tabindex")).toBe("-1");
    if (rows === 30) {
      expect(scrollbar("vertical")).not.toBeNull();
      await wheelOver(body, 0, 400);
      expect(body.scrollTop).toBeGreaterThan(0);
    }
  },
);

// Revert to fail: dialog.tsx, DialogBodyScrollArea without `orientation: "both"` (the body is no
// Tab stop and the arrow keys move nothing: a line that is only read can't be reached).
it("a body that only overflows sideways and is only read is a Tab stop and scrolls with the arrow keys", async () => {
  await setViewport(1024, 500);
  const { userEvent } = await import("vite-plus/test/browser/context");
  render(
    <ReadOnly lines={2}>
      <Wide />
    </ReadOnly>,
  );
  await settle();
  const body = screen.getByTestId("body");
  expect(body.scrollHeight).toBe(body.clientHeight);
  expect(body.tabIndex).toBe(0);

  screen.getByRole("button", { name: /close/i }).focus();
  await userEvent.keyboard("{Tab}");
  expect(document.activeElement).toBe(body);
  await userEvent.keyboard("{ArrowRight}{ArrowRight}");
  // A key scroll animates; let it end before the position is read.
  await settle();
  const right = body.scrollLeft;
  expect(right).toBeGreaterThan(0);
  await userEvent.keyboard("{ArrowLeft}");
  await settle();
  expect(body.scrollLeft).toBeLessThan(right);
});
