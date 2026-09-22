/**
 * @vitest-environment jsdom
 *
 * `TabsList variant="primary"` (Artea, slock Mermaid toolbar "图表 / 代码"):
 * elegant marks the active tab with the primary fill, like a primary Button.
 * Brutal already fills the active tab with primary, so the variant only
 * changes elegant; `default` stays the neutral pill.
 */
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Tabs, TabsBackground, TabsList, TabsTab } from "./tabs";

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

function renderTabs(variant: "default" | "primary") {
  return render(
    <ThemeProvider theme="elegant">
      <Tabs defaultValue="diagram">
        <TabsList variant={variant}>
          <TabsBackground />
          <TabsTab value="diagram">Diagram</TabsTab>
          <TabsTab value="code">Code</TabsTab>
        </TabsList>
      </Tabs>
    </ThemeProvider>,
  );
}

const classes = (el: Element | null) => [...(el?.classList ?? [])];

describe("TabsList variant=primary (elegant)", () => {
  test("the active indicator uses the primary fill and drops the neutral ring", () => {
    const { container } = renderTabs("primary");
    const indicator = container.querySelector('[data-slot="tabs-indicator"]');
    expect(classes(indicator)).toEqual(
      expect.arrayContaining(["bg-primary-400", "dark:bg-primary-400"]),
    );
    expect(classes(indicator)).not.toContain("bg-layer-panel");
    expect(classes(indicator)).not.toContain("dark:bg-fill-muted");
  });

  test("tabs carry primary-contrast text for the active state", () => {
    const { container } = renderTabs("primary");
    const tab = container.querySelector('[data-slot="tabs-tab"]');
    expect(classes(tab)).toContain("data-active:text-primary-950");
    expect(classes(tab)).not.toContain("data-active:text-foreground-active");
  });

  test("default keeps the neutral pill", () => {
    const { container } = renderTabs("default");
    const indicator = container.querySelector('[data-slot="tabs-indicator"]');
    expect(classes(indicator)).toContain("bg-layer-panel");
    expect(classes(indicator)).not.toContain("bg-primary-400");
  });
});
