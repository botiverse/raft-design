/**
 * @vitest-environment jsdom
 *
 * Submenu triggers carry a default right chevron.
 *
 * The raft-ui submenu trigger used to be a bare Base UI passthrough, so "this row
 * opens a submenu" had no visual affordance unless the caller hand-added an
 * icon (as one admin menu did). The indicator mirrors the checkbox/radio
 * item indicators: `indicator` recipe slot, right-aligned, aria-hidden.
 */
import { afterEach, describe, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSubmenu,
  DropdownMenuSubmenuTrigger,
} from "./dropdown-menu";

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

describe("DropdownMenuSubmenuTrigger", () => {
  test("renders exactly one aria-hidden chevron indicator inside the trigger", () => {
    render(
      <ThemeProvider defaultMode="light">
        <DropdownMenu defaultOpen>
          <DropdownMenuContent>
            <DropdownMenuSubmenu>
              <DropdownMenuSubmenuTrigger>Appearance</DropdownMenuSubmenuTrigger>
              <DropdownMenuContent />
            </DropdownMenuSubmenu>
          </DropdownMenuContent>
        </DropdownMenu>
      </ThemeProvider>,
    );

    const trigger = screen
      .getByText("Appearance")
      .closest('[data-slot="dropdown-menu-submenu-trigger"]');
    expect(trigger).not.toBeNull();

    const indicators = trigger!.querySelectorAll(
      '[data-slot="dropdown-menu-submenu-trigger-indicator"]',
    );
    expect(indicators.length).toBe(1);
    const indicator = indicators[0] as HTMLElement;
    expect(indicator.getAttribute("aria-hidden")).toBe("true");
    expect(indicator.className).toContain("ml-auto");

    const svg = indicator.querySelector("svg");
    expect(svg).not.toBeNull();
    const path = svg!.querySelector("path");
    expect(path).not.toBeNull();
    expect(path!.getAttribute("d")).toBe("M4.25 2.5L7.75 6l-3.5 3.5");
  });
});
