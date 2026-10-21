/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Drawer, DrawerContent, DrawerHeader } from "../drawer/drawer";
import { Button } from "../button/button";
import { PanelAction } from "./panel-action";
import { PanelHeader } from "./panel-header";

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

// Every head pads both sides by the content margin (20, 16 on a phone) and
// pulls its first and last frameless icon button out by its icon inset, so the
// icon box lands on the margin and the two ends mirror. A filled thing declares
// no inset and puts its shape on the margin. Positions are measured in
// head-edges.browser.test.tsx; these pin the shared tokens.
const EDGES = [
  "px-5",
  "max-md:px-4",
  "[&>[data-icon-inset]:first-child]:-ml-icon-inset",
  "[&>[data-icon-inset]:last-child]:-mr-icon-inset",
];

test("a raft head pads by the content margin and pulls both edge buttons by their inset", () => {
  render(
    <ThemeProvider>
      <PanelHeader data-testid="head" />
    </ThemeProvider>,
  );
  const classes = screen.getByTestId("head").className.split(/\s+/);
  for (const token of EDGES) expect(classes).toContain(token);
  expect(classes).not.toContain("max-md:pr-1.5");
  expect(classes).not.toContain("max-md:[&>[data-slot=panel-action]:first-child]:-ml-[13px]");
});

test("a frameless icon button declares its inset; a filled one does not", () => {
  render(
    <ThemeProvider>
      <PanelAction data-testid="action" aria-label="Back" />
      <Button data-testid="ghost" variant="ghost" size="icon-md" aria-label="Close" />
      <Button data-testid="filled" variant="primary" size="icon-lg" aria-label="Add" />
    </ThemeProvider>,
  );
  expect(screen.getByTestId("action").hasAttribute("data-icon-inset")).toBe(true);
  expect(screen.getByTestId("ghost").hasAttribute("data-icon-inset")).toBe(true);
  expect(screen.getByTestId("filled").hasAttribute("data-icon-inset")).toBe(false);
});

test("a raft side sheet's head takes the panel head's edges", () => {
  render(
    <ThemeProvider>
      <Drawer open swipeDirection="right">
        <DrawerContent>
          <DrawerHeader data-testid="sheet-head" />
        </DrawerContent>
      </Drawer>
    </ThemeProvider>,
  );
  const classes = screen.getByTestId("sheet-head").className.split(/\s+/);
  for (const token of EDGES) expect(classes).toContain(token);
});
