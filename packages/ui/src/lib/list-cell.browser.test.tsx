import "./row-hover.test.css";
import type { ReactElement } from "react";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ActivityInboxViewport } from "../components/activity-inbox";
import { ThemeProvider } from "./theme/theme-provider";
import { settled, token } from "./row-hover.test-colors";
import { InboxItem, InboxItemContent, InboxItemTitle } from "../components/inbox-item";
import { ListRow } from "../components/list-row/list-row";
import {
  SearchEntityResult,
  SearchMessageResult,
  SearchResultsList,
  SearchShellViewport,
} from "../components/search";
import { SidebarItem, SidebarItemTitle } from "../components/sidebar/sidebar-item";
import { SidebarList, SidebarSection } from "../components/sidebar/sidebar-section";

// List cells (design/patterns/lists.md), measured in a real browser: every
// list row draws no divider and draws its states on one shape as tall as the
// row and inset 8px from both sides of the list, in every state, with a
// classic scrollbar or without one. The list, not the shape, spaces the rows:
// its container is a column with a 2px gap, which belongs to no row.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

type List = {
  name: string;
  row: (i: number, props?: object) => ReactElement;
  /** The list's own container, inside a scroller; none when the scroller is the list. */
  list?: (rows: ReactElement[]) => ReactElement;
};

const lists: List[] = [
  {
    // Rows go straight in ActivityInboxViewport, which is the list.
    name: "inbox-item",
    row: (i, props) => (
      <InboxItem key={i} data-testid={`row-${i}`} {...props}>
        <InboxItemContent>
          <InboxItemTitle>Kirby mentioned you</InboxItemTitle>
        </InboxItemContent>
      </InboxItem>
    ),
  },
  {
    name: "sidebar-item",
    row: (i, props) => (
      <SidebarItem key={i} data-testid={`row-${i}`} {...props}>
        <SidebarItemTitle>launch-week</SidebarItemTitle>
      </SidebarItem>
    ),
    list: (rows) => (
      <SidebarSection>
        <SidebarList data-testid="list">{rows}</SidebarList>
      </SidebarSection>
    ),
  },
  {
    name: "list-row",
    row: (i, props) => (
      <ListRow cell key={i} data-testid={`row-${i}`} {...props}>
        Wug
      </ListRow>
    ),
    // A flat list of ListRows: the caller's column, with the list gap.
    list: (rows) => (
      <div data-testid="list" className="flex flex-col gap-0.5 py-2">
        {rows}
      </div>
    ),
  },
  {
    name: "search-entity-result",
    row: (i, props) => (
      <SearchEntityResult key={i} data-testid={`row-${i}`} {...props}>
        launch-week
      </SearchEntityResult>
    ),
    list: (rows) => <SearchResultsList data-testid="list">{rows}</SearchResultsList>,
  },
  {
    name: "search-message-result",
    row: (i, props) => (
      <SearchMessageResult key={i} data-testid={`row-${i}`} {...props}>
        A message that matched
      </SearchMessageResult>
    ),
    list: (rows) => <SearchResultsList data-testid="list">{rows}</SearchResultsList>,
  },
];

/** The shape's box: the row's box less the ::before's computed insets. */
function shapeRect(row: HTMLElement) {
  const box = row.getBoundingClientRect();
  const s = getComputedStyle(row, "::before");
  const px = (v: string) => Number.parseFloat(v);
  return {
    left: box.left + px(s.left),
    right: box.right - px(s.right),
    top: box.top + px(s.top),
    bottom: box.bottom - px(s.bottom),
  };
}

const SHORT = { width: 400, height: 120, flex: "none" } as const;
const TALL = { width: 400, height: 600, flex: "none" } as const;

function renderList(name: string, rows: number, overflow: boolean, selected?: object) {
  const list = lists.find((l) => l.name === name)!;
  const items = Array.from({ length: rows }, (_, i) => list.row(i, i === 1 ? selected : undefined));
  const style = overflow ? SHORT : TALL;
  render(
    <ThemeProvider>
      {list.list ? (
        <SearchShellViewport data-testid="scroller" style={style}>
          {list.list(items)}
        </SearchShellViewport>
      ) : (
        <ActivityInboxViewport data-testid="scroller" style={style}>
          {items}
        </ActivityInboxViewport>
      )}
    </ThemeProvider>,
  );
  return screen.getByTestId("scroller");
}

/** The edges of a row's shape from the scroller's outer edges. */
function edges(scroller: HTMLElement, row: HTMLElement) {
  const outer = scroller.getBoundingClientRect();
  const shape = shapeRect(row);
  const box = row.getBoundingClientRect();
  return {
    start: shape.left - outer.left,
    end: outer.right - shape.right,
    top: shape.top - box.top,
    bottom: box.bottom - shape.bottom,
  };
}

const selectedProps: Record<string, object> = {
  "inbox-item": { active: true },
  "sidebar-item": { active: true },
  "list-row": { selected: true },
  "search-entity-result": { selected: true },
  "search-message-result": { selected: true },
};

for (const { name } of lists) {
  it(`${name}: rows sit 2px apart, draw no line, and the shape is 8px from both edges in every state`, async () => {
    const scroller = renderList(name, 3, false, selectedProps[name]);
    const rows = [0, 1, 2].map((i) => screen.getByTestId(`row-${i}`));
    // Positive control: the cell's rules have landed.
    expect(await settled(() => getComputedStyle(rows[0]!, "::before").left)).toBe("8px");
    expect(scroller.style.getPropertyValue("--scrollbar-size")).toBe("0px");

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i]!;
      const style = getComputedStyle(row);
      expect(style.borderTopWidth, `${name} row ${i} has no border line`).toBe("0px");
      expect(getComputedStyle(row, "::before").borderTopWidth).toBe("0px");
      expect(style.marginTop).toBe("0px");
      expect(style.marginBottom).toBe("0px");
      expect(edges(scroller, row), `${name} row ${i}`).toEqual({
        start: 8,
        end: 8,
        top: 0,
        bottom: 0,
      });
      expect(getComputedStyle(row, "::before").borderTopLeftRadius).toBe("8px");
    }

    // The list's gap spaces the rows 2px apart. The gap belongs to the list,
    // not to a row; a row's whole height, up to its edge, is its target.
    const a = rows[0]!.getBoundingClientRect();
    const b = rows[1]!.getBoundingClientRect();
    expect(b.top - a.bottom, `${name}: the list gap`).toBe(2);
    const list = rows[0]!.parentElement!;
    expect(getComputedStyle(list).rowGap).toBe("2px");
    // The list's ends: 8px at the top and bottom, as far as the shape sits
    // from the sides, so the first shape is 8px below the list's top edge.
    expect(getComputedStyle(list).paddingTop, `${name}: list top`).toBe("8px");
    expect(getComputedStyle(list).paddingBottom, `${name}: list bottom`).toBe("8px");
    expect(a.top - list.getBoundingClientRect().top, `${name}: first shape`).toBe(8);
    for (const x of [a.left + 2, a.left + a.width / 2, a.right - 2]) {
      const hit = document.elementFromPoint(x, a.bottom - 0.5);
      expect(hit && rows[0]!.contains(hit), `${name}: ${x},${a.bottom - 0.5} hits row 0`).toBe(
        true,
      );
      const gap = document.elementFromPoint(x, a.bottom + 1);
      expect(gap && !rows.some((r) => r.contains(gap)), `${name}: the gap is no row's`).toBe(true);
      const below = document.elementFromPoint(x, b.top + 0.5);
      expect(below && rows[1]!.contains(below), `${name}: just below the gap hits row 1`).toBe(
        true,
      );
    }

    // Hovered, the fill is the same shape.
    const { page, userEvent } = await import("vite-plus/test/browser/context");
    await page.getByTestId("row-2").hover();
    expect(await settled(() => getComputedStyle(rows[2]!, "::before").backgroundColor)).not.toBe(
      "rgba(0, 0, 0, 0)",
    );
    expect(edges(scroller, rows[2]!)).toEqual({ start: 8, end: 8, top: 0, bottom: 0 });
    // Selected, too.
    expect(getComputedStyle(rows[1]!, "::before").backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(edges(scroller, rows[1]!)).toEqual({ start: 8, end: 8, top: 0, bottom: 0 });
    await userEvent.unhover(document.body);
  });
}

it("a scroller publishes its classic scrollbar, and the shape stays 8px from both outer edges", async () => {
  const scroller = renderList("inbox-item", 8, true);
  const row = screen.getByTestId("row-0");
  await settled(() => getComputedStyle(row, "::before").left);
  const scrollbar = scroller.offsetWidth - scroller.clientWidth;
  expect(scroller.style.getPropertyValue("--scrollbar-size")).toBe(`${scrollbar}px`);
  // Headless Chromium hides classic scrollbars; where one shows, it is the
  // 8px list scrollbar and the shape gives its end inset back.
  if (scrollbar > 0) expect(scrollbar).toBe(8);
  expect(edges(scroller, row)).toEqual({ start: 8, end: 8, top: 0, bottom: 0 });
});

it("press fills the shape at once, with no hover gate, so a finger presses as a mouse does", () => {
  const rules: string[] = [];
  const walk = (list: CSSRuleList, gated: boolean) => {
    for (const rule of Array.from(list)) {
      if (rule instanceof CSSMediaRule) {
        walk(rule.cssRules, gated || /hover:\s*hover/.test(rule.conditionText));
      } else if (rule instanceof CSSStyleRule) {
        if (
          !gated &&
          /:active/.test(rule.selectorText) &&
          rule.selectorText.endsWith("::before") &&
          rule.style.backgroundColor.includes("--fill-cell-press")
        ) {
          rules.push(rule.selectorText);
        }
        walk(rule.cssRules, gated);
      } else if ("cssRules" in rule) {
        walk((rule as CSSGroupingRule).cssRules, gated);
      }
    }
  };
  render(
    <ThemeProvider>
      <ListRow cell>Wug</ListRow>
    </ThemeProvider>,
  );
  for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules, false);
  expect(rules.length, "an ungated :active rule fills the shape").toBeGreaterThan(0);
});

for (const mode of ["light", "dark"] as const) {
  it(`${mode}: the cell tokens`, () => {
    render(
      <ThemeProvider>
        <div className={mode} data-testid="scope" />
      </ThemeProvider>,
    );
    const scope = screen.getByTestId("scope");
    if (mode === "light") {
      expect(token(scope, "fill-cell-hover")).toBe(token(scope, "fill-subtle"));
      expect(token(scope, "fill-cell-press")).toBe(token(scope, "fill-medium"));
      expect(token(scope, "fill-cell-selected")).toBe(token(scope, "info-soft"));
    } else {
      // Dark rows step up so their states read on a dark surface.
      expect(token(scope, "fill-cell-hover")).toBe("oklch(0.9843 0.004 106.47 / 0.075)");
      expect(token(scope, "fill-cell-press")).toBe("oklch(0.9843 0.004 106.47 / 0.12)");
      expect(token(scope, "fill-cell-selected")).toBe("oklch(0.452 0.0862 225.67 / 0.38)");
      expect(token(scope, "fill-subtle")).toBe("oklch(0.9843 0.004 106.47 / 0.03)");
    }
  });
}
