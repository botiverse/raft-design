/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import {
  ListRow,
  ListRowBody,
  ListRowBottom,
  ListRowChevron,
  ListRowDescription,
  ListRowGroup,
  ListRowIcon,
  ListRowMeta,
  ListRowTitle,
  ListRowTop,
  ListRowValue,
} from "./list-row";

afterEach(cleanup);

const classes = (element: Element) => element.className.split(/\s+/);

describe("ListRow", () => {
  test("is a button that lays the pressed overlay on hover and press", () => {
    render(<ListRow>launch-week</ListRow>);
    const row = screen.getByRole("button", { name: "launch-week" });
    expect(row.getAttribute("type")).toBe("button");
    expect(row.getAttribute("data-slot")).toBe("list-row");
    expect(row.getAttribute("data-variant")).toBe("default");
    const rowClasses = classes(row);
    expect(rowClasses).toContain("min-h-16");
    expect(rowClasses).toContain(
      "not-disabled:not-aria-disabled:not-data-selected:hover:press-overlay",
    );
    expect(rowClasses).toContain(
      "not-disabled:not-aria-disabled:not-data-selected:active:press-overlay",
    );
    // A flush row keeps its focus ring inside, so an inset card cannot clip it.
    expect(rowClasses).toContain("focus-visible:inset-ring-2");
  });

  test("a row that goes somewhere renders the link, without a button type", () => {
    render(
      <ListRow render={<a href="/c/launch-week" />}>
        <ListRowBody>
          <ListRowTitle>launch-week</ListRowTitle>
        </ListRowBody>
      </ListRow>,
    );
    const row = screen.getByRole("link", { name: "launch-week" });
    expect(row.getAttribute("href")).toBe("/c/launch-week");
    expect(row.hasAttribute("type")).toBe(false);
  });

  test("a hairline from the text start separates two rows; a setting's starts at the edge", () => {
    const { rerender } = render(<ListRow data-testid="row" />);
    let rowClasses = classes(screen.getByTestId("row"));
    expect(rowClasses).toContain("[--list-row-rule-start:63px]");
    expect(rowClasses).toContain("before:left-(--list-row-rule-start)");
    expect(rowClasses).toContain("[[data-slot=list-row]+&]:before:block");
    expect(rowClasses).toContain("[li+li>&]:before:block");

    rerender(<ListRow data-testid="row" variant="plain" />);
    rowClasses = classes(screen.getByTestId("row"));
    expect(rowClasses).toContain("min-h-11");
    expect(rowClasses).toContain("[--list-row-rule-start:16px]");
    expect(rowClasses).toContain("[[data-slot=list-row]+&]:before:block");
  });

  test("entry rows are a set of buttons: 44 tall, no lines between them", () => {
    render(
      <ListRow variant="entry" data-testid="row">
        <ListRowIcon data-testid="icon">
          <svg />
        </ListRowIcon>
        <ListRowBody>
          <ListRowTitle>Search</ListRowTitle>
        </ListRowBody>
      </ListRow>,
    );
    const row = screen.getByTestId("row");
    expect(row.getAttribute("data-variant")).toBe("entry");
    expect(classes(row)).toContain("min-h-11");
    expect(row.className).not.toContain("before:border-t");
    const icon = screen.getByTestId("icon");
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(classes(icon)).toContain("[&>svg]:size-5");
    expect(classes(icon)).toContain("text-foreground-hint");
  });

  test("a selected row takes the cyan wash and its hover is gated off", () => {
    render(
      <ListRow selected aria-current="true">
        release-review
      </ListRow>,
    );
    const row = screen.getByRole("button", { name: "release-review" });
    expect(row.hasAttribute("data-selected")).toBe(true);
    expect(row.getAttribute("aria-current")).toBe("true");
    expect(classes(row)).toContain("data-selected:bg-info-soft");
    expect(
      classes(row).filter(
        (name) => name.includes("press-overlay") && !name.includes("not-data-selected"),
      ),
    ).toEqual([]);
  });

  test("a display-only row is a div with no hover, press or button type", () => {
    render(
      <ListRow variant="plain" interactive={false} data-testid="row">
        <ListRowBody>
          <ListRowTitle>Agents can merge to main</ListRowTitle>
        </ListRowBody>
      </ListRow>,
    );
    const row = screen.getByTestId("row");
    expect(row.tagName).toBe("DIV");
    expect(row.hasAttribute("type")).toBe(false);
    expect(row.className).not.toContain("press-overlay");
  });

  test("the tone reaches the title and the preview through the row", () => {
    const { rerender } = render(
      <ListRow data-testid="row" tone="unread">
        <ListRowBody>
          <ListRowTop>
            <ListRowTitle data-testid="title">launch-week</ListRowTitle>
            <ListRowMeta data-testid="time">10:42</ListRowMeta>
          </ListRowTop>
          <ListRowBottom>
            <ListRowDescription data-testid="description">Wug: drafted.</ListRowDescription>
          </ListRowBottom>
        </ListRowBody>
      </ListRow>,
    );
    expect(screen.getByTestId("row").getAttribute("data-tone")).toBe("unread");
    expect(classes(screen.getByTestId("title"))).toContain(
      "group-data-[tone=unread]/list-row:font-bold",
    );
    expect(classes(screen.getByTestId("description"))).toContain(
      "group-data-[tone=unread]/list-row:text-foreground",
    );
    expect(classes(screen.getByTestId("time"))).toContain("font-mono");

    rerender(<ListRow data-testid="row" />);
    expect(screen.getByTestId("row").hasAttribute("data-tone")).toBe(false);
  });

  test("a preview truncates by default and wraps on request", () => {
    const { rerender } = render(<ListRowDescription data-testid="d">Off.</ListRowDescription>);
    expect(classes(screen.getByTestId("d"))).toContain("truncate");
    expect(classes(screen.getByTestId("d"))).not.toContain("whitespace-normal");

    rerender(
      <ListRowDescription data-testid="d" wrap>
        Off: a person approves every merge.
      </ListRowDescription>,
    );
    expect(classes(screen.getByTestId("d"))).toContain("whitespace-normal");
  });

  test("a setting row: the value and a decorative chevron", () => {
    render(
      <ListRow variant="plain">
        <ListRowBody>
          <ListRowTitle>Language</ListRowTitle>
        </ListRowBody>
        <ListRowValue data-testid="value">English</ListRowValue>
        <ListRowChevron data-testid="chevron" />
      </ListRow>,
    );
    expect(screen.getByRole("button", { name: /Language/ })).toBeTruthy();
    expect(classes(screen.getByTestId("value"))).toContain("max-w-[45%]");
    const chevron = screen.getByTestId("chevron");
    expect(chevron.getAttribute("aria-hidden")).toBe("true");
    expect(chevron.querySelector("svg")).not.toBeNull();
  });

  test("an inset group is a card around the rows", () => {
    render(
      <ListRowGroup data-testid="group" render={<ul />}>
        <li>
          <ListRow>Wug</ListRow>
        </li>
      </ListRowGroup>,
    );
    const group = screen.getByTestId("group");
    expect(group.tagName).toBe("UL");
    expect(group.getAttribute("data-slot")).toBe("list-row-group");
    expect(classes(group)).toEqual(
      expect.arrayContaining([
        "overflow-hidden",
        "rounded-container",
        "border",
        "border-line-muted",
        "bg-layer-card",
      ]),
    );
  });
});
