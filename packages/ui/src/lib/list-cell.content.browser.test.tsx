import "./row-hover.test.css";
import type { ReactElement } from "react";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { AtSign, Check, Hash } from "lucide-react";
import { ActivityInboxViewport } from "../components/activity-inbox";
import { Button } from "../components/button";
import { Checkbox } from "../components/checkbox";
import {
  InboxItem,
  InboxItemActions,
  InboxItemBody,
  InboxItemContent,
  InboxItemHeading,
  InboxItemLeading,
  InboxItemMarks,
  InboxItemSelection,
  InboxItemTimestamp,
  InboxItemTitle,
  InboxItemTrailing,
  InboxItemTrigger,
} from "../components/inbox-item";
import {
  ListRow,
  ListRowBody,
  ListRowIcon,
  ListRowMeta,
  ListRowTitle,
} from "../components/list-row/list-row";
import {
  SearchEntityResult,
  SearchMessageResult,
  SearchResultsList,
  SearchShellViewport,
} from "../components/search";
import {
  SearchEntityResultIcon,
  SearchEntityResultLeading,
} from "../components/search/search-entity";
import {
  SearchMessageResultBody,
  SearchMessageResultHeader,
  SearchMessageResultSender,
  SearchMessageResultTimestamp,
} from "../components/search/search-message";
import {
  SidebarItem,
  SidebarItemChannelIcon,
  SidebarItemCount,
  SidebarItemIndicator,
  SidebarItemTitle,
} from "../components/sidebar/sidebar-item";
import { SidebarList, SidebarSection } from "../components/sidebar/sidebar-section";
import { ThemeProvider } from "./theme/theme-provider";
import { settled } from "./row-hover.test-colors";

// List cells (design/patterns/lists.md#content): a cell's content is padded
// from its state shape, not from the list. The shape is 8px from the list's
// sides; inside it the content keeps 12px at the start and at the end, so
// the leading avatar or icon and the trailing time, counts, the @ sticker and
// a hover-revealed Mark as Done never touch the shape, at rest, hovered,
// selected, and with a classic scrollbar taking the end inset.

const it = test.skipIf(typeof window === "undefined");
const PAD = 12;

afterEach(cleanup);

/** The shape's box: the row's box less the ::before's computed insets. */
function shapeRect(row: HTMLElement) {
  const box = row.getBoundingClientRect();
  const s = getComputedStyle(row, "::before");
  const px = (v: string) => Number.parseFloat(v);
  return {
    left: box.left + px(s.left),
    right: box.right - px(s.right),
  };
}

/**
 * The nearest visible content box to each side of the shape: every element in
 * the row that paints (has a box and is shown), except the row's own trigger,
 * which covers the row on purpose.
 */
function contentInset(row: HTMLElement) {
  const shape = shapeRect(row);
  let start = Infinity;
  let end = Infinity;
  for (const el of Array.from(row.querySelectorAll<HTMLElement>("*"))) {
    if (el.dataset.slot === "inbox-item-open") continue;
    const b = el.getBoundingClientRect();
    // No box, or a visually hidden one (a checkbox's 1px clipped input).
    if (b.width <= 1.5 || b.height <= 1.5) continue;
    if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
    start = Math.min(start, b.left - shape.left);
    end = Math.min(end, shape.right - b.right);
  }
  return { start: Math.round(start * 100) / 100, end: Math.round(end * 100) / 100 };
}

type Case = {
  name: string;
  /** The row whose content reaches both ends: a leading visual and trailing marks. */
  row: (props?: object) => ReactElement;
  list?: (row: ReactElement) => ReactElement;
  hoverReveal?: boolean;
  /** No trailing part (a search entity): the end is only held to at least the padding. */
  noTrailing?: boolean;
  selected: object;
};

const cases: Case[] = [
  {
    name: "inbox-item",
    hoverReveal: true,
    selected: { active: true },
    row: (props) => (
      <InboxItem data-testid="row" density="compact" data-unread {...props}>
        <InboxItemTrigger aria-label="Open launch-week" />
        <InboxItemLeading>
          <Hash />
        </InboxItemLeading>
        <InboxItemContent>
          <InboxItemHeading>
            <InboxItemTitle>
              A title long enough to run under the trailing marks of the row
            </InboxItemTitle>
          </InboxItemHeading>
          <InboxItemBody>
            Kirby: the preview line, also long enough to be truncated at its end
          </InboxItemBody>
        </InboxItemContent>
        <InboxItemTrailing>
          <InboxItemTimestamp>9:41</InboxItemTimestamp>
          <InboxItemMarks>
            <SidebarItemIndicator>
              <AtSign />
            </SidebarItemIndicator>
            <SidebarItemCount>12</SidebarItemCount>
          </InboxItemMarks>
          <InboxItemActions reveal="hover">
            <Button variant="outline" size="icon-md" aria-label="Mark as done">
              <Check />
            </Button>
          </InboxItemActions>
        </InboxItemTrailing>
      </InboxItem>
    ),
  },
  {
    // Selecting: the 20px checkbox leads, in a slot as wide as it.
    name: "inbox-item selecting",
    selected: { active: true },
    row: (props) => (
      <InboxItem data-testid="row" {...props}>
        <InboxItemTrigger aria-label="Open launch-week" />
        <InboxItemSelection>
          <Checkbox aria-label="Select launch-week" />
        </InboxItemSelection>
        <InboxItemLeading>
          <Hash />
        </InboxItemLeading>
        <InboxItemContent>
          <InboxItemTitle>Kirby mentioned you</InboxItemTitle>
        </InboxItemContent>
        <InboxItemTrailing>
          <InboxItemTimestamp>9:41</InboxItemTimestamp>
        </InboxItemTrailing>
      </InboxItem>
    ),
  },
  {
    name: "sidebar-item",
    selected: { active: true },
    row: (props) => (
      <SidebarItem data-testid="row" {...props}>
        <SidebarItemChannelIcon>
          <Hash />
        </SidebarItemChannelIcon>
        <SidebarItemTitle>a-channel-name-long-enough-to-truncate-in-the-sidebar</SidebarItemTitle>
        <SidebarItemCount>3</SidebarItemCount>
      </SidebarItem>
    ),
    list: (row) => (
      <SidebarSection>
        <SidebarList>{row}</SidebarList>
      </SidebarSection>
    ),
  },
  {
    name: "list-row",
    selected: { selected: true },
    row: (props) => (
      <ListRow cell data-testid="row" {...props}>
        <ListRowIcon>
          <Hash />
        </ListRowIcon>
        <ListRowBody>
          <ListRowTitle>A conversation whose name runs long enough to truncate</ListRowTitle>
        </ListRowBody>
        <ListRowMeta>9:41</ListRowMeta>
      </ListRow>
    ),
    list: (row) => <div className="flex flex-col gap-0.5 py-2">{row}</div>,
  },
  {
    name: "search-entity-result",
    noTrailing: true,
    selected: { selected: true },
    row: (props) => (
      <SearchEntityResult data-testid="row" {...props}>
        <SearchEntityResultLeading>
          <SearchEntityResultIcon>
            <Hash />
          </SearchEntityResultIcon>
        </SearchEntityResultLeading>
        launch-week
      </SearchEntityResult>
    ),
    list: (row) => <SearchResultsList>{row}</SearchResultsList>,
  },
  {
    name: "search-message-result",
    selected: { selected: true },
    row: (props) => (
      <SearchMessageResult data-testid="row" {...props}>
        <SearchMessageResultHeader>
          <SearchMessageResultSender>Kirby</SearchMessageResultSender>
          <SearchMessageResultTimestamp>Oct 27</SearchMessageResultTimestamp>
        </SearchMessageResultHeader>
        <SearchMessageResultBody>A message that matched</SearchMessageResultBody>
      </SearchMessageResult>
    ),
    list: (row) => <SearchResultsList>{row}</SearchResultsList>,
  },
];

const FILLER = { height: 800 } as const;
const SHORT = { width: 360, height: 200, flex: "none" } as const;
const TALL = { width: 360, height: 400, flex: "none" } as const;

function renderCase(c: Case, props: object | undefined, overflow: boolean) {
  const row = c.row(props);
  // A short scroller with filler below the row shows a classic scrollbar
  // where the platform draws one; the shape gives that width back.
  const filler = overflow ? <div style={FILLER} /> : null;
  const style = overflow ? SHORT : TALL;
  render(
    <ThemeProvider>
      {c.list ? (
        <SearchShellViewport style={style}>
          {c.list(row)}
          {filler}
        </SearchShellViewport>
      ) : (
        <ActivityInboxViewport style={style}>
          {row}
          {filler}
        </ActivityInboxViewport>
      )}
    </ThemeProvider>,
  );
  return screen.getByTestId("row");
}

for (const c of cases) {
  for (const overflow of [false, true]) {
    const where = overflow ? "in an overflowing scroller" : "in a list";
    it(`${c.name} ${where}: the content keeps ${PAD}px from the shape at both ends, at rest, hovered and selected`, async () => {
      const row = renderCase(c, undefined, overflow);
      expect(await settled(() => getComputedStyle(row, "::before").left)).toBe("8px");
      expect(getComputedStyle(row).paddingLeft).toBe("20px");

      const rest = contentInset(row);
      expect(rest.start, `${c.name} rest start`).toBe(PAD);
      if (c.noTrailing) expect(rest.end, `${c.name} rest end`).toBeGreaterThanOrEqual(PAD);
      else expect(rest.end, `${c.name} rest end`).toBe(PAD);

      const { page, userEvent } = await import("vite-plus/test/browser/context");
      await page.getByTestId("row").hover();
      expect(await settled(() => getComputedStyle(row, "::before").backgroundColor)).not.toBe(
        "rgba(0, 0, 0, 0)",
      );
      if (c.hoverReveal) {
        const done = screen.getByRole("button", { name: "Mark as done" });
        expect(await settled(() => getComputedStyle(done.parentElement!).opacity)).toBe("1");
        const shape = shapeRect(row);
        expect(shape.right - done.getBoundingClientRect().right, "Mark as Done to the shape").toBe(
          PAD,
        );
      }
      const hover = contentInset(row);
      expect(hover.start, `${c.name} hover start`).toBeGreaterThanOrEqual(PAD);
      expect(hover.end, `${c.name} hover end`).toBeGreaterThanOrEqual(PAD);
      await userEvent.unhover(document.body);
      cleanup();

      const selected = renderCase(c, c.selected, overflow);
      await settled(() => getComputedStyle(selected, "::before").left);
      const sel = contentInset(selected);
      expect(sel.start, `${c.name} selected start`).toBeGreaterThanOrEqual(PAD);
      expect(sel.end, `${c.name} selected end`).toBeGreaterThanOrEqual(PAD);
    });
  }
}
