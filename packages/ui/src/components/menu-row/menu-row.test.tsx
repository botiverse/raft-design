/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test, vi } from "vite-plus/test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MenuRow, MenuRowCheck, MenuRowLabel, MenuRowList, MenuRowShortcut } from "./menu-row";

afterEach(cleanup);

const classes = (element: Element) => element.className.split(/\s+/);

test("a plain button with the menu item's look and no menu role", () => {
  const onClick = vi.fn();
  render(
    <MenuRow onClick={onClick}>
      <svg data-testid="icon" />
      <MenuRowLabel>Newest First</MenuRowLabel>
      <MenuRowShortcut>⌘N</MenuRowShortcut>
    </MenuRow>,
  );
  const row = screen.getByRole("button", { name: /Newest First/ });
  expect(row.getAttribute("type")).toBe("button");
  expect(row.hasAttribute("role")).toBe(false);
  expect(row.getAttribute("data-slot")).toBe("menu-row");
  expect(classes(row)).toEqual(
    expect.arrayContaining([
      "min-h-9",
      "rounded-control",
      "text-callout",
      "font-medium",
      "focus-visible:bg-primary-soft",
      "not-disabled:not-aria-disabled:hover:bg-primary-soft",
      "[&>svg:not([class*='size-'])]:size-4",
      "[&>svg]:text-foreground-icon",
    ]),
  );
  fireEvent.click(row);
  expect(onClick).toHaveBeenCalledOnce();
});

test("the current value is bold with an ink check", () => {
  render(
    <MenuRow aria-checked="true" role="menuitemradio">
      <MenuRowLabel>Oldest First</MenuRowLabel>
      <MenuRowCheck data-testid="check" />
    </MenuRow>,
  );
  const row = screen.getByRole("menuitemradio", { name: "Oldest First" });
  expect(classes(row)).toContain("aria-checked:font-bold");
  expect(classes(row)).toContain("aria-[current=page]:font-bold");
  const check = screen.getByTestId("check");
  expect(check.getAttribute("aria-hidden")).toBe("true");
  expect(check.querySelector("svg")).not.toBeNull();
  expect(classes(check)).toContain("text-foreground");
});

test("a driven highlight and a disabled row", () => {
  const { rerender } = render(<MenuRow highlighted>Channels</MenuRow>);
  let row = screen.getByRole("button", { name: "Channels" });
  expect(row.hasAttribute("data-highlighted")).toBe(true);
  expect(classes(row)).toContain("data-highlighted:bg-primary-soft");

  rerender(<MenuRow disabled>Channels</MenuRow>);
  row = screen.getByRole("button", { name: "Channels" });
  expect(row.hasAttribute("data-highlighted")).toBe(false);
  expect(classes(row)).toContain("disabled:text-foreground-disabled");
  expect(classes(row)).toContain("disabled:[&>svg]:text-foreground-disabled");
});

test("a row that goes somewhere renders the link, without a button type", () => {
  render(
    <MenuRow render={<a href="/s/acme" />} aria-current="page">
      <MenuRowLabel>Acme</MenuRowLabel>
    </MenuRow>,
  );
  const row = screen.getByRole("link", { name: "Acme" });
  expect(row.hasAttribute("type")).toBe(false);
  expect(row.getAttribute("aria-current")).toBe("page");
});

test("the shortcut drops the key cap's box and sits at the end", () => {
  render(<MenuRowShortcut data-testid="shortcut">⌘K</MenuRowShortcut>);
  const shortcut = screen.getByTestId("shortcut");
  expect(shortcut.tagName).toBe("KBD");
  expect(classes(shortcut)).toEqual(
    expect.arrayContaining(["ml-auto", "inset-ring-0", "font-mono", "text-foreground-hint"]),
  );
  expect(classes(shortcut)).not.toContain("inset-ring");
});

test("the list is the menu's 240 column with its 6px inset", () => {
  render(
    <MenuRowList data-testid="list">
      <MenuRow>Newest First</MenuRow>
    </MenuRowList>,
  );
  const list = screen.getByTestId("list");
  expect(list.getAttribute("data-slot")).toBe("menu-row-list");
  expect(classes(list)).toEqual(expect.arrayContaining(["flex-col", "w-60", "p-1.5"]));
});
