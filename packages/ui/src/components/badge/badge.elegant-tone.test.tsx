/**
 * @vitest-environment jsdom
 *
 * Elegant primary/accent tones for Badge (task #623): the elegant solid
 * appearance reads through the soft/strong pair — no brutal-yellow/pink
 * fill — while brutal keeps its exact fills.
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Badge } from "./badge";

// jsdom ships no matchMedia; ThemeProvider reads it for system-theme detection.
if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as never;
}

afterEach(cleanup);

function renderBadge(theme: "brutal" | "elegant", variant: "primary" | "accent") {
  render(
    <ThemeProvider theme={theme}>
      <Badge variant={variant}>Staff</Badge>
    </ThemeProvider>,
  );
  const badge = screen.getByText("Staff");
  return badge.className;
}

test("elegant solid primary reads the soft/strong pair", () => {
  const cls = renderBadge("elegant", "primary");
  expect(cls).toContain("bg-primary-soft");
  expect(cls).toContain("text-primary-strong");
  expect(cls).not.toContain("bg-primary-400");
});

test("elegant solid accent reads the soft/strong pair", () => {
  const cls = renderBadge("elegant", "accent");
  expect(cls).toContain("bg-accent-soft");
  expect(cls).toContain("text-accent-strong");
  expect(cls).not.toContain("bg-accent-400");
});

test("brutal keeps the solid fills", () => {
  const primary = renderBadge("brutal", "primary");
  expect(primary).toContain("bg-primary-400");
  expect(primary).toContain("text-primary-950");
  cleanup();
  const accent = renderBadge("brutal", "accent");
  expect(accent).toContain("bg-accent-400");
  expect(accent).toContain("text-accent-950");
});
