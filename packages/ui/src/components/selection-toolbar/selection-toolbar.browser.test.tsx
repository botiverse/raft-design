import "./selection-toolbar.test.css";
import { afterAll, afterEach, beforeAll, expect, test, vi } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../dropdown-menu/index";
import { Checkbox } from "../checkbox/index";
import {
  SelectionToolbar,
  SelectionToolbarAction,
  SelectionToolbarActions,
  SelectionToolbarClose,
  SelectionToolbarCount,
  SelectionToolbarCountValue,
  SelectionToolbarDock,
  SelectionToolbarHint,
  SelectionToolbarItem,
  SelectionToolbarMore,
  SelectionToolbarMoreItems,
} from "./selection-toolbar";

// The toolbar for selected items (design/components/overview.md › Toolbar for
// selected items): a floating frame as tall as a head (44px with a mouse,
// 56px by touch) with a head's air at its ends. With a mouse its buttons are
// md ghost buttons 4px apart with their labels; by touch 44px bar buttons
// side by side showing their icons alone. As the width it floats in narrows,
// things give way in order, measured: the hint, the secondary actions into
// More, the labels (the first action's last), then the other actions into
// More from the end; the count and × stay. Real layout only, in the design's
// fonts (selection-toolbar.test.css): jsdom has no boxes to measure.

const it = test.skipIf(typeof window === "undefined");

// Turning touch emulation off again leaves Chromium reporting `pointer: none`,
// so the mouse screen runs first.
const SCREENS = [
  { name: "desktop 1280", width: 1280, height: 800, touch: false, control: 34, gap: 4 },
  { name: "phone 360", width: 360, height: 780, touch: true, control: 44, gap: 0 },
] as const;
type Screen = (typeof SCREENS)[number];

let touching = false;
async function setScreen(s: Screen) {
  const { cdp, page } = await import("vite-plus/test/browser/context");
  await page.viewport(s.width, s.height);
  if (s.touch && !touching) {
    touching = true;
    await cdp().send("Emulation.setEmulatedMedia", {
      features: [{ name: "pointer", value: "coarse" }],
    });
    await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  }
}

beforeAll(async () => {
  if (typeof window === "undefined") return;
  await Promise.all([
    document.fonts.load("700 14px 'Space Grotesk'"),
    document.fonts.load("400 14px 'Space Grotesk'"),
    document.fonts.load("700 14px 'Space Mono'"),
  ]);
});
afterEach(cleanup);
afterAll(async () => {
  if (typeof window === "undefined") return;
  const { cdp, page } = await import("vite-plus/test/browser/context");
  if (touching) {
    await cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "pointer", value: "" }] });
    await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 1 });
  }
  await page.viewport(414, 896);
});

const near = (actual: number, expected: number) =>
  expect(Math.abs(actual - expected), `${actual} ≈ ${expected}`).toBeLessThanOrEqual(0.5);

const ICON = <svg viewBox="0 0 24 24" />;
const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

function More() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<SelectionToolbarMore aria-label="More" data-testid="more" />} />
      <DropdownMenuContent side="top" align="end">
        <SelectionToolbarMoreItems />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** The messages' toolbar: Forward, then three secondary actions. */
function MessageBar({ hint = false }: { hint?: boolean }) {
  return (
    <SelectionToolbar aria-label="Selected message actions" data-testid="bar">
      <SelectionToolbarCount data-testid="count">
        <SelectionToolbarCountValue data-testid="value">3</SelectionToolbarCountValue> selected
      </SelectionToolbarCount>
      {hint ? (
        <SelectionToolbarHint data-testid="hint">1 will be skipped</SelectionToolbarHint>
      ) : null}
      <SelectionToolbarActions>
        <SelectionToolbarAction icon={ICON} menu moreItem={null} data-testid="forward">
          Forward
        </SelectionToolbarAction>
        <SelectionToolbarAction icon={ICON} secondary data-testid="image">
          Generate image
        </SelectionToolbarAction>
        <SelectionToolbarAction icon={ICON} secondary data-testid="link">
          Copy link
        </SelectionToolbarAction>
        <SelectionToolbarAction icon={ICON} secondary data-testid="markdown">
          Copy Markdown
        </SelectionToolbarAction>
        <More />
      </SelectionToolbarActions>
      <SelectionToolbarClose aria-label="Cancel" data-testid="close">
        {ICON}
      </SelectionToolbarClose>
    </SelectionToolbar>
  );
}

/** The tasks' toolbar on a phone: N selected · Status · Assignee · Nudge · Follow · Delete. */
function TaskBar() {
  return (
    <SelectionToolbar aria-label="Selected task actions" data-testid="bar">
      <SelectionToolbarCount data-testid="count">
        <SelectionToolbarCountValue>3</SelectionToolbarCountValue> selected
      </SelectionToolbarCount>
      <SelectionToolbarHint data-testid="hint">1 will be skipped</SelectionToolbarHint>
      <SelectionToolbarActions>
        <SelectionToolbarAction icon={ICON} menu moreItem={null} data-testid="status">
          Status
        </SelectionToolbarAction>
        <SelectionToolbarAction icon={ICON} menu moreItem={null} data-testid="assignee">
          Assignee
        </SelectionToolbarAction>
        <SelectionToolbarAction icon={ICON} data-testid="nudge">
          Nudge
        </SelectionToolbarAction>
        <SelectionToolbarAction icon={ICON} secondary data-testid="follow">
          Follow
        </SelectionToolbarAction>
        <SelectionToolbarAction icon={ICON} secondary data-testid="delete">
          Delete
        </SelectionToolbarAction>
        <More />
      </SelectionToolbarActions>
      <SelectionToolbarClose aria-label="Clear selection" data-testid="close">
        {ICON}
      </SelectionToolbarClose>
    </SelectionToolbar>
  );
}

function show(ui: ReactNode) {
  return render(<ThemeProvider mode="light">{ui}</ThemeProvider>);
}

function docked(ui: ReactNode, width: number) {
  return show(
    <div style={{ position: "relative", width, height: 200 }} data-testid="area">
      <SelectionToolbarDock data-testid="dock">{ui}</SelectionToolbarDock>
    </div>,
  );
}

/** A length variable's computed value in px (it may be a calc()). */
function resolved(variable: string) {
  const probe = document.createElement("div");
  probe.style.height = `var(${variable})`;
  document.body.append(probe);
  const height = probe.getBoundingClientRect().height;
  probe.remove();
  return height;
}

const el = (id: string) => screen.getByTestId(id);
const shown = (id: string) => el(id).getClientRects().length > 0;
const box = (id: string) => el(id).getBoundingClientRect();
const label = (id: string) =>
  el(id).querySelector<HTMLElement>("[data-slot=selection-toolbar-action-label]")!;
const labelShown = (id: string) => getComputedStyle(label(id)).position !== "absolute";
const chevron = (id: string) => el(id).querySelector("svg:last-of-type")!;

/** Every button that shows sits inside the frame, ends included. */
function expectInside() {
  const bar = box("bar");
  for (const button of el("bar").querySelectorAll("button")) {
    if (button.getClientRects().length === 0) continue;
    const rect = button.getBoundingClientRect();
    expect(rect.left, button.textContent ?? "").toBeGreaterThanOrEqual(bar.left - 0.5);
    expect(rect.right, button.textContent ?? "").toBeLessThanOrEqual(bar.right + 0.5);
  }
}

function screenTests(s: Screen) {
  it(`${s.name}: the frame, the count and the buttons`, async () => {
    await setScreen(s);
    show(<MessageBar />);
    const bar = el("bar");
    const style = getComputedStyle(bar);
    expect(bar.getAttribute("role")).toBe("toolbar");
    // A floating panel's frame: a line-seam ring, no border.
    expect(style.borderTopWidth).toBe("0px");
    expect(style.boxShadow).not.toBe("none");
    expect(style.borderTopLeftRadius).toBe("10px");
    // As tall as a head, with a head's air at its ends.
    const headerHeight = resolved("--header-height");
    const headerAir = resolved("--header-air");
    near(headerHeight, s.touch ? 56 : 44);
    expect(style.paddingLeft).toBe(`${headerAir}px`);
    expect(style.flexWrap).toBe("nowrap");
    near(bar.getBoundingClientRect().height, headerHeight);
    // As wide as its row; × ends it the air from the edge, centred in the height.
    const outer = bar.getBoundingClientRect();
    expect(outer.width).toBeLessThan(document.body.clientWidth);
    const close = box("close");
    near(outer.right - close.right, headerAir);
    near(close.top - outer.top, (headerHeight - s.control) / 2);
    near(close.height, s.control);
    near(close.width, s.control);
    near(box("forward").height, s.control);
    expect(getComputedStyle(el("forward")).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    near(box("image").left - box("forward").right, s.gap);
    near(el("forward").querySelector("svg")!.getBoundingClientRect().width, 14);
    if (s.touch) {
      // By touch, a head's bar buttons: 44px squares, the icon alone, no chevron.
      near(resolved("--bar-button-size"), 44);
      near(box("forward").width, 44);
      // A bar button's corner (bar-button-radius), as a head's.
      for (const id of ["forward", "close"]) {
        expect(getComputedStyle(el(id)).borderTopLeftRadius, id).toBe(
          `${resolved("--bar-button-radius")}px`,
        );
      }
      expect(labelShown("forward")).toBe(false);
      expect(getComputedStyle(chevron("forward")).display).toBe("none");
    } else {
      expect(labelShown("forward")).toBe(true);
      near(chevron("forward").getBoundingClientRect().width, 12);
    }
    // The label stays the accessible name.
    expect(screen.getByRole("button", { name: "Forward" })).toBe(el("forward"));
    // The count: callout bold, 8px on its left, the number in Space Mono.
    const count = getComputedStyle(el("count"));
    expect(count.fontWeight).toBe("700");
    expect(count.paddingLeft).toBe("8px");
    expect(el("count").getAttribute("aria-live")).toBe("polite");
    expect(getComputedStyle(el("value")).fontFamily).toMatch(/Space Mono/);
  });

  it(`${s.name}: one Tab stop, the arrow keys inside, a select-all checkbox included`, async () => {
    await setScreen(s);
    show(
      <>
        <button type="button" data-testid="before">
          Before
        </button>
        <SelectionToolbar aria-label="Selected message actions" data-testid="bar">
          <SelectionToolbarItem>
            <Checkbox aria-label="Select all" data-testid="all" />
          </SelectionToolbarItem>
          <SelectionToolbarCount>3 selected</SelectionToolbarCount>
          <SelectionToolbarActions>
            <SelectionToolbarAction icon={ICON} data-testid="forward">
              Forward
            </SelectionToolbarAction>
            <More />
          </SelectionToolbarActions>
          <SelectionToolbarClose aria-label="Cancel" data-testid="close">
            {ICON}
          </SelectionToolbarClose>
        </SelectionToolbar>
      </>,
    );
    await frame();
    // Only one of its controls is in the Tab order.
    const tabbable = Array.from(el("bar").querySelectorAll<HTMLElement>("[tabindex]")).filter(
      (node) => node.tabIndex >= 0,
    );
    expect(tabbable).toHaveLength(1);
    el("all").focus();
    expect(document.activeElement).toBe(el("all"));
    // More is hidden while nothing is in it: the arrows skip it.
    const { userEvent } = await import("vite-plus/test/browser/context");
    expect(el("all").getAttribute("role")).toBe("checkbox");
    for (const id of ["forward", "close"]) {
      await userEvent.keyboard("{ArrowRight}");
      expect(document.activeElement?.getAttribute("data-testid"), id).toBe(id);
    }
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(document.activeElement).toBe(el("all"));
  });
}

// The mouse screen first: touch emulation, once on, stays on.
screenTests(SCREENS[0]);

it("a menu action without moreItem is a type error and warns in development", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  show(
    <SelectionToolbar aria-label="Selected task actions">
      <SelectionToolbarActions>
        {/* @ts-expect-error a menu action must say what it is in More */}
        <SelectionToolbarAction icon={ICON} menu>
          Status
        </SelectionToolbarAction>
      </SelectionToolbarActions>
    </SelectionToolbar>,
  );
  expect(warn.mock.calls.some(([message]) => String(message).includes("moreItem"))).toBe(true);
  warn.mockRestore();
});

it("desktop: in a 1280px dock every action shows its label and More hides", async () => {
  await setScreen(SCREENS[0]);
  docked(<MessageBar hint />, 1280);
  await frame();
  for (const id of ["forward", "image", "link", "markdown"]) {
    expect(shown(id), id).toBe(true);
    expect(labelShown(id), id).toBe(true);
  }
  expect(shown("more")).toBe(false);
  expect(getComputedStyle(el("hint")).position).toBe("static");
  // 12px above the bottom, centered.
  const area = box("area");
  const bar = box("bar");
  near(area.bottom - bar.bottom, 12);
  near(bar.left - area.left, area.right - bar.right);
});

it("desktop: in a 600px dock (a thread open beside) the secondary actions give way first, Forward keeps its label", async () => {
  await setScreen(SCREENS[0]);
  docked(<MessageBar hint />, 600);
  await frame();
  expectInside();
  // The hint went first: now read by screen readers only.
  expect(getComputedStyle(el("hint")).position).toBe("absolute");
  expect(shown("markdown"), "the last secondary action").toBe(false);
  expect(shown("more")).toBe(true);
  expect(shown("forward")).toBe(true);
  expect(labelShown("forward"), "Forward keeps its label").toBe(true);
  expect(el("bar").getBoundingClientRect().right).toBeLessThanOrEqual(box("dock").right - 20 + 0.5);
});

it("desktop: in a narrower dock the labels give way, Forward's last, then an icon square with a tooltip", async () => {
  await setScreen(SCREENS[0]);
  docked(<MessageBar />, 400);
  await frame();
  expectInside();
  for (const id of ["image", "link", "markdown"]) expect(shown(id), id).toBe(false);
  expect(labelShown("forward")).toBe(true);
  cleanup();
  docked(<MessageBar />, 280);
  await frame();
  expectInside();
  expect(labelShown("forward")).toBe(false);
  expect(getComputedStyle(chevron("forward")).display).toBe("none");
  near(box("forward").width, 34);
  near(box("more").width, 34);
  expect(screen.getByRole("button", { name: "Forward" })).toBe(el("forward"));
  // More lists what is in it, in order.
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.click(el("more"));
  const items = await screen.findAllByRole("menuitem");
  expect(items.map((item) => item.textContent)).toEqual([
    "Generate image",
    "Copy link",
    "Copy Markdown",
  ]);
});

screenTests(SCREENS[1]);

it("phone 360: the tasks' toolbar fits Status, Assignee and Nudge; Follow and Delete are in More", async () => {
  await setScreen(SCREENS[1]);
  docked(<TaskBar />, 360);
  await frame();
  expectInside();
  near(box("bar").height, 56);
  for (const id of ["status", "assignee", "nudge", "more", "close"]) {
    expect(shown(id), id).toBe(true);
    near(box(id).height, 44);
    near(box(id).width, 44);
  }
  for (const id of ["status", "assignee", "nudge"]) expect(labelShown(id), id).toBe(false);
  for (const id of ["status", "assignee"]) {
    expect(getComputedStyle(chevron(id)).display, id).toBe("none");
  }
  expect(shown("follow")).toBe(false);
  expect(shown("delete")).toBe(false);
  // The buttons touch: each is its own 44px tap, so a tap on the seam lands on one.
  near(box("assignee").left, box("status").right);
  const y = box("status").top + 22;
  const at = (x: number) => document.elementFromPoint(x, y)?.closest("[data-testid]");
  expect(at(box("status").right - 2)?.getAttribute("data-testid")).toBe("status");
  expect(at(box("assignee").left + 2)?.getAttribute("data-testid")).toBe("assignee");
});

it("phone: in a 320px dock Nudge moves into More too", async () => {
  await setScreen(SCREENS[1]);
  docked(<TaskBar />, 320);
  await frame();
  expectInside();
  for (const id of ["status", "assignee", "more", "close"]) expect(shown(id), id).toBe(true);
  for (const id of ["nudge", "follow", "delete"]) expect(shown(id), id).toBe(false);
});
