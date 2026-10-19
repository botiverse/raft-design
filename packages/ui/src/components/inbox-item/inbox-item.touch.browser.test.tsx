import "./inbox-item.test.css";
import { afterAll, afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { PanelAction } from "../panel/panel-action";
import { PanelToggleAction } from "../panel/panel-toggle-action";
import {
  InboxItem,
  InboxItemActions,
  InboxItemContent,
  InboxItemTitle,
  InboxItemTrailing,
  InboxItemTrigger,
} from "./inbox-item";

// On a touch screen (`pointer: coarse`) every action in the row keeps a 44px
// target at any width, and two targets don't overlap. A phone-width viewport
// is where it matters: there the panel action's own `md:` overhang is off.
// Measured in a real browser with touch emulated through CDP; jsdom has no
// media queries or layout.

const it = test.skipIf(typeof window === "undefined");

async function setCoarsePointer(enabled: boolean) {
  const { cdp } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: enabled ? "coarse" : "" }],
  });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled, maxTouchPoints: 1 });
}

beforeAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(390, 844);
});

afterEach(async () => {
  cleanup();
  if (typeof window !== "undefined") await setCoarsePointer(false);
});

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(414, 896);
});

function renderRow() {
  render(
    <InboxItem>
      <InboxItemTrigger aria-label="Open Martin needs your OK" />
      <InboxItemContent>
        <InboxItemTitle>Martin needs your OK</InboxItemTitle>
      </InboxItemContent>
      <InboxItemTrailing>
        <InboxItemActions>
          <PanelToggleAction aria-label="Save activity item">S</PanelToggleAction>
          <PanelAction aria-label="Mark as done">D</PanelAction>
        </InboxItemActions>
      </InboxItemTrailing>
    </InboxItem>,
  );
  return {
    save: screen.getByRole("button", { name: "Save activity item" }),
    done: screen.getByRole("button", { name: "Mark as done" }),
  };
}

/** The pressable box: the button plus the overhang of its `::after`. */
function hitArea(el: HTMLElement) {
  const box = el.getBoundingClientRect();
  const after = getComputedStyle(el, "::after");
  const overhang = (side: "top" | "right" | "bottom" | "left") =>
    after.position === "absolute" ? Math.max(0, -parseFloat(after[side])) : 0;
  return {
    left: box.left - overhang("left"),
    right: box.right + overhang("right"),
    width: box.width + overhang("left") + overhang("right"),
    height: box.height + overhang("top") + overhang("bottom"),
  };
}

it("keeps a 44px target for each row action on a touch screen at phone width", async () => {
  await setCoarsePointer(true);
  expect(matchMedia("(pointer: coarse)").matches).toBe(true);
  const { save, done } = renderRow();
  for (const action of [save, done]) {
    const area = hitArea(action);
    expect(area.width).toBeGreaterThanOrEqual(44);
    expect(area.height).toBeGreaterThanOrEqual(44);
  }
  expect(hitArea(save).right).toBeLessThanOrEqual(hitArea(done).left);
});

it("leaves a mouse at phone width as it was: 32px buttons, no overhang", async () => {
  expect(matchMedia("(pointer: coarse)").matches).toBe(false);
  const { save, done } = renderRow();
  for (const action of [save, done]) {
    expect(getComputedStyle(action, "::after").position).not.toBe("absolute");
    expect(action.getBoundingClientRect().height).toBe(32);
  }
  expect(done.getBoundingClientRect().left - save.getBoundingClientRect().right).toBe(2);
});
