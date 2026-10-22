/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { TextLink } from "./text-link";

// TextLink sits inside a line of text, so it must take that text's size and
// add nothing that could make the line taller. These assert the DECLARED
// classes that produce that: jsdom performs no layout, so a measured height
// would read 0 and pass on nothing.

afterEach(cleanup);

test("declares no height, padding, border or font-size of its own", () => {
  render(<TextLink>Forgot Password</TextLink>);
  const c = screen.getByRole("button").className;
  expect(c).not.toMatch(/\b(?:min-)?h-/);
  expect(c).not.toMatch(/\bp[xy]?-(?!0\b)/);
  expect(c).not.toMatch(/\bborder(?:-\d|-\[)/);
  expect(c).not.toMatch(/\btext-(?:xs|sm|base|lg|footnote|callout|subhead|body|\[)/);
  expect(c).not.toMatch(/\bleading-/);
});

test("muted is the default, and strong is ink", () => {
  render(
    <>
      <TextLink>Sign Out</TextLink>
      <TextLink variant="strong">Create One</TextLink>
    </>,
  );
  const [muted, strong] = screen.getAllByRole("button");
  expect(muted.className).toContain("text-foreground-muted");
  expect(muted.className).toContain("font-medium");
  expect(strong.className).toMatch(/\btext-foreground(?=\s|$)/);
  expect(strong.className).toContain("font-semibold");
});

test("a caller's font size wins over nothing and survives the merge", () => {
  render(<TextLink className="text-footnote">Sign Out</TextLink>);
  expect(screen.getByRole("button").className).toContain("text-footnote");
});

test("renders a real button that does not submit a form", () => {
  render(<TextLink>Later</TextLink>);
  const button = screen.getByRole("button") as HTMLButtonElement;
  expect(button.type).toBe("button");
  button.focus();
  expect(document.activeElement).toBe(button);
});

test("disabled is the native attribute", () => {
  render(<TextLink disabled>Sign Out</TextLink>);
  expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
});

test("renders a real link, without a button type, when given one", () => {
  render(<TextLink render={<a href="#create" />}>Create One</TextLink>);
  const link = screen.getByRole("link");
  expect(link.getAttribute("href")).toBe("#create");
  expect(link.hasAttribute("type")).toBe(false);
  expect(link.getAttribute("data-slot")).toBe("text-link");
});
