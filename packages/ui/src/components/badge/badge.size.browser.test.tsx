import "./badge.test.css";
/**
 * Browser-mode check of the Badge `size` axis: what a person sees is the box
 * height, so that is what is measured. jsdom has no layout and cannot.
 *
 * Run: `vp test --browser.enabled=true src/components/badge/badge.size.browser.test.tsx`
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Badge } from "./badge";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

function heights(theme: "brutal" | "elegant") {
  render(
    <ThemeProvider theme={theme}>
      <Badge data-testid="default">docs</Badge>
      <Badge size="sm" data-testid="sm">
        docs
      </Badge>
      <Badge size="md" data-testid="md">
        docs
      </Badge>
      <Badge size="md" appearance="outline" data-testid="md-icon">
        <svg width="11" height="11" aria-hidden="true" />
        docs
      </Badge>
    </ThemeProvider>,
  );
  const h = (id: string) => screen.getByTestId(id).getBoundingClientRect().height;
  return { default: h("default"), sm: h("sm"), md: h("md"), mdIcon: h("md-icon") };
}

for (const theme of ["brutal", "elegant"] as const) {
  it(`${theme}: md is a 24px box, taller than sm; sm is the default and unchanged`, () => {
    const h = heights(theme);
    expect(h.sm).toBe(h.default);
    expect(h.sm).toBe(theme === "brutal" ? 20 : 18);
    expect(h.md).toBe(24);
    expect(h.mdIcon).toBe(24);
  });
}

it("md is reported on the root for styling and tests", () => {
  render(
    <ThemeProvider theme="elegant">
      <Badge data-testid="a">a</Badge>
      <Badge size="md" data-testid="b">
        b
      </Badge>
    </ThemeProvider>,
  );
  expect(screen.getByTestId("a").getAttribute("data-size")).toBe("sm");
  expect(screen.getByTestId("b").getAttribute("data-size")).toBe("md");
});
