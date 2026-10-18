/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Drawer, DrawerContent, DrawerHeader } from "../drawer/drawer";
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

// Phone heads: a filled thing puts its shape on 16; the two ghost edge buttons
// overhang and mirror each other, 3px from their edges.
test("a raft phone head starts on 16 and mirrors a leading Back with the last action", () => {
  render(
    <ThemeProvider theme="raft">
      <PanelHeader data-testid="head" />
    </ThemeProvider>,
  );
  const classes = screen.getByTestId("head").className.split(/\s+/);
  expect(classes).toContain("max-md:pl-4");
  expect(classes).toContain("max-md:pr-1.5");
  expect(classes).toContain("max-md:[&>[data-slot=panel-action]:first-child]:-ml-[13px]");
});

test("a filled Button straight in a raft head ends its shape on the content edge", () => {
  render(
    <ThemeProvider theme="raft">
      <PanelHeader data-testid="head" />
    </ThemeProvider>,
  );
  const classes = screen.getByTestId("head").className.split(/\s+/);
  expect(classes).toContain("[&>[data-slot=button]:last-child]:mr-2");
  expect(classes).toContain("max-md:[&>[data-slot=button]:last-child]:mr-2.5");
});

test("a raft side sheet's head takes the panel head's phone edges", () => {
  render(
    <ThemeProvider theme="raft">
      <Drawer open swipeDirection="right">
        <DrawerContent>
          <DrawerHeader data-testid="sheet-head" />
        </DrawerContent>
      </Drawer>
    </ThemeProvider>,
  );
  const classes = screen.getByTestId("sheet-head").className.split(/\s+/);
  expect(classes).toContain("pl-5");
  expect(classes).toContain("max-md:pl-4");
  expect(classes).toContain("max-md:pr-1.5");
  expect(classes).toContain("max-md:[&>[data-slot=panel-action]:first-child]:-ml-[13px]");
});
