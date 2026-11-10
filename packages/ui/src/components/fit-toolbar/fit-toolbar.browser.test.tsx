import "./fit-toolbar.test.css";
import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { afterEach, expect, test } from "vite-plus/test";
import { act, cleanup, render, screen } from "@testing-library/react";
import { useLayoutEffect, useState } from "react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
} from "../segmented-control/segmented-control";
import { FitToolbar, FitToolbarGroup, useFitItem } from "./fit-toolbar";
import type { FitSteps } from "./fit-toolbar";

// FitToolbar measures its content in the width of its own region, never the
// window's, and takes its items' steps in order until it fits. Groups wrap
// only between groups, onto a line of their own or one they share
// (`wrapLine`), the gap fixed; the page says which stay on the first line.
// A wrapped group gets back what its items gave before it wrapped, so a width
// always gives the same toolbar. A SegmentedControl in it follows its steps. Fixed-width items keep the arithmetic
// independent of fonts. Real layout only.

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
  expect(el("b").hasAttribute("data-fit-group")).toBe(true);
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
  const filters = el("filters");
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
