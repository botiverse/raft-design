import "./tabs.test.css";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Tabs, TabsList, TabsTab } from "./index";
import type { TabsPlacement } from "./index";

// A tab's keyboard focus ring shows all four of its edges, also in a row that
// scrolls. The row clips what is drawn past it (overflow, and the edge fade is
// a mask), so the outward focus-ring lost its top and bottom in a sideways
// row, and its sides in an upright one (raft-design#1447). The test looks at
// pixels: it takes the row with the tab focused from the keyboard and again
// with the focus gone, and the pixels that differ are the ring. Each edge of
// their bounding box must be drawn along most of its length: the two side bars
// a clipped ring leaves don't make a top or a bottom edge. The ring also keeps
// clear of the tab's text, at the row's ends too, and a tab the arrow keys
// scroll into view is not left under the edge fade.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

async function browser() {
  return import("vite-plus/test/browser/context");
}

/** Waits out any transition, then two frames. */
const settle = async () => {
  await new Promise((r) => setTimeout(r, 150));
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
};

type Shot = { width: number; height: number; data: Uint8ClampedArray };

async function shot(element: HTMLElement): Promise<Shot> {
  const { page } = await browser();
  const base64 = await page.screenshot({ element, save: false });
  const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob();
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("no 2d context");
  context.drawImage(bitmap, 0, 0);
  const { data } = context.getImageData(0, 0, bitmap.width, bitmap.height);
  return { width: bitmap.width, height: bitmap.height, data };
}

/** The edges the ring draws, from the pixels that differ between two shots. */
function ringEdges(focused: Shot, blurred: Shot) {
  const { width, height } = focused;
  const changed = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    let delta = 0;
    for (let c = 0; c < 3; c += 1) delta += Math.abs(focused.data[i + c]! - blurred.data[i + c]!);
    return delta > 60;
  };
  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!changed(x, y)) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }
  if (right < 0) return { drawn: false, box: undefined, top: 0, bottom: 0, left: 0, right: 0 };
  // The share of an edge's length that is ring: a column (or row) counts when
  // one of the 3 pixels at that edge of the box changed.
  const rowShare = (from: number, to: number) => {
    let hit = 0;
    for (let x = left; x <= right; x += 1) {
      for (let y = from; y <= to; y += 1) {
        if (changed(x, y)) {
          hit += 1;
          break;
        }
      }
    }
    return hit / (right - left + 1);
  };
  const columnShare = (from: number, to: number) => {
    let hit = 0;
    for (let y = top; y <= bottom; y += 1) {
      for (let x = from; x <= to; x += 1) {
        if (changed(x, y)) {
          hit += 1;
          break;
        }
      }
    }
    return hit / (bottom - top + 1);
  };
  return {
    drawn: true,
    box: { left, right, top, bottom },
    top: rowShare(top, Math.min(top + 2, bottom)),
    bottom: rowShare(Math.max(bottom - 2, top), bottom),
    left: columnShare(left, Math.min(left + 2, right)),
    right: columnShare(Math.max(right - 2, left), right),
  };
}

function Row({
  variant,
  placement,
  mode,
}: {
  variant: "default" | "underline";
  placement: TabsPlacement;
  mode: "light" | "dark";
}) {
  const upright = placement === "left" || placement === "right";
  return (
    <ThemeProvider mode={mode}>
      <div className="bg-layer-canvas p-4">
        <button type="button" data-testid="before">
          Before
        </button>
        {/* Narrow enough that the row scrolls: sideways for top and bottom,
            up and down for left and right. */}
        <div
          data-testid="frame"
          className={upright ? "bg-layer-canvas p-4" : "w-[260px] bg-layer-canvas p-4"}
        >
          <Tabs defaultValue="general" placement={placement}>
            <TabsList
              variant={variant}
              aria-label="App settings"
              className={upright ? "max-h-24" : undefined}
            >
              <TabsTab value="general">General</TabsTab>
              <TabsTab value="members">Members</TabsTab>
              <TabsTab value="permissions">Permissions</TabsTab>
              <TabsTab value="notifications">Notifications</TabsTab>
              <TabsTab value="integrations">Integrations</TabsTab>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </ThemeProvider>
  );
}

async function expectFullRing(name: string, steps: number) {
  const selected = steps === 0;
  const { userEvent } = await browser();
  const list = screen.getByRole("tablist");
  const overflow = list.scrollWidth - list.clientWidth + (list.scrollHeight - list.clientHeight);
  expect(overflow, "the row scrolls").toBeGreaterThan(8);

  // From the keyboard, as a person reaches it: Tab lands on the selected tab;
  // the arrow keys move focus on without selecting.
  await userEvent.click(screen.getByTestId("before"));
  await userEvent.keyboard("{Tab}");
  const arrow =
    list.getAttribute("aria-orientation") === "vertical" ? "{ArrowDown}" : "{ArrowRight}";
  for (let i = 0; i < steps; i += 1) await userEvent.keyboard(arrow);
  await settle();
  const tab = document.activeElement as HTMLElement;
  expect(tab.getAttribute("role")).toBe("tab");
  expect(tab.hasAttribute("data-active"), "selected").toBe(selected);

  const frame = screen.getByTestId("frame");
  const focused = await shot(frame);
  const frameBox = frame.getBoundingClientRect();
  const text = tab.querySelector("[data-slot=tabs-tab-content]")!.getBoundingClientRect();
  // Blurring without a pointer keeps the keyboard modality and the scroll;
  // only the ring goes.
  tab.blur();
  await settle();
  const blurred = await shot(frame);

  const edges = ringEdges(focused, blurred);
  expect(edges.drawn, `${name}: a ring is drawn`).toBe(true);
  for (const side of ["top", "bottom", "left", "right"] as const) {
    expect(edges[side], `${name}: the ring's ${side} edge`).toBeGreaterThan(0.6);
  }
  // At least 6px between the ring's inner side and the text, in CSS pixels.
  const scale = focused.width / frameBox.width;
  const box = edges.box!;
  expect(
    (text.left - frameBox.left) * scale - (box.left + 2 * scale),
    `${name}: room before the text`,
  ).toBeGreaterThanOrEqual(6 * scale);
  expect(
    box.right - 2 * scale - (text.right - frameBox.left) * scale,
    `${name}: room after the text`,
  ).toBeGreaterThanOrEqual(6 * scale);
}

for (const mode of ["light", "dark"] as const) {
  for (const variant of ["default", "underline"] as const) {
    for (const placement of ["top", "bottom", "left", "right"] as const) {
      it(`${mode} ${variant} ${placement}: a focused tab in a scrolling row shows all four edges of its ring`, async () => {
        render(<Row variant={variant} placement={placement} mode={mode} />);
        await document.fonts.ready;
        await settle();
        await expectFullRing(`${mode} ${variant} ${placement}`, 1);
      });
    }
    it(`${mode} ${variant}: the focused selected tab, first in the row, shows its ring as well as the selected look`, async () => {
      render(<Row variant={variant} placement="top" mode={mode} />);
      await document.fonts.ready;
      await settle();
      await expectFullRing(`${mode} ${variant} selected`, 0);
    });
    it(`${mode} ${variant}: a tab the arrow keys scroll into view shows its whole ring, clear of the fade`, async () => {
      render(<Row variant={variant} placement="top" mode={mode} />);
      await document.fonts.ready;
      await settle();
      await expectFullRing(`${mode} ${variant} scrolled`, 2);
      expect(screen.getByRole("tablist").scrollLeft, "the row scrolled").toBeGreaterThan(0);
    });
    it(`${mode} ${variant}: the last tab, at the row's end, shows its whole ring`, async () => {
      render(<Row variant={variant} placement="top" mode={mode} />);
      await document.fonts.ready;
      await settle();
      await expectFullRing(`${mode} ${variant} last`, 4);
    });
  }
}

// The underline row makes the room for its end tabs' rings inside its own box
// and gives it back with a negative margin: the first tab's text stays on the
// content's edge, alone and in a panel's tab row (whose padding is the room).
it("underline: the first tab stays on the content's edge", async () => {
  const { ConversationPanelTabs } = await import("../conversation-panel/conversation-panel");
  render(
    <ThemeProvider>
      <div data-testid="bare" className="w-[260px] px-4">
        <Tabs defaultValue="general">
          <TabsList variant="underline" aria-label="Bare">
            <TabsTab value="general">General</TabsTab>
            <TabsTab value="members">Members</TabsTab>
            <TabsTab value="permissions">Permissions</TabsTab>
            <TabsTab value="notifications">Notifications</TabsTab>
          </TabsList>
        </Tabs>
      </div>
      <div data-testid="panel" className="w-[260px]">
        <Tabs defaultValue="general">
          <ConversationPanelTabs>
            <TabsList variant="underline" aria-label="Panel">
              <TabsTab value="general">General</TabsTab>
              <TabsTab value="members">Members</TabsTab>
              <TabsTab value="permissions">Permissions</TabsTab>
              <TabsTab value="notifications">Notifications</TabsTab>
            </TabsList>
          </ConversationPanelTabs>
        </Tabs>
      </div>
    </ThemeProvider>,
  );
  await document.fonts.ready;
  await settle();
  const first = (name: string) =>
    screen
      .getByRole("tablist", { name })
      .querySelector("[data-slot=tabs-tab]")!
      .getBoundingClientRect();
  const bare = screen.getByTestId("bare").getBoundingClientRect();
  expect(first("Bare").left - bare.left).toBe(16);
  const panelList = screen.getByRole("tablist", { name: "Panel" });
  expect(first("Panel").left - screen.getByTestId("panel").getBoundingClientRect().left).toBe(
    parseFloat(getComputedStyle(panelList).paddingLeft),
  );
  expect(getComputedStyle(panelList).marginLeft).toBe("0px");
  // The bare row still spans its column, and scrolls inside it.
  const list = screen.getByRole("tablist", { name: "Bare" }).getBoundingClientRect();
  expect(list.left).toBe(bare.left + 16 - 10);
  expect(list.right).toBe(bare.right - 16 + 10);
});
