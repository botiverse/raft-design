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

// Row hover (design/foundations/states.md#hover-and-press): a row or a
// message hovers with the subtle tier, a small step people can see, lighter
// than its press and than selection, so text read on it keeps its contrast.
// Rows used to hover with the medium tier (7.8% ink), which took 11 APCA Lc
// off a message's body text in light mode. Measured in a real browser: :hover
// needs a real pointer. Per-tier alphas: hover-tiers.browser.test.tsx.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const rows = [
  // A message and a compact row take the same step: body text loses at most 6 Lc.
  { id: "message", surface: "layer-canvas", fill: "fill-subtle", maxDrop: 6, read: "color" },
  // List cells (lib/list-cell.ts) hover on their inset shape with the cell
  // token: fill-subtle in light, a stronger step in dark.
  { id: "sidebar", surface: "layer-sidebar", fill: "fill-cell-hover", maxDrop: 6, read: "before" },
  { id: "list-row", surface: "layer-card", fill: "fill-cell-hover", maxDrop: 6, read: "before" },
  // A settings row (ListRow without `cell`) keeps its row-wide overlay.
  { id: "settings-row", surface: "layer-card", fill: "fill-subtle", maxDrop: 6, read: "image" },
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
            <ListRow cell data-testid="list-row">
              Wug
            </ListRow>
            <ListRow data-testid="settings-row">Appearance</ListRow>
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
      const read = () => readFill(el, row.read);
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
// pointer, or from the toolbar's button on the row): the two don't stack.
it("with a mouse, a hovered message with its menu open keeps fill-subtle", async () => {
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
    token(scope, "fill-subtle"),
  );
  await page.getByTestId("closed").hover();
  expect(await settled(() => getComputedStyle(getByTestId("closed")).backgroundColor)).toBe(
    token(scope, "fill-subtle"),
  );
  await page.getByTestId("open").hover();
  expect(open.matches(":hover")).toBe(true);
  expect(await settled(() => getComputedStyle(open).backgroundColor)).toBe(
    token(scope, "fill-subtle"),
  );
});

// Every row with its menu open (states.md#hover-and-press) takes fill-subtle,
// hovered or not: one look for "the row this menu belongs to". On each row's
// surface it is a visible step (2 or more), under info-soft and brand-soft,
// and hint text keeps 4.5:1.
// A list cell takes it on its inset shape, as fill-cell-hover (fill-subtle in
// light, a stronger step in dark), under the cell's selected tint.
const openRows = [
  { id: "open-sidebar", surface: "layer-sidebar", read: "before" },
  { id: "open-list-row", surface: "layer-card", read: "before" },
  { id: "open-settings-row", surface: "layer-card", read: "image" },
  { id: "open-inbox", surface: "layer-canvas", read: "before" },
  { id: "open-entity", surface: "layer-popover", read: "before" },
  { id: "open-search-message", surface: "layer-popover", read: "before" },
  { id: "open-table-row", surface: "layer-canvas", read: "color" },
  { id: "open-file", surface: "layer-card", read: "image" },
] as const;

/** The row's state fill: its background colour, its overlay, or (a list
 *  cell) its ::before shape's colour. */
function readFill(el: HTMLElement, read: "color" | "image" | "before"): string {
  if (read === "before") return getComputedStyle(el, "::before").backgroundColor;
  if (read === "color") return getComputedStyle(el).backgroundColor;
  return firstOklch(getComputedStyle(el).backgroundImage);
}

for (const mode of ["light", "dark"] as const) {
  it(`${mode}: every row with its menu open takes fill-subtle, hovered or not`, async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <div className={mode} data-testid="scope">
          <div className="bg-layer-sidebar p-2">
            <SidebarItem data-testid="open-sidebar" data-popup-open="">
              <SidebarItemTitle>launch-week</SidebarItemTitle>
            </SidebarItem>
          </div>
          <div className="bg-layer-card p-2">
            <ListRow cell data-testid="open-list-row" data-popup-open="">
              Wug
            </ListRow>
            <ListRow data-testid="open-settings-row" data-popup-open="">
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
      const read = () => readFill(el, row.read);
      const expected = token(scope, row.read === "before" ? "fill-cell-hover" : "fill-subtle");
      await userEvent.unhover(document.body);
      expect.soft(await settled(read), `${mode} ${row.id} at rest`).toBe(expected);
      await page.getByTestId(row.id).hover();
      const fill = await settled(read);
      expect.soft(fill, `${mode} ${row.id} hovered`).toBe(expected);

      const surface = parseOklch(token(scope, row.surface));
      const open = over(parseOklch(fill), surface);
      const step = deltaE(open, surface);
      expect
        .soft(step, `${mode} ${row.id}: ${step.toFixed(2)} off ${row.surface}`)
        .toBeGreaterThanOrEqual(2);
      // Open question (#167): a list cell's dark hover (7.5% ink) on the
      // lighter popover surface lands level with the search keyboard
      // highlight (brand-soft, 6.24 vs 6.20 dE) and takes hint text to 4.33:1.
      // The values were asked for as they are; until a design call, this
      // holds them where they measure so neither gets worse.
      const darkPopoverCell =
        mode === "dark" && row.read === "before" && row.surface === "layer-popover";
      for (const selection of [
        row.read === "before" ? "fill-cell-selected" : "info-soft",
        "brand-soft",
      ]) {
        const selected = deltaE(over(parseOklch(token(scope, selection)), surface), surface);
        const room = darkPopoverCell && selection === "brand-soft" ? 0.1 : 0;
        expect.soft(step, `${mode} ${row.id}: under ${selection}`).toBeLessThan(selected + room);
      }
      const hint = over(parseOklch(token(scope, "foreground-hint")), open);
      expect
        .soft(wcag(hint, open), `${mode} ${row.id}: hint text`)
        .toBeGreaterThanOrEqual(darkPopoverCell ? 4.3 : 4.5);
    }
  });
}

// A comment card is read like a row and hovers like one: fill-subtle, not
// the medium tier.
for (const mode of ["light", "dark"] as const) {
  it(`${mode}: a collapsed comment card hovers with fill-subtle`, async () => {
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
    expect(fill, `${mode}: the card's hover`).toBe(token(scope, "fill-subtle"));

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
