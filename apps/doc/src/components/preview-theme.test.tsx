import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PreviewThemeProvider, useResolvedPreviewMode } from "./preview-theme.tsx";
import { ModeSwitcher, ThemeSwitcher } from "./theme-switcher.tsx";

/**
 * The preset controls (landing footer, doc sections, playground picker) match
 * the current selection against fixed light/dark presets. After `system` became
 * the default mode, matching the raw value against those presets left the
 * landing switcher on its fallback — a brand-new visitor saw a brutal page with
 * "Elegant" highlighted, and clicking it did nothing. These tests pin the
 * resolved selection each control must use.
 */
function stubSystemPreference(prefers: "light" | "dark") {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: prefers === "dark" && query === "(prefers-color-scheme: dark)",
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function Probe() {
  return <span data-testid="mode">{useResolvedPreviewMode()}</span>;
}

describe("resolved preview mode", () => {
  it("resolves a system selection against the OS preference", () => {
    const light = render(
      <PreviewThemeProvider initial={{ theme: "elegant", mode: "system" }}>
        <Probe />
      </PreviewThemeProvider>,
    );
    expect(light.getByTestId("mode").textContent).toBe("light");
    light.unmount();

    stubSystemPreference("dark");
    const dark = render(
      <PreviewThemeProvider initial={{ theme: "elegant", mode: "system" }}>
        <Probe />
      </PreviewThemeProvider>,
    );
    expect(dark.getByTestId("mode").textContent).toBe("dark");
    dark.unmount();
  });

  it("passes explicit modes through", () => {
    const view = render(
      <PreviewThemeProvider initial={{ theme: "elegant", mode: "dark" }}>
        <Probe />
      </PreviewThemeProvider>,
    );
    expect(view.getByTestId("mode").textContent).toBe("dark");
  });
});

describe("preview preset switcher", () => {
  it("highlights Brutal for a brand-new visitor (brutal + system)", () => {
    render(
      <PreviewThemeProvider>
        <ThemeSwitcher />
      </PreviewThemeProvider>,
    );
    expect(screen.getByRole("radio", { name: "Brutal" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("radio", { name: "Elegant" }).getAttribute("aria-checked")).toBe(
      "false",
    );
  });

  it("highlights Elegant dark for a stored elegant system selection on a dark machine", () => {
    stubSystemPreference("dark");
    render(
      <PreviewThemeProvider initial={{ theme: "elegant", mode: "system" }}>
        <ThemeSwitcher />
      </PreviewThemeProvider>,
    );
    expect(screen.getByRole("radio", { name: "Elegant dark" }).getAttribute("aria-checked")).toBe(
      "true",
    );
  });
});

describe("mode switcher", () => {
  it("keeps dark and system disabled while the family is brutal", () => {
    render(
      <PreviewThemeProvider>
        <ModeSwitcher />
      </PreviewThemeProvider>,
    );
    expect(screen.getByRole("radio", { name: "Light" }).getAttribute("aria-checked")).toBe("true");
    expect((screen.getByRole("radio", { name: "Dark" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("radio", { name: "System" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it("enables all three choices on elegant", () => {
    stubSystemPreference("dark");
    render(
      <PreviewThemeProvider initial={{ theme: "elegant", mode: "system" }}>
        <ModeSwitcher />
      </PreviewThemeProvider>,
    );
    expect(screen.getByRole("radio", { name: "System" }).getAttribute("aria-checked")).toBe("true");
    expect((screen.getByRole("radio", { name: "Dark" }) as HTMLButtonElement).disabled).toBe(false);
  });
});
