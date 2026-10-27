import "./avatar.test.css";
/**
 * AvatarGroupButton hovers as one control (avatar.md, "A stack that opens a
 * list"): the button lays fill-medium, and the ring between faces, painted
 * with the stack's surface, takes the same fill over it, so no face keeps a
 * ring of the resting surface inside the hover. Real paint: only a browser
 * computes the hovered box-shadow layers.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/avatar/avatar.group-button.browser.test.tsx`
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Avatar, AvatarGroupButton, AvatarGroupCount } from "./avatar";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

/** Paints the colours in order (bottom first) over white and over black; returns both pixels. */
function composite(colors: readonly string[]): number[] {
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("no 2d context");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = "#000";
  ctx.fillRect(1, 0, 1, 1);
  for (const color of colors) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 2, 1);
  }
  const data = ctx.getImageData(0, 0, 2, 1).data;
  return [data[0]!, data[1]!, data[2]!, data[4]!, data[5]!, data[6]!];
}

function expectSamePaint(actual: readonly string[], expected: readonly string[]) {
  const a = composite(actual);
  const e = composite(expected);
  expect(
    a.some((v, i) => Math.abs(v - e[i]!) > 2),
    `${actual.join(" + ")} should paint like ${expected.join(" + ")} (${JSON.stringify(a)} vs ${JSON.stringify(e)})`,
  ).toBe(false);
}

/** A computed box-shadow's layers as [colour, spread], top layer first. */
function shadowLayers(boxShadow: string): Array<[string, string]> {
  const layers: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < boxShadow.length; i += 1) {
    const ch = boxShadow[i];
    if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;
    else if (ch === "," && depth === 0) {
      layers.push(boxShadow.slice(start, i).trim());
      start = i + 1;
    }
  }
  layers.push(boxShadow.slice(start).trim());
  return layers.map((layer) => {
    const close = layer.indexOf(")");
    const color = layer.slice(0, close + 1);
    const lengths = layer
      .slice(close + 1)
      .trim()
      .split(/\s+/);
    return [color, lengths[3] ?? "0px"];
  });
}

/** The colours under the ring between faces (3px spread), bottom first. */
function ringPaint(avatar: HTMLElement): string[] {
  return shadowLayers(getComputedStyle(avatar).boxShadow)
    .filter(([, spread]) => spread === "3px")
    .map(([color]) => color)
    .reverse();
}

/** Ends the hover transitions (the fill and the rings), so the computed paint is the hovered one. */
function settle(el: HTMLElement) {
  for (const animation of el.getAnimations({ subtree: true })) animation.finish();
}

function Stack() {
  return (
    <ThemeProvider>
      <div
        data-testid="card"
        className="bg-layer-card p-4 [--avatar-group-surface:var(--layer-card)]"
      >
        <AvatarGroupButton aria-label="2 viewing, 1 more" data-testid="stack">
          <Avatar size="xs" type="agent" data-testid="face" />
          <Avatar size="xs" type="agent" />
          <AvatarGroupCount size="xs" data-testid="count">
            +1
          </AvatarGroupCount>
        </AvatarGroupButton>
      </div>
    </ThemeProvider>
  );
}

it("at rest, the ring is the stack's surface and the button has no fill", async () => {
  render(<Stack />);
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.unhover(document.body);
  settle(screen.getByTestId("stack"));
  const card = getComputedStyle(screen.getByTestId("card")).backgroundColor;
  expectSamePaint(ringPaint(screen.getByTestId("face")), [card]);
  expectSamePaint([card, getComputedStyle(screen.getByTestId("stack")).backgroundColor], [card]);
});

it("hovered, the ring between faces paints like the button's hover fill", async () => {
  render(<Stack />);
  const { page } = await import("vite-plus/test/browser/context");
  await page.getByTestId("stack").hover();
  settle(screen.getByTestId("stack"));
  const card = getComputedStyle(screen.getByTestId("card")).backgroundColor;
  const fill = getComputedStyle(screen.getByTestId("stack")).backgroundColor;
  // The button does hover (fill-medium, not transparent).
  expect(composite([card, fill])).not.toEqual(composite([card]));
  const around = [card, fill];
  expectSamePaint(ringPaint(screen.getByTestId("face")), around);
  expectSamePaint(ringPaint(screen.getByTestId("count")), around);
});

it("the faces sit 4px inside the button's fill", () => {
  render(<Stack />);
  const button = screen.getByTestId("stack").getBoundingClientRect();
  const face = screen.getByTestId("face").getBoundingClientRect();
  expect(face.left - button.left).toBeCloseTo(4, 0);
  expect(face.top - button.top).toBeCloseTo(4, 0);
});
