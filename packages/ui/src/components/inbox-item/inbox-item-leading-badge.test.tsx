// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";
import { InboxItemLeadingBadge } from "./inbox-item-leading-badge";

afterEach(cleanup);

test("the leading badge is a decorative corner mark with its slot", () => {
  render(<InboxItemLeadingBadge data-testid="badge">T</InboxItemLeadingBadge>);
  const badge = screen.getByTestId("badge");
  expect(badge.getAttribute("data-slot")).toBe("inbox-item-leading-badge");
  // The row's label names the thread; the mark itself is not read out.
  expect(badge.getAttribute("aria-hidden")).toBe("true");
  // It sits on the leading visual's bottom-right corner, where a presence light would.
  const classes = badge.className.split(/\s+/);
  expect(classes).toContain("absolute");
  expect(classes.some((c) => /^-?bottom-/.test(c))).toBe(true);
  expect(classes.some((c) => /^-?(right|end)-/.test(c))).toBe(true);
});

test("a badge given a role is announced", () => {
  render(
    <InboxItemLeadingBadge data-testid="badge" role="img" aria-label="Thread">
      T
    </InboxItemLeadingBadge>,
  );
  expect(screen.getByTestId("badge").hasAttribute("aria-hidden")).toBe(false);
});
