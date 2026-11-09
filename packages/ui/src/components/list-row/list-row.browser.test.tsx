import "./list-row.test.css";
/**
 * Browser-mode checks for what the class strings alone cannot prove: the
 * hairline is drawn only between two rows (flat and in `ul > li`, never between
 * entry rows), a row
 * that is selected or disabled does not react to hover, and a settings row's
 * ends centre on its text, not on the SaveStatus line reserved under it.
 *
 * Run: `vp test --browser.enabled=true src/components/list-row/list-row.browser.test.tsx`
 * (chromium via playwright; a real CDP hover so :hover applies). The file
 * stays importable in the node pool, where it skips.
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { Settings } from "lucide-react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { SaveStatus, SaveStatusError, SaveStatusSaved } from "../save-status/save-status";
import { Switch } from "../switch/switch";
import {
  ListRow,
  ListRowBody,
  ListRowDescription,
  ListRowGroup,
  ListRowIcon,
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

function StatusRow({ status }: { status: ReactNode }) {
  return (
    <ThemeProvider>
      <div style={{ width: 480 }}>
        <ListRowGroup>
          <ListRow variant="plain" interactive={false} data-testid="row">
            <ListRowIcon data-testid="icon">
              <Settings />
            </ListRowIcon>
            <ListRowBody data-testid="body">
              <ListRowTitle id="hide-all-title" data-testid="title">
                Hide #all channel
              </ListRowTitle>
              <ListRowDescription wrap data-testid="description">
                Members no longer see #all in their sidebar.
              </ListRowDescription>
              <SaveStatus data-testid="status">{status}</SaveStatus>
            </ListRowBody>
            <Switch aria-labelledby="hide-all-title" data-testid="switch" />
          </ListRow>
        </ListRowGroup>
      </div>
    </ThemeProvider>
  );
}

it("a settings row's ends centre on its title and description, not on the SaveStatus line under them", async () => {
  const { getByTestId, rerender } = render(<StatusRow status={<SaveStatusSaved />} />);
  const box = (id: string) => getByTestId(id).getBoundingClientRect();
  const centre = (r: DOMRect) => (r.top + r.bottom) / 2;
  // Wait for the rules: the line reserves one footnote line once they land.
  await settled(() => String(box("status").height));
  expect(box("status").height).toBeGreaterThan(0);

  const text = (box("title").top + box("description").bottom) / 2;
  const at = { switch: box("switch").top, icon: box("icon").top, row: box("row").height };
  expect(
    Math.abs(centre(box("switch")) - text),
    "the switch centres on the text",
  ).toBeLessThanOrEqual(1);
  expect(Math.abs(centre(box("icon")) - text), "the icon centres on the text").toBeLessThanOrEqual(
    1,
  );

  // The row keeps its height: its padding and the whole body, line included.
  const inset = Number.parseFloat(getComputedStyle(getByTestId("row")).paddingTop);
  expect(at.row).toBeCloseTo(box("body").height + 2 * inset, 0);

  // "Saved" arriving moves nothing.
  rerender(<StatusRow status={<SaveStatusSaved>Saved</SaveStatusSaved>} />);
  expect(box("switch").top, "Saved moved the switch").toBe(at.switch);
  expect(box("icon").top, "Saved moved the icon").toBe(at.icon);
  expect(box("row").height, "Saved changed the row's height").toBe(at.row);

  // A one-line error moves nothing either.
  rerender(
    <StatusRow status={<SaveStatusError>Couldn&apos;t save. Try again.</SaveStatusError>} />,
  );
  expect(box("switch").top, "a one-line error moved the switch").toBe(at.switch);
  expect(box("row").height).toBe(at.row);

  // The line reserves one line: an error that wraps grows the row by its
  // extra lines, and the ends, still centred on the row less the reserved
  // line, move down by half of them.
  const long =
    "Couldn't hide #all: the server didn't answer before the request timed out. Check your connection and try again.";
  rerender(<StatusRow status={<SaveStatusError>{long}</SaveStatusError>} />);
  const extra = box("row").height - at.row;
  expect(extra, "the long error wraps").toBeGreaterThan(0);
  expect(box("switch").top - at.switch).toBeCloseTo(extra / 2, 0);
});

it("a settings row without a SaveStatus still centres its ends on the whole body", async () => {
  const { getByTestId } = render(
    <ThemeProvider>
      <div style={{ width: 480 }}>
        <ListRow variant="plain" interactive={false} data-testid="row">
          <ListRowBody data-testid="body">
            <ListRowTitle id="t">Hide #all channel</ListRowTitle>
            <ListRowDescription wrap>
              Members no longer see #all in their sidebar.
            </ListRowDescription>
          </ListRowBody>
          <Switch aria-labelledby="t" data-testid="switch" />
        </ListRow>
      </div>
    </ThemeProvider>,
  );
  const row = getByTestId("row");
  await settled(() => getComputedStyle(row).paddingBottom);
  const style = getComputedStyle(row);
  expect(style.paddingBottom).toBe(style.paddingTop);
  const body = getByTestId("body").getBoundingClientRect();
  const sw = getByTestId("switch").getBoundingClientRect();
  expect(Math.abs((sw.top + sw.bottom) / 2 - (body.top + body.bottom) / 2)).toBeLessThanOrEqual(1);
});
