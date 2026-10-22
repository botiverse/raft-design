import "./mobile-nav.test.css";
/**
 * The server tab in a real layout (navigation.md, "Servers"): on a 390px
 * phone, a press and a long press open the menu, the menu rises above the tab
 * bar 8px from each side, Esc closes it and gives focus back to the tab, and a
 * long server name truncates inside the tab's fifth of the bar.
 */
import { afterEach, expect, test } from "vite-plus/test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Activity, CheckSquare, Home, Search } from "lucide-react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Avatar, AvatarFallback } from "../avatar/avatar";
import { MobileNavItem, MobileNavLabel, MobileNavRoot } from "./mobile-nav";
import {
  MobileNavServerItem,
  MobileNavServerMenu,
  MobileNavServerMenuContent,
} from "./mobile-nav-server";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const LONG_NAME = "Botiverse Research Laboratories";

function renderPhone(name = "Raft HQ") {
  render(
    <ThemeProvider>
      <div
        style={{ width: 390, height: 700, display: "flex", flexDirection: "column" }}
        className="bg-layer-page"
      >
        <div style={{ flex: 1 }} />
        <MobileNavRoot aria-label="Primary" data-testid="bar">
          <MobileNavItem selected>
            <Home />
            <MobileNavLabel>Home</MobileNavLabel>
          </MobileNavItem>
          <MobileNavItem>
            <Activity />
            <MobileNavLabel>Activity</MobileNavLabel>
          </MobileNavItem>
          <MobileNavItem>
            <CheckSquare />
            <MobileNavLabel>Tasks</MobileNavLabel>
          </MobileNavItem>
          <MobileNavItem data-testid="search">
            <Search />
            <MobileNavLabel>Search</MobileNavLabel>
          </MobileNavItem>
          <MobileNavServerMenu>
            <MobileNavServerItem aria-label={name}>
              <Avatar type="server" size="xs" data-testid="avatar">
                <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <MobileNavLabel data-testid="name">{name}</MobileNavLabel>
            </MobileNavServerItem>
            <MobileNavServerMenuContent aria-label="Servers">
              <button type="button" style={{ height: 48 }}>
                Launch Crew
              </button>
            </MobileNavServerMenuContent>
          </MobileNavServerMenu>
        </MobileNavRoot>
      </div>
    </ThemeProvider>,
  );
  return screen.getByRole("button", { name });
}

const menu = () => screen.queryByRole("dialog", { name: "Servers" });
const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function touch(tab: HTMLElement, type: "pointerdown" | "pointerup") {
  const rect = tab.getBoundingClientRect();
  tab.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      pointerType: "touch",
      isPrimary: true,
      button: 0,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + 10,
    }),
  );
}

async function tap(tab: HTMLElement) {
  await act(async () => {
    touch(tab, "pointerdown");
    touch(tab, "pointerup");
    tab.click();
    await frame();
  });
}

it("a tap opens the menu", async () => {
  const tab = renderPhone();
  expect(menu()).toBeNull();
  await tap(tab);
  expect(menu()).not.toBeNull();
});

it("a long press opens the menu, and lifting the finger keeps it open", async () => {
  const tab = renderPhone();
  await act(async () => {
    touch(tab, "pointerdown");
    await wait(300);
  });
  expect(menu()).toBeNull();
  await act(async () => {
    await wait(300);
  });
  expect(menu()).not.toBeNull();
  await act(async () => {
    touch(tab, "pointerup");
    tab.click();
    await frame();
  });
  expect(menu()).not.toBeNull();
  expect(tab.getAttribute("aria-expanded")).toBe("true");
});

it("Esc closes the menu and gives focus back to the tab", async () => {
  const tab = renderPhone();
  await tap(tab);
  const open = menu();
  expect(open).not.toBeNull();
  await act(async () => {
    await frame();
    await frame();
  });
  expect(open?.contains(document.activeElement)).toBe(true);
  await act(async () => {
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    await frame();
  });
  expect(tab.getAttribute("aria-expanded")).toBe("false");
  await act(async () => {
    await frame();
  });
  expect(document.activeElement).toBe(tab);
});

it("rises above the tab bar, 8px from each side of it and 8px above it", async () => {
  const tab = renderPhone();
  await tap(tab);
  await act(async () => {
    await frame();
    await frame();
  });
  const bar = screen.getByTestId("bar").getBoundingClientRect();
  const popup = menu()!.getBoundingClientRect();
  expect(bar.width).toBe(390);
  expect(popup.left - bar.left).toBeCloseTo(8, 0);
  expect(bar.right - popup.right).toBeCloseTo(8, 0);
  expect(bar.top - popup.bottom).toBeCloseTo(8, 0);
});

it("shows the avatar at the 22px of the other tabs' icons, and opens with the press fill", async () => {
  const tab = renderPhone();
  const icon = screen.getByTestId("search").querySelector("svg")!.getBoundingClientRect();
  const avatar = screen.getByTestId("avatar").getBoundingClientRect();
  expect(avatar.width).toBe(22);
  expect(avatar.height).toBe(22);
  expect(avatar.top).toBeCloseTo(icon.top, 0);
  const closed = getComputedStyle(tab, "::before").backgroundColor;
  await tap(tab);
  expect(getComputedStyle(tab, "::before").backgroundColor).not.toBe(closed);
});

it("truncates a long server name inside its fifth of the bar", () => {
  const tab = renderPhone(LONG_NAME);
  const name = screen.getByTestId("name");
  const search = screen.getByTestId("search").getBoundingClientRect();
  const item = tab.getBoundingClientRect();
  expect(item.width).toBeCloseTo(search.width, 0);
  expect(name.scrollWidth).toBeGreaterThan(name.clientWidth);
  expect(name.getBoundingClientRect().right).toBeLessThanOrEqual(item.right);
  expect(getComputedStyle(name).textOverflow).toBe("ellipsis");
});
