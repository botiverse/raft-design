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
  const body = container.querySelector('[data-slot="popover-body"]')!;
  const actions = container.querySelector('[data-slot="popover-actions"]')!;
  expect(body.className).toContain("px-4");
  expect(body.className).toContain("pt-4");
  expect(actions.className).toContain("justify-end");
  expect(actions.className).toContain("last:pb-4");
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
  const body = document.querySelector('[data-slot="popover-body"]')!;
  const title = document.querySelector('[data-slot="popover-title"]')!;
  const actions = document.querySelector('[data-slot="popover-actions"]')!;
  expect(container).toBeTruthy();
  expect(popup.getAttribute("data-size")).toBe("item");
  expect(popup.className).toContain("w-[400px]");
  expect(body.className).toContain("p-3");
  expect(body.className).not.toContain("px-4");
  expect(title.className).toContain("text-subhead");
  expect(actions.className).toContain("flex-nowrap");
  expect(actions.className).not.toContain("last:pb-4");
});
