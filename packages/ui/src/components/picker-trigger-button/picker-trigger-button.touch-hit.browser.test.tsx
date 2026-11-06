import "../button/button.test.css";
/**
 * By touch a filter trigger looks 32px and keeps a 44px tap area, as a
 * Button at `md` does: its ::after overhangs 6px above and below, never
 * sideways. With a mouse it is the control height (34px) and takes no taps
 * past its box (design/foundations/spacing.md#heights). Real layout and hit
 * testing: browser only.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/picker-trigger-button/picker-trigger-button.touch-hit.browser.test.tsx`
 */
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { PickerTriggerButton } from "./picker-trigger-button";

const it = test.skipIf(typeof window === "undefined");

// Turning touch emulation off again leaves Chromium reporting `pointer: none`,
// so the mouse screen runs first.
const SCREENS = [
  { name: "mouse 1280", width: 1280, height: 800, touch: false, box: 34, hit: 34 },
  { name: "touch 1024", width: 1024, height: 768, touch: true, box: 32, hit: 44 },
  { name: "phone 390", width: 390, height: 844, touch: true, box: 32, hit: 44 },
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
  expect(matchMedia(`(pointer: ${s.touch ? "coarse" : "fine"})`).matches).toBe(true);
}

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

function showTriggers() {
  render(
    <ThemeProvider mode="light">
      <div className="flex items-center gap-2" style={{ padding: 24 }}>
        <PickerTriggerButton data-testid="empty">Channel</PickerTriggerButton>
        <PickerTriggerButton data-testid="applied" data-has-value="">
          #launch-week
        </PickerTriggerButton>
      </div>
    </ThemeProvider>,
  );
  return [screen.getByTestId("empty"), screen.getByTestId("applied")] as const;
}

const hits = (el: Element, x: number, y: number) => {
  const at = document.elementFromPoint(x, y);
  return at !== null && el.contains(at);
};

/** The rectangle that takes the element's taps: its box, or its overhanging ::after. */
function tapArea(el: Element) {
  const box = el.getBoundingClientRect();
  const after = getComputedStyle(el, "::after");
  if (after.display === "none" || after.position !== "absolute") {
    return { top: box.top, bottom: box.bottom, left: box.left, right: box.right };
  }
  // It has no border, so its ::after is placed from its box.
  return {
    top: box.top + parseFloat(after.top),
    bottom: box.bottom - parseFloat(after.bottom),
    left: box.left + parseFloat(after.left),
    right: box.right - parseFloat(after.right),
  };
}

for (const s of SCREENS) {
  it(`${s.name}: a ${s.box}px trigger takes a ${s.hit}px tap`, async () => {
    await setScreen(s);
    for (const trigger of showTriggers()) {
      const box = trigger.getBoundingClientRect();
      const area = tapArea(trigger);
      expect(box.height).toBe(s.box);
      expect(area.bottom - area.top).toBe(s.hit);
      // By touch 6px past the box above and below; with a mouse none.
      expect(box.top - area.top).toBe(s.touch ? 6 : 0);
      expect(area.bottom - box.bottom).toBe(s.touch ? 6 : 0);
      // Never sideways.
      expect(area.left).toBe(box.left);
      expect(area.right).toBe(box.right);
      // A tap 1px inside the area's edges lands on the trigger, 1px outside doesn't.
      const x = box.left + box.width / 2;
      expect(hits(trigger, x, area.top + 1)).toBe(true);
      expect(hits(trigger, x, area.bottom - 1)).toBe(true);
      expect(hits(trigger, x, area.top - 1)).toBe(false);
      expect(hits(trigger, x, area.bottom + 1)).toBe(false);
      expect(hits(trigger, box.left - 1, area.top + 1)).toBe(false);
      expect(hits(trigger, box.right + 1, area.top + 1)).toBe(false);
    }
  });

  it(`${s.name}: two triggers 8px apart keep the gap out of their tap areas`, async () => {
    await setScreen(s);
    const [empty, applied] = showTriggers();
    const a = empty.getBoundingClientRect();
    const b = applied.getBoundingClientRect();
    expect(b.left - a.right).toBe(8);
    const x = (a.right + b.left) / 2;
    for (const y of [a.top + a.height / 2, a.top - 4, a.bottom + 4]) {
      expect(hits(empty, x, y)).toBe(false);
      expect(hits(applied, x, y)).toBe(false);
    }
  });
}
