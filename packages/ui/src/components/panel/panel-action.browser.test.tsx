import "./panel-header.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { PanelAction } from "./panel-action";
import { PanelActions, PanelHeader, PanelHeaderContent, PanelTitle } from "./panel-header";

// A PanelAction follows the control metrics: on a desktop (from 768px with a
// mouse or trackpad) it is 32px with an 18px icon and a 44px hit area; on a
// phone, and on a touch screen at any width, it is 44px with a 22px icon. In
// a head the last icon box ends on the content margin, whichever size the
// button is: 20px wherever the desktop layout shows, 16px on a phone
// (head-edges.browser.test.tsx measures both ends of every head). Measured in a real browser with touch
// emulated through CDP; jsdom has no media queries or layout.

const it = test.skipIf(typeof window === "undefined");

const MODES = ["light", "dark"] as const;

// Touch is emulated through CDP. Turning touch emulation off again leaves
// Chromium reporting `pointer: none`, not `fine`, so the mouse cases run
// first, before this file emulates a finger, and check that they see one.
let touching = false;

async function setScreen(width: number, pointer: "coarse" | "fine") {
  const { cdp, page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, 800);
  if (pointer === "fine") return;
  touching = true;
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: "coarse" }],
  });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
}

afterEach(async () => {
  cleanup();
  if (typeof window === "undefined" || !touching) return;
  const { cdp } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "pointer", value: "" }] });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 1 });
});

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(414, 896);
});

function renderHead(mode: (typeof MODES)[number]) {
  render(
    <ThemeProvider mode={mode}>
      <PanelHeader data-testid="head">
        <PanelHeaderContent>
          <PanelTitle>proj-frontend</PanelTitle>
        </PanelHeaderContent>
        <PanelActions>
          <PanelAction aria-label="Search">
            <svg viewBox="0 0 24 24" />
          </PanelAction>
          <PanelAction data-testid="action" aria-label="Settings">
            <svg data-testid="icon" viewBox="0 0 24 24" />
          </PanelAction>
        </PanelActions>
      </PanelHeader>
    </ThemeProvider>,
  );
  return {
    head: screen.getByTestId("head"),
    action: screen.getByTestId("action"),
    icon: screen.getByTestId("icon"),
  };
}

const height = (element: Element) => element.getBoundingClientRect().height;

/**
 * The height of the button's ::after hit area, placed from inside the button's
 * border. Chromium draws the 1.5px border as 1px at 1x, so it is at least, not
 * exactly, the target (as Button's).
 */
function hitHeight(button: HTMLElement) {
  const after = getComputedStyle(button, "::after");
  if (after.position !== "absolute") return height(button);
  const own = getComputedStyle(button);
  const inside =
    height(button) -
    Number.parseFloat(own.borderTopWidth) -
    Number.parseFloat(own.borderBottomWidth);
  return inside - Number.parseFloat(after.top) - Number.parseFloat(after.bottom);
}

/** How far the last icon box ends from the head's right edge. */
const edgeInset = (head: HTMLElement, icon: Element) =>
  head.getBoundingClientRect().right - icon.getBoundingClientRect().right;

const SCREENS = [
  { name: "a desktop", width: 1280, pointer: "fine", size: 32, hit: 44, icon: 18, edge: 20 },
  { name: "a phone", width: 390, pointer: "coarse", size: 44, hit: 44, icon: 22, edge: 16 },
  { name: "a touch tablet", width: 1024, pointer: "coarse", size: 44, hit: 44, icon: 22, edge: 20 },
] as const;

for (const s of SCREENS) {
  for (const mode of MODES) {
    it(`${mode}: on ${s.name} a PanelAction is ${s.size}px with a ${s.icon}px icon and a ${s.hit}px hit area`, async () => {
      await setScreen(s.width, s.pointer);
      expect(matchMedia(`(pointer: ${s.pointer})`).matches).toBe(true);
      const { action, icon } = renderHead(mode);
      expect(height(action)).toBe(s.size);
      expect(action.getBoundingClientRect().width).toBe(s.size);
      expect(hitHeight(action)).toBeGreaterThanOrEqual(s.hit);
      expect(height(icon)).toBe(s.icon);
    });

    it(`${mode}: on ${s.name} the last icon box ends ${s.edge}px from the head's edge`, async () => {
      await setScreen(s.width, s.pointer);
      expect(matchMedia(`(pointer: ${s.pointer})`).matches).toBe(true);
      const { head, icon } = renderHead(mode);
      expect(edgeInset(head, icon)).toBe(s.edge);
    });
  }
}
