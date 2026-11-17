/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { TextLink } from "./text-link";

// The in-sentence form (text-link.md, "In a sentence"): a span that acts as a
// button, so it wraps with the words around it. It must still be a button to
// a keyboard and a screen reader.

afterEach(cleanup);

test("a span with the button's role, in the tab order", () => {
  render(
    <TextLink nativeButton={false} render={<span />}>
      switch to another runtime
    </TextLink>,
  );
  const link = screen.getByRole("button");
  expect(link.tagName).toBe("SPAN");
  expect(link.tabIndex).toBe(0);
  expect(link.hasAttribute("type")).toBe(false);
  expect(link.getAttribute("data-slot")).toBe("text-link");
  expect(link.className).toContain("box-decoration-clone");
});

test("Enter and Space press it, as they press a button", () => {
  const onClick = vi.fn();
  render(
    <TextLink nativeButton={false} render={<span />} onClick={onClick}>
      switch to another runtime
    </TextLink>,
  );
  const link = screen.getByRole("button");
  link.focus();
  expect(document.activeElement).toBe(link);
  fireEvent.keyDown(link, { key: "Enter" });
  expect(onClick).toHaveBeenCalledTimes(1);
  fireEvent.keyDown(link, { key: " " });
  fireEvent.keyUp(link, { key: " " });
  expect(onClick).toHaveBeenCalledTimes(2);
  fireEvent.click(link);
  expect(onClick).toHaveBeenCalledTimes(3);
});

test("disabled is aria-disabled: out of the tab order, and nothing presses it", () => {
  const onClick = vi.fn();
  render(
    <TextLink nativeButton={false} render={<span />} disabled onClick={onClick}>
      switch to another runtime
    </TextLink>,
  );
  const link = screen.getByRole("button");
  expect(link.getAttribute("aria-disabled")).toBe("true");
  expect(link.tabIndex).toBe(-1);
  expect(link.className).toContain("aria-disabled:text-foreground-disabled");
  fireEvent.click(link);
  fireEvent.keyDown(link, { key: "Enter" });
  fireEvent.keyDown(link, { key: " " });
  fireEvent.keyUp(link, { key: " " });
  expect(onClick).not.toHaveBeenCalled();
});

test("the button and link forms are unchanged: no role, no inline classes", () => {
  render(
    <>
      <TextLink>Later</TextLink>
      <TextLink render={<a href="#create" />}>Create one</TextLink>
    </>,
  );
  const button = screen.getByRole("button");
  expect(button.tagName).toBe("BUTTON");
  expect(button.hasAttribute("role")).toBe(false);
  expect(button.className).not.toContain("box-decoration-clone");
  const link = screen.getByRole("link");
  expect(link.hasAttribute("role")).toBe(false);
  expect(link.hasAttribute("tabindex")).toBe(false);
  expect(link.className).not.toContain("box-decoration-clone");
});
