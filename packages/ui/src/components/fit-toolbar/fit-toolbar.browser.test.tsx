import "./fit-toolbar.test.css";
import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { FitToolbar, FitToolbarGroup, useFitItem } from "./fit-toolbar";
import type { FitSteps } from "./fit-toolbar";

// FitToolbar measures its content in the width of its own region, never the
// window's, and takes its items' steps in order until it fits. Groups wrap
// only between groups, each to a line of its own, the gap fixed; the page
// says which stay on the first line. Fixed-width items keep the arithmetic
// independent of fonts. Real layout only.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const el = (id: string) => screen.getByTestId(id);
const box = (id: string) => el(id).getBoundingClientRect();
const shown = (id: string) => el(id).getClientRects().length > 0;

/** A 90px item, or 40px when `narrow`. */
function Item({ id, narrow = false, ...steps }: FitSteps & { id: string; narrow?: boolean }) {
  const item = useFitItem(steps);
  return (
    <BaseToolbar.Button
      data-testid={id}
      className={narrow ? "h-8 w-10 flex-none" : "h-8 w-[90px] flex-none"}
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
