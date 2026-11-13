/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { Drawer, DrawerBody } from "./drawer";

// The classes that make DrawerBody scroll, by the edge the drawer comes from
// (drawer.md, Anatomy): a sheet's body scrolls natively by its own classes, as
// a side drawer's does, and in a sheet with snap points only at its full
// height. jsdom has no layout, so this file checks the classes only;
// `drawer.sheet-body.browser.test.tsx` and its touch file measure them.

afterEach(cleanup);

const SHEET = "flex flex-1 flex-col items-stretch px-4 pt-2 pb-4 text-left [:where(&)>*]:shrink-0";
const SIDE =
  "flex flex-1 flex-col [:where(&)>*]:shrink-0 items-stretch text-left min-h-0 overflow-y-auto px-(--surface-inset) pt-(--page-top) pb-(--page-inset)";

function classes(props: Parameters<typeof Drawer>[0], className?: string) {
  const { container } = render(
    <Drawer {...props}>
      <DrawerBody className={className}>
        <p>Text</p>
      </DrawerBody>
    </Drawer>,
  );
  const body = container.firstElementChild as HTMLElement;
  expect(body.dataset.slot).toBe("drawer-body");
  return body.className;
}

test.each(["down", "up"] as const)("a %s sheet's body scrolls natively", (swipeDirection) => {
  expect(classes({ swipeDirection })).toBe(`${SHEET} min-h-0 overflow-y-auto`);
});

test("the default drawer is a bottom sheet, with the same body", () => {
  expect(classes({})).toBe(`${SHEET} min-h-0 overflow-y-auto`);
});

test.each(["right", "left"] as const)(
  "a %s drawer's body has the classes it had",
  (swipeDirection) => {
    expect(classes({ swipeDirection })).toBe(SIDE);
    // Snap points are a sheet's: a side drawer's body is the same with them.
    cleanup();
    expect(classes({ swipeDirection, snapPoints: ["20rem", 1] })).toBe(SIDE);
  },
);

test.each(["down", "up"] as const)(
  "a %s sheet with snap points scrolls its body only at its full height",
  (swipeDirection) => {
    expect(classes({ swipeDirection, snapPoints: ["20rem", 1] })).toBe(
      `${SHEET} min-h-0 overflow-y-hidden group-data-expanded/drawer-popup:overflow-y-auto`,
    );
    // An empty list is no snap points.
    cleanup();
    expect(classes({ swipeDirection, snapPoints: [] })).toBe(`${SHEET} min-h-0 overflow-y-auto`);
  },
);

test("a caller's own scrolling classes replace the sheet's, each once", () => {
  expect(classes({}, "min-h-0 overflow-y-auto")).toBe(`${SHEET} min-h-0 overflow-y-auto`);
  expect(classes({}, "gap-4 overflow-y-auto")).toBe(`${SHEET} min-h-0 gap-4 overflow-y-auto`);
});

test("a caller's padding classes replace the sheet's and leave its scrolling", () => {
  expect(classes({}, "p-0")).toBe(
    "flex flex-1 flex-col items-stretch text-left [:where(&)>*]:shrink-0 min-h-0 overflow-y-auto p-0",
  );
  expect(classes({}, "px-0")).toBe(
    "flex flex-1 flex-col items-stretch pt-2 pb-4 text-left [:where(&)>*]:shrink-0 min-h-0 overflow-y-auto px-0",
  );
});

test("a caller can turn a sheet's scrolling off", () => {
  expect(classes({}, "min-h-auto overflow-visible")).toBe(`${SHEET} min-h-auto overflow-visible`);
});
