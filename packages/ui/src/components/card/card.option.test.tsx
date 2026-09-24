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

function renderCard(theme: "brutal" | "elegant", variant?: "default" | "option") {
  return render(
    <ThemeProvider theme={theme}>
      <Card data-testid="card" {...(variant ? { variant } : {})}>
        <CardHeader>
          <CardTitle data-testid="title">Fast mode</CardTitle>
        </CardHeader>
        <CardContent>body</CardContent>
      </Card>
    </ThemeProvider>,
  );
}

test("brutal option sits at CONTROL elevation, not panel elevation", () => {
  renderCard("brutal", "option");
  const cls = screen.getByTestId("card").className;
  expect(cls, "must use the 2px control shadow").toMatch(/\bshadow-raft-sm\b/);
  expect(
    cls,
    "must not keep the 4px panel shadow — that is what made it read as floating above the form",
  ).not.toMatch(/\bshadow-raft-md\b/);
});

test("brutal default keeps panel elevation", () => {
  renderCard("brutal");
  expect(screen.getByTestId("card").className).toMatch(/\bshadow-raft-md\b/);
});

/**
 * The one that could silently fail: `text-card-title` is a custom utility, so
 * tailwind-merge does not necessarily know it conflicts with `text-sm`. If both
 * survive, the cascade decides and the title may still render at 18px while the
 * class string looks correct.
 */
test("option title drops the card-title scale entirely", () => {
  for (const theme of ["brutal", "elegant"] as const) {
    cleanup();
    renderCard(theme, "option");
    const cls = screen.getByTestId("title").className;
    expect(cls, `${theme}: option title must take the field scale`).toMatch(/\btext-sm\b/);
    expect(
      cls,
      `${theme}: text-card-title must be REPLACED, not merely accompanied — both surviving leaves the cascade to decide and the title can still render at 18px`,
    ).not.toMatch(/text-card-title/);
  }
});

test("default title keeps the card-title scale", () => {
  renderCard("brutal");
  expect(screen.getByTestId("title").className).toMatch(/text-card-title/);
});

/**
 * The leading control's gap to the title must match the card's own inset, so an
 * option reads as one row rather than a control parked away from its label.
 * `gap-x-4` (16px) is panel scale; the option uses `gap-x-3.5` (14px), which is
 * brutal's 2px border + 12px padding (@cindyz, 2026-09-03).
 */
test("option header tightens the leading gap to the card's inset", () => {
  for (const theme of ["brutal", "elegant"] as const) {
    cleanup();
    render(
      <ThemeProvider theme={theme}>
        <Card variant="option">
          <CardHeader data-testid="hdr">
            <CardTitle>Fast mode</CardTitle>
          </CardHeader>
        </Card>
      </ThemeProvider>,
    );
    const cls = screen.getByTestId("hdr").className;
    expect(cls, `${theme}: option header must use the 14px leading gap`).toMatch(/\bgap-x-3\.5\b/);
    expect(
      cls,
      `${theme}: the 16px panel gap must be REPLACED — both surviving leaves the cascade to pick, and the control drifts from its label`,
    ).not.toMatch(/\bgap-x-4\b/);
  }
});

test("default header keeps the panel gap", () => {
  render(
    <ThemeProvider theme="brutal">
      <Card>
        <CardHeader data-testid="hdr">
          <CardTitle>Panel</CardTitle>
        </CardHeader>
      </Card>
    </ThemeProvider>,
  );
  expect(screen.getByTestId("hdr").className).toMatch(/\bgap-x-4\b/);
});
