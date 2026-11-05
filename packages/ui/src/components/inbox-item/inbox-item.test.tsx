// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { MouseEvent } from "react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { PanelAction } from "../panel/panel-action";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip/tooltip";
import {
  InboxItem,
  InboxItemActions,
  InboxItemBody,
  InboxItemContent,
  InboxItemHeading,
  InboxItemLine,
  InboxItemListGroup,
  InboxItemListHeading,
  InboxItemMarks,
  InboxItemStatus,
  InboxItemTimestamp,
  InboxItemTitle,
  InboxItemTrailing,
  InboxItemTrigger,
} from "./inbox-item";

afterEach(cleanup);

function prevent(event: MouseEvent<HTMLElement>) {
  event.preventDefault();
}

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

test("a compact row's time takes the pointer only in the heading; in the trailing column nothing changes", () => {
  const onOpen = vi.fn();
  render(
    <>
      <InboxItem density="compact" data-testid="row">
        <InboxItemTrigger aria-label="Open" onClick={onOpen} />
        <InboxItemContent data-testid="content">
          <InboxItemHeading data-testid="heading">
            <InboxItemTitle>T</InboxItemTitle>
            <InboxItemTimestamp data-testid="heading-time">2m</InboxItemTimestamp>
          </InboxItemHeading>
          <InboxItemLine data-testid="line">
            <InboxItemBody>B</InboxItemBody>
            <InboxItemMarks />
          </InboxItemLine>
          <InboxItemActions reveal="hover" />
        </InboxItemContent>
      </InboxItem>
      <InboxItem data-testid="default-row">
        <InboxItemContent data-testid="default-content">
          <InboxItemHeading data-testid="default-heading">
            <InboxItemTitle>T</InboxItemTitle>
            <InboxItemTimestamp data-testid="default-time">2m</InboxItemTimestamp>
          </InboxItemHeading>
        </InboxItemContent>
        <InboxItemTrailing data-testid="trailing">
          <InboxItemTimestamp data-testid="trailing-time">2m</InboxItemTimestamp>
        </InboxItemTrailing>
      </InboxItem>
      <InboxItem density="compact">
        <InboxItemTrigger aria-label="Open too" onClick={onOpen} />
        <InboxItemTrailing>
          <InboxItemTimestamp data-testid="compact-trailing-time">2m</InboxItemTimestamp>
        </InboxItemTrailing>
      </InboxItem>
    </>,
  );
  const classes = (id: string) => screen.getByTestId(id).className.split(/\s+/);
  expect(classes("heading")).toContain("*:data-inbox-item-time:pointer-events-auto");
  expect(classes("default-heading")).not.toContain("*:data-inbox-item-time:pointer-events-auto");
  expect(screen.getByTestId("heading-time").hasAttribute("data-inbox-item-time")).toBe(true);
  for (const id of ["default-time", "trailing-time", "compact-trailing-time"]) {
    expect(screen.getByTestId(id).hasAttribute("data-inbox-item-time")).toBe(false);
  }
  fireEvent.click(screen.getByTestId("compact-trailing-time"));
  expect(onOpen).not.toHaveBeenCalled();
  // Both lines end at the row's padding, and short of the action while it shows.
  const fullWidth = "has-data-[slot=inbox-item-line]:[--inbox-item-content-end:-1]";
  expect(classes("row")).toContain(fullWidth);
  expect(classes("default-row")).not.toContain(fullWidth);
  const room =
    "has-[>[data-slot=inbox-item-line]]:has-[>[data-reveal=hover]]:pr-(--inbox-item-actions-room,0px)";
  expect(classes("content")).toContain(room);
  expect(classes("default-content")).not.toContain(room);
  expect(screen.getByTestId("line").getAttribute("data-slot")).toBe("inbox-item-line");
  expect(classes("line")).toContain("*:data-[slot=inbox-item-marks]:empty:hidden");
});

test("a time with reveal is hidden until the row shows it; without it, it has no display of its own", () => {
  render(
    <InboxItem density="compact">
      <InboxItemHeading>
        <InboxItemTimestamp reveal="hover" data-testid="older">
          Jul 27
        </InboxItemTimestamp>
        <InboxItemTimestamp data-testid="recent">2m</InboxItemTimestamp>
      </InboxItemHeading>
    </InboxItem>,
  );
  const reveal = "[display:var(--inbox-item-time-display,none)]";
  expect(screen.getByTestId("older").className.split(/\s+/)).toContain(reveal);
  expect(screen.getByTestId("recent").className.split(/\s+/)).not.toContain(reveal);
  // Actions read their own data-reveal in a trailing column; the time must not look like them.
  expect(screen.getByTestId("older").hasAttribute("data-reveal")).toBe(false);
});

test("a click on the time opens the item, unless its own handler prevents that", () => {
  const onOpen = vi.fn();
  render(
    <InboxItem density="compact">
      <InboxItemTrigger aria-label="Open" onClick={onOpen} />
      <InboxItemContent>
        <InboxItemHeading>
          <InboxItemTitle>T</InboxItemTitle>
          <InboxItemTimestamp data-testid="time">2m</InboxItemTimestamp>
          <InboxItemTimestamp data-testid="prevented" onClick={prevent}>
            3m
          </InboxItemTimestamp>
        </InboxItemHeading>
      </InboxItemContent>
    </InboxItem>,
  );
  fireEvent.click(screen.getByTestId("time"));
  expect(onOpen).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByTestId("prevented"));
  expect(onOpen).toHaveBeenCalledTimes(1);
});

test("a list heading is an h3 unless rendered as another level, in its own group", () => {
  render(
    <InboxItemListGroup data-testid="group">
      <InboxItemListHeading data-testid="h3">Today</InboxItemListHeading>
      <InboxItemListHeading render={<h4 />} data-testid="h4">
        Yesterday
      </InboxItemListHeading>
    </InboxItemListGroup>,
  );
  expect(screen.getByTestId("group").getAttribute("data-slot")).toBe("inbox-item-list-group");
  expect(screen.getByTestId("h3").tagName).toBe("H3");
  expect(screen.getByTestId("h4").tagName).toBe("H4");
  expect(screen.getByTestId("h3").getAttribute("data-slot")).toBe("inbox-item-list-heading");
  // A heading has no first-child rule of its own: it is the first child of every group.
  expect(screen.getByTestId("h3").className).not.toContain("first:");
});

test("a status shows its word and hides its pixel unless a row with a line is narrow", () => {
  const { container } = render(
    <InboxItemStatus id="status" status="done" data-testid="word">
      Done
    </InboxItemStatus>,
  );
  const word = screen.getByTestId("word");
  expect(word.id).toBe("status");
  expect(word.textContent).toBe("Done");
  expect(word.className.split(/\s+/)).toContain("@max-[320px]/inbox-item-row:hidden");
  const pixel = container.querySelector("[data-slot=inbox-item-status-pixel]");
  expect(pixel?.getAttribute("role")).toBe("img");
  expect(pixel?.getAttribute("aria-label")).toBe("Done");
  expect(pixel?.className.split(/\s+/)).toEqual(
    expect.arrayContaining(["hidden", "@max-[320px]/inbox-item-row:inline-flex"]),
  );
});

test("the heading finds the time when it is a tooltip's trigger, which replaces data-slot", () => {
  render(
    <InboxItem density="compact">
      <InboxItemHeading>
        <InboxItemTitle>T</InboxItemTitle>
        <Tooltip>
          <TooltipTrigger render={<InboxItemTimestamp data-testid="time" />}>2m</TooltipTrigger>
          <TooltipContent>2 minutes ago</TooltipContent>
        </Tooltip>
      </InboxItemHeading>
    </InboxItem>,
  );
  expect(screen.getByTestId("time").hasAttribute("data-inbox-item-time")).toBe(true);
});
