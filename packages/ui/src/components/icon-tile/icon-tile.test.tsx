/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { IconTile } from "./icon-tile";

afterEach(cleanup);

const classes = (element: Element) => element.className.split(/\s+/);

test("a neutral 35px square with an 18px ink-2 icon by default", () => {
  render(
    <IconTile data-testid="tile">
      <svg />
    </IconTile>,
  );
  const tile = screen.getByTestId("tile");
  expect(tile.tagName).toBe("SPAN");
  expect(tile.getAttribute("data-slot")).toBe("icon-tile");
  expect(tile.getAttribute("data-size")).toBe("md");
  expect(classes(tile)).toEqual(
    expect.arrayContaining([
      "size-[35px]",
      "rounded-sticker",
      "bg-fill-muted",
      "text-foreground-muted",
      "[&_svg:not([class*='size-'])]:size-[18px]",
    ]),
  );
});

test("sizes follow the avatar ladder, each with its own icon size", () => {
  const expected = {
    xs: ["size-[19px]", "[&_svg:not([class*='size-'])]:size-[11px]"],
    sm: ["size-[27px]", "[&_svg:not([class*='size-'])]:size-3.5"],
    md: ["size-[35px]", "[&_svg:not([class*='size-'])]:size-[18px]"],
    lg: ["size-[51px]", "[&_svg:not([class*='size-'])]:size-[22px]"],
  } as const;
  for (const [size, names] of Object.entries(expected)) {
    render(<IconTile data-testid={size} size={size as keyof typeof expected} />);
    const tile = screen.getByTestId(size);
    expect(tile.getAttribute("data-size")).toBe(size);
    expect(classes(tile)).toEqual(expect.arrayContaining([...names]));
  }
});

test("system notices take the soft orange or cyan with an ink icon", () => {
  render(
    <>
      <IconTile data-testid="warning" variant="warning" />
      <IconTile data-testid="information" variant="information" />
    </>,
  );
  expect(classes(screen.getByTestId("warning"))).toEqual(
    expect.arrayContaining(["bg-warning-soft", "text-foreground"]),
  );
  expect(classes(screen.getByTestId("information"))).toEqual(
    expect.arrayContaining(["bg-info-soft", "text-foreground"]),
  );
  expect(classes(screen.getByTestId("warning"))).not.toContain("bg-fill-muted");
});

test("a labelled tile keeps the caller's role and label", () => {
  render(<IconTile role="img" aria-label="Private channel" />);
  expect(screen.getByRole("img", { name: "Private channel" })).toBeTruthy();
});

test("decorative by default: hidden from assistive tech until it has a role", () => {
  render(
    <>
      <IconTile data-testid="decorative" />
      <IconTile data-testid="labelled" role="img" aria-label="Archived channel" />
    </>,
  );
  expect(screen.getByTestId("decorative").getAttribute("aria-hidden")).toBe("true");
  expect(screen.getByTestId("labelled").hasAttribute("aria-hidden")).toBe(false);
});
