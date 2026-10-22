// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";
import { ListRowSkeleton } from "./list-row-skeleton";

afterEach(cleanup);

test("the skeleton row is a hidden, display-only ListRow of the same variant", () => {
  render(<ListRowSkeleton data-testid="row" />);
  const row = screen.getByTestId("row");
  expect(row.tagName).toBe("DIV");
  expect(row.getAttribute("data-slot")).toBe("list-row");
  expect(row.getAttribute("data-variant")).toBe("default");
  expect(row.getAttribute("aria-hidden")).toBe("true");
  // A default row: a 35px leading block, the title and the time, the description.
  expect(row.firstElementChild?.className).toContain("size-[35px]");
  for (const slot of ["list-row-title", "list-row-meta", "list-row-description"]) {
    expect(row.querySelector(`[data-slot=${slot}] [data-slot=skeleton]`)).not.toBeNull();
  }
});

test("a plain row has no leading block or description unless asked", () => {
  const { rerender } = render(<ListRowSkeleton data-testid="row" variant="plain" />);
  let row = screen.getByTestId("row");
  expect(row.getAttribute("data-variant")).toBe("plain");
  expect(row.querySelector("[data-slot=list-row-description]")).toBeNull();
  expect(row.querySelector("[data-slot=list-row-meta]")).toBeNull();
  expect(row.firstElementChild?.getAttribute("data-slot")).toBe("list-row-body");

  rerender(<ListRowSkeleton data-testid="row" variant="plain" leading description />);
  row = screen.getByTestId("row");
  expect(row.firstElementChild?.className).toContain("size-5");
  expect(row.querySelector("[data-slot=list-row-description]")).not.toBeNull();
});
