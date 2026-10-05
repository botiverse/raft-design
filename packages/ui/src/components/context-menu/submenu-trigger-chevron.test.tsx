/**
 * @vitest-environment jsdom
 *
 * Context-menu submenu triggers carry the same default right chevron as the
 * dropdown menu (artin, #proj-hands:a223c242; see the dropdown-menu sibling
 * test for the full rationale).
 */
import { afterEach, describe, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuSubmenu,
  ContextMenuSubmenuTrigger,
} from "./context-menu";

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

describe.each(["elegant", "brutal"] as const)("ContextMenuSubmenuTrigger (%s)", (theme) => {
  test("renders exactly one aria-hidden chevron indicator inside the trigger", () => {
    render(
      <ThemeProvider defaultTheme={theme} defaultMode="light">
        <ContextMenu defaultOpen>
          <ContextMenuContent>
            <ContextMenuSubmenu>
              <ContextMenuSubmenuTrigger>Move to</ContextMenuSubmenuTrigger>
              <ContextMenuContent />
            </ContextMenuSubmenu>
          </ContextMenuContent>
        </ContextMenu>
      </ThemeProvider>,
    );

    const trigger = screen
      .getByText("Move to")
      .closest('[data-slot="context-menu-submenu-trigger"]');
    expect(trigger).not.toBeNull();
    const indicators = trigger!.querySelectorAll(
      '[data-slot="context-menu-submenu-trigger-indicator"]',
    );
    expect(indicators.length).toBe(1);
    expect(indicators[0]!.getAttribute("aria-hidden")).toBe("true");
  });
});
