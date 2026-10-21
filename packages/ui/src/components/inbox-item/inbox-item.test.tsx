// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";
import { PanelAction } from "../panel/panel-action";
import { InboxItem, InboxItemActions, InboxItemTitle, InboxItemTrailing } from "./inbox-item";

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

test("rows that don't opt in keep their parts' classes; compact and reveal only add", () => {
  render(
    <>
      <InboxItem data-testid="row">
        <InboxItemTitle data-testid="title">T</InboxItemTitle>
        <InboxItemTrailing data-testid="trailing">
          <InboxItemActions data-testid="plain-actions" />
        </InboxItemTrailing>
      </InboxItem>
      <InboxItem density="compact" data-testid="compact-row">
        <InboxItemTitle data-testid="compact-title">T</InboxItemTitle>
        <InboxItemTrailing data-testid="compact-trailing">
          <InboxItemActions reveal="hover" data-testid="reveal-actions" />
        </InboxItemTrailing>
      </InboxItem>
    </>,
  );
  const classes = (id: string) => screen.getByTestId(id).className.split(/\s+/);
  expect(screen.getByTestId("row").hasAttribute("data-density")).toBe(false);
  expect(screen.getByTestId("plain-actions").hasAttribute("data-reveal")).toBe(false);
  expect(classes("plain-actions")).toContain("pointer-events-auto");
  expect(classes("plain-actions")).not.toContain("opacity-0");
  expect(classes("title")).toEqual(expect.arrayContaining(["line-clamp-2", "pl-[18px]"]));
  expect(classes("trailing")).toContain("group-data-[unread=true]/inbox-item:after:block");

  expect(screen.getByTestId("compact-row").getAttribute("data-density")).toBe("compact");
  expect(classes("compact-title")).toEqual(
    expect.arrayContaining(["line-clamp-1", "pl-0", "has-[>svg]:pl-[18px]"]),
  );
  expect(classes("compact-title")).not.toContain("line-clamp-2");
  // The unread count in the marks replaces the attention dot.
  expect(classes("compact-trailing")).toContain("group-data-[unread=true]/inbox-item:after:hidden");
  expect(classes("compact-trailing")).not.toContain(
    "group-data-[unread=true]/inbox-item:after:block",
  );
  expect(screen.getByTestId("reveal-actions").getAttribute("data-reveal")).toBe("hover");
  expect(classes("reveal-actions")).toEqual(
    expect.arrayContaining(["pointer-events-none", "opacity-0", "pointer-coarse:opacity-100"]),
  );
  expect(classes("reveal-actions")).not.toContain("pointer-events-auto");
});

test("the line between items starts at the text and ends where the content ends", () => {
  render(
    <>
      <InboxItem data-testid="first">
        <InboxItemTitle>A</InboxItemTitle>
      </InboxItem>
      <InboxItem data-testid="second">
        <InboxItemTitle>B</InboxItemTitle>
      </InboxItem>
    </>,
  );
  const classes = screen.getByTestId("second").className.split(/\s+/);
  expect(classes).toContain("before:left-4");
  expect(classes).toContain("before:right-4");
  expect(classes).not.toContain("before:right-0");
});
