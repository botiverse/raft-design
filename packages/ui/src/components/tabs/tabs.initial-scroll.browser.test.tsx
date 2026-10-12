import "./tabs.initial-scroll.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Tabs, TabsIndicator, TabsLabel, TabsList, TabsTab } from "./tabs";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const TABS = [
  "Weekly signups chart",
  "Release timeline",
  "Pricing comparison",
  "Latency breakdown",
];

// Base UI scrolls the active tab into view on mount and measures it with
// offsetLeft, which is only relative to the list when the list is positioned.
for (const theme of ["brutal", "elegant"] as const) {
  for (const variant of ["default", "underline"] as const) {
    it(`${theme} ${variant}: an overflowing list keeps a visible first tab at scroll 0`, () => {
      render(
        <ThemeProvider theme={theme}>
          <div style={{ position: "relative", paddingLeft: "400px" }}>
            <div style={{ width: "240px" }}>
              <Tabs defaultValue={TABS[0]}>
                <TabsList variant={variant} data-testid="list">
                  {TABS.map((tab) => (
                    <TabsTab key={tab} value={tab} className="shrink-0">
                      <TabsLabel>{tab}</TabsLabel>
                    </TabsTab>
                  ))}
                  <TabsIndicator />
                </TabsList>
              </Tabs>
            </div>
          </div>
        </ThemeProvider>,
      );
      const list = screen.getByTestId("list");
      expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);
      expect(list.scrollLeft).toBe(0);
    });
  }
}
