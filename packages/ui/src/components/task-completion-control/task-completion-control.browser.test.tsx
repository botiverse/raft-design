import "./task-completion-control.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { TaskCompletionControl } from "./task-completion-control";

// The completion control's hit area reaches 8px past its 20px circle with a
// mouse (36 x 36) and 12px on a touch screen (44 x 44), as a Checkbox's does
// (design/patterns/tasks.md#completing-a-task). Real layout only.

const it = test.skipIf(typeof window === "undefined");

const DEVICES = [
  { name: "desktop", width: 1280, touch: false, size: 36 },
  { name: "phone", width: 390, touch: true, size: 44 },
] as const;

async function context() {
  return import("vite-plus/test/browser/context");
}

async function device(width: number, touch: boolean) {
  const { cdp, page } = await context();
  await page.viewport(width, 900);
  // Turning touch emulation off leaves no fine pointer, so the desktop case
  // runs first and never turns it on.
  if (touch) {
    await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  }
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: touch ? "coarse" : "fine" }],
  });
  await expect.poll(() => matchMedia("(pointer: fine)").matches).toBe(!touch);
}

afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { cdp, page } = await context();
  await page.viewport(1280, 720);
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false });
  await cdp().send("Emulation.setEmulatedMedia", { features: [] });
});

// The faint check shows while the pointer is over the control itself, and
// not while it is elsewhere on a row or column that is a `group`: a TaskBoard
// column is one, so with CheckboxIndicator's own group preview a hover
// anywhere in the column would preview every card's check.
it("desktop: hovering the control previews the check; hovering its group does not", async () => {
  await device(1280, false);
  const { userEvent } = await context();
  render(
    <div className="group flex items-center gap-10 p-10">
      <TaskCompletionControl checked={false} aria-label="#25 Fix onboarding copy" />
      <span data-testid="row">Fix onboarding copy</span>
    </div>,
  );
  const control = screen.getByRole("checkbox");
  const indicator = control.querySelector<HTMLElement>("[data-slot=checkbox-indicator-graphic]")!;
  const alpha = () => {
    const value = getComputedStyle(indicator).color;
    const match = /\/\s*([\d.]+)\s*\)$|rgba\([^)]*,\s*([\d.]+)\)$/.exec(value);
    if (value === "transparent" || value === "rgba(0, 0, 0, 0)") return 0;
    return match ? Number(match[1] ?? match[2]) : 1;
  };

  await userEvent.hover(screen.getByTestId("row"));
  // Hovering the row previews nothing.
  await expect.poll(alpha).toBe(0);

  await userEvent.hover(control);
  // Hovering the control previews the check.
  await expect.poll(alpha).toBeGreaterThan(0);
  expect(alpha()).toBeLessThan(0.5);
  await userEvent.unhover(control);
});

for (const { name, width, touch, size } of DEVICES) {
  it(`${name}: the control is a 20px circle with a ${size} x ${size} hit area`, async () => {
    await device(width, touch);
    render(
      <div className="p-10">
        <TaskCompletionControl checked={false} aria-label="#25 Fix onboarding copy" />
      </div>,
    );
    const el = screen.getByRole("checkbox");
    const r = el.getBoundingClientRect();
    expect(r.width).toBe(20);
    expect(r.height).toBe(20);
    const indicator = el.querySelector("[data-slot=checkbox-indicator-graphic]")!;
    expect(parseFloat(getComputedStyle(indicator).borderTopLeftRadius)).toBeGreaterThanOrEqual(10);

    const [x, y] = [r.left + r.width / 2, r.top + r.height / 2];
    const hits = (dx: number, dy: number) => {
      const target = document.elementFromPoint(x + dx, y + dy);
      return target === el || el.contains(target);
    };
    // Scan across the centre in half pixels; hit-testing snaps to pixels,
    // so the extent can read 1px over.
    const extent = (axis: "x" | "y") => {
      const hit: number[] = [];
      for (let d = -30; d <= 30; d += 0.5) if (axis === "y" ? hits(0, d) : hits(d, 0)) hit.push(d);
      return hit[hit.length - 1]! - hit[0]!;
    };
    for (const [value, label] of [
      [extent("x"), "width"],
      [extent("y"), "height"],
    ] as const) {
      expect(value, label).toBeGreaterThanOrEqual(size);
      expect(value, label).toBeLessThanOrEqual(size + 1);
    }
  });
}
