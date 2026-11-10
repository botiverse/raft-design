import "./mobile-nav.test.css";
/**
 * The server tab in a real layout (navigation.md, "Servers"): on a 390px
 * phone, a press and a long press open the menu, the menu rises above the tab
 * bar 8px from each side, Esc closes it and gives focus back to the tab, and a
 * long server name truncates inside the tab's fifth of the bar.
 */
import { afterEach, expect, test } from "vite-plus/test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  Activity,
  Blocks,
  CheckSquare,
  Home,
  Monitor,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Avatar, AvatarFallback } from "../avatar/avatar";
import { ArtifactIcon } from "../icons/object-icons";
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
  MobileNavServerPopoverRowBody,
  MobileNavServerPopoverRowDescription,
  MobileNavServerPopoverRowLabel,
} from "./mobile-nav-server";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const LONG_NAME = "Botiverse Research Laboratories";

const PAGE_ICONS = [<ArtifactIcon />, <Users />, <Monitor />, <Blocks />, <Settings />];

function renderPhone(
  name = "Raft HQ",
  servers = 1,
  {
    width = 390,
    height = 700,
    pages,
    current,
    actions = 1,
  }: { width?: number; height?: number; pages?: string[]; current?: number; actions?: number } = {},
) {
  render(
    <ThemeProvider>
      <div
        style={{ width, height, display: "flex", flexDirection: "column" }}
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
                  <MobileNavServerPopoverRow
                    key={index}
                    data-testid="row"
                    aria-current={index === current ? "true" : undefined}
                  >
                    <Avatar type="server" size="xs" data-testid="row-avatar">
                      <AvatarFallback>S</AvatarFallback>
                    </Avatar>
                    <MobileNavServerPopoverRowBody>
                      <MobileNavServerPopoverRowLabel data-testid="row-label">
                        Server {index + 1}
                      </MobileNavServerPopoverRowLabel>
                      <MobileNavServerPopoverRowDescription data-testid="row-slug">
                        /server-{index + 1}
                      </MobileNavServerPopoverRowDescription>
                    </MobileNavServerPopoverRowBody>
                  </MobileNavServerPopoverRow>
                ))}
              </MobileNavServerPopoverList>
              <PopoverSeparator />
              <MobileNavServerPopoverGroup data-testid="footer">
                {Array.from({ length: actions }, (_, index) => (
                  <MobileNavServerPopoverRow key={index}>
                    <Plus />
                    <MobileNavServerPopoverRowLabel>
                      {index === 0 ? "Switch or Create Server" : `Action ${index + 1}`}
                    </MobileNavServerPopoverRowLabel>
                  </MobileNavServerPopoverRow>
                ))}
              </MobileNavServerPopoverGroup>
              <PopoverSeparator />
              <MobileNavServerPopoverDestinations aria-label={name} data-testid="destinations">
                {pages
                  ? pages.map((page, index) => (
                      <MobileNavServerPopoverDestination key={page} data-testid="page">
                        {PAGE_ICONS[index % PAGE_ICONS.length]}
                        <span data-testid="page-label">{page}</span>
                      </MobileNavServerPopoverDestination>
                    ))
                  : [
                      <MobileNavServerPopoverDestination key="members">
                        <Users />
                        <span>Members</span>
                      </MobileNavServerPopoverDestination>,
                      <MobileNavServerPopoverDestination key="computers">
                        <Monitor data-testid="computers-icon" />
                        <span>Computers</span>
                        <Status
                          aria-hidden
                          variant="accent"
                          size="sm"
                          data-testid="computers-dot"
                        />
                      </MobileNavServerPopoverDestination>,
                      <MobileNavServerPopoverDestination key="settings">
                        <Settings />
                        <span>Settings</span>
                      </MobileNavServerPopoverDestination>,
                    ]}
              </MobileNavServerPopoverDestinations>
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

async function openMenu(servers: number, options?: Parameters<typeof renderPhone>[2]) {
  const tab = renderPhone("Raft HQ", servers, options);
  await tap(tab);
  await act(async () => {
    await frame();
    await frame();
  });
  return menu()!;
}

it("puts each server's name over its address at the two-line option height, the 20px avatar centered", async () => {
  await openMenu(5);
  const rows = screen.getAllByTestId("row");
  const labels = screen.getAllByTestId("row-label");
  const slugs = screen.getAllByTestId("row-slug");
  const avatars = screen.getAllByTestId("row-avatar");
  rows.forEach((element, index) => {
    const row = element.getBoundingClientRect();
    const label = labels[index].getBoundingClientRect();
    const slug = slugs[index].getBoundingClientRect();
    const avatar = avatars[index].getBoundingClientRect();
    // The one-line option's padding, (36px - one line) / 2, above and below;
    // the second line adds its own height and nothing else.
    expect(label.height).toBe(parseFloat(getComputedStyle(labels[index]).lineHeight));
    expect(slug.height).toBe(parseFloat(getComputedStyle(slugs[index]).lineHeight));
    const inset = (36 - label.height) / 2;
    expect(label.top - row.top).toBeCloseTo(inset, 1);
    expect(row.bottom - slug.bottom).toBeCloseTo(inset, 1);
    expect(slug.top).toBeCloseTo(label.bottom, 1);
    expect(row.height).toBeCloseTo(36 + slug.height, 1);
    expect(avatar.width).toBe(20);
    expect(avatar.top + avatar.height / 2).toBeCloseTo(row.top + row.height / 2, 0);
  });
  expect(getComputedStyle(slugs[0]).fontFamily).toMatch(/Mono/i);
  const destinations = [...screen.getByTestId("destinations").children].map((cell) =>
    cell.getBoundingClientRect(),
  );
  expect(destinations).toHaveLength(3);
  expect(destinations[1].top).toBe(destinations[0].top);
  expect(destinations[1].width).toBeCloseTo(destinations[0].width, 0);
});

it("with 20 servers, where one whole row fits, stays within 60% of the screen; the list scrolls and the rest stays in view", async () => {
  const popup = (await openMenu(20)).getBoundingClientRect();
  expect(popup.height).toBeLessThanOrEqual(window.innerHeight * 0.6 + 1);
  const list = screen.getByTestId("list");
  expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
  list.scrollTop = 120;
  expect(list.scrollTop).toBe(120);
  const footerBox = screen.getByTestId("footer").getBoundingClientRect();
  const destinationsBox = screen.getByTestId("destinations").getBoundingClientRect();
  expect(footerBox.top).toBeGreaterThanOrEqual(list.getBoundingClientRect().bottom);
  // The server's pages come last, nearest the thumb and the tab bar.
  expect(destinationsBox.top).toBeGreaterThanOrEqual(footerBox.bottom);
  expect(popup.bottom - destinationsBox.bottom).toBeLessThanOrEqual(2);
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

// The longest of the server's pages in the languages Raft ships, at 360px,
// the narrowest phone the tab bar is drawn for after 320px's 5 tabs.
const LONG_PAGES = ["Artefactos", "Miembros", "Computadoras", "Aplicaciones", "Configuración"];

it("keeps 4 pages side by side in one row of equal cells", async () => {
  await openMenu(1, { pages: ["Members", "Computers", "Apps", "Settings"] });
  const group = screen.getByTestId("destinations");
  expect(group.dataset.layout).toBe("row");
  const cells = screen.getAllByTestId("page").map((cell) => cell.getBoundingClientRect());
  for (const cell of cells) {
    expect(cell.top).toBe(cells[0].top);
    expect(cell.width).toBeCloseTo(cells[0].width, 0);
  }
});

it("lays out more than 4 pages in 3 columns at 360px, every label whole, the last row from the left", async () => {
  await openMenu(1, { width: 360, pages: LONG_PAGES });
  const group = screen.getByTestId("destinations");
  expect(group.dataset.layout).toBe("grid");
  const cells = screen.getAllByTestId("page").map((cell) => cell.getBoundingClientRect());
  expect(cells).toHaveLength(5);
  const [a, b, c, d, e] = cells;
  expect(b.top).toBe(a.top);
  expect(c.top).toBe(a.top);
  expect(d.top).toBeGreaterThanOrEqual(a.bottom);
  expect(e.top).toBe(d.top);
  // The last row starts at the left, under the first two columns.
  expect(d.left).toBeCloseTo(a.left, 0);
  expect(e.left).toBeCloseTo(b.left, 0);
  for (const cell of cells) {
    expect(cell.width).toBeCloseTo(a.width, 0);
    // The cells keep the one-row height: icon, label and padding.
    expect(cell.height).toBeCloseTo(a.height, 0);
  }
  for (const label of screen.getAllByTestId("page-label")) {
    expect(getComputedStyle(label).fontSize).toBe("13px");
    expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth);
  }
});

it("draws the cells of the grid as tall as the cells of one row", async () => {
  await openMenu(1, { width: 360, pages: ["Members", "Computers", "Settings"] });
  const row = screen.getAllByTestId("page")[0].getBoundingClientRect().height;
  cleanup();
  await openMenu(1, { width: 360, pages: LONG_PAGES });
  const grid = screen.getAllByTestId("page")[0].getBoundingClientRect().height;
  expect(grid).toBeCloseTo(row, 0);
});

async function context() {
  return import("vite-plus/test/browser/context");
}

async function viewport(width: number, height: number) {
  const { page } = await context();
  await page.viewport(width, height);
}

const scrollArea = (popup: HTMLElement) =>
  popup.querySelector<HTMLElement>("[data-slot=mobile-nav-server-popover-scroll]")!;

const rowHeight = () => screen.getAllByTestId("row")[0].getBoundingClientRect().height;

it("grows past 60% of a short screen as far as one whole server row needs, and no further", async () => {
  await viewport(360, 520);
  try {
    const popup = await openMenu(20, { width: 360, height: 520, pages: LONG_PAGES, actions: 5 });
    const list = screen.getByTestId("list");
    const box = popup.getBoundingClientRect();
    // The parts after the list would leave it less than a row inside 60%.
    expect(box.height).toBeGreaterThan(window.innerHeight * 0.6 + 1);
    expect(list.clientHeight).toBeGreaterThanOrEqual(rowHeight());
    expect(list.clientHeight).toBeLessThan(rowHeight() * 2);
    // It fits, so the popover itself doesn't scroll.
    const area = scrollArea(popup);
    expect(area.scrollHeight).toBeLessThanOrEqual(area.clientHeight + 1);
    const bar = screen.getByTestId("bar").getBoundingClientRect();
    expect(bar.top - box.bottom).toBeCloseTo(8, 0);
  } finally {
    await viewport(1280, 720);
  }
});

it("on a screen too short even for one row, scrolls the whole popover, the footer and the pages with it", async () => {
  await viewport(360, 340);
  try {
    const popup = await openMenu(20, { width: 360, height: 340, pages: LONG_PAGES, actions: 3 });
    const list = screen.getByTestId("list");
    const box = popup.getBoundingClientRect();
    expect(list.clientHeight).toBeGreaterThanOrEqual(rowHeight());
    expect(box.top).toBeGreaterThanOrEqual(0);
    // The parts sit in a ScrollArea that fills the popover and scrolls.
    const area = scrollArea(popup);
    expect(area.getBoundingClientRect().bottom).toBeCloseTo(box.bottom, 0);
    expect(area.scrollHeight).toBeGreaterThan(area.clientHeight + 1);
    expect(getComputedStyle(area).overflowY).toBe("auto");
    area.scrollTop = area.scrollHeight;
    const destinations = screen.getByTestId("destinations").getBoundingClientRect();
    expect(destinations.bottom).toBeLessThanOrEqual(area.getBoundingClientRect().bottom + 0.5);
  } finally {
    await viewport(1280, 720);
  }
});

const inside = (inner: DOMRect, outer: DOMRect) =>
  inner.top >= outer.top - 0.5 && inner.bottom <= outer.bottom + 0.5;

it("opens with the list already on the current server, without animation", async () => {
  await openMenu(20, { current: 15 });
  const list = screen.getByTestId("list");
  const current = screen.getAllByTestId("row")[15];
  expect(list.scrollTop).toBeGreaterThan(0);
  expect(inside(current.getBoundingClientRect(), list.getBoundingClientRect())).toBe(true);
  expect(getComputedStyle(list).scrollBehavior).not.toBe("smooth");
});

it("opened from the keyboard, focuses the current server's row and keeps the list on it", async () => {
  const tab = renderPhone("Raft HQ", 20, { current: 15 });
  const { userEvent } = await context();
  tab.focus();
  await userEvent.keyboard("{Enter}");
  await act(async () => {
    await frame();
    await frame();
    await frame();
  });
  expect(menu()).not.toBeNull();
  const list = screen.getByTestId("list");
  const current = screen.getAllByTestId("row")[15];
  // Focus on open never scrolls the list back to the top.
  expect(list.scrollTop).toBeGreaterThan(0);
  expect(inside(current.getBoundingClientRect(), list.getBoundingClientRect())).toBe(true);
  expect(document.activeElement).toBe(current);
});
