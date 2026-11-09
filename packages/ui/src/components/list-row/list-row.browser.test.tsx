import "./list-row.test.css";
/**
 * Browser-mode checks for what the class strings alone cannot prove: the
 * hairline is drawn only between two rows (flat and in `ul > li`, never between
 * entry rows), and a row
 * that is selected or disabled does not react to hover.
 *
 * Run: `vp test --browser.enabled=true src/components/list-row/list-row.browser.test.tsx`
 * (chromium via playwright; a real CDP hover so :hover applies). The file
 * stays importable in the node pool, where it skips.
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  ListRow,
  ListRowBody,
  ListRowDescription,
  ListRowGroup,
  ListRowSubtitle,
  ListRowTitle,
} from "./list-row";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

/** Whether the row draws its hairline: a ::before that is shown, has content
 *  and a top border. (A flex container blockifies even an empty ::before, so
 *  display alone would read "block" for a row with no line.) */
function drawsRule(element: Element): boolean {
  const rule = getComputedStyle(element, "::before");
  return (
    rule.display !== "none" &&
    rule.content !== "none" &&
    rule.content !== "normal" &&
    Number.parseFloat(rule.borderTopWidth) > 0
  );
}

/** Tailwind rules are injected on demand: poll until the value settles. */
async function settled(read: () => string): Promise<string> {
  let prev = "";
  let next = read();
  for (let i = 0; i < 50 && next !== prev; i += 1) {
    prev = next;
    await new Promise((resolve) => setTimeout(resolve, 50));
    next = read();
  }
  return next;
}

it("draws the hairline only between two rows, flat and in a ul > li list", async () => {
  const { getByTestId } = render(
    <ThemeProvider>
      <div>
        <ListRow data-testid="flat-1">Wug</ListRow>
        <ListRow data-testid="flat-2">Martin</ListRow>
        <ListRow data-testid="flat-3">Mia Chen</ListRow>
      </div>
      <ListRowGroup render={<ul />}>
        <li>
          <ListRow data-testid="li-1">Wug</ListRow>
        </li>
        <li>
          <ListRow data-testid="li-2">Martin</ListRow>
        </li>
      </ListRowGroup>
      <div>
        <ListRow variant="entry" data-testid="entry-1">
          Search
        </ListRow>
        <ListRow variant="entry" data-testid="entry-2">
          Activity
        </ListRow>
      </div>
    </ThemeProvider>,
  );

  expect(await settled(() => String(drawsRule(getByTestId("flat-2"))))).toBe("true");
  expect(drawsRule(getByTestId("flat-1"))).toBe(false);
  expect(drawsRule(getByTestId("flat-3"))).toBe(true);
  expect(drawsRule(getByTestId("li-1"))).toBe(false);
  expect(drawsRule(getByTestId("li-2"))).toBe(true);
  expect(drawsRule(getByTestId("entry-1"))).toBe(false);
  expect(drawsRule(getByTestId("entry-2"))).toBe(false);
  // The default row's line starts at the text: 16 + 35 + 12.
  expect(getComputedStyle(getByTestId("flat-2"), "::before").left).toBe("63px");
});

it("a selected or a disabled row does not react to hover; an enabled one does", async () => {
  render(
    <ThemeProvider>
      <div>
        <ListRow data-testid="control">Wug</ListRow>
        <ListRow data-testid="selected" selected>
          Martin
        </ListRow>
        <ListRow data-testid="disabled" disabled>
          Mia Chen
        </ListRow>
      </div>
    </ThemeProvider>,
  );
  const { page } = await import("vite-plus/test/browser/context");
  const overlay = (id: string) => getComputedStyle(page.getByTestId(id).element()).backgroundImage;

  // Positive control: the rules have landed and hover lays the overlay.
  await page.getByTestId("control").hover();
  expect(await settled(() => overlay("control"))).toContain("linear-gradient");

  for (const id of ["selected", "disabled"]) {
    await page.getByTestId(id).hover({ force: true });
    expect(await settled(() => overlay(id)), `${id} must not react to hover`).toBe("none");
  }
});

it("a cell list draws no line, its shapes inset 8px at the sides, 2px apart and 8px from the list's ends", async () => {
  const { getByTestId } = render(
    <ThemeProvider>
      <div data-testid="list" className="flex flex-col gap-0.5 py-2">
        <ListRow cell data-testid="cell-1">
          Wug
        </ListRow>
        <ListRow cell data-testid="cell-2">
          Martin
        </ListRow>
      </div>
    </ThemeProvider>,
  );
  const first = getByTestId("cell-1");
  expect(await settled(() => getComputedStyle(first, "::before").left)).toBe("8px");
  for (const id of ["cell-1", "cell-2"]) {
    const row = getByTestId(id);
    expect(drawsRule(row), `${id} draws no line`).toBe(false);
    const shape = getComputedStyle(row, "::before");
    expect([shape.top, shape.right, shape.bottom, shape.left], id).toEqual([
      "0px",
      "8px",
      "0px",
      "8px",
    ]);
  }
  const list = getByTestId("list").getBoundingClientRect();
  const a = first.getBoundingClientRect();
  const b = getByTestId("cell-2").getBoundingClientRect();
  expect(b.top - a.bottom).toBe(2);
  expect(a.top - list.top).toBe(8);
  expect(list.bottom - b.bottom).toBe(8);
});

it("a subtitle is one line under the title, in the title's ink at 400 and a size down, through every tone", async () => {
  const long = "Drafts the release notes from merged pull requests and the changelog every Friday";
  const { getByTestId } = render(
    <ThemeProvider>
      <div style={{ width: 280 }}>
        {(["default", "unread", "muted", "away"] as const).map((tone) => (
          <ListRow key={tone} tone={tone} data-testid={`row-${tone}`}>
            <ListRowBody>
              <ListRowTitle data-testid={`title-${tone}`}>Bugen</ListRowTitle>
              <ListRowSubtitle data-testid={`subtitle-${tone}`}>{long}</ListRowSubtitle>
              <ListRowDescription data-testid={`description-${tone}`}>Off.</ListRowDescription>
            </ListRowBody>
          </ListRow>
        ))}
        <ListRow disabled data-testid="row-disabled">
          <ListRowBody>
            <ListRowTitle data-testid="title-disabled">Bugen</ListRowTitle>
            <ListRowSubtitle data-testid="subtitle-disabled">{long}</ListRowSubtitle>
          </ListRowBody>
        </ListRow>
      </div>
    </ThemeProvider>,
  );
  const style = (id: string) => getComputedStyle(getByTestId(id));
  // Wait for the rules: the subtitle's weight comes from its own class.
  expect(await settled(() => style("subtitle-default").fontWeight)).toBe("400");

  // Primary data: the title's ink, never the ink-2 an explanation reads.
  expect(style("subtitle-default").color).not.toBe(style("description-default").color);
  for (const tone of ["default", "unread", "muted", "away", "disabled"]) {
    expect(style(`subtitle-${tone}`).color, tone).toBe(style(`title-${tone}`).color);
  }

  const title = getByTestId("title-default");
  const subtitle = getByTestId("subtitle-default");
  expect(Number.parseFloat(style("subtitle-default").fontSize)).toBeLessThan(
    Number.parseFloat(style("title-default").fontSize),
  );
  // Its own line under the title, cut to one line at the row's width.
  expect(subtitle.getBoundingClientRect().top).toBeGreaterThanOrEqual(
    title.getBoundingClientRect().bottom - 0.5,
  );
  expect(subtitle.getBoundingClientRect().height).toBeCloseTo(
    Number.parseFloat(style("subtitle-default").lineHeight),
    0,
  );
  expect(subtitle.scrollWidth).toBeGreaterThan(subtitle.clientWidth);
});
