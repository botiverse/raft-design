import "./panel-header.test.css";
import { afterAll, afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { DropdownMenu, DropdownMenuTrigger } from "../dropdown-menu/dropdown-menu";
import {
  PanelSplitAction,
  PanelSplitActionMain,
  PanelSplitActionMenu,
  PanelSplitActionToggle,
} from "./panel-split-action";

// A split action reads as one control: the part under the pointer takes the
// medium tier (fill-medium), the other part the subtle tier (fill-subtle), and
// while the main part is pressed the menu part keeps the subtle tier. The menu
// part is narrower than the main part. Measured as real computed colours in a
// browser on a desktop (from 768px with a mouse); jsdom has no hover or layout.

const it = test.skipIf(typeof window === "undefined");

const MODES = ["light", "dark"] as const;

beforeAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 800);
});

afterEach(cleanup);

const noop = () => {};

function renderSplit(mode: (typeof MODES)[number], toggle = false, pressed = false) {
  render(
    <ThemeProvider mode={mode}>
      <div data-testid="stage" className="flex gap-8 bg-layer-canvas p-8 text-foreground">
        <span data-testid="subtle" className="size-4 bg-fill-subtle" />
        <span data-testid="medium" className="size-4 bg-fill-medium" />
        <PanelSplitAction>
          {toggle ? (
            <PanelSplitActionToggle
              data-testid="main"
              aria-label="Comment"
              pressed={pressed}
              onPressedChange={noop}
            >
              <svg viewBox="0 0 24 24" />
            </PanelSplitActionToggle>
          ) : (
            <PanelSplitActionMain data-testid="main" aria-label="Comment">
              <svg viewBox="0 0 24 24" />
            </PanelSplitActionMain>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<PanelSplitActionMenu data-testid="menu" aria-label="Comments" />}
            />
          </DropdownMenu>
        </PanelSplitAction>
      </div>
    </ThemeProvider>,
  );
  return {
    main: screen.getByTestId("main"),
    menu: screen.getByTestId("menu"),
    subtle: getComputedStyle(screen.getByTestId("subtle")).backgroundColor,
    medium: getComputedStyle(screen.getByTestId("medium")).backgroundColor,
  };
}

const bg = (element: Element) => getComputedStyle(element).backgroundColor;

/** Poll until the element's fill settles on `expected` (rules land on demand, fills transition). */
async function settle(element: Element, expected: string) {
  for (let i = 0; i < 40 && bg(element) !== expected; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return bg(element);
}

async function hover(testId: string) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.getByTestId(testId).hover();
}

for (const mode of MODES) {
  it(`${mode}: hovering the main part tints the menu part one tier lighter`, async () => {
    const { main, menu, subtle, medium } = renderSplit(mode);
    expect(subtle).not.toBe(medium);
    await hover("stage");
    expect(await settle(menu, "rgba(0, 0, 0, 0)")).toBe("rgba(0, 0, 0, 0)");
    await hover("main");
    expect(await settle(main, medium)).toBe(medium);
    expect(await settle(menu, subtle)).toBe(subtle);
  });

  it(`${mode}: hovering the menu part tints the main part one tier lighter`, async () => {
    const { main, menu, subtle, medium } = renderSplit(mode);
    await hover("menu");
    expect(await settle(menu, medium)).toBe(medium);
    expect(await settle(main, subtle)).toBe(subtle);
  });

  it(`${mode}: while the main part is pressed the menu part keeps the lighter tint`, async () => {
    const { main, menu, subtle, medium } = renderSplit(mode, true, true);
    await hover("stage");
    expect(await settle(menu, subtle)).toBe(subtle);
    expect(bg(main)).not.toBe(subtle);
    await hover("menu");
    expect(await settle(menu, medium)).toBe(medium);
  });
}

it("the menu part is narrower than the main part and as tall", () => {
  const { main, menu } = renderSplit("light");
  const mainBox = main.getBoundingClientRect();
  const menuBox = menu.getBoundingClientRect();
  expect(menuBox.width).toBe(20);
  expect(menuBox.width).toBeLessThan(mainBox.width);
  expect(menuBox.height).toBe(mainBox.height);
  expect(menuBox.left).toBe(mainBox.right);
});

// Touch runs last: turning touch emulation off again leaves Chromium
// reporting `pointer: none`, not `fine` (panel-action.browser.test.tsx).
it("on a touch screen the main part is 44px and the menu part a 24px drawing with a 44px target", async () => {
  const { cdp, page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 800);
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: "coarse" }],
  });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  const { main, menu } = renderSplit("light");
  const mainBox = main.getBoundingClientRect();
  const menuBox = menu.getBoundingClientRect();
  expect(mainBox.width).toBe(44);
  expect(mainBox.height).toBe(44);
  expect(menuBox.width).toBe(24);
  expect(menuBox.height).toBe(44);
  // The ::after reaches past the menu part's end (measured from inside its
  // 1.5px border) to a 44px target, into space the part keeps free.
  const after = getComputedStyle(menu, "::after");
  const reach = -parseFloat(after.right) - 1.5;
  expect(menuBox.width + reach).toBe(44);
  // And the 44px button's full height where it reaches past it.
  const own = getComputedStyle(menu);
  const inside =
    menuBox.height - parseFloat(own.borderTopWidth) - parseFloat(own.borderBottomWidth);
  expect(inside - parseFloat(after.top) - parseFloat(after.bottom)).toBeGreaterThanOrEqual(44);
  expect(parseFloat(getComputedStyle(menu).marginInlineEnd)).toBeGreaterThanOrEqual(reach);
});

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { cdp, page } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "pointer", value: "" }] });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 1 });
  await page.viewport(414, 896);
});
