import "../dialog/dialog.test.css";
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
  Drawer,
  DrawerActions,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./drawer";

// A side drawer's DrawerBody with `unstable_scrollArea` (drawer.md, "Scrolling
// in a ScrollArea"): a frame takes the body's place between the header and
// the footer and the body scrolls inside it, under raft-ui's scrollbar. What
// must not move: the header and the footer, the body's padding, its own flex
// column and `gap`, the Tab order, and a list opened from a field in it.
// Measured in a real browser at 1280 x 800, against the native body.

const it = test.skipIf(typeof window === "undefined");

async function setViewport(width: number, height: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, height);
}

// The drawer slides in over 240ms, and the area measures in the next frame.
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
  rows = 3,
  picker = false,
  children,
}: {
  scrollArea?: boolean;
  rows?: number;
  picker?: boolean;
  children?: ReactNode;
}) {
  return (
    <ThemeProvider>
      <Drawer open swipeDirection="right">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit profile</DrawerTitle>
            <DrawerClose />
          </DrawerHeader>
          <DrawerBody data-testid="body" className="gap-4" unstable_scrollArea={scrollArea}>
            {children ?? <Rows rows={rows} picker={picker} />}
          </DrawerBody>
          <DrawerFooter data-testid="footer">
            <DrawerActions>
              <DrawerClose render={<Button variant="ghost" />}>Cancel</DrawerClose>
              <Button variant="primary">Save</Button>
            </DrawerActions>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </ThemeProvider>
  );
}

function ReadOnly({ lines }: { lines: number }) {
  return (
    <Scene>
      {Array.from({ length: lines }, (_, index) => (
        <p key={index}>Line {index + 1} of the terms, which is only read.</p>
      ))}
    </Scene>
  );
}

const popup = () => document.querySelector("[data-slot=drawer-popup]") as HTMLElement;
const head = () => document.querySelector("[data-slot=drawer-header]") as HTMLElement;
const frame = () => document.querySelector("[data-slot=drawer-body-frame]") as HTMLElement;
const rect = (element: Element) => element.getBoundingClientRect();

/** Where the header, the footer and the body's rows sit in the drawer. */
function layout(rows: number) {
  const card = rect(popup());
  const at = (element: Element) => {
    const box = rect(element);
    return {
      top: box.top - card.top,
      left: box.left - card.left,
      width: box.width,
      height: box.height,
    };
  };
  return {
    card: { width: card.width, height: card.height },
    head: at(head()),
    footer: at(screen.getByTestId("footer")),
    rows: Array.from({ length: rows }, (_, index) => at(screen.getByTestId(`row-${index}`))),
  };
}

// Revert to fail: drawer.tsx, `if (scrollArea && swipeAxis === "x")` to `if (false)` (the body
// scrolls natively: no frame, no raft-ui scrollbar), or drawer.recipe.ts, `bodyFrame` without
// `min-h-0` (the frame grows with its content, pushes the footer out of the drawer and nothing
// scrolls).
it("scrolls a long body between the header and the footer, under raft-ui's scrollbar", async () => {
  await setViewport(1280, 800);
  render(<Scene rows={30} />);
  await settle();
  const body = screen.getByTestId("body");
  const footer = screen.getByTestId("footer");

  // The drawer is the window's height, and the body takes what the bars leave.
  expect(rect(popup()).height).toBe(800);
  expect(rect(head()).top).toBe(0);
  expect(Math.round(rect(footer).bottom)).toBe(800);
  expect(Math.round(rect(frame()).top)).toBe(Math.round(rect(head()).bottom));
  expect(Math.round(rect(frame()).bottom)).toBe(Math.round(rect(footer).top));
  expect(rect(body).height).toBe(rect(frame()).height);
  expect(rect(body).width).toBe(rect(popup()).width);
  expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);

  // One scrollbar, raft-ui's: the platform's takes no room and is not drawn.
  expect(getComputedStyle(body).scrollbarWidth).toBe("none");
  expect(body.offsetWidth).toBe(body.clientWidth);
  // A scroll stops at the body's end, and may still bounce there.
  expect(getComputedStyle(body).overscrollBehaviorY).toBe("contain");
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

  // It scrolls, the thumb follows, and the header and the footer stay.
  const before = rect(thumb).top;
  const bars = { head: rect(head()), footer: rect(footer) };
  body.scrollTop = 400;
  await settle(100);
  expect(body.scrollTop).toBe(400);
  expect(rect(thumb).top).toBeGreaterThan(before);
  expect(rect(head())).toEqual(bars.head);
  expect(rect(footer)).toEqual(bars.footer);
});

// Revert to fail: drawer.recipe.ts, `bodyScroll` without `flex-col` (the rows lie in a row), or
// with `pt-0` in place of `pt-(--page-top)` (every row moves up).
it("keeps the header, the footer and every row of a flex body with a gap where they are", async () => {
  await setViewport(1280, 800);
  render(<Scene rows={30} scrollArea={false} />);
  await settle();
  const native = layout(30);
  const nativeBody = rect(screen.getByTestId("body"));
  cleanup();
  render(<Scene rows={30} />);
  await settle();
  const body = screen.getByTestId("body");
  expect(layout(30)).toEqual(native);
  expect(rect(body).top).toBe(nativeBody.top);
  expect(rect(body).height).toBe(nativeBody.height);

  // The column holds the caller's rows only: the first one right under the
  // body's padding, one 16px gap between each, each as wide as the body allows.
  const style = getComputedStyle(body);
  expect(style.display).toBe("flex");
  expect(style.flexDirection).toBe("column");
  expect(body.firstElementChild).toBe(screen.getByTestId("row-0"));
  expect(rect(screen.getByTestId("row-0")).top - rect(body).top).toBe(parseFloat(style.paddingTop));
  expect(rect(screen.getByTestId("row-1")).top - rect(screen.getByTestId("row-0")).bottom).toBe(16);
  expect(rect(screen.getByTestId("row-0")).width).toBe(
    rect(body).width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
  );
});

// Revert to fail: drawer.recipe.ts, the padding moved from `bodyScroll` to `bodyFrame` (it then
// stays around the scrolling body instead of scrolling with the rows).
it("scrolls the body's padding with its content", async () => {
  await setViewport(1280, 800);
  render(<Scene rows={30} scrollArea={false} />);
  await settle();
  const nativeStyle = getComputedStyle(screen.getByTestId("body"));
  const native = {
    top: nativeStyle.paddingTop,
    bottom: nativeStyle.paddingBottom,
    left: nativeStyle.paddingLeft,
    right: nativeStyle.paddingRight,
  };
  cleanup();
  render(<Scene rows={30} />);
  await settle();
  const body = screen.getByTestId("body");
  const style = getComputedStyle(body);
  expect({
    top: style.paddingTop,
    bottom: style.paddingBottom,
    left: style.paddingLeft,
    right: style.paddingRight,
  }).toEqual(native);
  expect(parseFloat(style.paddingTop)).toBeGreaterThan(0);
  expect(parseFloat(style.paddingBottom)).toBeGreaterThan(0);
  // The frame has none: the body reaches the header, the footer and both edges.
  expect(getComputedStyle(frame()).padding).toBe("0px");
  expect(rect(body).top).toBe(rect(head()).bottom);

  // At the start the first row is the top padding under the header.
  const first = screen.getByTestId("row-0");
  expect(rect(first).top - rect(head()).bottom).toBe(parseFloat(style.paddingTop));
  // Scrolled, it goes under the header: the padding went with it.
  body.scrollTop = 60;
  expect(Math.round(rect(first).top - rect(head()).bottom)).toBe(
    Math.round(parseFloat(style.paddingTop) - 60),
  );
  // At the end the last row stops the bottom padding above the footer.
  body.scrollTop = body.scrollHeight;
  const last = screen.getByTestId("row-29");
  expect(Math.round(rect(screen.getByTestId("footer")).top - rect(last).bottom)).toBe(
    Math.round(parseFloat(style.paddingBottom)),
  );
});

// Revert to fail: drawer.recipe.ts, `bodyFrame` without `flex-1` (the frame is as tall as its
// content and the body's height differs from the native one), or drawer.tsx, the body's `tabIndex`
// fixed to `0` (a short body is a Tab stop).
it("draws no scrollbar, fills the drawer and is no Tab stop when the body is short", async () => {
  await setViewport(1280, 800);
  render(<Scene rows={3} scrollArea={false} />);
  await settle();
  const native = layout(3);
  const nativeHeight = rect(screen.getByTestId("body")).height;
  cleanup();
  render(<ReadOnly lines={2} />);
  await settle();
  expect(screen.getByTestId("body").hasAttribute("tabindex")).toBe(false);
  expect(screen.getByTestId("body").tabIndex).toBe(-1);
  cleanup();
  render(<Scene rows={3} />);
  await settle();
  const body = screen.getByTestId("body");
  expect(layout(3)).toEqual(native);
  expect(rect(body).height).toBe(nativeHeight);
  expect(Math.round(rect(screen.getByTestId("footer")).bottom)).toBe(800);
  expect(body.scrollHeight).toBe(body.clientHeight);
  expect(frame().querySelector("[data-slot=scroll-area-scrollbar]")).toBeNull();
});

// drawer.md, "Scrolling in a ScrollArea": the body is a Tab stop only while it overflows and holds
// nothing that takes focus, as a native scroller is.
// Revert to fail: drawer.tsx, `tabIndex ?? (holdsFocusable ? -1 : containerProps.tabIndex)` to
// `tabIndex ?? containerProps.tabIndex` (the form gains a stop before its first field).
it("Tab goes from the header's close button to the first field of a long form", async () => {
  await setViewport(1280, 800);
  const { userEvent } = await import("vite-plus/test/browser/context");
  render(<Scene rows={30} />);
  await settle();
  const body = screen.getByTestId("body");
  expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
  expect(body.getAttribute("tabindex")).toBe("-1");

  screen.getByRole("button", { name: "Close" }).focus();
  await userEvent.keyboard("{Tab}");
  expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Field 1" }));
});

// Revert to fail: drawer.tsx, the same expression to a fixed `-1` (Tab skips the body, and
// nothing in it can take focus, so the keyboard can't scroll it).
it("a long body that is only read is a Tab stop and scrolls with PageDown", async () => {
  await setViewport(1280, 800);
  const { userEvent } = await import("vite-plus/test/browser/context");
  render(<ReadOnly lines={80} />);
  await settle();
  const body = screen.getByTestId("body");
  expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
  expect(body.tabIndex).toBe(0);

  screen.getByRole("button", { name: "Close" }).focus();
  await userEvent.keyboard("{Tab}");
  expect(document.activeElement).toBe(body);
  await userEvent.keyboard("{PageDown}");
  await waitFor(() => expect(body.scrollTop).toBeGreaterThan(0));
});

// The list is portaled beside the drawer, so the frame can't clip it; what the frame can break
// is the body as the list's scroller.
// Revert to fail: drawer.recipe.ts, `bodyFrame` without `min-h-0` (the body doesn't scroll, so the
// trigger can't be brought to the middle and the list has nothing to follow).
it("opens a Select from the body on its trigger, unclipped, and keeps it there as the body scrolls", async () => {
  await setViewport(1280, 800);
  const { userEvent } = await import("vite-plus/test/browser/context");
  render(<Scene rows={30} picker />);
  await settle();
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
  // Not clipped by the body or the frame, nor drawn under the drawer: every
  // corner and the middle are the list's, under the header and over the footer.
  const at = rect(list);
  expect(at.height).toBeGreaterThan(100);
  expect(at.top).toBeGreaterThanOrEqual(rect(head()).bottom);
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
