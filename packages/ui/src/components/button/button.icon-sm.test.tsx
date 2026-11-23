/**
 * @vitest-environment jsdom
 *
 * `icon-sm`, a row's action (Button › Row actions): a 28px square read from
 * `row-action-size`, with no breakpoint of its own, a 16px icon, and a hit
 * area that reaches the 44px touch target past each side, on a touch screen
 * as with a mouse.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { cn } from "../../lib/cn";
import { Button } from "./button";

afterEach(cleanup);

const HIT =
  "after:-inset-[calc((var(--control-height)+2*var(--control-hit-inset)-var(--row-action-size))/2+1.5px)]";

function classesOf(props: Parameters<typeof Button>[0]) {
  render(<Button aria-label="More" {...props} />);
  return screen.getByRole("button", { name: "More" }).className.split(/\s+/);
}

type Resolved = Record<string, Record<string, { $value: Record<string, number> }>>;
const resolved = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../tokens.resolved.json"), "utf8"),
) as Resolved;

describe("Button icon-sm", () => {
  test("is the row-action token's square with a 16px icon", () => {
    const names = classesOf({ variant: "ghost", size: "icon-sm" });
    expect(names).toEqual(
      expect.arrayContaining([
        "size-row-action",
        "rounded-chip",
        "p-0",
        "[&_svg:not([class*='size-'])]:size-4",
        "[--icon-inset:calc((var(--row-action-size)-16px)/2)]",
      ]),
    );
    // The token switches once, in the token layer: no size of the button's own.
    expect(names).not.toContain("size-control-small");
    expect(names.filter((name) => /^(md:)?pointer-[a-z]+:.*size-/.test(name))).toEqual([]);
    expect(names.filter((name) => /^md:.*:size-/.test(name))).toEqual([]);
  });

  test("its hit area overhangs to 44px with no pointer variant, so a touch screen gets it", () => {
    const names = classesOf({ variant: "ghost", size: "icon-sm" });
    expect(names).toContain("after:absolute");
    expect(names).toContain(HIT);
    expect(names.filter((name) => /pointer-(fine|coarse):after:/.test(name))).toEqual([]);
    expect(names).not.toContain("after:-inset-[calc(--spacing(1.5)+1.5px)]");
  });

  test("the overhang makes 44px in every context the tokens resolve", () => {
    for (const context of ["touch", "fine", "desktop"]) {
      const control = resolved.control.height.$value[context];
      const hitInset = resolved.control["hit-inset"].$value[context];
      const size = resolved["row-action"].size.$value[context];
      expect(size, context).toBe(28);
      const overhang = (control + 2 * hitInset - size) / 2 + 1.5;
      // An absolute ::after is placed from the padding box: the 1.5px border twice.
      expect(size - 3 + 2 * overhang, context).toBe(44);
    }
  });

  test("keeps every variant, and a frameless one greys without a box when disabled", () => {
    expect(classesOf({ variant: "default", size: "icon-sm" })).toContain("border-line-strong");
    cleanup();
    const ghost = classesOf({ variant: "ghost", size: "icon-sm", disabled: true });
    expect(ghost).toContain("disabled:bg-transparent");
    expect(ghost).not.toContain("disabled:bg-fill-muted");
  });

  test("marks its icon inset when frameless, like the other icon sizes", () => {
    render(<Button aria-label="More" variant="ghost" size="icon-sm" />);
    expect(screen.getByRole("button", { name: "More" }).hasAttribute("data-icon-inset")).toBe(true);
  });

  test("tailwind-merge knows size-row-action", () => {
    expect(cn("size-row-action", "size-10")).toBe("size-10");
  });
});
