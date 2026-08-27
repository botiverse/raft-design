/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Badge } from "./badge";

if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

afterEach(cleanup);

function renderBadge(theme: "brutal" | "elegant", uppercase: boolean) {
  render(
    <ThemeProvider theme={theme}>
      <Badge uppercase={uppercase}>In Progress</Badge>
    </ThemeProvider>,
  );
  return screen.getByText("In Progress").className;
}

test("brutal uppercase Badge carries the one-pixel top optical correction", () => {
  const className = renderBadge("brutal", true);

  expect(className).toContain("uppercase");
  expect(className).toContain("tracking-wide");
  expect(className).toContain("pt-px");
});

test("brutal mixed-case Badge does not inherit the uppercase optical correction", () => {
  const className = renderBadge("brutal", false);

  expect(className).not.toContain("uppercase");
  expect(className).not.toContain("pt-px");
});

test("elegant keeps caller casing and geometry when uppercase is requested", () => {
  const className = renderBadge("elegant", true);

  expect(className).not.toContain("uppercase");
  expect(className).not.toContain("pt-px");
});
