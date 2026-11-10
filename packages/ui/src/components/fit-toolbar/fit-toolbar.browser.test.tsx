import "./fit-toolbar.test.css";
import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { afterEach, expect, test } from "vite-plus/test";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { useLayoutEffect, useState } from "react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";
import {
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
} from "../segmented-control/segmented-control";
import { FitToolbar, FitToolbarButton, FitToolbarGroup, useFitItem } from "./fit-toolbar";
import type { FitSteps } from "./fit-toolbar";

// FitToolbar measures its content in the width of its own region, never the
// window's, and takes its items' steps in order until it fits. Groups wrap
// only between groups, onto a line of their own or one they share
// (`wrapLine`), the gap fixed; the page says which stay on the first line.
// A wrapped group gets back what its items gave before it wrapped, so a width
// always gives the same toolbar. A SegmentedControl in it follows its steps.
// The primary action shows as + alone (`plus`) only after the groups have
// wrapped. An open popup's focus guards are not part of the row. Fixed-width
// items keep the arithmetic independent of fonts. Real layout only.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const el = (id: string) => screen.getByTestId(id);
const box = (id: string) => el(id).getBoundingClientRect();
const shown = (id: string) => el(id).getClientRects().length > 0;

/** A 90px item (40px once its label has given way), or 40px when `narrow`. */
function Item({ id, narrow = false, ...steps }: FitSteps & { id: string; narrow?: boolean }) {
  const item = useFitItem(steps);
  return (
    <BaseToolbar.Button
      data-testid={id}
      className={narrow ? "h-8 w-10 flex-none" : "h-8 w-[90px] flex-none data-fit-label:w-10"}
      {...item.props}
    >
      {id}
    </BaseToolbar.Button>
  );
}

// 188 + 8 + 188 + 8 + 90 = 482px on one line.
function Bar({
  wrap = true,
  firstLine,
  collapse = false,
}: {
  wrap?: boolean;
  firstLine?: "c";
  collapse?: boolean;
}) {
  return (
    <FitToolbar aria-label="Tasks" wrap={wrap} className="gap-2" data-testid="bar">
      <FitToolbarGroup firstLine className="gap-2" data-testid="a">
        <Item id="a1" />
        <Item id="a2" />
      </FitToolbarGroup>
      <FitToolbarGroup
        className="gap-2"
        data-testid="b"
        collapseOrder={collapse ? 0 : undefined}
        collapsed={collapse ? <Item id="b-one" narrow /> : undefined}
      >
        <Item id="b1" />
        <Item id="b2" />
      </FitToolbarGroup>
      <FitToolbarGroup firstLine={firstLine === "c"} className="gap-2" data-testid="c">
        <Item id="c1" />
      </FitToolbarGroup>
    </FitToolbar>
  );
}

function inRegion(width: number, ui: ReactNode) {
  return render(
    <ThemeProvider mode="light">
      <div style={{ width }} data-testid="region">
        {ui}
      </div>
    </ThemeProvider>,
  );
}

async function wide() {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 800);
}

it("in a 1000px region the groups share one line", async () => {
  await wide();
  inRegion(1000, <Bar />);
  await frame();
  expect(box("c").top).toBe(box("a").top);
  expect(el("bar").hasAttribute("data-fit-wrapping")).toBe(false);
});

it("at 420px the last group moves to a line of its own, a fixed gap below, at the start", async () => {
  await wide();
  inRegion(420, <Bar />);
  await frame();
  // Measured in the region, not the 1280px window.
  expect(el("bar").hasAttribute("data-fit-wrapping")).toBe(true);
  expect(el("c").hasAttribute("data-fit-wrap")).toBe(true);
  expect(box("b").top).toBe(box("a").top);
  expect(box("c").top - box("a").bottom).toBe(8);
  expect(box("c1").left).toBe(box("region").left);
  // Nothing is spread: the first line keeps its 8px gaps.
  expect(box("b").left - box("a").right).toBe(8);
  for (const id of ["a1", "a2", "b1", "b2", "c1"]) {
    expect(box(id).right, id).toBeLessThanOrEqual(box("region").right);
  }
});

it("the page keeps a group on the first line: the one before it wraps instead", async () => {
  await wide();
  inRegion(420, <Bar firstLine="c" />);
  await frame();
  expect(el("c").hasAttribute("data-fit-wrap")).toBe(false);
  expect(el("b").hasAttribute("data-fit-wrap")).toBe(true);
  expect(box("c").top).toBe(box("a").top);
  expect(box("b").top).toBeGreaterThan(box("a").bottom);
});

it("without wrap, a group gives way as one button instead", async () => {
  await wide();
  inRegion(420, <Bar wrap={false} collapse />);
  await frame();
  expect(el("bar").hasAttribute("data-fit-wrapping")).toBe(false);
  expect(el("b").hasAttribute("data-fit-collapse")).toBe(true);
  expect(shown("b1")).toBe(false);
  expect(shown("b-one")).toBe(true);
  expect(box("c").top).toBe(box("a").top);
  expect(box("c1").right).toBeLessThanOrEqual(box("region").right);
});

it("follows its region as it narrows and widens", async () => {
  await wide();
  inRegion(1000, <Bar />);
  await frame();
  expect(el("bar").hasAttribute("data-fit-wrapping")).toBe(false);
  el("region").style.width = "420px";
  await frame();
  await frame();
  expect(el("bar").hasAttribute("data-fit-wrapping")).toBe(true);
  el("region").style.width = "1000px";
  await frame();
  await frame();
  expect(el("bar").hasAttribute("data-fit-wrapping")).toBe(false);
});

it("groups with the same wrapLine wrap onto one line, a fixed gap apart", async () => {
  await wide();
  inRegion(
    300,
    <FitToolbar aria-label="Tasks" wrap className="gap-2" data-testid="bar">
      <FitToolbarGroup firstLine className="gap-2" data-testid="a">
        <Item id="a1" />
        <Item id="a2" />
      </FitToolbarGroup>
      <FitToolbarGroup wrapLine="filters" className="gap-2" data-testid="b">
        <Item id="b1" />
        <Item id="b2" />
      </FitToolbarGroup>
      <FitToolbarGroup wrapLine="filters" className="gap-2" data-testid="c">
        <Item id="c1" />
      </FitToolbarGroup>
    </FitToolbar>,
  );
  await frame();
  expect(el("b").hasAttribute("data-fit-wrap")).toBe(true);
  expect(el("c").hasAttribute("data-fit-wrap")).toBe(true);
  // One second line, b then c, 8px apart, 8px under the first.
  expect(box("c").top).toBe(box("b").top);
  expect(box("c").left - box("b").right).toBe(8);
  expect(box("b").top - box("a").bottom).toBe(8);
  expect(box("b1").left).toBe(box("region").left);
});

/** a1 a2 on the first line; b1 b2 give their labels first (10), then wrap (20). */
function LabelBar() {
  return (
    <FitToolbar aria-label="Tasks" wrap className="gap-2" data-testid="bar">
      <FitToolbarGroup firstLine className="gap-2" data-testid="a">
        <Item id="a1" />
        <Item id="a2" />
      </FitToolbarGroup>
      <FitToolbarGroup wrapOrder={20} className="gap-2" data-testid="b">
        <Item id="b1" label={10} />
        <Item id="b2" label={10} />
      </FitToolbarGroup>
    </FitToolbar>
  );
}

const labelled = (id: string) => !el(id).hasAttribute("data-fit-label");

it("a group that wrapped gets its labels back, and a width gives the same toolbar both ways", async () => {
  await wide();
  // 300px: the labels going is enough (188 + 8 + 40 + 8 + 40 = 284).
  inRegion(300, <LabelBar />);
  await frame();
  expect(el("b").hasAttribute("data-fit-wrap")).toBe(false);
  expect([labelled("b1"), labelled("b2")]).toEqual([false, false]);
  // 250px: even then b has to wrap, and on its own line it has room for its labels.
  el("region").style.width = "250px";
  await frame();
  await frame();
  expect(el("b").hasAttribute("data-fit-wrap")).toBe(true);
  expect([labelled("b1"), labelled("b2")]).toEqual([true, true]);
  expect(box("b1").width).toBe(90);
  expect(box("b").top).toBeGreaterThan(box("a").bottom);
  // Back to 300px: the same as rendered there.
  el("region").style.width = "300px";
  await frame();
  await frame();
  expect(el("b").hasAttribute("data-fit-wrap")).toBe(false);
  expect([labelled("b1"), labelled("b2")]).toEqual([false, false]);
  // And 250px from fresh is what narrowing to it gave.
  cleanup();
  inRegion(250, <LabelBar />);
  await frame();
  expect(el("b").hasAttribute("data-fit-wrap")).toBe(true);
  expect([labelled("b1"), labelled("b2")]).toEqual([true, true]);
});

function Segments() {
  const item = useFitItem({ label: 10 });
  return (
    <SegmentedControl
      aria-label="View"
      defaultValue="board"
      iconsOnlyBelow="auto"
      data-testid="segments"
      {...item.props}
    >
      <SegmentedControlItem value="board">
        <svg viewBox="0 0 24 24" />
        <SegmentedControlLabel data-testid="board">Board</SegmentedControlLabel>
      </SegmentedControlItem>
      <SegmentedControlItem value="list">
        <svg viewBox="0 0 24 24" />
        <SegmentedControlLabel>List</SegmentedControlLabel>
      </SegmentedControlItem>
    </SegmentedControl>
  );
}

it("a SegmentedControl in the toolbar follows the toolbar's label step, not its own iconsOnlyBelow", async () => {
  await wide();
  const ui = (
    <FitToolbar aria-label="Tasks" className="gap-2" data-testid="bar">
      <FitToolbarGroup className="gap-2">
        <Item id="a1" />
        <Segments />
      </FitToolbarGroup>
    </FitToolbar>
  );
  inRegion(1000, ui);
  await frame();
  expect(el("segments").hasAttribute("data-fit-label")).toBe(false);
  expect(el("board").getBoundingClientRect().width).toBeGreaterThan(1);
  cleanup();
  inRegion(180, ui);
  await frame();
  await frame();
  expect(el("segments").hasAttribute("data-fit-label")).toBe(true);
  expect(el("board").getBoundingClientRect().width).toBeLessThanOrEqual(1);
  // Its own measure stays off: it never marks itself.
  expect(el("segments").hasAttribute("data-icons-only")).toBe(false);
  for (const id of ["a1", "segments"]) {
    expect(box(id).right, id).toBeLessThanOrEqual(box("region").right);
  }
});

const grow: { to: (long: boolean) => void } = { to: () => {} };
/** An item whose label changes on its own, without the toolbar rendering. */
function Growing() {
  const [long, setLong] = useState(false);
  useLayoutEffect(() => {
    grow.to = setLong;
  }, []);
  const item = useFitItem({ label: 10 });
  return (
    <BaseToolbar.Button
      data-testid="grow"
      className="h-8 flex-none whitespace-nowrap data-fit-label:w-10 data-fit-label:overflow-hidden"
      {...item.props}
    >
      {long ? "A label much longer than the room it has" : "Short"}
    </BaseToolbar.Button>
  );
}

it("measures again when an item's content changes on its own", async () => {
  await wide();
  inRegion(
    260,
    <FitToolbar aria-label="Tasks" className="gap-2" data-testid="bar">
      <FitToolbarGroup className="gap-2">
        <Item id="a1" />
        <Growing />
      </FitToolbarGroup>
    </FitToolbar>,
  );
  await frame();
  expect(el("grow").hasAttribute("data-fit-label")).toBe(false);
  act(() => grow.to(true));
  await frame();
  await frame();
  expect(el("grow").hasAttribute("data-fit-label")).toBe(true);
  act(() => grow.to(false));
  await frame();
  await frame();
  expect(el("grow").hasAttribute("data-fit-label")).toBe(false);
});

function ScrollBar({ active }: { active: string }) {
  return (
    <FitToolbar aria-label="Tasks" className="gap-2" data-testid="bar">
      <FitToolbarGroup firstLine className="gap-2">
        <Item id="view" />
      </FitToolbarGroup>
      <FitToolbarGroup overflow="scroll" className="gap-2" data-testid="filters">
        {["f1", "f2", "f3", "f4", "f5"].map((id) => (
          <BaseToolbar.Button
            key={id}
            data-testid={id}
            data-active={active === id ? "" : undefined}
            className="h-8 w-[90px] flex-none"
          >
            {id}
          </BaseToolbar.Button>
        ))}
      </FitToolbarGroup>
    </FitToolbar>
  );
}

const within = (id: string, scroller: string) => {
  const item = box(id);
  const area = box(scroller);
  return item.left >= area.left - 0.5 && item.right <= area.right + 0.5;
};

it("at 320px a scrolling group takes the rest of the line and keeps its active item in view", async () => {
  await wide();
  const { rerender } = inRegion(320, <ScrollBar active="f5" />);
  await frame();
  const filters = el("filters").querySelector<HTMLElement>("[data-fit-scroller]")!;
  // One line: the view and the filters beside it, which scroll.
  expect(box("f1").top).toBe(box("view").top);
  expect(box("filters").right).toBeLessThanOrEqual(box("region").right + 0.5);
  expect(filters.scrollWidth).toBeGreaterThan(filters.clientWidth);
  expect(filters.getAttribute("data-overflow")).toBe("start");
  expect(within("f5", "filters"), "the active filter").toBe(true);
  // Another filter becomes active: it scrolls into view.
  rerender(
    <ThemeProvider mode="light">
      <div style={{ width: 320 }} data-testid="region">
        <ScrollBar active="f1" />
      </div>
    </ThemeProvider>,
  );
  await frame();
  expect(within("f1", "filters"), "the newly active filter").toBe(true);
  expect(filters.scrollLeft).toBe(0);
  // The arrow keys reach every filter, and the focused one comes into view.
  el("f1").focus();
  const { userEvent } = await import("vite-plus/test/browser/context");
  for (let i = 0; i < 4; i += 1) await userEvent.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(el("f5"));
  expect(within("f5", "filters"), "the focused filter").toBe(true);
});

/**
 * Tasks at 375-420px: the scope (90px), sort (40px) and Create task on the
 * first line; the filters scroll and wrap (20) before Create task becomes +
 * (30).
 */
function TasksBar() {
  return (
    <FitToolbar aria-label="Tasks" wrap className="gap-2" data-testid="bar">
      <FitToolbarGroup firstLine className="gap-2" data-testid="first">
        <Item id="scope" />
        <Item id="sort" narrow />
      </FitToolbarGroup>
      <FitToolbarGroup overflow="scroll" wrapOrder={20} className="gap-2" data-testid="filters">
        {["f1", "f2", "f3"].map((id) => (
          <BaseToolbar.Button key={id} data-testid={id} className="h-8 w-[90px] flex-none">
            {id}
          </BaseToolbar.Button>
        ))}
      </FitToolbarGroup>
      <FitToolbarGroup firstLine className="gap-2">
        <FitToolbarButton variant="primary" plusOrder={30} data-testid="create">
          Create task
        </FitToolbarButton>
      </FitToolbarGroup>
    </FitToolbar>
  );
}

it("the primary action shows as + only once the filters have wrapped and the first line still doesn't fit", async () => {
  await wide();
  inRegion(1000, <TasksBar />);
  await frame();
  expect(el("create").hasAttribute("data-fit-plus")).toBe(false);
  const label = box("create").width;
  // The first line's own items, 8px apart: no room for the filters beside them.
  const firstLine = 90 + 8 + 40 + 8 + label;
  cleanup();

  // Just wide enough for the first line: the filters wrap, Create task keeps its label.
  inRegion(firstLine + 2, <TasksBar />);
  await frame();
  expect(el("filters").hasAttribute("data-fit-wrap")).toBe(true);
  expect(el("create").hasAttribute("data-fit-plus")).toBe(false);
  expect(box("create").width).toBe(label);

  // Narrower: wrapping is not enough, so Create task becomes +.
  el("region").style.width = `${firstLine - 10}px`;
  await frame();
  await frame();
  expect(el("filters").hasAttribute("data-fit-wrap")).toBe(true);
  expect(box("f1").top).toBeGreaterThan(box("create").bottom);
  expect(el("create").hasAttribute("data-fit-plus")).toBe(true);
  expect(box("create").width).toBeLessThanOrEqual(44);
  expect(box("create").right).toBeLessThanOrEqual(box("region").right);
  // On the first line, centered on it beside items of another height.
  const middle = (id: string) => box(id).top + box(id).height / 2;
  expect(middle("create")).toBeCloseTo(middle("scope"), 0);
  const plus = el("create").querySelector("[data-slot=fit-toolbar-button-plus]")!;
  expect(plus.getClientRects().length).toBe(1);
  const text = el("create").querySelector("[data-slot=fit-toolbar-button-label]")!;
  expect(text.getBoundingClientRect().width).toBeLessThanOrEqual(1);
  // Its label stays its accessible name, and is its tooltip.
  expect(screen.getByRole("button", { name: "Create task" })).toBe(el("create"));
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.hover(el("create"));
  await waitFor(
    () =>
      expect(document.querySelector("[data-slot=tooltip-content]")?.textContent).toBe(
        "Create task",
      ),
    { timeout: 3000 },
  );
  await userEvent.unhover(el("create"));

  // Wider again: the label is back.
  el("region").style.width = `${firstLine + 2}px`;
  await frame();
  await frame();
  expect(el("create").hasAttribute("data-fit-plus")).toBe(false);
  expect(box("create").width).toBe(label);
  expect(plus.getClientRects().length).toBe(0);
});

it("opening a popover from a toolbar item leaves the toolbar as it was", async () => {
  await wide();
  inRegion(
    420,
    <div style={{ marginTop: 120 }}>
      <FitToolbar aria-label="Tasks" wrap className="gap-2" data-testid="bar">
        <FitToolbarGroup firstLine className="gap-2" data-testid="a">
          <Item id="a1" label={30} />
          <Item id="a2" label={30} />
        </FitToolbarGroup>
        <Popover>
          <PopoverTrigger data-testid="trigger" className="h-8 w-10 flex-none">
            Sort
          </PopoverTrigger>
          <PopoverContent>
            <button type="button">Newest</button>
          </PopoverContent>
        </Popover>
        <FitToolbarGroup className="gap-2" data-testid="b">
          <Item id="b1" />
          <Item id="b2" />
        </FitToolbarGroup>
      </FitToolbar>
    </div>,
  );
  await frame();
  const snapshot = () =>
    Array.from(document.querySelectorAll<HTMLElement>("[data-testid]"), (node) => {
      const r = node.getBoundingClientRect();
      const steps = node
        .getAttributeNames()
        .filter((name) => /^data-fit-(label|more|collapse|wrap|plus|wrapping)$/.test(name));
      return `${node.dataset.testid} ${r.left},${r.top},${r.width} ${steps.join(",")}`;
    });
  const before = snapshot();
  expect(el("bar").hasAttribute("data-fit-wrapping")).toBe(true);
  expect(el("a1").hasAttribute("data-fit-label")).toBe(false);
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.click(el("trigger"));
  await screen.findByRole("button", { name: "Newest" });
  // The popup's focus guards sit in the row, fixed at the window's corner.
  await waitFor(() => expect(el("bar").querySelector("[data-base-ui-focus-guard]")).not.toBeNull());
  await frame();
  await frame();
  expect(snapshot()).toEqual(before);
});

it("opening a popover from a scrolling group's first item doesn't make it the group's first item", async () => {
  await wide();
  // 90 + 8 + 40 = 138px on the first line: in 200px the filters' scroller has
  // 54px, less than one 90px filter, so they wrap to a line of their own.
  inRegion(
    200,
    <div style={{ marginTop: 120 }}>
      <FitToolbar aria-label="Tasks" wrap className="gap-2" data-testid="bar">
        <FitToolbarGroup firstLine className="gap-2">
          <Item id="scope" />
          <Item id="sort" narrow />
        </FitToolbarGroup>
        <FitToolbarGroup overflow="scroll" className="gap-2" data-testid="filters">
          <Popover>
            <PopoverTrigger data-testid="f1" className="h-8 w-[90px] flex-none">
              f1
            </PopoverTrigger>
            <PopoverContent>
              <button type="button">Mine</button>
            </PopoverContent>
          </Popover>
          {["f2", "f3"].map((id) => (
            <BaseToolbar.Button key={id} data-testid={id} className="h-8 w-[90px] flex-none">
              {id}
            </BaseToolbar.Button>
          ))}
        </FitToolbarGroup>
      </FitToolbar>
    </div>,
  );
  await frame();
  expect(el("filters").hasAttribute("data-fit-wrap")).toBe(true);
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.click(el("f1"));
  await screen.findByRole("button", { name: "Mine" });
  // The popup's focus guards come first in the scroller, 1px, fixed at the window's corner.
  const content = el("filters").querySelector("[data-slot=scroll-area-content]")!;
  await waitFor(() =>
    expect(content.firstElementChild?.hasAttribute("data-base-ui-focus-guard")).toBe(true),
  );
  await frame();
  await frame();
  expect(el("filters").hasAttribute("data-fit-wrap")).toBe(true);
  expect(box("f1").top).toBeGreaterThan(box("scope").bottom);
});
