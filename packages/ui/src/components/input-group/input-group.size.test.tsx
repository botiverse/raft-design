/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { InputGroup, InputGroupInput } from "./input-group";

afterEach(cleanup);

function classesOf(size?: "md" | "lg") {
  render(
    <InputGroup size={size} data-testid="group">
      <InputGroupInput aria-label="Search" />
    </InputGroup>,
  );
  const group = screen.getByTestId("group");
  return { size: group.dataset.size, classes: group.className.split(/\s+/) };
}

// A field on its own is the control height; `md` is a field in a toolbar or a
// filter row, as high as the row's buttons (xxchan, 2026-11-06).
test("a field defaults to the control height", () => {
  const { size, classes } = classesOf();
  expect(size).toBe("lg");
  expect(classes).toContain("h-control");
  expect(classes).toContain("overflow-hidden");
  expect(classes).not.toContain("h-8");
});

test("`md` takes the row's button height, the control height with a mouse", () => {
  const { size, classes } = classesOf("md");
  expect(size).toBe("md");
  expect(classes).toContain("h-8");
  expect(classes).toContain("md:pointer-fine:h-control");
  expect(classes).not.toContain("h-control");
  // It stops clipping, so its input can reach a 44px tap past the box.
  expect(classes).toContain("overflow-visible");
  expect(classes).not.toContain("overflow-hidden");
});
