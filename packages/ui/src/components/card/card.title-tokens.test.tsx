/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Card, CardContent, CardHeader, CardLeading, CardTitle } from "./card";

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

function renderCard(theme: "brutal" | "elegant") {
  return render(
    <ThemeProvider theme={theme}>
      <Card>
        <CardHeader>
          <CardLeading data-testid="leading">icon</CardLeading>
          <CardTitle data-testid="title">Test title</CardTitle>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>
    </ThemeProvider>,
  );
}

const cls = (testid: string) => screen.getByTestId(testid).className;

afterEach(cleanup);

test("brutal CardTitle uses the card-title token axis AND keeps the theme font family", () => {
  renderCard("brutal");
  const c = cls("title");
  expect(c).toContain("text-card-title");
  expect(c).toContain("font-card-title");
  expect(c).toContain("font-heading");
  expect(c).not.toContain("text-lg");
  expect(c).not.toContain("leading-5");
  expect(c).not.toContain("font-bold");
});

test("elegant CardTitle uses the card-title token axis AND keeps the theme font family", () => {
  renderCard("elegant");
  const c = cls("title");
  expect(c).toContain("text-card-title");
  expect(c).toContain("font-card-title");
  expect(c).toContain("font-sans");
  expect(c).not.toContain("text-base");
  expect(c).not.toContain("leading-[22px]");
  expect(c).not.toContain("font-medium");
});

test("brutal CardLeading uses the tokenized line-height", () => {
  renderCard("brutal");
  const c = cls("leading");
  expect(c).toContain("min-h-(--card-title-line-height)");
  expect(c).not.toContain("min-h-5");
});

test("elegant CardLeading uses the tokenized line-height", () => {
  renderCard("elegant");
  const c = cls("leading");
  expect(c).toContain("min-h-(--card-title-line-height)");
  expect(c).not.toContain("min-h-[22px]");
});

test("class-group exclusivity: consumer text-sm resolves against text-card-title", () => {
  render(
    <ThemeProvider theme="brutal">
      <Card>
        <CardHeader>
          <CardTitle data-testid="title" className="text-sm">
            Test title
          </CardTitle>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>
    </ThemeProvider>,
  );
  const c = cls("title");
  const hasToken = c.includes("text-card-title");
  const hasOverride = c.includes("text-sm");
  expect(hasToken !== hasOverride).toBe(true);
});

test("class-group exclusivity: consumer font-bold resolves against font-card-title", () => {
  render(
    <ThemeProvider theme="elegant">
      <Card>
        <CardHeader>
          <CardTitle data-testid="title" className="font-bold">
            Test title
          </CardTitle>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>
    </ThemeProvider>,
  );
  const c = cls("title");
  const hasToken = c.includes("font-card-title");
  const hasOverride = c.includes("font-bold");
  expect(hasToken !== hasOverride).toBe(true);
});
