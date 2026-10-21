import "./row-hover.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "./theme/theme-provider";
import { CommentCard, CommentCardTrigger } from "../components/comment/comment-card";
import { CommentEntry, CommentEntryBody } from "../components/comment/comment-entry";
import { FileAction, FileActions, FileContent, FileName, FileRow } from "../components/files";
import { InboxItem, InboxItemContent, InboxItemTitle } from "../components/inbox-item";
import { ListRow } from "../components/list-row/list-row";
import { SearchEntityResult, SearchMessageResult } from "../components/search";
import { Table, TableBody, TableCell, TableRow } from "../components/table";
import { MessageItem, MessageItemBody, MessageItemContent } from "../components/message-item";
import { SidebarItem, SidebarItemTitle } from "../components/sidebar/sidebar-item";
import {
  apca,
  deltaE,
  firstOklch,
  over,
  parseOklch,
  settled,
  token,
  wcag,
} from "./row-hover.test-colors";

// Row hover (design/foundations/states.md#row-hover): a row hovers with the
// lightest step people can see, lighter than its press and than selection,
// so text read on it keeps its contrast. Rows used to hover with
// fill-pressed (7.8% ink), which took 11 APCA Lc off a message's body text in
// light mode. Measured in a real browser: :hover needs a real pointer.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const rows = [
  // A message: the lightest step, its body text loses at most 5 Lc.
  { id: "message", surface: "layer-canvas", fill: "fill-message-hover", maxDrop: 5, read: "color" },
  // Compact rows: one step, at most 6 Lc.
  { id: "sidebar", surface: "layer-sidebar", fill: "fill-row-hover", maxDrop: 6, read: "color" },
  { id: "list-row", surface: "layer-card", fill: "fill-row-hover", maxDrop: 6, read: "image" },
] as const;

for (const mode of ["light", "dark"] as const) {
  it(`${mode}: rows hover with the row-hover tokens, and text keeps its contrast`, async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <div className={mode} data-testid="scope">
          <div className="bg-layer-canvas p-2">
            <MessageItem data-testid="message">
              <MessageItemContent>
                <MessageItemBody>
                  A long message someone reads with the pointer resting on it.
                </MessageItemBody>
              </MessageItemContent>
            </MessageItem>
          </div>
          <div className="bg-layer-sidebar p-2">
            <SidebarItem data-testid="sidebar">
              <SidebarItemTitle>launch-week</SidebarItemTitle>
            </SidebarItem>
          </div>
          <div className="bg-layer-card p-2">
            <ListRow data-testid="list-row">Wug</ListRow>
          </div>
        </div>
      </ThemeProvider>,
    );
    const { page, userEvent } = await import("vite-plus/test/browser/context");
    console.log(
      "DBG-first",
      matchMedia("(hover: hover)").matches,
      matchMedia("(pointer: fine)").matches,
    );
    await userEvent.unhover(document.body);
    const scope = getByTestId("scope");
    const ink = parseOklch(token(scope, "foreground"));
    const hint = token(scope, "foreground-hint");

    for (const row of rows) {
      const el = getByTestId(row.id);
      await page.getByTestId(row.id).hover();
      const read = () =>
        row.read === "color"
          ? getComputedStyle(el).backgroundColor
          : firstOklch(getComputedStyle(el).backgroundImage);
      const fill = await settled(read);
      expect(fill, `${mode} ${row.id} hovers with ${row.fill}`).toBe(token(scope, row.fill));

      const surface = parseOklch(token(scope, row.surface));
      const hovered = over(parseOklch(fill), surface);
      const drop = apca(ink, surface) - apca(ink, hovered);
      expect(drop, `${mode} ${row.id}: body text loses ${drop.toFixed(1)} Lc`).toBeLessThanOrEqual(
        row.maxDrop,
      );
      const hintOnHover = over(parseOklch(hint), hovered);
      expect(wcag(hintOnHover, hovered), `${mode} ${row.id}: hint text`).toBeGreaterThanOrEqual(
        4.5,
      );
    }
  });
}

// With a mouse the open message is hovered too (the menu opened under the
// pointer, or from the toolbar's button on the row): the open state wins.
it("with a mouse, a hovered message with its menu open keeps fill-row-open", async () => {
  const { getByTestId } = render(
    <ThemeProvider>
      <div data-testid="scope" className="bg-layer-canvas p-2">
        <MessageItem data-testid="closed">
          <MessageItemContent>
            <MessageItemBody>No menu.</MessageItemBody>
          </MessageItemContent>
        </MessageItem>
        <MessageItem data-testid="open" data-popup-open="">
          <MessageItemContent>
            <MessageItemBody>Its menu is open.</MessageItemBody>
          </MessageItemContent>
        </MessageItem>
      </div>
    </ThemeProvider>,
  );
  const { page, userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.unhover(document.body);
  const scope = getByTestId("scope");
  const open = getByTestId("open");
  expect(await settled(() => getComputedStyle(open).backgroundColor)).toBe(
    token(scope, "fill-row-open"),
  );
  await page.getByTestId("closed").hover();
  expect(await settled(() => getComputedStyle(getByTestId("closed")).backgroundColor)).toBe(
    token(scope, "fill-message-hover"),
  );
  await page.getByTestId("open").hover();
  expect(open.matches(":hover")).toBe(true);
  expect(await settled(() => getComputedStyle(open).backgroundColor)).toBe(
    token(scope, "fill-row-open"),
  );
});

// Every row with its menu open (states.md#row-hover) takes fill-row-open,
// hovered or not: one look for "the row this menu belongs to". On each row's
// surface it is a clear step (3 or more), under info-soft and brand-soft, and
// hint text keeps 4.5:1.
const openRows = [
  { id: "open-sidebar", surface: "layer-sidebar", read: "color" },
  { id: "open-list-row", surface: "layer-card", read: "image" },
  { id: "open-inbox", surface: "layer-canvas", read: "color" },
  { id: "open-entity", surface: "layer-popover", read: "color" },
  { id: "open-search-message", surface: "layer-popover", read: "color" },
  { id: "open-table-row", surface: "layer-canvas", read: "color" },
  { id: "open-file", surface: "layer-card", read: "image" },
] as const;

for (const mode of ["light", "dark"] as const) {
  it(`${mode}: every row with its menu open takes fill-row-open, hovered or not`, async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <div className={mode} data-testid="scope">
          <div className="bg-layer-sidebar p-2">
            <SidebarItem data-testid="open-sidebar" data-popup-open="">
              <SidebarItemTitle>launch-week</SidebarItemTitle>
            </SidebarItem>
          </div>
          <div className="bg-layer-card p-2">
            <ListRow data-testid="open-list-row" data-popup-open="">
              Wug
            </ListRow>
          </div>
          <div className="bg-layer-canvas">
            <InboxItem data-testid="open-inbox" data-popup-open="">
              <InboxItemContent>
                <InboxItemTitle>Kirby mentioned you</InboxItemTitle>
              </InboxItemContent>
            </InboxItem>
          </div>
          <div className="bg-layer-popover">
            <SearchEntityResult data-testid="open-entity" data-popup-open="">
              launch-week
            </SearchEntityResult>
            <SearchMessageResult data-testid="open-search-message" data-popup-open="">
              A message that matched
            </SearchMessageResult>
          </div>
          <div className="bg-layer-canvas">
            <Table>
              <TableBody>
                <TableRow data-testid="open-table-row" data-popup-open="">
                  <TableCell>raft-design</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="bg-layer-canvas p-2">
            <FileRow data-testid="open-file">
              <FileContent>
                <FileName>notes.md</FileName>
              </FileContent>
              <FileActions>
                <FileAction aria-label="More" data-popup-open="">
                  ⋯
                </FileAction>
              </FileActions>
            </FileRow>
          </div>
        </div>
      </ThemeProvider>,
    );
    const { page, userEvent } = await import("vite-plus/test/browser/context");
    const scope = getByTestId("scope");
    for (const row of openRows) {
      const el = getByTestId(row.id);
      const read = () =>
        row.read === "color"
          ? getComputedStyle(el).backgroundColor
          : firstOklch(getComputedStyle(el).backgroundImage);
      await userEvent.unhover(document.body);
      expect
        .soft(await settled(read), `${mode} ${row.id} at rest`)
        .toBe(token(scope, "fill-row-open"));
      await page.getByTestId(row.id).hover();
      const fill = await settled(read);
      expect.soft(fill, `${mode} ${row.id} hovered`).toBe(token(scope, "fill-row-open"));

      const surface = parseOklch(token(scope, row.surface));
      const open = over(parseOklch(fill), surface);
      const step = deltaE(open, surface);
      expect
        .soft(step, `${mode} ${row.id}: ${step.toFixed(2)} off ${row.surface}`)
        .toBeGreaterThanOrEqual(3);
      for (const selection of ["info-soft", "brand-soft"]) {
        const selected = deltaE(over(parseOklch(token(scope, selection)), surface), surface);
        expect.soft(step, `${mode} ${row.id}: under ${selection}`).toBeLessThan(selected);
      }
      const hint = over(parseOklch(token(scope, "foreground-hint")), open);
      expect.soft(wcag(hint, open), `${mode} ${row.id}: hint text`).toBeGreaterThanOrEqual(4.5);
    }
  });
}

// A comment card is read like a row and hovers like one: fill-row-hover, not
// the press overlay. fill-message-hover would be 1.9 off a dark card, under
// the visible step of 2.
for (const mode of ["light", "dark"] as const) {
  it(`${mode}: a collapsed comment card hovers with fill-row-hover`, async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <div className={mode} data-testid="scope">
          <div className="w-72 p-2">
            <CommentCard>
              <CommentEntry>
                <CommentEntryBody clamp>
                  A comment someone reads beside the passage.
                </CommentEntryBody>
              </CommentEntry>
              <CommentCardTrigger aria-label="Comment from Wug" data-testid="trigger" />
            </CommentCard>
          </div>
        </div>
      </ThemeProvider>,
    );
    const { page, userEvent } = await import("vite-plus/test/browser/context");
    await userEvent.unhover(document.body);
    const scope = getByTestId("scope");
    const el = getByTestId("trigger");
    await page.getByTestId("trigger").hover();
    const fill = await settled(() => getComputedStyle(el).backgroundColor);
    expect(fill, `${mode}: the card's hover`).toBe(token(scope, "fill-row-hover"));

    const surface = parseOklch(token(scope, "layer-card"));
    const hovered = over(parseOklch(fill), surface);
    const step = deltaE(hovered, surface);
    expect(step, `${mode}: ${step.toFixed(2)} off the card`).toBeGreaterThanOrEqual(2);
    const selected = deltaE(over(parseOklch(token(scope, "info-soft")), surface), surface);
    expect(step).toBeLessThan(selected);
    const ink = parseOklch(token(scope, "foreground"));
    const drop = apca(ink, surface) - apca(ink, hovered);
    expect(drop, `${mode}: body text loses ${drop.toFixed(1)} Lc`).toBeLessThanOrEqual(6);
  });
}
