import "./person-list.test.css";
/**
 * PersonList in a real popover (person-list.md): each row is a list cell at a
 * popup row's height, 34px with a mouse on a desktop and 36px on a phone, its
 * state shape 8px inside the popover and the content 8px inside the shape, so
 * the face starts on the popover's 16px inset, where its title starts, at
 * every width. Hover fills the shape, keyboard focus rings it; a row
 * that opens nothing does none of it and is skipped by Tab. Real layout,
 * media queries and input modality: only a browser computes them.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/person-list`
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { settled, token } from "../../lib/row-hover.test-colors";
import { Avatar, AvatarFallback } from "../avatar/avatar";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../popover/popover";
import {
  PersonList,
  PersonListItem,
  PersonListItemName,
  PersonListItemStatus,
} from "./person-list";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

async function context() {
  return import("vite-plus/test/browser/context");
}

function Viewers() {
  return (
    <ThemeProvider>
      <button type="button" data-testid="before">
        Before
      </button>
      <Popover defaultOpen>
        <PopoverTrigger>Who's here</PopoverTrigger>
        <PopoverContent className="w-[300px]" data-testid="popover">
          <PopoverHeader>
            <PopoverTitle data-testid="title">Who's here</PopoverTitle>
          </PopoverHeader>
          <PersonList data-testid="list">
            <PersonListItem data-testid="martin">
              <Avatar aria-hidden size="xs" type="human" data-testid="martin-face">
                <AvatarFallback>M</AvatarFallback>
              </Avatar>
              <PersonListItemName>Martin</PersonListItemName>
              <PersonListItemStatus data-testid="martin-status">viewing</PersonListItemStatus>
            </PersonListItem>
            <PersonListItem data-testid="wug">
              <Avatar aria-hidden size="xs" type="agent" />
              <PersonListItemName data-testid="wug-name">Wug</PersonListItemName>
              <PersonListItemStatus data-testid="wug-since">updated since</PersonListItemStatus>
              <PersonListItemStatus data-testid="wug-when">2h</PersonListItemStatus>
            </PersonListItem>
            <PersonListItem interactive={false} data-testid="atlas">
              <Avatar aria-hidden size="xs" type="agent" />
              <PersonListItemName>Atlas</PersonListItemName>
              <PersonListItemStatus>deleted</PersonListItemStatus>
            </PersonListItem>
            <PersonListItem data-testid="niko">
              <Avatar aria-hidden size="xs" type="agent" />
              <PersonListItemName>Niko</PersonListItemName>
            </PersonListItem>
          </PersonList>
        </PopoverContent>
      </Popover>
    </ThemeProvider>
  );
}

const rect = (id: string) => screen.getByTestId(id).getBoundingClientRect();
const shape = (id: string) => getComputedStyle(screen.getByTestId(id), "::before");

for (const [label, width, height] of [
  ["desktop with a mouse", 1280, 34],
  ["phone width", 400, 36],
] as const) {
  it(`${label}: a ${height}px row, its shape 8px inside the popover, the face on the popover's 16px inset`, async () => {
    const { page } = await context();
    await page.viewport(width, 800);
    render(<Viewers />);
    await screen.findByTestId("list");
    expect(await settled(() => shape("martin").left)).toBe("8px");

    const popover = rect("popover");
    for (const id of ["martin", "wug", "atlas", "niko"]) {
      const row = rect(id);
      expect(row.height, `${id} height`).toBe(height);
      expect(row.left - popover.left, `${id} spans the popover`).toBe(0);
      expect(popover.right - row.right, `${id} spans the popover`).toBe(0);
      expect(shape(id).left, `${id} shape start`).toBe("8px");
      expect(shape(id).right, `${id} shape end`).toBe("8px");
      expect(shape(id).borderTopLeftRadius, `${id} radius-control`).toBe("8px");
    }
    // The content sits 8px inside the shape: 16px from the popover's edges,
    // the line its title starts on.
    expect(rect("martin-face").left - popover.left).toBe(16);
    expect(rect("title").left - popover.left).toBe(16);
    expect(rect("martin-face").width).toBe(19);
    expect(popover.right - rect("martin-status").right, "the last status ends the row").toBe(16);
    expect(popover.right - rect("wug-when").right).toBe(16);
    // A status before the last stays beside the name.
    expect(rect("wug-since").left - rect("wug-name").right).toBe(8);
    // The rows are the list cells' column: 2px apart, 8px at the list's ends.
    expect(rect("wug").top - rect("martin").bottom).toBe(2);
    expect(rect("martin").top - rect("list").top).toBe(8);
    expect(rect("list").bottom - rect("niko").bottom).toBe(8);
  });
}

it("hover fills the shape with fill-cell-hover; a row that opens nothing doesn't answer", async () => {
  const { page, userEvent } = await context();
  await page.viewport(1280, 800);
  render(<Viewers />);
  await screen.findByTestId("list");
  await userEvent.unhover(document.body);
  const scope = screen.getByTestId("popover");
  expect(await settled(() => shape("martin").backgroundColor)).toBe("rgba(0, 0, 0, 0)");

  await userEvent.hover(screen.getByTestId("martin"));
  expect(await settled(() => shape("martin").backgroundColor)).toBe(
    token(scope, "fill-cell-hover"),
  );
  // The row itself stays transparent: the fill is on the inset shape only.
  expect(getComputedStyle(screen.getByTestId("martin")).backgroundColor).toBe("rgba(0, 0, 0, 0)");

  await userEvent.hover(screen.getByTestId("atlas"));
  expect(await settled(() => shape("atlas").backgroundColor)).toBe("rgba(0, 0, 0, 0)");
  expect(getComputedStyle(screen.getByTestId("atlas")).cursor).toBe("auto");
});

it("Tab moves row to row with the inset ring on the shape, and skips a row that opens nothing", async () => {
  const { page, userEvent } = await context();
  await page.viewport(1280, 800);
  render(<Viewers />);
  await screen.findByTestId("list");
  screen.getByTestId("martin").focus();
  await userEvent.keyboard("{Tab}");
  expect(document.activeElement).toBe(screen.getByTestId("wug"));
  expect(await settled(() => shape("wug").boxShadow)).toMatch(/0px 0px 0px 2px inset/);
  // The row draws no ring of its own outside the shape.
  expect(getComputedStyle(screen.getByTestId("wug")).boxShadow).not.toMatch(/[1-9]\d*px/);
  await userEvent.keyboard("{Tab}");
  expect(document.activeElement, "Atlas opens nothing: Tab passes it").toBe(
    screen.getByTestId("niko"),
  );
  // Arrow keys don't move between rows: it is a list of buttons, not a menu.
  await userEvent.keyboard("{ArrowUp}");
  expect(document.activeElement).toBe(screen.getByTestId("niko"));
});

it("each row is named by its words, a comma before each status, the face hidden", async () => {
  const { page } = await context();
  await page.viewport(1280, 800);
  render(<Viewers />);
  await screen.findByTestId("list");
  expect(page.getByRole("list").element()).toBe(screen.getByTestId("list"));
  expect(page.getByRole("listitem").elements()).toHaveLength(4);
  expect(page.getByRole("button", { name: "Martin, viewing", exact: true }).element()).toBe(
    screen.getByTestId("martin"),
  );
  expect(page.getByRole("button", { name: "Wug, updated since, 2h", exact: true }).element()).toBe(
    screen.getByTestId("wug"),
  );
  // The comma is for the ear only.
  expect(screen.getByTestId("martin").innerText).not.toContain(",");
  expect(screen.getByTestId("wug").innerText).not.toContain(",");
});
