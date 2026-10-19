// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";
import { PanelAction } from "../panel/panel-action";
import { InboxItemActions } from "./inbox-item";

afterEach(cleanup);

test("row actions keep a 44px target and spaced targets on a touch screen", () => {
  render(
    <InboxItemActions data-testid="actions">
      <PanelAction aria-label="Mark as done">D</PanelAction>
    </InboxItemActions>,
  );
  const classes = screen.getByTestId("actions").className.split(/\s+/);
  expect(classes).toContain("pointer-coarse:gap-3");
  for (const slot of ["panel-action", "panel-toggle-action"]) {
    expect(classes).toContain(`pointer-coarse:*:data-[slot=${slot}]:after:absolute`);
    expect(classes).toContain(`pointer-coarse:*:data-[slot=${slot}]:after:-inset-1.5`);
  }
  // A mouse keeps the 32px buttons 2px apart, whatever the width.
  expect(classes).toContain("gap-0.5");
  expect(classes).toContain("*:data-[slot=panel-action]:h-8");
});
