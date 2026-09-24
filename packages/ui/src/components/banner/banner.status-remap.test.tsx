/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Banner, BannerAction, BannerDescription } from "./banner";
import type { BannerStatus } from "./banner";

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

// --- ghost indent fix (brutal grid) ---

function renderWithAction(theme: "brutal" | "elegant", status: "warning" | "info") {
  return render(
    <ThemeProvider theme={theme}>
      <Banner status={status} data-testid="banner">
        <BannerDescription data-testid="desc">Test</BannerDescription>
        <BannerAction data-testid="action">
          <button type="button">X</button>
        </BannerAction>
      </Banner>
    </ThemeProvider>,
  );
}

test("brutal root base grid has no zero-width phantom column", () => {
  renderWithAction("brutal", "warning");
  const c = cls();
  expect(c).not.toMatch(/grid-cols-\[0[_ ]/);
});

test("brutal description col-start-2 is conditional on icon or status-slot presence", () => {
  renderWithAction("brutal", "warning");
  const classes = screen.getByTestId("desc").className.split(/\s+/);
  const colStart2 = classes.filter((c) => c.includes("col-start-2"));
  expect(colStart2.length).toBeGreaterThan(0);
  for (const c of colStart2) {
    expect(c).toMatch(/group-has/);
  }
});

// --- inline button color (elegant warning description) ---

function renderWithInlineButton(theme: "brutal" | "elegant") {
  return render(
    <ThemeProvider theme={theme}>
      <Banner status="warning" data-testid="banner">
        <BannerDescription data-testid="desc">
          Text <button type="button">Link</button>
        </BannerDescription>
      </Banner>
    </ThemeProvider>,
  );
}

const descCls = () => screen.getByTestId("desc").className;

test("elegant warning description carries button color override", () => {
  renderWithInlineButton("elegant");
  expect(descCls()).toContain("text-current");
});

test("brutal warning description does NOT carry button color override", () => {
  renderWithInlineButton("brutal");
  expect(descCls()).not.toContain("text-current");
});

test("elegant warning root does NOT blanket-override all button colors", () => {
  renderWithInlineButton("elegant");
  const rootClasses = cls().split(/\s+/);
  const blanketButtonColor = rootClasses.filter(
    (c) => c.includes("button") && c.includes("text-current"),
  );
  expect(blanketButtonColor).toHaveLength(0);
});

// --- narrow multi-action wrapping ---

function renderMultiAction(theme: "brutal" | "elegant") {
  return render(
    <ThemeProvider theme={theme}>
      <Banner status="warning" data-testid="banner">
        <BannerDescription>Test</BannerDescription>
        <BannerAction data-testid="action">
          <button type="button">A</button>
          <button type="button">B</button>
        </BannerAction>
      </Banner>
    </ThemeProvider>,
  );
}

const actionCls = () => screen.getByTestId("action").className;

test("brutal action has narrow-container wrapping utilities", () => {
  renderMultiAction("brutal");
  const classes = actionCls().split(/\s+/);
  const wrapping = classes.filter((c) => c.includes("@max-[24rem]"));
  expect(wrapping.length).toBeGreaterThan(0);
});

test("elegant action has narrow-container wrapping utilities", () => {
  renderMultiAction("elegant");
  const classes = actionCls().split(/\s+/);
  const wrapping = classes.filter((c) => c.includes("@max-[24rem]"));
  expect(wrapping.length).toBeGreaterThan(0);
});
