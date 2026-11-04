import "./avatar.test.css";
/**
 * Avatar stacks (avatar.md, "Stacks"): faces lie directly on one another,
 * 5px over the one before, with no ring of the surface between them (stdrc,
 * 2026-11-04, #proj-raft-ui:7531279d). A face in a stack paints exactly as
 * it does alone, at rest and inside a hovered AvatarGroupButton. Real
 * paint and layout: only a browser computes them.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/avatar/avatar.group-button.browser.test.tsx`
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Avatar, AvatarGroup, AvatarGroupButton, AvatarGroupCount } from "./avatar";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

/** Ends the hover transitions, so the computed paint is the hovered one. */
function settle(el: HTMLElement) {
  for (const animation of el.getAnimations({ subtree: true })) animation.finish();
}

const shadow = (id: string) => getComputedStyle(screen.getByTestId(id)).boxShadow;

/** The box-shadow layers that paint anything: a spread above 0. */
const paintedLayers = (id: string) =>
  shadow(id)
    .split(/,(?![^(]*\))/)
    .filter((layer) => !/\s0px\s*$/.test(layer.trim()) && layer.trim() !== "none");

function Stacks() {
  return (
    <ThemeProvider>
      <div data-testid="card" className="flex gap-4 bg-layer-card p-4">
        <Avatar size="xs" type="agent" data-testid="alone" />
        <AvatarGroup data-testid="group">
          <Avatar size="xs" type="agent" data-testid="group-first" />
          <Avatar size="xs" type="human" data-testid="group-second" />
          <AvatarGroupCount size="xs" data-testid="group-count">
            +1
          </AvatarGroupCount>
        </AvatarGroup>
        <AvatarGroupButton aria-label="2 viewing, 1 more" data-testid="stack">
          <Avatar size="xs" type="agent" data-testid="face" />
          <Avatar size="xs" type="agent" data-testid="face-second" />
          <AvatarGroupCount size="xs" data-testid="count">
            +1
          </AvatarGroupCount>
        </AvatarGroupButton>
      </div>
    </ThemeProvider>
  );
}

it("a face in a stack paints as it does alone: no ring of the surface", () => {
  render(<Stacks />);
  const alone = shadow("alone");
  for (const id of ["group-first", "group-second", "face", "face-second"]) {
    expect(shadow(id), id).toBe(alone);
  }
  // The count chip has no edge and no ring.
  expect(paintedLayers("group-count")).toEqual([]);
  expect(paintedLayers("count")).toEqual([]);
});

it("hovered, the faces keep their own paint and only the button fills", async () => {
  render(<Stacks />);
  const { page } = await import("vite-plus/test/browser/context");
  await page.getByTestId("stack").hover();
  settle(screen.getByTestId("stack"));
  expect(getComputedStyle(screen.getByTestId("stack")).backgroundColor).not.toBe(
    "rgba(0, 0, 0, 0)",
  );
  expect(shadow("face")).toBe(shadow("alone"));
  expect(paintedLayers("count")).toEqual([]);
});

it("each face lies 5px over the one before, and the chip too", () => {
  render(<Stacks />);
  for (const [a, b] of [
    ["group-first", "group-second"],
    ["group-second", "group-count"],
    ["face", "face-second"],
    ["face-second", "count"],
  ] as const) {
    const left = screen.getByTestId(a).getBoundingClientRect();
    const right = screen.getByTestId(b).getBoundingClientRect();
    expect(left.right - right.left, `${a} → ${b}`).toBeCloseTo(5, 1);
  }
});

it("the faces sit 4px inside the button's fill", () => {
  render(<Stacks />);
  const button = screen.getByTestId("stack").getBoundingClientRect();
  const face = screen.getByTestId("face").getBoundingClientRect();
  expect(face.left - button.left).toBeCloseTo(4, 0);
  expect(face.top - button.top).toBeCloseTo(4, 0);
});
