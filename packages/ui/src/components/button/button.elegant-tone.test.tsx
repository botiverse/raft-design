/**
 * @vitest-environment jsdom
 *
 * Elegant primary/accent tones (task #623): under the elegant theme the
 * primary and accent tones read through the soft/strong pair — the elegant
 * theme has no brutal-yellow/pink fill — while brutal keeps its exact
 * fills. The per-mode hover depth lives in --primary-hover/--accent-hover
 * and is asserted against foundation.css below.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "./button";

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

function renderButton(theme: "brutal" | "elegant", variant: "primary" | "accent") {
  render(
    <ThemeProvider theme={theme}>
      <Button variant={variant}>Action</Button>
    </ThemeProvider>,
  );
  return screen.getByRole("button", { name: "Action" }).className;
}

test("elegant primary reads the soft/strong pair instead of the brutal scale", () => {
  const cls = renderButton("elegant", "primary");
  expect(cls).toContain("bg-primary-soft");
  expect(cls).toContain("text-primary-strong");
  expect(cls).not.toContain("bg-primary-400");
  expect(cls).not.toContain("text-primary-950");
});

test("elegant accent reads the soft/strong pair instead of the brutal scale", () => {
  const cls = renderButton("elegant", "accent");
  expect(cls).toContain("bg-accent-soft");
  expect(cls).toContain("text-accent-strong");
  expect(cls).not.toContain("bg-accent-400");
  expect(cls).not.toContain("text-accent-950");
});

test("brutal keeps its own fills (not the elegant soft pair)", () => {
  // The brutal compounds map the tones to the brutal palette; the tone
  // table itself is covered by button.brutal-tone.test.tsx.
  const primary = renderButton("brutal", "primary");
  expect(primary).toContain("bg-brutal-yellow");
  expect(primary).not.toContain("bg-primary-soft");
  cleanup();
  const accent = renderButton("brutal", "accent");
  expect(accent).toContain("bg-brutal-pink");
  expect(accent).not.toContain("bg-accent-soft");
});

test("the elegant hover wash deepens the soft pair per mode", () => {
  const css = readFileSync(resolve(import.meta.dirname, "../../foundation.css"), "utf8");

  const light = css.slice(
    css.indexOf('[data-theme="elegant"] {'),
    css.indexOf('[data-theme="elegant"].light'),
  );
  expect(light).toContain(
    "--primary-hover: color-mix(in srgb-linear, var(--primary-soft) 88%, var(--primary-strong))",
  );
  expect(light).toContain(
    "--accent-hover: color-mix(in srgb-linear, var(--accent-soft) 88%, var(--accent-strong))",
  );

  const dark = css.slice(
    css.indexOf('[data-theme="elegant"].dark {'),
    css.indexOf('[data-theme="elegant"]:not(.light):not(.dark)'),
  );
  expect(dark).toContain(
    "--primary-hover: color-mix(in srgb-linear, var(--primary-soft) 78%, var(--primary-strong))",
  );
  expect(dark).toContain(
    "--accent-hover: color-mix(in srgb-linear, var(--accent-soft) 78%, var(--accent-strong))",
  );
});
