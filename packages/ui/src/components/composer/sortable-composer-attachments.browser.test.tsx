import "../drag/drag.test.css";
import { cleanup, render, screen } from "@testing-library/react";
import type { CSSProperties } from "react";
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

const FILES: Record<string, string> = {
  "att-1f2": "roadmap.png",
  "att-8d4": "notes.pdf",
  "att-5c9": "budget.xlsx",
};
const FILE_IDS = Object.keys(FILES);

function renderFiles({
  wrapperStyle,
  container,
}: { wrapperStyle?: CSSProperties; container?: Element | null } = {}) {
  render(
    <div data-testid="wrapper" style={{ width: 400, ...wrapperStyle }}>
      <SortableComposerAttachments items={FILE_IDS} onReorder={vi.fn()} container={container}>
        {FILE_IDS.map((id) => (
          <SortableComposerAttachment key={id} id={id} label={FILES[id]!}>
            <div data-testid={`tile-${id}`} style={TILE}>
              {FILES[id]}
            </div>
          </SortableComposerAttachment>
        ))}
      </SortableComposerAttachments>
    </div>,
  );
  const first = screen.getAllByTestId(`tile-${FILE_IDS[0]}`)[0]!.getBoundingClientRect();
  const last = screen.getAllByTestId(`tile-${FILE_IDS[2]}`)[0]!.getBoundingClientRect();
  return { x: first.left + 32, y: first.top + 32, first, last };
}

// A drawer's popup (translate3d and scale) or a dialog (-translate-1/2) makes
// itself the containing block of anything `position: fixed` inside it.
const TRANSFORMED: CSSProperties = { transform: "translate3d(40px, 30px, 0) scale(0.98)" };

it("the lifted copy renders in document.body, where a transformed ancestor can't offset it", async () => {
  const { x, y, first } = renderFiles({ wrapperStyle: TRANSFORMED });
  await mouse("mousePressed", x, y);
  await mouse("mouseMoved", x + 8, y);
  await wait(50);
  await mouse("mouseMoved", x + 8, y + 20);
  await wait(50);
  const lift = document.querySelector<HTMLElement>("[data-slot=drag-lift]")!;
  expect(screen.getByTestId("wrapper").contains(lift)).toBe(false);
  expect(lift.closest("[data-slot=drag-lift-portal]")?.parentElement).toBe(document.body);
  // 1:1 with the hand from where it was grabbed, not shifted by the transform.
  expect(lift.getBoundingClientRect().left - first.left).toBeCloseTo(8, 0);
  expect(lift.getBoundingClientRect().top - first.top).toBeCloseTo(20, 0);
  await mouse("mouseReleased", x + 8, y + 20);
  await wait(250);
});

it("container renders the copy there", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  try {
    const { x, y } = renderFiles({ container: host });
    await mouse("mousePressed", x, y);
    await mouse("mouseMoved", x + 8, y);
    await wait(50);
    expect(host.querySelector("[data-slot=drag-lift]")).not.toBeNull();
    await mouse("mouseReleased", x + 8, y);
    await wait(250);
  } finally {
    host.remove();
  }
});

it("every step is announced by the attachment's label and position, never its id", async () => {
  const { x, y, last } = renderFiles();
  const region = document.querySelector("[role=status][aria-live]")!;
  const said: string[] = [];
  const observer = new MutationObserver(() => {
    if (region.textContent) said.push(region.textContent);
  });
  observer.observe(region, { childList: true, characterData: true, subtree: true });
  await mouse("mousePressed", x, y);
  await mouse("mouseMoved", x + 8, y);
  await wait(50);
  for (let step = 1; step <= 6; step++) {
    await mouse("mouseMoved", x + ((last.left + 40 - x) * step) / 6, y);
    await wait(16);
  }
  await wait(80);
  await mouse("mouseReleased", last.left + 40, y);
  await wait(250);
  observer.disconnect();
  for (const line of said) expect(line).not.toMatch(/att-\w{3}/);
  expect(said[0]).toBe("Picked up roadmap.png. Over position 1 of 3.");
  expect(said.at(-1)).toBe("Dropped roadmap.png in position 3 of 3.");
});
