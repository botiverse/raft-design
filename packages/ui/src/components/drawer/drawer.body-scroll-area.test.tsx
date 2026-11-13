/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { Drawer, DrawerBody } from "./drawer";

// DrawerBody's `unstable_scrollArea` (drawer.md, "Scrolling in a ScrollArea"):
// off, and in a bottom or top sheet whatever the prop says, the body is the
// one element it has always been; on, in a drawer from a side, a frame holds
// the body and the scrollbars. jsdom has no layout, so this file checks the
// markup only; `drawer.body-scroll-area.browser.test.tsx` measures it.

afterEach(cleanup);

// A side drawer's classes are those of 0.97.0, before the prop existed, plus the rule that keeps
// its children's height (`drawer.body-rows.browser.test.tsx`). A sheet's are those plus
// its own scrolling (`drawer.sheet-body.test.tsx`).
const SIDE =
  "flex flex-1 flex-col [:where(&)>*]:shrink-0 items-stretch text-left min-h-0 overflow-y-auto px-(--surface-inset) pt-(--page-top) pb-(--page-inset)";
const SHEET =
  "flex flex-1 flex-col items-stretch px-4 pt-2 pb-4 text-left [:where(&)>*]:shrink-0 min-h-0 overflow-y-auto";

/** A class list as `outerHTML` writes it: `&` and `>` in a variant are escaped. */
const html = (classes: string) => classes.replaceAll("&", "&amp;").replaceAll(">", "&gt;");

const AXES = [
  ["right", SIDE],
  ["left", SIDE],
  ["down", SHEET],
  ["up", SHEET],
] as const;

test.each(AXES)(
  "without the prop a %s drawer's body is the same element with the same classes",
  (swipeDirection, classes) => {
    const { container } = render(
      <Drawer swipeDirection={swipeDirection}>
        <DrawerBody id="plain">
          <p>Text</p>
        </DrawerBody>
      </Drawer>,
    );
    expect(container.innerHTML).toBe(
      `<div data-slot="drawer-body" class="${html(classes)}" id="plain"><p>Text</p></div>`,
    );
  },
);

test.each(AXES)(
  "without the prop a className, a render and a wrapperClassName change nothing else in a %s drawer",
  (swipeDirection, classes) => {
    const { container } = render(
      <Drawer swipeDirection={swipeDirection}>
        <DrawerBody className="gap-4" render={<section />}>
          <p>Text</p>
        </DrawerBody>
        <DrawerBody
          className="gap-4"
          render={<section />}
          unstable_scrollArea={false}
          wrapperClassName="max-h-80"
        >
          <p>Text</p>
        </DrawerBody>
      </Drawer>,
    );
    const [plain, off] = Array.from(container.children);
    expect(plain?.outerHTML).toBe(
      `<section data-slot="drawer-body" class="${html(classes)} gap-4"><p>Text</p></section>`,
    );
    expect(off?.outerHTML).toBe(plain?.outerHTML);
  },
);

test.each([
  ["down", SHEET],
  ["up", SHEET],
] as const)("a %s sheet ignores the prop", (swipeDirection, classes) => {
  const ref = createRef<HTMLDivElement>();
  const { container } = render(
    <Drawer swipeDirection={swipeDirection}>
      <DrawerBody unstable_scrollArea ref={ref} className="gap-4" wrapperClassName="max-h-80">
        <p>Text</p>
      </DrawerBody>
    </Drawer>,
  );
  expect(container.innerHTML).toBe(
    `<div data-slot="drawer-body" class="${html(classes)} gap-4"><p>Text</p></div>`,
  );
  expect(ref.current).toBe(container.firstElementChild);
});

test.each(["right", "left"] as const)(
  "with the prop a %s drawer's frame holds the body and the scrollbars after it",
  (swipeDirection) => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Drawer swipeDirection={swipeDirection}>
        <DrawerBody
          unstable_scrollArea
          ref={ref}
          id="form"
          aria-label="Fields"
          data-testid="body"
          className="gap-4"
          wrapperClassName="max-h-80"
        >
          <p>First</p>
          <p>Second</p>
        </DrawerBody>
      </Drawer>,
    );
    const frame = container.firstElementChild as HTMLElement;
    const body = screen.getByTestId("body");

    expect(container.children).toHaveLength(1);
    expect(frame.dataset.slot).toBe("drawer-body-frame");
    expect(frame.classList.contains("r-scroll-area--absolute-gutters")).toBe(true);
    // Both ways, as DialogBody: something wider than the body is scrolled to, not cut off.
    expect(frame.classList.contains("r-scroll-area--both-orientation")).toBe(true);
    // The frame is the drawer's flex child and takes the sizing classes.
    for (const name of ["min-h-0", "flex-1", "max-h-80"]) {
      expect(frame.classList.contains(name), name).toBe(true);
    }
    expect(frame.classList.contains("gap-4")).toBe(false);

    // The body: the slot, the caller's className, ref and native props.
    expect(Array.from(frame.children).map((child) => (child as HTMLElement).dataset.slot)).toEqual([
      "drawer-body",
      "scroll-area-gutters",
    ]);
    expect(body.parentElement).toBe(frame);
    expect(body.tagName).toBe("DIV");
    expect(ref.current).toBe(body);
    expect(body.id).toBe("form");
    expect(body.getAttribute("aria-label")).toBe("Fields");
    expect(body.hasAttribute("wrapperclassname")).toBe(false);
    // The side drawer's own classes but the native overflow, which the ScrollArea gives.
    expect(new Set(body.className.split(" "))).toEqual(
      new Set([
        ...SIDE.split(" ").filter((name) => name !== "overflow-y-auto"),
        "r-scroll-area__container",
        "gap-4",
      ]),
    );
    expect(body.classList.contains("max-h-80")).toBe(false);

    // Nothing but the caller's children is inside the body.
    expect(Array.from(body.children).map((child) => child.textContent)).toEqual([
      "First",
      "Second",
    ]);
  },
);

test("with the prop `render` replaces the body, inside the frame, with every ref set", () => {
  const ref = createRef<HTMLDivElement>();
  const own = createRef<HTMLFormElement>();
  const { container } = render(
    <Drawer swipeDirection="right">
      <DrawerBody
        unstable_scrollArea
        ref={ref}
        className="gap-4"
        render={<form ref={own} className="caller" aria-label="Profile" />}
      >
        <p>Text</p>
      </DrawerBody>
    </Drawer>,
  );
  const frame = container.firstElementChild as HTMLElement;
  const body = frame.firstElementChild as HTMLElement;
  expect(frame.tagName).toBe("DIV");
  expect(frame.dataset.slot).toBe("drawer-body-frame");
  expect(body.tagName).toBe("FORM");
  expect(body.dataset.slot).toBe("drawer-body");
  expect(body.getAttribute("aria-label")).toBe("Profile");
  for (const name of ["r-scroll-area__container", "gap-4", "caller", "flex-col"]) {
    expect(body.classList.contains(name), name).toBe(true);
  }
  expect(ref.current).toBe(body);
  expect(own.current).toBe(body);
  expect(body.nextElementSibling?.getAttribute("data-slot")).toBe("scroll-area-gutters");
});

test("with the prop a body that holds a control is no tab stop, and the caller's tabIndex wins", () => {
  render(
    <Drawer swipeDirection="right">
      <DrawerBody unstable_scrollArea data-testid="form">
        <input aria-label="Name" />
      </DrawerBody>
      <DrawerBody unstable_scrollArea data-testid="disabled">
        <button type="button" disabled>
          Save
        </button>
      </DrawerBody>
      <DrawerBody unstable_scrollArea data-testid="text" tabIndex={0}>
        <input aria-label="Other" />
      </DrawerBody>
    </Drawer>,
  );
  expect(screen.getByTestId("form").getAttribute("tabindex")).toBe("-1");
  // jsdom has no layout, so nothing overflows: a body with nothing to focus has no tabindex.
  expect(screen.getByTestId("disabled").hasAttribute("tabindex")).toBe(false);
  expect(screen.getByTestId("text").getAttribute("tabindex")).toBe("0");
});
