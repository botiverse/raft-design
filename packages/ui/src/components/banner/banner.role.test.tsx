/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Banner, BannerDescription, type BannerStatus } from "./banner";

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

// role="alert" is assertive: it interrupts whatever a screen reader is saying.
// Only destructive banners earn that; informational banners use the polite
// role="status" instead.

function renderBanner(status: BannerStatus) {
  return render(
    <ThemeProvider theme="elegant">
      <Banner status={status} data-testid="banner">
        <BannerDescription>Test</BannerDescription>
      </Banner>
    </ThemeProvider>,
  );
}

test("destructive banners render role=alert", () => {
  renderBanner("destructive");
  expect(screen.getByTestId("banner").getAttribute("role")).toBe("alert");
});

test.each(["default", "warning", "info", "success"] as const)(
  "%s banners render the polite role=status",
  (status) => {
    renderBanner(status);
    expect(screen.getByTestId("banner").getAttribute("role")).toBe("status");
  },
);
