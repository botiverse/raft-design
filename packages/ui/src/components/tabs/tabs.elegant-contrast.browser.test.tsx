/**
 * Rendered-colour guard for the elegant tab strip (Josh's review of #404):
 * the source-classes pin in color.ladder.test.ts could not see the compound
 * winning over the theme block — this one reads computed colours, so a merge
 * regression fails here instead of on a screenshot.
 */
import "./tabs.elegant-contrast.test.css";
import { afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Tabs, TabsList, TabsTab } from "./tabs";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

beforeAll(async () => {
  if (typeof window === "undefined") return;
  // `md:` styles need a viewport; the tab strip is desktop chrome here.
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 800);
});

it("elegant unselected tabs compute to the hint tier, selected to the title tier", () => {
  render(
    <ThemeProvider theme="elegant">
      <div>
        <div data-testid="probe-hint" className="text-foreground-hint">
          probe
        </div>
        <div data-testid="probe-placeholder" className="text-foreground-placeholder">
          probe
        </div>
        <div data-testid="probe-base" className="text-foreground">
          probe
        </div>
        <Tabs defaultValue="one">
          {/* The underline variant is what the three panel strips render (ChatPanel
              L1494 / AgentDetailPanel L3065); the segmented default variant keeps
              its own foreground-active selected token — out of this scope. */}
          <TabsList variant="underline">
            <TabsTab value="one" data-testid="tab-selected">
              One
            </TabsTab>
            <TabsTab value="two" data-testid="tab-idle">
              Two
            </TabsTab>
          </TabsList>
        </Tabs>
      </div>
    </ThemeProvider>,
  );

  const color = (id: string) => getComputedStyle(screen.getByTestId(id)).color;
  const hint = color("probe-hint");
  const placeholder = color("probe-placeholder");

  expect(hint).not.toBe(placeholder);
  // Unselected rests on hint — this is the assertion the compound regression
  // broke (placeholder used to win the merge).
  expect(color("tab-idle")).toBe(hint);
  // Selected rides the same ink as panel titles (base).
  expect(color("tab-selected")).toBe(color("probe-base"));
});
