import "./segmented-control.test.css";
/**
 * By touch a segment looks 32px and keeps a 44px tap area, as a Button at
 * `md` does: its ::after overhangs 6px above and below, up and down only, so
 * the tap areas of segments 3px apart never overlap. With a mouse it is the
 * control height (34px) and takes no taps past its box
 * (design/foundations/spacing.md#heights). Real layout and hit testing:
 * browser only.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/segmented-control/segmented-control.touch-hit.browser.test.tsx`
 */
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { Columns3, List } from "lucide-react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "../button/button";
import { PickerTriggerButton } from "../picker-trigger-button/picker-trigger-button";
import { SegmentedControl, SegmentedControlItem, SegmentedControlLabel } from "./segmented-control";

const it = test.skipIf(typeof window === "undefined");

// Turning touch emulation off again leaves Chromium reporting `pointer: none`,
// so the mouse screen runs first.
const SCREENS = [
  { name: "mouse 1280", width: 1280, height: 800, touch: false, segment: 34, hit: 34 },
  { name: "touch 1024", width: 1024, height: 768, touch: true, segment: 32, hit: 44 },
  { name: "phone 390", width: 390, height: 844, touch: true, segment: 32, hit: 44 },
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

function ToolbarRow() {
  return (
    <ThemeProvider mode="light">
      <div style={{ padding: 16, width: 380 }}>
        <div className="flex items-center gap-2">
          <PickerTriggerButton data-testid="picker">Type</PickerTriggerButton>
          <SegmentedControl aria-label="View" defaultValue="cards" data-testid="track">
            <SegmentedControlItem value="cards">
              <Columns3 />
              <SegmentedControlLabel>Cards</SegmentedControlLabel>
            </SegmentedControlItem>
            <SegmentedControlItem value="list">
              <List />
              <SegmentedControlLabel>List</SegmentedControlLabel>
            </SegmentedControlItem>
          </SegmentedControl>
          <Button size="md" data-testid="button">
            New
          </Button>
        </div>
      </div>
    </ThemeProvider>
  );
}

const hits = (el: Element, x: number, y: number) => {
  const at = document.elementFromPoint(x, y);
  return at !== null && el.contains(at);
};

/**
 * The rectangle that takes the element's taps: its box, and its overhanging
 * ::after, which is placed from inside the border.
 */
function tapArea(el: Element) {
  const box = el.getBoundingClientRect();
  const style = getComputedStyle(el);
  const after = getComputedStyle(el, "::after");
  if (after.display === "none" || after.position !== "absolute") {
    return { top: box.top, bottom: box.bottom, left: box.left, right: box.right };
  }
  return {
    top: Math.min(box.top, box.top + parseFloat(style.borderTopWidth) + parseFloat(after.top)),
    bottom: Math.max(
      box.bottom,
      box.bottom - parseFloat(style.borderBottomWidth) - parseFloat(after.bottom),
    ),
    left: Math.min(box.left, box.left + parseFloat(style.borderLeftWidth) + parseFloat(after.left)),
    right: Math.max(
      box.right,
      box.right - parseFloat(style.borderRightWidth) - parseFloat(after.right),
    ),
  };
}

/** A tap 1px inside the area's edges lands on the element, 1px outside doesn't. */
function expectTapsIn(el: Element, area: ReturnType<typeof tapArea>) {
  const x = (area.left + area.right) / 2;
  expect(hits(el, x, area.top + 1)).toBe(true);
  expect(hits(el, x, area.bottom - 1)).toBe(true);
  expect(hits(el, x, area.top - 1)).toBe(false);
  expect(hits(el, x, area.bottom + 1)).toBe(false);
  const y = area.top + 1;
  expect(hits(el, area.left - 1, y)).toBe(false);
  expect(hits(el, area.right + 1, y)).toBe(false);
}

for (const s of SCREENS) {
  it(`${s.name}: a ${s.segment}px segment takes a ${s.hit}px tap`, async () => {
    await setScreen(s);
    render(<ToolbarRow />);
    const button = screen.getByTestId("button");
    for (const item of screen.getAllByRole("radio")) {
      const box = item.getBoundingClientRect();
      const area = tapArea(item);
      expect(box.height).toBe(s.segment);
      expectTapsIn(item, area);
      // Up and down only, never sideways.
      expect(area.left).toBe(box.left);
      expect(area.right).toBe(box.right);
      if (s.touch) {
        // 32 - 3 + 2 x (6 + 1.5) = 44. Chromium draws the 1.5px border 1px
        // wide at a device pixel ratio of 1, so there it is 45, the same as
        // the Button at `md` beside it.
        const border = parseFloat(getComputedStyle(item).borderTopWidth);
        expect(area.bottom - area.top).toBe(s.hit + 2 * (1.5 - border));
        const b = tapArea(button);
        expect(area.bottom - area.top).toBe(b.bottom - b.top);
      } else {
        // With a mouse no taps past the box.
        expect(area.top).toBe(box.top);
        expect(area.bottom).toBe(box.bottom);
      }
    }
  });

  it(`${s.name}: neighbouring segments' tap areas don't overlap`, async () => {
    await setScreen(s);
    render(<ToolbarRow />);
    const [first, second] = screen.getAllByRole("radio");
    const a = first!.getBoundingClientRect();
    const b = second!.getBoundingClientRect();
    expect(b.left - a.right).toBe(3);
    expect(tapArea(first!).right).toBeLessThan(tapArea(second!).left);
    // The 3px between two segments, in the box and in the overhang.
    const gap = (a.right + b.left) / 2;
    for (const y of [a.top + a.height / 2, a.top - 4, a.bottom + 4]) {
      expect(hits(first!, gap, y)).toBe(false);
      expect(hits(second!, gap, y)).toBe(false);
    }
  });

  it(`${s.name}: in a toolbar row, the tap areas spread up and down, not onto the neighbours`, async () => {
    await setScreen(s);
    render(<ToolbarRow />);
    const picker = screen.getByTestId("picker");
    const track = screen.getByTestId("track");
    const button = screen.getByTestId("button");
    const segments = screen.getAllByRole("radio");
    const p = picker.getBoundingClientRect();
    const t = track.getBoundingClientRect();
    const b = button.getBoundingClientRect();
    // The row's 8px gaps stay out of every tap area, in the boxes' band and
    // in the overhang above and below the track.
    for (const [left, right] of [
      [p.right, t.left],
      [t.right, b.left],
    ] as const) {
      expect(right - left).toBe(8);
      const x = (left + right) / 2;
      for (const y of [t.top + t.height / 2, t.top - 2, t.bottom + 2]) {
        expect([picker, ...segments, button].some((el) => hits(el, x, y))).toBe(false);
      }
    }
    // By touch a segment's tap area reaches past the track, and no control's
    // reaches more than 6px past the row's boxes, as a Button at `md`: the
    // controls above and below keep 6px from the row.
    const reach = Math.max(...segments.map((el) => t.top - tapArea(el).top));
    if (s.touch) {
      expect(reach).toBeGreaterThan(0);
      expect(reach).toBeLessThanOrEqual(6);
      expect(p.top - tapArea(picker).top).toBe(6);
    } else {
      expect(reach).toBeLessThan(0);
      expect(tapArea(picker).top).toBe(p.top);
    }
  });

  it(`${s.name}: segments scrolling inside the track scroll sideways only`, async () => {
    await setScreen(s);
    render(
      <ThemeProvider mode="light">
        <div style={{ padding: 16, width: 120 }}>
          <SegmentedControl aria-label="View" defaultValue="cards" data-testid="narrow">
            <SegmentedControlItem value="cards">Cards</SegmentedControlItem>
            <SegmentedControlItem value="list">List</SegmentedControlItem>
            <SegmentedControlItem value="rows">Rows</SegmentedControlItem>
          </SegmentedControl>
        </div>
      </ThemeProvider>,
    );
    const track = screen.getByTestId("narrow");
    await waitFor(() => expect(track.hasAttribute("data-overflowing")).toBe(true));
    expect(track.scrollWidth).toBeGreaterThan(track.clientWidth);
    // A segment's tap area reaches past the track by touch; it must not make
    // the track scroll up and down under a finger.
    expect(getComputedStyle(track).overflowY).toBe("hidden");
  });
}
