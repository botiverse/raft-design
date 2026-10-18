/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeAll, describe, expect, it } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Tabs, TabsList, TabsPanel, TabsTab } from "./tabs";
import type { TabsPlacement } from "./tabs";

afterEach(cleanup);

beforeAll(() => {
  window.matchMedia ??= ((query: string) =>
    ({
      matches: false,
      media: query,
      addEventListener() {},
      removeEventListener() {},
    }) as unknown as MediaQueryList) as typeof window.matchMedia;
});

function Example({
  placement,
  orientation,
}: {
  placement?: TabsPlacement;
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <Tabs defaultValue="one" placement={placement} orientation={orientation}>
      <TabsList>
        <TabsTab value="one">One</TabsTab>
        <TabsTab value="two">Two</TabsTab>
      </TabsList>
      <TabsPanel value="one">Panel one</TabsPanel>
      <TabsPanel value="two">Panel two</TabsPanel>
    </Tabs>
  );
}

describe("Tabs placement", () => {
  it("defaults to top and a horizontal list", () => {
    render(<Example />);
    expect(document.querySelector('[data-slot="tabs"]')?.getAttribute("data-placement")).toBe(
      "top",
    );
    expect(screen.getByRole("tablist").getAttribute("data-orientation")).toBe("horizontal");
  });

  it.each(["left", "right"] as const)("makes the list vertical for %s", (placement) => {
    render(<Example placement={placement} />);
    const list = screen.getByRole("tablist");
    expect(list.getAttribute("data-orientation")).toBe("vertical");
    expect(list.getAttribute("data-placement")).toBe(placement);
    expect(list.className).toContain("flex-col");
  });

  it("keeps bottom horizontal and moves the list after the panels", () => {
    render(<Example placement="bottom" />);
    const list = screen.getByRole("tablist");
    expect(list.getAttribute("data-orientation")).toBe("horizontal");
    expect(list.className).toContain("order-last");
  });

  it("lets an explicit orientation win over the placement default", () => {
    render(<Example placement="left" orientation="horizontal" />);
    expect(screen.getByRole("tablist").getAttribute("data-orientation")).toBe("horizontal");
  });

  it("puts the underline on the side facing the panels", () => {
    // The underline is the selected tab's own inset edge (no indicator part).
    const edges = {
      top: "data-active:shadow-[inset_0_-2px_0_var(--foreground)]",
      bottom: "data-active:shadow-[inset_0_2px_0_var(--foreground)]",
      left: "data-active:shadow-[inset_-2px_0_0_var(--foreground)]",
      right: "data-active:shadow-[inset_2px_0_0_var(--foreground)]",
    } as const;
    for (const [placement, edge] of Object.entries(edges)) {
      const { unmount } = render(
        <ThemeProvider syncDom={false}>
          <Tabs defaultValue="one" placement={placement as TabsPlacement}>
            <TabsList variant="underline">
              <TabsTab value="one">One</TabsTab>
            </TabsList>
          </Tabs>
        </ThemeProvider>,
      );
      const tab = screen.getByRole("tab");
      expect(tab.hasAttribute("data-active")).toBe(true);
      expect(tab.className.split(" "), placement).toContain(edge);
      for (const other of Object.values(edges)) {
        if (other !== edge) expect(tab.className.split(" "), placement).not.toContain(other);
      }
      unmount();
    }
  });
});
