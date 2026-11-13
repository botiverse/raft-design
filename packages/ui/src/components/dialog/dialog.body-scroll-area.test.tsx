/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { DialogBody } from "./dialog";

// DialogBody's `unstable_scrollArea` (dialog.md, "Scrolling in a ScrollArea"):
// off, the body is the one element it has always been; on, a frame holds the
// body and the scrollbars. jsdom has no layout, so this file checks the
// markup only; `dialog.body-scroll-area.browser.test.tsx` measures it.

afterEach(cleanup);

const BODY =
  "min-w-0 flex-1 overflow-y-auto px-(--surface-inset) pt-1.5 pb-(--surface-inset) first:pt-(--surface-inset) font-sans text-subhead text-foreground-muted";

test("without the prop the body is the same element with the same classes", () => {
  const { container } = render(
    <DialogBody id="plain">
      <p>Text</p>
    </DialogBody>,
  );
  expect(container.innerHTML).toBe(
    `<div data-slot="dialog-body" class="${BODY}" id="plain"><p>Text</p></div>`,
  );
});

test("without the prop a className and a wrapperClassName change nothing else", () => {
  const { container } = render(
    <>
      <DialogBody className="grid gap-4">
        <p>Text</p>
      </DialogBody>
      <DialogBody className="grid gap-4" unstable_scrollArea={false} wrapperClassName="max-h-80">
        <p>Text</p>
      </DialogBody>
    </>,
  );
  const [plain, off] = Array.from(container.children);
  expect(plain?.outerHTML).toBe(
    `<div data-slot="dialog-body" class="${BODY} grid gap-4"><p>Text</p></div>`,
  );
  expect(off?.outerHTML).toBe(plain?.outerHTML);
});

test("a bar body ignores the prop", () => {
  const { container } = render(
    <>
      <DialogBody bar>
        <p>Text</p>
      </DialogBody>
      <DialogBody bar unstable_scrollArea wrapperClassName="max-h-80">
        <p>Text</p>
      </DialogBody>
    </>,
  );
  const [plain, on] = Array.from(container.children);
  expect(plain?.outerHTML).toBe(
    '<div data-slot="dialog-body" class="min-w-0 font-sans text-subhead flex min-h-0 flex-1 overflow-hidden p-0 first:pt-0 text-foreground"><p>Text</p></div>',
  );
  expect(on?.outerHTML).toBe(plain?.outerHTML);
});

test("with the prop a frame holds the body and the scrollbars after it", () => {
  const ref = createRef<HTMLDivElement>();
  const { container } = render(
    <DialogBody
      unstable_scrollArea
      ref={ref}
      id="form"
      aria-label="Fields"
      data-testid="body"
      className="grid gap-4"
      wrapperClassName="max-h-80"
    >
      <p>First</p>
      <p>Second</p>
    </DialogBody>,
  );
  const frame = container.firstElementChild as HTMLElement;
  const body = screen.getByTestId("body");

  expect(container.children).toHaveLength(1);
  expect(frame.dataset.slot).toBe("dialog-body-frame");
  expect(frame.classList.contains("r-scroll-area--absolute-gutters")).toBe(true);
  // The frame is the dialog's flex child and takes the sizing classes.
  for (const name of ["min-h-0", "min-w-0", "flex-1", "max-h-80"]) {
    expect(frame.classList.contains(name), name).toBe(true);
  }
  expect(frame.classList.contains("grid")).toBe(false);

  // The body: the slot, the caller's className, ref and native props.
  expect(Array.from(frame.children).map((child) => (child as HTMLElement).dataset.slot)).toEqual([
    "dialog-body",
    "scroll-area-gutters",
  ]);
  expect(body.parentElement).toBe(frame);
  expect(body.dataset.slot).toBe("dialog-body");
  expect(ref.current).toBe(body);
  expect(body.id).toBe("form");
  expect(body.getAttribute("aria-label")).toBe("Fields");
  for (const name of ["r-scroll-area__container", "grid", "gap-4", "px-(--surface-inset)"]) {
    expect(body.classList.contains(name), name).toBe(true);
  }
  expect(body.classList.contains("max-h-80")).toBe(false);
  // The ScrollArea gives the overflow: no native-scrolling class.
  expect(body.className).not.toMatch(/overflow-/);

  // Nothing but the caller's children is inside the body.
  expect(Array.from(body.children).map((child) => child.textContent)).toEqual(["First", "Second"]);
});

test("with the prop a body that holds a control is no tab stop, and the caller's tabIndex wins", () => {
  render(
    <>
      <DialogBody unstable_scrollArea data-testid="form">
        <input aria-label="Name" />
      </DialogBody>
      <DialogBody unstable_scrollArea data-testid="disabled">
        <button type="button" disabled>
          Save
        </button>
      </DialogBody>
      <DialogBody unstable_scrollArea data-testid="text" tabIndex={0}>
        <input aria-label="Other" />
      </DialogBody>
    </>,
  );
  expect(screen.getByTestId("form").getAttribute("tabindex")).toBe("-1");
  // jsdom has no layout, so nothing overflows: a body with nothing to focus has no tabindex.
  expect(screen.getByTestId("disabled").hasAttribute("tabindex")).toBe(false);
  expect(screen.getByTestId("text").getAttribute("tabindex")).toBe("0");
});
