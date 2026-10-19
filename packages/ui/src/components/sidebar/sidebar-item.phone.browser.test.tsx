import "./sidebar-item.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { SidebarItem, SidebarItemTitle } from "./sidebar-item";

// Below md a sidebar row is a phone list of places (Home, Members, the
// Settings list): at least 44px for a finger, on its own. The Settings list
// sat at 36px on phones because this size lived in one product class that
// only Home's rows were given. Measured in a real browser; jsdom has no layout.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

async function viewport(width: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, 800);
}

function rowHeight() {
  render(
    <ThemeProvider>
      <SidebarItem data-testid="row">
        <SidebarItemTitle>Appearance</SidebarItemTitle>
      </SidebarItem>
    </ThemeProvider>,
  );
  return screen.getByTestId("row").getBoundingClientRect().height;
}

it("on a phone a row is 44px", async () => {
  await viewport(390);
  expect(rowHeight()).toBe(44);
});

it("CONTROL: on a desktop the same row stays 36px", async () => {
  await viewport(1280);
  expect(rowHeight()).toBe(36);
});

it("on a phone the name is set in 16/24 at 600", async () => {
  await viewport(390);
  render(
    <ThemeProvider>
      <SidebarItem data-testid="row">
        <SidebarItemTitle>Appearance</SidebarItemTitle>
      </SidebarItem>
    </ThemeProvider>,
  );
  const style = getComputedStyle(screen.getByTestId("row"));
  expect(style.fontSize).toBe("16px");
  expect(style.lineHeight).toBe("24px");
  expect(style.fontWeight).toBe("600");
});

// A phone on its side is both narrow and short. The short-window rules are
// for a short desktop window, so on a phone the phone size must win, for a
// wrapping row as much as a one-line one.
it("on a phone on its side, a wrapping row keeps the phone padding", async () => {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(667, 375);
  render(
    <ThemeProvider>
      <SidebarItem data-testid="row" wrap>
        <SidebarItemTitle>A pinned channel</SidebarItemTitle>
      </SidebarItem>
    </ThemeProvider>,
  );
  const row = screen.getByTestId("row");
  expect(getComputedStyle(row).paddingTop).toBe("8.5px");
  expect(row.getBoundingClientRect().height).toBe(44);
});
