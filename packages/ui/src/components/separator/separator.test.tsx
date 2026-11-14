/**
 * @vitest-environment jsdom
 *
 * A vertical separator takes its row's height by default, and a caller that makes it shorter can
 * centre it: the caller's `self-*` and `h-*` replace the separator's own (they are plain classes, not
 * `data-[orientation=…]:` variants, which would outrank the caller's).
 */
import { afterEach, describe, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Separator } from "./separator";

afterEach(cleanup);

const classes = (props: Parameters<typeof Separator>[0]) => {
  render(<Separator {...props} />);
  return screen.getByRole("separator").className.split(/\s+/);
};

describe("Separator", () => {
  test("horizontal: a full-width 1px line", () => {
    const names = classes({});
    expect(names).toEqual(expect.arrayContaining(["h-px", "w-full", "bg-line-hairline"]));
    expect(names).not.toContain("self-stretch");
  });

  test("vertical: a 1px line as tall as its row", () => {
    const names = classes({ orientation: "vertical" });
    expect(names).toEqual(expect.arrayContaining(["w-px", "self-stretch"]));
    expect(names).not.toContain("w-full");
  });

  test("vertical with its own height: the caller's self-center replaces self-stretch", () => {
    const names = classes({ orientation: "vertical", className: "h-5 self-center" });
    expect(names).toEqual(expect.arrayContaining(["w-px", "h-5", "self-center"]));
    expect(names).not.toContain("self-stretch");
    // No variant left that would outrank the caller's class.
    expect(names.some((name) => name.startsWith("data-[orientation"))).toBe(false);
  });
});
