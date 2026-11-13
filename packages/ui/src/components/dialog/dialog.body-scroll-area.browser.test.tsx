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
}: {
  scrollArea?: boolean;
  header?: boolean;
  rows?: number;
  picker?: boolean;
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

function Sheet({ rows = 30, children }: { rows?: number; children?: ReactNode }) {
  return (
    <ThemeProvider>
      <Dialog open>
        <DialogSheetContent>
          <DialogHeader>
            <DialogTitle>Create channel</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <form id="body-scroll-area-form" className="contents">
            <DialogBody data-testid="body" className="grid gap-4" unstable_scrollArea>
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
