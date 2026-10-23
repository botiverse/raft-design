/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { PopoverActions, PopoverBody } from "./popover";

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
