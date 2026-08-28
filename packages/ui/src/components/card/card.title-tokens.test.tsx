/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

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
          <CardTitle data-testid="title">Test title</CardTitle>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>
    </ThemeProvider>,
  );
}

const cls = (testid: string) => screen.getByTestId(testid).className;

afterEach(cleanup);

test("brutal CardTitle uses the card-title token axis", () => {
  renderCard("brutal");
  expect(cls("title")).toContain("text-card-title");
  expect(cls("title")).toContain("font-card-title");
  expect(cls("title")).not.toContain("text-lg");
  expect(cls("title")).not.toContain("leading-5");
  expect(cls("title")).not.toContain("font-bold");
});

test("elegant CardTitle uses the card-title token axis", () => {
  renderCard("elegant");
  expect(cls("title")).toContain("text-card-title");
  expect(cls("title")).toContain("font-card-title");
  expect(cls("title")).not.toContain("text-base");
  expect(cls("title")).not.toContain("leading-[22px]");
  expect(cls("title")).not.toContain("font-medium");
});
