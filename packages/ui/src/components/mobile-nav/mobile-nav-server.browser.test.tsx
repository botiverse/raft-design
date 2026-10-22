import "./mobile-nav.test.css";
/**
 * The server tab in a real layout (navigation.md, "Servers"): on a 390px
 * phone, a press and a long press open the menu, the menu rises above the tab
 * bar 8px from each side, Esc closes it and gives focus back to the tab, and a
 * long server name truncates inside the tab's fifth of the bar.
 */
import { afterEach, expect, test } from "vite-plus/test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Activity, CheckSquare, Home, Monitor, Plus, Search, Settings, Users } from "lucide-react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Avatar, AvatarFallback } from "../avatar/avatar";
import { Status } from "../status/status";
import { MobileNavItem, MobileNavLabel, MobileNavRoot } from "./mobile-nav";
import { PopoverSeparator } from "../popover/popover";
import {
  MobileNavServerItem,
  MobileNavServerPopover,
  MobileNavServerPopoverContent,
  MobileNavServerPopoverDestination,
  MobileNavServerPopoverDestinations,
  MobileNavServerPopoverGroup,
  MobileNavServerPopoverList,
  MobileNavServerPopoverRow,
  MobileNavServerPopoverRowLabel,
} from "./mobile-nav-server";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const LONG_NAME = "Botiverse Research Laboratories";

function renderPhone(name = "Raft HQ", servers = 1) {
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
          <MobileNavServerPopover>
            <MobileNavServerItem aria-label={name}>
              <Avatar type="server" size="xs" data-testid="avatar">
                <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <MobileNavLabel data-testid="name">{name}</MobileNavLabel>
            </MobileNavServerItem>
            <MobileNavServerPopoverContent aria-label="Servers">
              <MobileNavServerPopoverList data-testid="list">
                {Array.from({ length: servers }, (_, index) => (
                  <MobileNavServerPopoverRow key={index} data-testid="row">
                    <Avatar type="server" size="xs" data-testid="row-avatar">
                      <AvatarFallback>S</AvatarFallback>
                    </Avatar>
                    <MobileNavServerPopoverRowLabel>
                      Server {index + 1}
                    </MobileNavServerPopoverRowLabel>
                  </MobileNavServerPopoverRow>
                ))}
              </MobileNavServerPopoverList>
              <PopoverSeparator />
              <MobileNavServerPopoverDestinations aria-label={name} data-testid="destinations">
                <MobileNavServerPopoverDestination>
                  <Users />
                  <span>Members</span>
                </MobileNavServerPopoverDestination>
                <MobileNavServerPopoverDestination>
                  <Monitor data-testid="computers-icon" />
                  <span>Computers</span>
                  <Status aria-hidden variant="accent" size="sm" data-testid="computers-dot" />
                </MobileNavServerPopoverDestination>
                <MobileNavServerPopoverDestination>
                  <Settings />
                  <span>Settings</span>
                </MobileNavServerPopoverDestination>
              </MobileNavServerPopoverDestinations>
              <PopoverSeparator />
              <MobileNavServerPopoverGroup data-testid="footer">
                <MobileNavServerPopoverRow>
                  <Plus />
                  <MobileNavServerPopoverRowLabel>
                    Switch or Create Server
                  </MobileNavServerPopoverRowLabel>
                </MobileNavServerPopoverRow>
              </MobileNavServerPopoverGroup>
            </MobileNavServerPopoverContent>
          </MobileNavServerPopover>
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

async function openMenu(servers: number) {
  const tab = renderPhone("Raft HQ", servers);
  await tap(tab);
  await act(async () => {
    await frame();
    await frame();
  });
  return menu()!;
}

it("puts each server on one line at the option height, with a 20px avatar", async () => {
  await openMenu(5);
  const rows = screen.getAllByTestId("row");
  for (const row of rows) expect(row.getBoundingClientRect().height).toBe(36);
  expect(screen.getAllByTestId("row-avatar")[0].getBoundingClientRect().width).toBe(20);
  const destinations = [...screen.getByTestId("destinations").children].map((cell) =>
    cell.getBoundingClientRect(),
  );
  expect(destinations).toHaveLength(3);
  expect(destinations[1].top).toBe(destinations[0].top);
  expect(destinations[1].width).toBeCloseTo(destinations[0].width, 0);
});

it("with 20 servers stays within 60% of the screen; the list scrolls and the rest stays in view", async () => {
  const popup = (await openMenu(20)).getBoundingClientRect();
  expect(popup.height).toBeLessThanOrEqual(window.innerHeight * 0.6 + 1);
  const list = screen.getByTestId("list");
  expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
  list.scrollTop = 120;
  expect(list.scrollTop).toBe(120);
  for (const id of ["destinations", "footer"]) {
    const part = screen.getByTestId(id).getBoundingClientRect();
    expect(part.height).toBeGreaterThan(0);
    expect(part.top).toBeGreaterThanOrEqual(popup.top);
    expect(part.bottom).toBeLessThanOrEqual(popup.bottom + 0.5);
  }
});

it("puts a destination's attention dot on its icon's top-right corner", async () => {
  await openMenu(3);
  const icon = screen.getByTestId("computers-icon").getBoundingClientRect();
  const dot = screen.getByTestId("computers-dot").getBoundingClientRect();
  const centerX = dot.left + dot.width / 2;
  const centerY = dot.top + dot.height / 2;
  expect(Math.abs(centerX - icon.right)).toBeLessThanOrEqual(2);
  expect(Math.abs(centerY - icon.top)).toBeLessThanOrEqual(2);
});
