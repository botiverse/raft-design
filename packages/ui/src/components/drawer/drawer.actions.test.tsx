/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Drawer, DrawerActions } from "./drawer";

afterEach(cleanup);

// A bottom (or top) sheet stacks its buttons full width, so its actions carry
// `data-stacked`, which gives a ghost Cancel its frame (Button). A drawer from
// a side keeps them in a row: no `data-stacked`, Cancel stays frameless.
test.each([
  ["down", true],
  ["up", true],
  ["left", false],
  ["right", false],
] as const)("a %s drawer's actions are stacked: %s", (swipeDirection, stacked) => {
  render(
    <Drawer swipeDirection={swipeDirection}>
      <DrawerActions data-testid="actions" />
    </Drawer>,
  );
  expect(screen.getByTestId("actions").hasAttribute("data-stacked")).toBe(stacked);
});
