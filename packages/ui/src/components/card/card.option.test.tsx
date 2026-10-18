/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
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
afterEach(cleanup);

function renderCard(variant?: "default" | "option") {
  return render(
    <ThemeProvider>
      <Card data-testid="card" {...(variant ? { variant } : {})}>
        <CardHeader>
          <CardTitle data-testid="title">Fast mode</CardTitle>
        </CardHeader>
        <CardContent>body</CardContent>
      </Card>
    </ThemeProvider>,
  );
}

test("option sits in the control plane, not on the panel's", () => {
  renderCard("option");
  const cls = screen.getByTestId("card").className;
  expect(cls, "must take the control radius and the field border").toMatch(/\brounded-control\b/);
  expect(cls).toMatch(/\bborder-line-field\b/);
  expect(
    cls,
    "must not keep the panel radius — that is what made it read as floating above the form",
  ).not.toMatch(/\brounded-container\b/);
  expect(cls).not.toMatch(/\bshadow-(raft-|float|sticker)/);
});

test("default keeps the panel frame", () => {
  renderCard();
  const cls = screen.getByTestId("card").className;
  expect(cls).toMatch(/\brounded-container\b/);
  expect(cls).toMatch(/\bborder-line-hairline\b/);
});

/**
 * The one that could silently fail: `text-card-title` is a custom utility, so
 * tailwind-merge does not necessarily know it conflicts with the field scale.
 * If both survive, the cascade decides and the title may still render at the
 * card-title size while the class string looks correct.
 */
test("option title drops the card-title scale entirely", () => {
  renderCard("option");
  const cls = screen.getByTestId("title").className;
  expect(cls, "option title must take the field scale").toMatch(/\btext-callout\b/);
  expect(
    cls,
    "text-card-title must be REPLACED, not merely accompanied — both surviving leaves the cascade to decide and the title can still render at the card-title size",
  ).not.toMatch(/text-card-title/);
  expect(cls).not.toMatch(/font-card-title/);
});

test("default title keeps the card-title scale", () => {
  renderCard();
  expect(screen.getByTestId("title").className).toMatch(/text-card-title/);
});

/**
 * The leading control's gap to the title must match the card's own inset, so an
 * option reads as one row rather than a control parked away from its label.
 * `gap-x-4` (16px) is panel scale; the option uses `gap-x-3` (12px), the same
 * as its 12px padding.
 */
test("option header tightens the leading gap to the card's inset", () => {
  render(
    <ThemeProvider>
      <Card variant="option">
        <CardHeader data-testid="hdr">
          <CardTitle>Fast mode</CardTitle>
        </CardHeader>
      </Card>
    </ThemeProvider>,
  );
  const cls = screen.getByTestId("hdr").className;
  expect(cls, "option header must use the 12px leading gap").toMatch(/\bgap-x-3\b/);
  expect(cls, "…the same as its inset").toMatch(/\bp-3\b/);
  expect(
    cls,
    "the 16px panel gap must be REPLACED — both surviving leaves the cascade to pick, and the control drifts from its label",
  ).not.toMatch(/\bgap-x-4\b/);
});

test("default header keeps the panel gap", () => {
  render(
    <ThemeProvider>
      <Card>
        <CardHeader data-testid="hdr">
          <CardTitle>Panel</CardTitle>
        </CardHeader>
      </Card>
    </ThemeProvider>,
  );
  expect(screen.getByTestId("hdr").className).toMatch(/\bgap-x-4\b/);
});
