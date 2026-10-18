/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { SidebarItem, SidebarItemTitle } from "./sidebar-item";

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

const classes = (element: Element) => element.className.split(/\s+/);

describe("tones", () => {
  test("the tone reaches the name: unread bold, muted ink-2, away ink-3", () => {
    render(
      <ThemeProvider>
        <SidebarItem data-testid="row" tone="muted">
          <SidebarItemTitle data-testid="title">release-review</SidebarItemTitle>
        </SidebarItem>
      </ThemeProvider>,
    );
    const row = screen.getByTestId("row");
    expect(row.getAttribute("data-tone")).toBe("muted");
    // The yellow sticker keeps its ink: the tone only applies off it.
    expect(classes(row)).toContain("not-data-active:data-[tone=muted]:text-foreground-muted");
    expect(classes(row)).toContain("not-data-active:data-[tone=away]:text-foreground-hint");
    expect(classes(screen.getByTestId("title"))).toContain(
      "group-data-[tone=unread]/sidebar-item:font-bold",
    );
  });

  test("a default row carries no tone", () => {
    render(
      <ThemeProvider>
        <SidebarItem data-testid="row">launch-week</SidebarItem>
      </ThemeProvider>,
    );
    expect(screen.getByTestId("row").hasAttribute("data-tone")).toBe(false);
  });
});

describe("interactive", () => {
  test("a row is a button that reacts to hover, press and focus", () => {
    render(
      <ThemeProvider>
        <SidebarItem>launch-week</SidebarItem>
      </ThemeProvider>,
    );
    const row = screen.getByRole("button", { name: "launch-week" });
    expect(row.getAttribute("type")).toBe("button");
    expect(classes(row)).toEqual(
      expect.arrayContaining([
        "hover:bg-fill-pressed",
        "active:bg-fill-pressed",
        "not-data-active:data-popup-open:bg-fill-pressed",
        "focus-visible:shadow-raft-focus",
      ]),
    );
  });

  test("a display-only row is a div with nothing to press", () => {
    render(
      <ThemeProvider>
        <SidebarItem data-testid="row" interactive={false} wrap>
          This Mac
        </SidebarItem>
      </ThemeProvider>,
    );
    const row = screen.getByTestId("row");
    expect(row.tagName).toBe("DIV");
    expect(row.hasAttribute("type")).toBe(false);
    expect(row.className).not.toContain("bg-fill-pressed");
    expect(row.className).not.toContain("focus-visible:shadow-raft-focus");
    expect(classes(row)).toContain("cursor-default");
    // The two-line layout still applies.
    expect(classes(row)).toContain("h-auto");
  });
});
