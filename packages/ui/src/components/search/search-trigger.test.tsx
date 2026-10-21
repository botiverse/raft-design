/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test, vi } from "vite-plus/test";
import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SearchTrigger, SearchTriggerLabel, SearchTriggerShortcut } from "./search-trigger";

afterEach(cleanup);

const classes = (element: Element) => element.className.split(/\s+/);

test("a button drawn as the top bar's search field", () => {
  const onClick = vi.fn();
  const ref = createRef<HTMLButtonElement>();
  render(
    <SearchTrigger ref={ref} onClick={onClick}>
      <svg data-testid="icon" />
      <SearchTriggerLabel>Search Raft</SearchTriggerLabel>
      <SearchTriggerShortcut>⌘K</SearchTriggerShortcut>
    </SearchTrigger>,
  );
  const trigger = screen.getByRole("button", { name: /Search Raft/ });
  // The overlay anchors on the trigger, so the ref reaches the element.
  expect(ref.current).toBe(trigger);
  expect(trigger.getAttribute("type")).toBe("button");
  expect(trigger.getAttribute("data-slot")).toBe("search-trigger");
  expect(classes(trigger)).toEqual(
    expect.arrayContaining([
      "h-9",
      "w-[clamp(360px,32vw,520px)]",
      "border-[1.5px]",
      "border-line-field",
      "bg-layer-card",
      "text-body",
      "font-normal",
      "text-foreground-hint",
      "hover:press-overlay",
      "active:press-overlay",
      "focus-visible:shadow-focus",
      "[&>svg:not([class*='size-'])]:size-[18px]",
    ]),
  );
  fireEvent.click(trigger);
  expect(onClick).toHaveBeenCalledOnce();
});

test("the label truncates and the shortcut keeps to the right end", () => {
  render(
    <SearchTrigger>
      <SearchTriggerLabel data-testid="label">Search Raft</SearchTriggerLabel>
      <SearchTriggerShortcut data-testid="shortcut">⌘K</SearchTriggerShortcut>
    </SearchTrigger>,
  );
  expect(classes(screen.getByTestId("label"))).toEqual(
    expect.arrayContaining(["min-w-0", "flex-1", "truncate"]),
  );
  const shortcut = screen.getByTestId("shortcut");
  expect(shortcut.tagName).toBe("KBD");
  expect(classes(shortcut)).toEqual(expect.arrayContaining(["ml-auto", "shrink-0"]));
});

test("disabled, it is a disabled field and the press overlay is reset", () => {
  render(
    <SearchTrigger disabled>
      <SearchTriggerLabel>Search Raft</SearchTriggerLabel>
    </SearchTrigger>,
  );
  const trigger = screen.getByRole("button", { name: "Search Raft" });
  expect(trigger).toHaveProperty("disabled", true);
  expect(classes(trigger)).toEqual(
    expect.arrayContaining([
      "disabled:bg-none",
      "disabled:bg-fill-muted",
      "disabled:border-line-hairline",
      "disabled:text-foreground-disabled",
      "aria-disabled:bg-none",
      "aria-disabled:text-foreground-disabled",
    ]),
  );
});
