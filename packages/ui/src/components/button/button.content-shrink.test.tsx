/**
 * @vitest-environment jsdom
 *
 * A Button's content span may shrink to the Button's content box, so a
 * constrained Button (`min-w-0 max-w-full`) truncates a `truncate` label
 * instead of spilling past its border. The layout itself is measured in
 * button.constrained.browser.test.tsx.
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Button } from "./button";

afterEach(cleanup);

test.each([
  { size: "md" },
  { size: "lg" },
  { size: "xl" },
  { size: "icon-md" },
  { size: "icon-lg" },
] as const)("the $size content span can shrink to the Button", ({ size }) => {
  render(<Button size={size}>Open</Button>);
  const content = screen.getByRole("button").querySelector("[data-slot=button-content]");
  expect(content?.className.split(/\s+/)).toEqual(
    expect.arrayContaining(["min-w-0", "max-w-full"]),
  );
});
