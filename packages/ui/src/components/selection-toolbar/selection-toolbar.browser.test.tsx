import "./selection-toolbar.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  SelectionToolbar,
  SelectionToolbarAction,
  SelectionToolbarActions,
  SelectionToolbarClose,
  SelectionToolbarCount,
  SelectionToolbarCountValue,
  SelectionToolbarDock,
  SelectionToolbarHint,
  SelectionToolbarMore,
} from "./selection-toolbar";

// The toolbar for selected items (design/components/overview.md › Toolbar for
// selected items): a 1px line-strong frame, 8px across and 6px down inside,
// md ghost buttons 4px apart with 14px icons; below md (the screen's or the
// dock's) the actions show their icons alone and secondary ones give way to
// More. Real layout only: jsdom has no boxes to measure.

const it = test.skipIf(typeof window === "undefined");

// Turning touch emulation off again leaves Chromium reporting `pointer: none`,
// so the mouse screen runs first.
const SCREENS = [
  { name: "desktop 1280", width: 1280, height: 800, touch: false, control: 34 },
  { name: "phone 390", width: 390, height: 844, touch: true, control: 32 },
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
  expect(Math.abs(actual - expected), `${actual} ≈ ${expected}`).toBeLessThanOrEqual(0.25);

const ICON = <svg viewBox="0 0 24 24" />;

function Bar() {
  return (
    <SelectionToolbar aria-label="Selected message actions" data-testid="bar">
      <SelectionToolbarCount data-testid="count">
        <SelectionToolbarCountValue data-testid="value">3</SelectionToolbarCountValue> selected
      </SelectionToolbarCount>
      <SelectionToolbarHint data-testid="hint">1 will be skipped</SelectionToolbarHint>
      <SelectionToolbarActions>
        <SelectionToolbarAction icon={ICON} data-testid="copy">
          Copy link
        </SelectionToolbarAction>
        <SelectionToolbarAction icon={ICON} menu data-testid="forward">
          Forward
        </SelectionToolbarAction>
        <SelectionToolbarAction icon={ICON} secondary data-testid="image">
          Generate image
        </SelectionToolbarAction>
        <SelectionToolbarMore aria-label="More actions" data-testid="more">
          {ICON}
        </SelectionToolbarMore>
      </SelectionToolbarActions>
      <SelectionToolbarClose aria-label="Cancel" data-testid="close">
        {ICON}
      </SelectionToolbarClose>
    </SelectionToolbar>
  );
}

function show(ui: ReactNode) {
  return render(<ThemeProvider mode="light">{ui}</ThemeProvider>);
}

const shown = (id: string) => getComputedStyle(screen.getByTestId(id)).display !== "none";
const label = (id: string) =>
  screen.getByTestId(id).querySelector<HTMLElement>("[data-slot=selection-toolbar-action-label]")!;
const box = (id: string) => screen.getByTestId(id).getBoundingClientRect();

function expectNarrow(narrow: boolean) {
  // The label hides visually but stays the button's accessible name.
  expect(getComputedStyle(label("copy")).position).toBe(narrow ? "absolute" : "static");
  expect(screen.getByRole("button", { name: "Copy link" })).toBe(screen.getByTestId("copy"));
  expect(shown("image"), "the secondary action").toBe(!narrow);
  expect(shown("more"), "More").toBe(narrow);
  expect(shown("hint"), "the hint").toBe(!narrow);
  const chevron = screen.getByTestId("forward").querySelector("svg:last-of-type")!;
  expect(getComputedStyle(chevron).display === "none", "the chevron hides").toBe(narrow);
  // Icon alone: 6px each side of the 14px icon, inside the border (1.5px,
  // which Chromium draws at 1px at a device pixel ratio of 1).
  if (narrow) {
    const copy = getComputedStyle(screen.getByTestId("copy"));
    expect(copy.paddingLeft).toBe("6px");
    expect(copy.paddingRight).toBe("6px");
    const border = parseFloat(copy.borderLeftWidth) + parseFloat(copy.borderRightWidth);
    near(box("copy").width, 6 + 14 + 6 + border);
  }
}

for (const s of SCREENS) {
  it(`${s.name}: the frame, the count and md ghost buttons 4px apart`, async () => {
    await setScreen(s);
    show(<Bar />);
    const bar = screen.getByTestId("bar");
    const style = getComputedStyle(bar);
    expect(bar.getAttribute("role")).toBe("toolbar");
    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderTopLeftRadius).toBe("10px");
    expect(style.paddingLeft).toBe("8px");
    expect(style.paddingTop).toBe("6px");
    expect(style.flexWrap).toBe("nowrap");
    // The buttons keep the md height: 32px, 34px with a mouse.
    near(bar.getBoundingClientRect().height, s.control + 12 + 2);
    // It is as wide as its row, not its container: × ends it 9px from the edge.
    const frame = bar.getBoundingClientRect();
    expect(frame.width).toBeLessThan(document.body.clientWidth);
    const close = box("close");
    near(frame.right - close.right, 9);
    near(close.top - frame.top, 7);
    near(close.height, s.control);
    near(box("copy").height, s.control);
    expect(getComputedStyle(screen.getByTestId("copy")).borderTopLeftRadius).toBe("8px");
    expect(getComputedStyle(screen.getByTestId("copy")).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    near(box("forward").left - box("copy").right, 4);
    near(close.left - box(s.touch ? "more" : "image").right, 4);
    // 14px icons, a 12px chevron.
    near(screen.getByTestId("copy").querySelector("svg")!.getBoundingClientRect().width, 14);
    if (!s.touch) {
      const chevron = screen.getByTestId("forward").querySelector("svg:last-of-type")!;
      near(chevron.getBoundingClientRect().width, 12);
    }
    // The count: callout bold, 8px each side, the number in Space Mono.
    const count = getComputedStyle(screen.getByTestId("count"));
    expect(count.fontWeight).toBe("700");
    expect(count.paddingLeft).toBe("8px");
    expect(screen.getByTestId("count").getAttribute("aria-live")).toBe("polite");
    expect(getComputedStyle(screen.getByTestId("value")).fontFamily).toMatch(/Space Mono/);
  });

  it(`${s.name}: below md the actions show their icons alone and secondary ones give way to More`, async () => {
    await setScreen(s);
    show(<Bar />);
    expectNarrow(s.touch);
  });

  it(`${s.name}: in a narrow dock the toolbar is narrow at any screen width`, async () => {
    await setScreen(s);
    show(
      <div style={{ position: "relative", width: 400, height: 200 }} data-testid="area">
        <SelectionToolbarDock data-testid="dock">
          <Bar />
        </SelectionToolbarDock>
      </div>,
    );
    expectNarrow(true);
    // 16px above the bottom, centered.
    const area = box("area");
    const bar = box("bar");
    near(area.bottom - bar.bottom, 16);
    near(bar.left - area.left, area.right - bar.right);
  });

  it(`${s.name}: the arrow keys move between the buttons that show`, async () => {
    await setScreen(s);
    show(<Bar />);
    const order = s.touch
      ? ["copy", "forward", "more", "close"]
      : ["copy", "forward", "image", "close"];
    screen.getByTestId("copy").focus();
    for (const id of order.slice(1)) {
      fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
      expect(document.activeElement).toBe(screen.getByTestId(id));
    }
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(document.activeElement).toBe(screen.getByTestId("copy"));
    fireEvent.keyDown(document.activeElement!, { key: "End" });
    expect(document.activeElement).toBe(screen.getByTestId("close"));
  });

  it(`${s.name}: a tap between two buttons lands on the nearer`, async () => {
    await setScreen(s);
    show(<Bar />);
    const copy = box("copy");
    const forward = box("forward");
    const y = copy.top + copy.height / 2;
    const at = (x: number) => document.elementFromPoint(x, y)?.closest("[data-testid]");
    expect(at(copy.right + 1), "1px right of Copy link").toBe(screen.getByTestId("copy"));
    expect(at(forward.left - 1), "1px left of Forward").toBe(screen.getByTestId("forward"));
    // On a touch screen each 32px button takes a 44px tap: 6px past its top and bottom.
    if (s.touch) {
      const x = copy.left + copy.width / 2;
      for (const ty of [copy.top - 5.5, copy.bottom + 5.5]) {
        expect(document.elementFromPoint(x, ty)?.closest("[data-testid]"), `at ${ty}`).toBe(
          screen.getByTestId("copy"),
        );
      }
    }
  });
}
