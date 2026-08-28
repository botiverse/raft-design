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

function renderBanner(theme: "brutal" | "elegant", status: "warning" | "info") {
  return render(
    <ThemeProvider theme={theme}>
      <Banner status={status} data-testid="banner">
        <BannerDescription>Test</BannerDescription>
      </Banner>
    </ThemeProvider>,
  );
}

const cls = () => screen.getByTestId("banner").className;

afterEach(cleanup);

test("pending is not a valid BannerStatus", () => {
  const _check: "pending" extends BannerStatus ? never : true = true;
  expect(_check).toBe(true);
});

test("brutal warning uses orange, not yellow", () => {
  renderBanner("brutal", "warning");
  const c = cls();
  expect(c).toContain("orange");
  expect(c).not.toContain("yellow");
});

test("brutal info uses yellow, not orange or cyan", () => {
  renderBanner("brutal", "info");
  const c = cls();
  expect(c).toContain("yellow");
  expect(c).not.toContain("orange");
  expect(c).not.toContain("info-soft");
});

test("elegant warning bg hue is ~50 (orange), not ~103 or ~220", () => {
  renderBanner("elegant", "warning");
  const c = cls();
  expect(c).toMatch(/oklch\([^)]*_50[)/]/);
  expect(c).not.toMatch(/oklch\([^)]*103/);
});

test("elegant info uses info-soft and hue 220, not hue 50", () => {
  renderBanner("elegant", "info");
  const c = cls();
  expect(c).toContain("info-soft");
  expect(c).toMatch(/oklch\([^)]*220/);
  expect(c).not.toMatch(/oklch\([^)]*_50[)/]/);
});
