import "./avatar.test.css";
/**
 * Avatar stacks (avatar.md, "Stacks"): faces lie directly on one another,
 * 5px over the one before at every size, past the corner so the seam sits on
 * the straight edge, with no ring of the surface between them, and the +N
 * chip has the faces' edge (stdrc, 2026-11-04,
 * #proj-raft-ui:7531279d). A face in a stack paints exactly as
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
        <AvatarGroup data-testid="mini">
          <Avatar size="3xs" type="agent" data-testid="mini-first" />
          <Avatar size="3xs" type="agent" data-testid="mini-second" />
          <AvatarGroupCount size="3xs" data-testid="mini-count">
            2
          </AvatarGroupCount>
        </AvatarGroup>
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
  // The count chip has the faces' edge (die-cut shadow and ink border), and no ring.
  const face = getComputedStyle(screen.getByTestId("group-first"));
  for (const id of ["group-count", "count"]) {
    expect(shadow(id), id).toBe(alone);
    const chip = getComputedStyle(screen.getByTestId(id));
    expect(chip.borderLeftColor, id).toBe(face.borderLeftColor);
    expect(chip.borderLeftWidth, id).toBe(face.borderLeftWidth);
  }
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
  expect(shadow("count")).toBe(shadow("alone"));
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

it("at 3xs (14px) too, each face and the chip lie 5px over the one before", () => {
  render(<Stacks />);
  for (const [a, b] of [
    ["mini-first", "mini-second"],
    ["mini-second", "mini-count"],
  ] as const) {
    const left = screen.getByTestId(a).getBoundingClientRect();
    const right = screen.getByTestId(b).getBoundingClientRect();
    expect(left.width, a).toBeCloseTo(14, 1);
    expect(left.right - right.left, `${a} → ${b}`).toBeCloseTo(5, 1);
  }
});

it("the overlap clears the corner, so the seam sits on the straight edge", () => {
  render(<Stacks />);
  for (const [a, b] of [
    ["group-first", "group-second"],
    ["mini-first", "mini-second"],
  ] as const) {
    const overlap =
      screen.getByTestId(a).getBoundingClientRect().right -
      screen.getByTestId(b).getBoundingClientRect().left;
    const radius = Number.parseFloat(getComputedStyle(screen.getByTestId(b)).borderTopLeftRadius);
    expect(radius, b).toBeGreaterThan(0);
    expect(overlap, `${a} → ${b}`).toBeGreaterThan(radius);
  }
});
