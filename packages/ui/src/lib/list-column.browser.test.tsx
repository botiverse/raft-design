import "./row-hover.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Hash, ListFilter } from "lucide-react";
import {
  ActivityInboxControls,
  ActivityInboxPanel,
  ActivityInboxViewport,
} from "../components/activity-inbox";
import { Button } from "../components/button";
import {
  InboxItem,
  InboxItemContent,
  InboxItemLeading,
  InboxItemTitle,
  InboxItemTrailing,
  InboxItemTimestamp,
  InboxItemTrigger,
} from "../components/inbox-item";
import { PanelHeaderContent, PanelSectionHeader, PanelTitle } from "../components/panel";
import {
  SearchEntityResult,
  SearchResultsList,
  SearchShellFilters,
  SearchShellRoot,
  SearchShellViewport,
} from "../components/search";
import {
  SearchEntityResultIcon,
  SearchEntityResultLeading,
} from "../components/search/search-entity";
import {
  SearchMessageResult,
  SearchMessageResultHeader,
  SearchMessageResultMeta,
  SearchMessageResultSender,
  SearchMessageResultThreadMeta,
  SearchMessageResultTimestamp,
} from "../components/search/search-message";
import { Badge } from "../components/badge";
import {
  SidebarBody,
  SidebarContent,
  SidebarHeader,
  SidebarHeaderTitle,
  SidebarRoot,
} from "../components/sidebar/sidebar";
import {
  SidebarItem,
  SidebarItemChannelIcon,
  SidebarItemTitle,
} from "../components/sidebar/sidebar-item";
import { SidebarList, SidebarSection } from "../components/sidebar/sidebar-section";
import { ThemeProvider } from "./theme/theme-provider";

// One edge per list column (design/patterns/lists.md#one-edge): the column's
// title, its toolbar and its rows' leading content start on one line, 20px
// from the column's edge, on a phone as on a desktop. The rows put their
// content 8px (shape) + 12px in; a list column sets `--column-margin` to the
// same 20px, so its head and toolbar follow, where a phone column is 16px.

const it = test.skipIf(typeof window === "undefined");
const EDGE = 20;

afterEach(cleanup);
afterAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(414, 896);
});

/** The left edge of the first painted text in an element. */
function textLeft(el: Element) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent?.trim()) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    return range.getBoundingClientRect().left;
  }
  throw new Error("no text");
}

const left = (id: string) => screen.getByTestId(id).getBoundingClientRect().left;
const COLUMN = { width: 360, height: 600 } as const;
const NARROW = { width: 300, height: 200 } as const;

for (const width of [390, 1280]) {
  const where = width < 768 ? "on a phone" : "on a desktop";

  it(`Activity ${where}: the title, the Filter button and the rows' leading start ${EDGE}px in`, async () => {
    const { page } = await import("vite-plus/test/browser/context");
    await page.viewport(width, 800);
    render(
      <ThemeProvider>
        <ActivityInboxPanel data-testid="column" style={COLUMN}>
          <PanelSectionHeader>
            <PanelHeaderContent>
              <PanelTitle data-testid="title">Activity</PanelTitle>
            </PanelHeaderContent>
          </PanelSectionHeader>
          <ActivityInboxControls>
            <Button data-testid="filter" variant="outline" size="md">
              <ListFilter data-icon="inline-start" />
              Filter
            </Button>
          </ActivityInboxControls>
          <ActivityInboxViewport>
            <InboxItem density="compact">
              <InboxItemTrigger aria-label="Open" />
              <InboxItemLeading data-testid="leading">
                <Hash />
              </InboxItemLeading>
              <InboxItemContent>
                <InboxItemTitle>launch-week</InboxItemTitle>
              </InboxItemContent>
              <InboxItemTrailing>
                <InboxItemTimestamp>9:41</InboxItemTimestamp>
              </InboxItemTrailing>
            </InboxItem>
          </ActivityInboxViewport>
        </ActivityInboxPanel>
      </ThemeProvider>,
    );
    const column = left("column");
    expect(textLeft(screen.getByTestId("title")) - column, "title").toBeCloseTo(EDGE, 0);
    expect(left("filter") - column, "Filter button's edge").toBe(EDGE);
    expect(left("leading") - column, "row leading").toBe(EDGE);
  });

  it(`Sidebar ${where}: the head and the rows' leading start ${EDGE}px in`, async () => {
    const { page } = await import("vite-plus/test/browser/context");
    await page.viewport(width, 800);
    render(
      <ThemeProvider>
        <SidebarRoot data-testid="column" style={COLUMN}>
          <SidebarHeader>
            <SidebarHeaderTitle data-testid="title">Raft</SidebarHeaderTitle>
          </SidebarHeader>
          <SidebarBody>
            <SidebarContent>
              <SidebarSection>
                <SidebarList>
                  <SidebarItem>
                    <SidebarItemChannelIcon data-testid="leading">
                      <Hash />
                    </SidebarItemChannelIcon>
                    <SidebarItemTitle>general</SidebarItemTitle>
                  </SidebarItem>
                </SidebarList>
              </SidebarSection>
            </SidebarContent>
          </SidebarBody>
        </SidebarRoot>
      </ThemeProvider>,
    );
    const column = left("column");
    expect(textLeft(screen.getByTestId("title")) - column, "head title").toBeCloseTo(EDGE, 0);
    expect(left("leading") - column, "row leading").toBe(EDGE);
  });

  it(`Search ${where}: the filters and the rows' leading start ${EDGE}px in`, async () => {
    const { page } = await import("vite-plus/test/browser/context");
    await page.viewport(width, 800);
    render(
      <ThemeProvider>
        <SearchShellRoot data-testid="column" style={COLUMN}>
          <SearchShellFilters>
            <Button data-testid="filter" variant="outline" size="md">
              All
            </Button>
          </SearchShellFilters>
          <SearchShellViewport>
            <SearchResultsList>
              <SearchEntityResult type="button">
                <SearchEntityResultLeading>
                  <SearchEntityResultIcon data-testid="leading">
                    <Hash />
                  </SearchEntityResultIcon>
                </SearchEntityResultLeading>
                general
              </SearchEntityResult>
            </SearchResultsList>
          </SearchShellViewport>
        </SearchShellRoot>
      </ThemeProvider>,
    );
    const column = left("column");
    expect(left("filter") - column, "filter's edge").toBe(EDGE);
    expect(left("leading") - column, "row leading").toBe(EDGE);
  });
}

it("a column that holds no list keeps the phone's 16px head", async () => {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(390, 800);
  render(
    <ThemeProvider>
      <div data-testid="column" style={COLUMN}>
        <PanelSectionHeader>
          <PanelHeaderContent>
            <PanelTitle data-testid="title">Thread</PanelTitle>
          </PanelHeaderContent>
        </PanelSectionHeader>
      </div>
    </ThemeProvider>,
  );
  expect(textLeft(screen.getByTestId("title")) - left("column")).toBeCloseTo(16, 0);
});

it("a search hit's head line in a narrow list keeps the time inside the shape's padding", async () => {
  // The ⌘K overlay is narrow: a thread hit with a badge used to push its time
  // past the inner 12px, onto the shape's edge. The place truncates first,
  // then the time.
  render(
    <ThemeProvider>
      <SearchShellViewport style={NARROW}>
        <SearchResultsList>
          <SearchMessageResult type="button" data-testid="row">
            <SearchMessageResultHeader>
              <SearchMessageResultMeta>#design-reviews</SearchMessageResultMeta>
              <SearchMessageResultThreadMeta>thread</SearchMessageResultThreadMeta>
              <Badge>Upgrade to view</Badge>
              <SearchMessageResultSender>artin</SearchMessageResultSender>
              <SearchMessageResultTimestamp data-testid="time">
                127 days ago
              </SearchMessageResultTimestamp>
            </SearchMessageResultHeader>
          </SearchMessageResult>
        </SearchResultsList>
      </SearchShellViewport>
    </ThemeProvider>,
  );
  const row = screen.getByTestId("row");
  const shapeRight =
    row.getBoundingClientRect().right - Number.parseFloat(getComputedStyle(row, "::before").right);
  expect(
    shapeRight - screen.getByTestId("time").getBoundingClientRect().right,
  ).toBeGreaterThanOrEqual(12);
});
