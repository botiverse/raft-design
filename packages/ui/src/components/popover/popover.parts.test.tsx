/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { Popover, PopoverActions, PopoverBody, PopoverContent, PopoverTitle } from "./popover";

afterEach(cleanup);

test("PopoverBody and PopoverActions are inset like a preview card's body and actions", () => {
  const { container } = render(
    <>
      <PopoverBody>Text</PopoverBody>
      <PopoverActions>Buttons</PopoverActions>
    </>,
  );
  // The inset is on the body's content, inside its scroller.
  const body = container.querySelector(
    '[data-slot="popover-body"] > [data-slot="scroll-area-content"]',
  )!;
  const actions = container.querySelector('[data-slot="popover-actions"]')!;
  expect(body.className).toContain("px-4");
  expect(body.className).toContain("pt-4");
  // Last in the panel, it ends 16px above its edge, as `last:pb-4` did before it scrolled.
  expect(body.className).toContain("[:last-child>&]:pb-4");
  expect(actions.className).toContain("justify-end");
  expect(actions.className).toContain("last:pb-4");
});

test("PopoverBody's className is its content's, as before it scrolled; scrollClassName is the scroller's", () => {
  const { container } = render(
    <PopoverBody
      className="flex flex-col gap-3"
      scrollClassName="overflow-visible"
      aria-label="Notes"
    >
      Text
    </PopoverBody>,
  );
  const scroller = container.querySelector('[data-slot="popover-body"]')!;
  const content = scroller.querySelector(':scope > [data-slot="scroll-area-content"]')!;
  expect(content.className).toContain("gap-3");
  expect(content.className).not.toContain("gap-1.5");
  expect(scroller.className).toContain("overflow-visible");
  expect(scroller.className).not.toContain("gap-3");
  expect(scroller.getAttribute("aria-label")).toBe("Notes");
});

test("a popover about an item takes a card's body, title and one row of buttons", () => {
  const { container } = render(
    <Popover open>
      <PopoverContent size="item">
        <PopoverBody>
          <PopoverTitle>Show previews from Stamp?</PopoverTitle>
        </PopoverBody>
        <PopoverActions>Buttons</PopoverActions>
      </PopoverContent>
    </Popover>,
  );
  const popup = document.querySelector('[data-slot="popover-content"]')!;
  const body = document.querySelector(
    '[data-slot="popover-body"] > [data-slot="scroll-area-content"]',
  )!;
  const title = document.querySelector('[data-slot="popover-title"]')!;
  const actions = document.querySelector('[data-slot="popover-actions"]')!;
  expect(container).toBeTruthy();
  expect(popup.getAttribute("data-size")).toBe("item");
  expect(popup.className).toContain("w-[400px]");
  expect(popup.className).toContain("max-w-(--available-width)");
  expect(body.className).toContain("p-3");
  expect(body.className).not.toContain("px-4");
  expect(title.className).toContain("text-subhead");
  expect(actions.className).toContain("flex-wrap");
  expect(actions.className).not.toContain("last:pb-4");
});
