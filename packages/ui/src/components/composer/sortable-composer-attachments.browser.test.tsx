import "../drag/drag.test.css";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { SortableComposerAttachment, SortableComposerAttachments } from "./index";

// Composer attachments follow the one drag model (design/patterns/drag-and-drop.md),
// with a real mouse through CDP: the lifted copy has the lift look and is not
// held to the row, the attachment it came from stays at 40% while home, its
// slot becomes the dashed place once it moves, and a drop reorders.

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

async function cdp() {
  const { cdp } = await import("vite-plus/test/browser/context");
  return cdp();
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const TILE = { width: 64, height: 64 };
const IDS = ["a", "b", "c"];

async function mouse(type: "mousePressed" | "mouseMoved" | "mouseReleased", x: number, y: number) {
  await (
    await cdp()
  ).send("Input.dispatchMouseEvent", {
    type,
    x,
    y,
    button: "left",
    buttons: type === "mouseReleased" ? 0 : 1,
    clickCount: 1,
    pointerType: "mouse",
  });
}

it("lifts a copy, keeps the original at 40% while home, opens the dashed place, and reorders on drop", async () => {
  const onReorder = vi.fn();
  render(
    <div style={{ width: 400 }}>
      <SortableComposerAttachments items={IDS} onReorder={onReorder}>
        {IDS.map((id) => (
          <SortableComposerAttachment key={id} id={id} label={`file-${id}.png`}>
            <div data-testid={`tile-${id}`} style={TILE}>
              {id}
            </div>
          </SortableComposerAttachment>
        ))}
      </SortableComposerAttachments>
    </div>,
  );
  // The attachment's own slot in the row (the lifted copy holds a second tile).
  const tile = (id: string) =>
    screen
      .getAllByTestId(`tile-${id}`)
      .map((node) => node.closest<HTMLElement>("[data-slot=sortable-composer-attachment]"))
      .find((node) => node != null)!;
  const a = tile("a").getBoundingClientRect();
  const c = tile("c").getBoundingClientRect();
  const x = a.left + 32;
  const y = a.top + 32;

  await mouse("mousePressed", x, y);
  await mouse("mouseMoved", x + 8, y);
  await wait(50);
  expect(getComputedStyle(tile("a")).opacity).toBe("0.4");
  const lift = document.querySelector<HTMLElement>("[data-slot=drag-lift]")!;
  expect(getComputedStyle(lift).boxShadow).toContain("0px 0px 0px 1px");

  // Off the row and over the last tile: not held to the row's axis.
  for (let step = 1; step <= 6; step++) {
    await mouse("mouseMoved", x + ((c.left + 40 - x) * step) / 6, y + 30 * (step / 6));
    await wait(16);
  }
  await wait(80);
  expect(lift.getBoundingClientRect().top).toBeGreaterThan(a.top + 20);
  expect(tile("a").querySelector("[data-slot=drop-placeholder]")).not.toBeNull();

  await mouse("mouseReleased", c.left + 40, y + 30);
  await wait(250);
  expect(onReorder).toHaveBeenLastCalledWith(["b", "c", "a"]);
});
