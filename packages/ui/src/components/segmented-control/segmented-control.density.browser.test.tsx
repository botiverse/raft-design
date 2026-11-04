import "./segmented-control.test.css";
/**
 * The segmented control's size by screen (sizing audit v12, stdrc 2026-11-04):
 * a 26px segment in a 32px track on a desktop (from 768px with a mouse or
 * trackpad), the control height, so it sits in a 44px head like a field; a
 * 32px segment in a 38px track on a phone and a touch screen. An icons-only
 * segment is the same square. Real layout and media queries: browser only.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/segmented-control`
 */
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Columns3, List } from "lucide-react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { TooltipProvider } from "../tooltip/tooltip";
import { SegmentedControl, SegmentedControlItem, SegmentedControlLabel } from "./segmented-control";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

// Turning touch emulation off again leaves Chromium reporting `pointer: none`,
// so the mouse screen runs first.
const SCREENS = [
  {
    name: "desktop 1440x900",
    width: 1440,
    height: 900,
    pointer: "fine",
    segment: 26,
    track: 32,
    radius: 6,
  },
  {
    name: "touch tablet 1024x1366",
    width: 1024,
    height: 1366,
    pointer: "coarse",
    segment: 32,
    track: 38,
    radius: 8,
  },
  {
    name: "phone 390x844",
    width: 390,
    height: 844,
    pointer: "coarse",
    segment: 32,
    track: 38,
    radius: 8,
  },
] as const;

let touching = false;

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { cdp, page } = await import("vite-plus/test/browser/context");
  if (touching) {
    await cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "pointer", value: "" }] });
    await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 1 });
  }
  await page.viewport(414, 896);
});

function Control({ iconsOnly }: { iconsOnly: boolean }) {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <div className="@container flex items-center" style={{ width: iconsOnly ? 200 : 600 }}>
          <SegmentedControl
            aria-label="Task view"
            defaultValue="board"
            iconsOnlyBelow="sm"
            data-testid="track"
          >
            <SegmentedControlItem value="board">
              <Columns3 />
              <SegmentedControlLabel>Board</SegmentedControlLabel>
            </SegmentedControlItem>
            <SegmentedControlItem value="list">
              <List />
              <SegmentedControlLabel>List</SegmentedControlLabel>
            </SegmentedControlItem>
          </SegmentedControl>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}

for (const s of SCREENS) {
  it(`${s.name}: a ${s.segment}px segment in a ${s.track}px track`, async () => {
    const { cdp, page } = await import("vite-plus/test/browser/context");
    await page.viewport(s.width, s.height);
    if (s.pointer === "coarse" && !touching) {
      touching = true;
      await cdp().send("Emulation.setEmulatedMedia", {
        features: [{ name: "pointer", value: "coarse" }],
      });
      await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
    }
    expect(matchMedia(`(pointer: ${s.pointer})`).matches).toBe(true);

    render(<Control iconsOnly={false} />);
    const track = screen.getByRole("radiogroup");
    expect(track.getBoundingClientRect().height).toBe(s.track);
    for (const item of screen.getAllByRole("radio")) {
      expect(item.getBoundingClientRect().height).toBe(s.segment);
      expect(getComputedStyle(item).borderTopLeftRadius).toBe(`${s.radius}px`);
    }
    // Concentric: the track's corner is the segment's plus its 3px inset.
    expect(getComputedStyle(track).borderTopLeftRadius).toBe(`${s.radius + 3}px`);
    cleanup();

    render(<Control iconsOnly />);
    for (const item of screen.getAllByRole("radio")) {
      const r = item.getBoundingClientRect();
      expect(r.width).toBe(s.segment);
      expect(r.height).toBe(s.segment);
    }
  });
}
