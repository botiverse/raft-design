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
import { Avatar, AvatarBadge, AvatarFallback } from "../avatar/avatar";
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
  PersonListItemContent,
  PersonListItemDescription,
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

/** Working now: two-line rows, an sm face with its light, the name bold, what it does under it. */
function WorkingNow() {
  const agent = (id: string, name: string, doing: string) => (
    <PersonListItem data-testid={id}>
      <Avatar aria-hidden size="sm" type="agent" data-testid={`${id}-face`}>
        <AvatarBadge presence="busy" />
      </Avatar>
      <PersonListItemContent>
        <PersonListItemName data-testid={`${id}-name`}>{name}</PersonListItemName>
        <PersonListItemDescription data-testid={`${id}-doing`}>{doing}</PersonListItemDescription>
      </PersonListItemContent>
    </PersonListItem>
  );
  return (
    <ThemeProvider>
      <Popover defaultOpen>
        <PopoverTrigger>Working now</PopoverTrigger>
        <PopoverContent className="w-[300px]" data-testid="popover">
          <PersonList data-testid="list">
            {agent("one", "Bugen", "Editing Flow.tsx · #25")}
            {agent(
              "two",
              "Wug",
              "Drafting the release notes for 0.103 from the merged pull requests · #31",
            )}
            {agent(
              "three",
              "Atlas",
              "Running the browser tests for the sidebar, the search results and the Activity rows, one file at a time, then writing up which ones failed and why · #40",
            )}
            <PersonListItem data-testid="plain">
              <Avatar aria-hidden size="xs" type="human">
                <AvatarFallback>M</AvatarFallback>
              </Avatar>
              <PersonListItemName data-testid="plain-name">Martin</PersonListItemName>
              <PersonListItemStatus>viewing</PersonListItemStatus>
            </PersonListItem>
          </PersonList>
        </PopoverContent>
      </Popover>
    </ThemeProvider>
  );
}

const line = (id: string) => Number.parseFloat(getComputedStyle(screen.getByTestId(id)).lineHeight);

for (const [label, width, inset] of [
  ["desktop with a mouse", 1280, 6],
  ["phone width", 400, 8],
] as const) {
  it(`${label}: a two-line row grows with its description, clamped at 2 lines, at the one-line row's inset`, async () => {
    const { page } = await context();
    await page.viewport(width, 800);
    render(<WorkingNow />);
    await screen.findByTestId("list");
    expect(await settled(() => shape("one").left)).toBe("8px");
    const nameLine = line("one-name");
    const doingLine = line("one-doing");

    // One line of description, two, and a long one cut at two.
    expect(rect("one-doing").height, "one line").toBe(doingLine);
    expect(rect("two-doing").height, "two lines").toBe(2 * doingLine);
    expect(rect("three-doing").height, "clamped at two lines").toBe(2 * doingLine);
    expect(screen.getByTestId("three-doing").scrollHeight).toBeGreaterThan(2 * doingLine);
    for (const [id, lines] of [
      ["one", 1],
      ["two", 2],
      ["three", 2],
    ] as const) {
      expect(rect(id).height, `${id}: the content and the inset`).toBe(
        inset + nameLine + lines * doingLine + inset,
      );
      // The same state shape: as tall as the row, 8px in from the sides.
      expect(shape(id).top, id).toBe("0px");
      expect(shape(id).bottom, id).toBe("0px");
      expect(shape(id).left, id).toBe("8px");
    }
    // The heights person-list.md gives.
    expect([rect("one").height, rect("two").height]).toEqual(width === 1280 ? [52, 70] : [54, 72]);
    // A one-line row in the same list keeps its height.
    expect(rect("plain").height).toBe(2 * inset + line("plain-name"));
  });
}

it("a two-line row: the sm face centers on the row, on the 16px line; the name is bold there only", async () => {
  const { page } = await context();
  await page.viewport(1280, 800);
  render(<WorkingNow />);
  await screen.findByTestId("list");
  const popover = rect("popover");
  for (const id of ["one", "two", "three"]) {
    const face = rect(`${id}-face`);
    const row = rect(id);
    expect(face.width, `${id}: sm`).toBe(27);
    expect(face.left - popover.left, `${id}: on the popover's inset`).toBe(16);
    expect(
      Math.abs(face.top + face.height / 2 - (row.top + row.height / 2)),
      `${id}: centered`,
    ).toBeLessThanOrEqual(0.5);
    // The text starts 8px after the face; the name and its description share that edge.
    expect(rect(`${id}-name`).left - face.right).toBe(8);
    expect(rect(`${id}-doing`).left).toBe(rect(`${id}-name`).left);
    expect(getComputedStyle(screen.getByTestId(`${id}-name`)).fontWeight, `${id}: bold`).toBe(
      "700",
    );
  }
  expect(getComputedStyle(screen.getByTestId("plain-name")).fontWeight, "one line: regular").toBe(
    "400",
  );
});

it("a two-line row is named by its name, then its description", async () => {
  const { page } = await context();
  await page.viewport(1280, 800);
  render(<WorkingNow />);
  await screen.findByTestId("list");
  expect(
    page.getByRole("button", { name: "Bugen, Editing Flow.tsx · #25", exact: true }).element(),
  ).toBe(screen.getByTestId("one"));
});
