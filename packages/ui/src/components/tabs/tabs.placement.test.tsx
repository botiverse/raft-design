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

  it("puts the Elegant underline indicator on the side facing the panels", () => {
    const sides = { top: "bottom-0", bottom: "top-0", left: "right-0", right: "left-0" } as const;
    for (const [placement, side] of Object.entries(sides)) {
      const { unmount } = render(
        <ThemeProvider theme="elegant" syncDom={false}>
          <Tabs defaultValue="one" placement={placement as TabsPlacement}>
            <TabsList variant="underline">
              <TabsTab value="one">One</TabsTab>
            </TabsList>
          </Tabs>
        </ThemeProvider>,
      );
      const indicator = document.querySelector('[data-slot="tabs-indicator"]');
      expect(indicator?.className.split(" ")).toContain(side);
      unmount();
    }
  });
});
