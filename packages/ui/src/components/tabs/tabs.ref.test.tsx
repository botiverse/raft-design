/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { SortableTabsList, SortableTabsTab, Tabs, TabsList, TabsTab } from "./tabs";

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

afterEach(cleanup);

// TabsTabButton composes the caller's ref with dnd-kit's setNodeRef. An
// earlier spread order let a caller ref silently replace the sortable
// registration and kill dragging; these pin that the caller ref keeps working
// on both the plain and the sortable path.

test("plain TabsTab still delivers the caller's ref", () => {
  let node: HTMLElement | null = null;
  render(
    <ThemeProvider theme="elegant">
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTab
            value="a"
            ref={(el) => {
              node = el;
            }}
          >
            Tab A
          </TabsTab>
        </TabsList>
      </Tabs>
    </ThemeProvider>,
  );
  expect(node).toBe(screen.getByRole("tab", { name: "Tab A" }));
});

test("sortable TabsTab still delivers the caller's ref", () => {
  let node: HTMLElement | null = null;
  render(
    <ThemeProvider theme="elegant">
      <Tabs defaultValue="a">
        <SortableTabsList value={["a", "b"]} onReorder={() => {}}>
          <SortableTabsTab
            value="a"
            ref={(el) => {
              node = el;
            }}
          >
            Tab A
          </SortableTabsTab>
          <SortableTabsTab value="b">Tab B</SortableTabsTab>
        </SortableTabsList>
      </Tabs>
    </ThemeProvider>,
  );
  expect(node).toBe(screen.getByRole("tab", { name: "Tab A" }));
});
