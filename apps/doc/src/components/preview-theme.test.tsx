import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PreviewThemeProvider, useResolvedPreviewMode } from "./preview-theme.tsx";
import type { StoredPreviewTheme } from "#/lib/preview-theme-storage.ts";
import { SettingsDialog } from "./settings-dialog.tsx";
import { ThemeSwitcher } from "./theme-switcher.tsx";

/**
 * The preset controls (landing footer, doc sections, playground picker) match
 * the current selection against fixed light/dark presets. After `system` became
 * the default mode, matching the raw value against those presets left the
 * landing switcher on its fallback — a brand-new visitor saw a brutal page with
 * "Elegant" highlighted, and clicking it did nothing. These tests pin the
 * resolved selection each control must use, and the settings dialog that now
 * owns the mode and the per-mode families.
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

// rui's ThemeProvider reads matchMedia unguarded, and jsdom does not implement
// it; a light baseline keeps every render working unless a test overrides it.
beforeEach(() => {
  stubSystemPreference("light");
});

const DEFAULT_STATE: StoredPreviewTheme = { mode: "system", light: "brutal", dark: "elegant" };

function Probe() {
  return <span data-testid="mode">{useResolvedPreviewMode()}</span>;
}

describe("resolved preview mode", () => {
  it("resolves a system selection against the OS preference", () => {
    const light = render(
      <PreviewThemeProvider initial={{ ...DEFAULT_STATE, light: "elegant", dark: "elegant" }}>
        <Probe />
      </PreviewThemeProvider>,
    );
    expect(light.getByTestId("mode").textContent).toBe("light");
    light.unmount();

    stubSystemPreference("dark");
    const dark = render(
      <PreviewThemeProvider initial={{ ...DEFAULT_STATE, light: "elegant", dark: "elegant" }}>
        <Probe />
      </PreviewThemeProvider>,
    );
    expect(dark.getByTestId("mode").textContent).toBe("dark");
    dark.unmount();
  });

  it("passes explicit modes through", () => {
    const view = render(
      <PreviewThemeProvider initial={{ ...DEFAULT_STATE, mode: "dark" }}>
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

  it("highlights Elegant dark for an all-elegant system selection on a dark machine", () => {
    stubSystemPreference("dark");
    render(
      <PreviewThemeProvider initial={{ mode: "system", light: "elegant", dark: "elegant" }}>
        <ThemeSwitcher />
      </PreviewThemeProvider>,
    );
    expect(screen.getByRole("radio", { name: "Elegant dark" }).getAttribute("aria-checked")).toBe(
      "true",
    );
  });
});

describe("settings dialog", () => {
  function openSettings(initial: StoredPreviewTheme = DEFAULT_STATE) {
    render(
      <PreviewThemeProvider initial={initial}>
        <SettingsDialog />
      </PreviewThemeProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
  }

  it("opens from the sidebar button with the appearance options", () => {
    openSettings();
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("radiogroup", { name: "Color mode" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "System" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("radio", { name: "Light" }).getAttribute("aria-checked")).toBe("false");
  });

  it("switches the color mode", () => {
    openSettings();
    fireEvent.click(screen.getByRole("radio", { name: "Dark" }));
    expect(screen.getByRole("radio", { name: "Dark" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("radio", { name: "System" }).getAttribute("aria-checked")).toBe(
      "false",
    );
  });

  it("offers both families for light and only elegant for dark", () => {
    openSettings();
    const lightGroup = screen.getByRole("radiogroup", { name: "Light appearance" });
    const darkGroup = screen.getByRole("radiogroup", { name: "Dark appearance" });
    expect(within(lightGroup).getByRole("radio", { name: "Brutal" })).toBeTruthy();
    expect(within(lightGroup).getByRole("radio", { name: "Elegant" })).toBeTruthy();
    expect(within(darkGroup).queryByRole("radio", { name: "Brutal" })).toBeNull();
    expect(within(darkGroup).getByRole("radio", { name: "Elegant" })).toBeTruthy();
  });

  it("draws each family card in its own theme, not the site's", () => {
    // The brutal box is square with a 2px edge while the elegant box is a rounded
    // hairline, and each carries its own `data-theme` scope so the tokens resolve
    // inside it — the dialog is portaled, so nothing may inherit from its root.
    openSettings();
    const lightGroup = screen.getByRole("radiogroup", { name: "Light appearance" });
    const darkGroup = screen.getByRole("radiogroup", { name: "Dark appearance" });
    const brutalCard = within(lightGroup).getByRole("radio", { name: "Brutal" });
    const elegantCard = within(lightGroup).getByRole("radio", { name: "Elegant" });
    const elegantDarkCard = within(darkGroup).getByRole("radio", { name: "Elegant" });

    expect(brutalCard.className).toContain("border-2");
    expect(brutalCard.className).not.toContain("rounded-md");
    expect(elegantCard.className).toContain("rounded-md");
    expect(elegantCard.className).not.toContain("border-2");

    // The themed element must BE the card that draws the ring — with the theme
    // only on a wrapper, the highlight sits outside its own scope and every
    // card paints the site's version (@Josh's measurement).
    expect(brutalCard.getAttribute("data-theme")).toBe("brutal");
    expect(elegantCard.getAttribute("data-theme")).toBe("elegant");
    expect(elegantCard.classList.contains("light")).toBe(true);
    expect(elegantDarkCard.getAttribute("data-theme")).toBe("elegant");
    expect(elegantDarkCard.classList.contains("dark")).toBe(true);
    // And the ring itself lives on that same element.
    expect(brutalCard.className).toContain("border-primary-400");
  });

  it("keeps the frames independent of the site's theme", () => {
    // Site on elegant: the brutal box must still be the brutal box.
    openSettings({ mode: "light", light: "elegant", dark: "elegant" });
    const lightGroup = screen.getByRole("radiogroup", { name: "Light appearance" });
    const brutalCard = within(lightGroup).getByRole("radio", { name: "Brutal" });
    expect(brutalCard.className).toContain("border-2");
    expect(brutalCard.getAttribute("data-theme")).toBe("brutal");
    expect(screen.getAllByText("Current")).toHaveLength(1);
  });

  it("marks the appearance that applies right now", () => {
    openSettings();
    expect(screen.getAllByText("Current")).toHaveLength(1);
  });

  it("selects a light family without touching the dark one", () => {
    openSettings();
    const lightGroup = screen.getByRole("radiogroup", { name: "Light appearance" });
    const elegantLight = within(lightGroup).getByRole("radio", { name: "Elegant" });
    fireEvent.click(elegantLight);
    expect(elegantLight.getAttribute("aria-checked")).toBe("true");
    expect(
      within(lightGroup).getByRole("radio", { name: "Brutal" }).getAttribute("aria-checked"),
    ).toBe("false");
    const darkGroup = screen.getByRole("radiogroup", { name: "Dark appearance" });
    expect(
      within(darkGroup).getByRole("radio", { name: "Elegant" }).getAttribute("aria-checked"),
    ).toBe("true");
  });
});
