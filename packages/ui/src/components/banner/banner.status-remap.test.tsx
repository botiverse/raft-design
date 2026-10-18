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

function renderBanner(status: "warning" | "info") {
  return render(
    <ThemeProvider>
      <Banner status={status} data-testid="banner">
        <BannerDescription>Test</BannerDescription>
      </Banner>
    </ThemeProvider>,
  );
}

const cls = () => screen.getByTestId("banner").className.split(/\s+/);

afterEach(cleanup);

test("pending is not a valid BannerStatus", () => {
  const _check: "pending" extends BannerStatus ? never : true = true;
  expect(_check).toBe(true);
});

test("warning takes the warning wash, not info's", () => {
  renderBanner("warning");
  const c = cls();
  expect(c).toContain("bg-warning-soft");
  expect(c).not.toContain("bg-info-soft");
});

test("info takes the info wash, not warning's", () => {
  renderBanner("info");
  const c = cls();
  expect(c).toContain("bg-info-soft");
  expect(c).not.toContain("bg-warning-soft");
});

// --- ghost indent fix (grid) ---

function renderWithAction(status: "warning" | "info") {
  return render(
    <ThemeProvider>
      <Banner status={status} data-testid="banner">
        <BannerDescription data-testid="desc">Test</BannerDescription>
        <BannerAction data-testid="action">
          <button type="button">X</button>
        </BannerAction>
      </Banner>
    </ThemeProvider>,
  );
}

test("root base grid has no zero-width phantom column", () => {
  renderWithAction("warning");
  expect(cls().join(" ")).not.toMatch(/grid-cols-\[0[_ ]/);
});

test("description column follows the lead parts through the shared variable", () => {
  renderWithAction("warning");
  const desc = screen.getByTestId("desc").className.split(/\s+/);
  // The description reads the variable the root sets when an icon/status slot
  // is present; it no longer carries an ancestor :has() shape itself (#386).
  expect(desc).toContain("col-start-(--banner-text-col,1)");
  expect(desc.some((c) => c.includes("group-has"))).toBe(false);
  const root = cls();
  expect(root).toContain("has-[>svg]:[--banner-text-col:2]");
  expect(root).toContain("has-[>[data-slot=status]]:[--banner-text-col:2]");
});

// --- inline button colour (warning description) ---

function renderWithInlineButton() {
  return render(
    <ThemeProvider>
      <Banner status="warning" data-testid="banner">
        <BannerDescription data-testid="desc">
          Text <button type="button">Link</button>
        </BannerDescription>
      </Banner>
    </ThemeProvider>,
  );
}

const descCls = () => screen.getByTestId("desc").className;

test("warning description sets ink text and no button colour override", () => {
  // The description is ink like the buttons inside it, so an inline button
  // keeps its own colour.
  renderWithInlineButton();
  expect(descCls().split(/\s+/)).toContain("text-foreground");
  expect(descCls()).not.toContain("text-current");
});

test("warning root does NOT blanket-override all button colors", () => {
  renderWithInlineButton();
  const blanketButtonColor = cls().filter(
    (c) => c.includes("button") && c.includes("text-current"),
  );
  expect(blanketButtonColor).toHaveLength(0);
});

// --- multi-action wrapping ---

test("several actions wrap on their own row under the text", () => {
  render(
    <ThemeProvider>
      <Banner status="warning" data-testid="banner">
        <BannerDescription>Test</BannerDescription>
        <BannerAction data-testid="action">
          <button type="button">A</button>
          <button type="button">B</button>
        </BannerAction>
      </Banner>
    </ThemeProvider>,
  );
  const classes = screen.getByTestId("action").className.split(/\s+/);
  expect(classes).toContain("flex-wrap");
  expect(classes).toContain("col-start-(--banner-text-col,1)");
});
