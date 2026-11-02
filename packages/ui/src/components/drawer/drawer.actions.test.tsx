/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Drawer, DrawerActions, DrawerContent, DrawerHeader, DrawerTitle } from "./drawer";

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

const SNAP_POINTS = ["8rem", "24rem"];

// Every bottom sheet draws the grab handle, not only one with snap points
// (Rules: "Give every bottom sheet a grab handle"); before 2026-11-02 a
// content-sized sheet had none. It stays hidden from assistive technology, and
// a drawer from the right, without snap points, has none.
test.each([
  ["down", undefined, true],
  ["down", SNAP_POINTS, true],
  ["right", undefined, false],
] as const)(
  "a %s drawer with snap points %j draws the grab handle: %s",
  (swipeDirection, snapPoints, shown) => {
    render(
      <Drawer open swipeDirection={swipeDirection} snapPoints={snapPoints}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Sheet</DrawerTitle>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>,
    );
    const handle = document.querySelector('[data-slot="drawer-swipe-handle"]');
    expect(handle !== null).toBe(shown);
    if (handle) expect(handle.getAttribute("aria-hidden")).toBe("true");
  },
);
