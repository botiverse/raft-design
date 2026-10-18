/**
 * @vitest-environment jsdom
 *
 * Frameless buttons: a disabled frameless icon button greys its icon and shows
 * no box (DS IconButton), a disabled text button keeps the sunken box (DS
 * Button), and the on-frame variant draws the frame's ink with frame-pressed,
 * sizing the 32px controls up to the 36px frame item.
 */
import { afterEach, describe, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Button } from "./button";

afterEach(cleanup);

const classes = (element: Element) => element.className.split(/\s+/);

function renderButton(props: Parameters<typeof Button>[0]) {
  render(<Button aria-label="Back" {...props} />);
  return classes(screen.getByRole("button", { name: "Back" }));
}

describe("a disabled frameless icon button", () => {
  test.each(["icon-xs", "icon-sm", "icon-md", "icon-lg"] as const)(
    "%s greys its icon with no box, on both disabled paths",
    (size) => {
      const names = renderButton({ variant: "ghost", size, disabled: true });
      expect(names).toEqual(
        expect.arrayContaining([
          "disabled:border-transparent",
          "disabled:bg-transparent",
          "aria-disabled:border-transparent",
          "aria-disabled:bg-transparent",
          "disabled:text-foreground-disabled",
          "aria-disabled:text-foreground-disabled",
        ]),
      );
      expect(names).not.toContain("disabled:bg-fill-muted");
      expect(names).not.toContain("disabled:border-line-hairline");
      expect(names).not.toContain("aria-disabled:bg-fill-muted");
    },
  );

  test("a disabled ghost text button keeps the sunken box", () => {
    const names = renderButton({ variant: "ghost", size: "md", disabled: true });
    expect(names).toContain("disabled:bg-fill-muted");
    expect(names).toContain("disabled:border-line-hairline");
  });

  test("an outline icon button keeps its disabled box", () => {
    const names = renderButton({ variant: "outline", size: "icon-md", disabled: true });
    expect(names).toContain("disabled:bg-fill-muted");
  });
});

describe("on-frame", () => {
  test("the frame's ink, frame-pressed on hover, press and an open popup", () => {
    const names = renderButton({ variant: "on-frame", size: "icon-lg" });
    expect(names).toEqual(
      expect.arrayContaining([
        "bg-transparent",
        "border-transparent",
        "text-foreground-on-frame",
        "hover:bg-fill-frame-pressed",
        "active:bg-fill-frame-pressed",
        "aria-expanded:bg-fill-frame-pressed",
        "data-popup-open:bg-fill-frame-pressed",
      ]),
    );
    expect(names).not.toContain("hover:bg-fill-pressed");
    // The phone frame keeps the 44 icon button.
    expect(names).toContain("size-11");
  });

  test("a 32px icon button is the 36px frame item with a 20px icon", () => {
    const names = renderButton({ variant: "on-frame", size: "icon-md" });
    expect(names).toContain("size-9");
    expect(names).not.toContain("size-8");
    expect(names).toContain("[&_svg:not([class*='size-'])]:size-5");
    expect(names).not.toContain("[&_svg:not([class*='size-'])]:size-[18px]");
    expect(names).toContain("after:-inset-1");
  });

  test("a text button is the top bar's 36px item: 15/20 700, 10px each side", () => {
    const names = renderButton({ variant: "on-frame", size: "md" });
    expect(names).toEqual(expect.arrayContaining(["h-9", "px-2.5", "text-subhead", "font-bold"]));
    expect(names).not.toContain("h-8");
    expect(names).not.toContain("px-3");
    expect(names).not.toContain("text-footnote");
  });

  test("disabled, text or icon, it only greys", () => {
    for (const size of ["md", "icon-md"] as const) {
      const names = renderButton({ variant: "on-frame", size, disabled: true });
      expect(names).toContain("disabled:bg-transparent");
      expect(names).toContain("disabled:text-foreground-disabled");
      expect(names).not.toContain("disabled:bg-fill-muted");
      cleanup();
    }
  });
});
