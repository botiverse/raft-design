import "./list-row.test.css";
/**
 * Browser-mode checks for what the class strings alone cannot prove: the
 * hairline is drawn only between two rows (flat and in `ul > li`, never between
 * entry rows), a row
 * that is selected or disabled does not react to hover, a settings row's
 * ends centre on the whole row whether or not a SaveStatus is under its text
 * (empty, it takes no room), and an attached row follows the setting above it
 * with no hairline between them.
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

/** A settings row whose body ends with a SaveStatus, or with none at all
 *  (`status` undefined). */
function StatusRow({ status }: { status?: ReactNode }) {
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
              {status === undefined ? null : <SaveStatus data-testid="status">{status}</SaveStatus>}
            </ListRowBody>
            <Switch aria-labelledby="hide-all-title" data-testid="switch" />
          </ListRow>
        </ListRowGroup>
      </div>
    </ThemeProvider>
  );
}

it("a settings row centres its ends on the whole row, and an empty SaveStatus changes nothing", async () => {
  const { getByTestId, rerender } = render(<StatusRow />);
  const box = (id: string) => getByTestId(id).getBoundingClientRect();
  const centre = (r: DOMRect) => (r.top + r.bottom) / 2;
  const row = getByTestId("row");
  await settled(() => getComputedStyle(row).paddingBottom);
  const style = getComputedStyle(row);
  expect(style.paddingBottom).toBe(style.paddingTop);
  expect(Math.abs(centre(box("switch")) - centre(box("body")))).toBeLessThanOrEqual(1);
  expect(Math.abs(centre(box("icon")) - centre(box("body")))).toBeLessThanOrEqual(1);
  const at = { switch: box("switch").top, icon: box("icon").top, row: box("row").height };

  // Nothing failed: the line is there, empty, and takes no room, so the row
  // is as tall as without it and its ends stay put.
  for (const status of [null, <SaveStatusSaved key="saved">Saved</SaveStatusSaved>]) {
    rerender(<StatusRow status={status} />);
    expect(box("status").height).toBe(0);
    expect(box("row").height, "an empty line changed the row's height").toBe(at.row);
    expect(box("switch").top, "an empty line moved the switch").toBe(at.switch);
    expect(box("icon").top, "an empty line moved the icon").toBe(at.icon);
  }
});

it("a failure grows a settings row by its line, and the ends centre on the whole row, error included", async () => {
  const { getByTestId, rerender } = render(<StatusRow status={null} />);
  const box = (id: string) => getByTestId(id).getBoundingClientRect();
  const centre = (r: DOMRect) => (r.top + r.bottom) / 2;
  await settled(() => getComputedStyle(getByTestId("row")).paddingBottom);
  const at = { switch: box("switch").top, row: box("row").height };

  rerender(
    <StatusRow status={<SaveStatusError>Couldn&apos;t save. Try again.</SaveStatusError>} />,
  );
  const status = getByTestId("status");
  const line = Number.parseFloat(getComputedStyle(status).lineHeight);
  expect(box("status").top - box("description").bottom, "4px under the description").toBeCloseTo(
    4,
    0,
  );
  const grew = box("row").height - at.row;
  expect(grew, "the row grows by the line and its 4px").toBeCloseTo(4 + line, 0);
  expect(Math.abs(centre(box("switch")) - centre(box("body")))).toBeLessThanOrEqual(1);
  expect(box("switch").top - at.switch, "the switch moves down by half").toBeCloseTo(grew / 2, 0);
});

function QuietHours({ attached }: { attached: boolean }) {
  return (
    <ThemeProvider>
      <div style={{ width: 480 }}>
        <ListRowGroup>
          <ListRow variant="plain" interactive={false} data-testid="owner">
            <ListRowBody data-testid="owner-body">
              <ListRowTitle id="quiet-title">Quiet hours</ListRowTitle>
              <ListRowDescription wrap>
                Every day between these times, nothing alerts on any of your devices.
              </ListRowDescription>
            </ListRowBody>
            <Switch aria-labelledby="quiet-title" data-testid="owner-switch" />
          </ListRow>
          <ListRow variant="plain" interactive={false} attached={attached} data-testid="times">
            <ListRowBody data-testid="times-body">
              <ListRowTitle>22:00 to 08:00</ListRowTitle>
            </ListRowBody>
          </ListRow>
          <ListRow variant="plain" interactive={false} data-testid="next">
            <ListRowBody>
              <ListRowTitle>Show message previews</ListRowTitle>
            </ListRowBody>
          </ListRow>
        </ListRowGroup>
      </div>
    </ThemeProvider>
  );
}

it("an attached row follows the setting above it: no hairline, no top padding, and the setting doesn't move", async () => {
  const { getByTestId, rerender } = render(<QuietHours attached={false} />);
  const box = (id: string) => getByTestId(id).getBoundingClientRect();
  const owner = getByTestId("owner");
  await settled(() => getComputedStyle(owner).paddingBottom);
  const inset = Number.parseFloat(getComputedStyle(owner).paddingBottom);
  expect(inset, "the settings row inset").toBeGreaterThan(0);

  // Not attached: a row of its own, a hairline and the full inset above it.
  expect(drawsRule(getByTestId("times"))).toBe(true);
  expect(box("times-body").top - box("owner-body").bottom).toBeCloseTo(2 * inset, 0);
  const at = { switch: box("owner-switch").top, owner: box("owner").height };

  rerender(<QuietHours attached />);
  const times = getByTestId("times");
  expect(times.hasAttribute("data-attached")).toBe(true);
  expect(drawsRule(times), "no hairline above an attached row").toBe(false);
  expect(getComputedStyle(times).paddingTop).toBe("0px");
  // The only space between them is the owning row's bottom inset.
  expect(box("times-body").top - box("owner-body").bottom).toBeCloseTo(inset, 0);
  // The setting it belongs to keeps its height, and its switch stays put.
  expect(box("owner").height).toBe(at.owner);
  expect(box("owner-switch").top).toBe(at.switch);
  // The row after it is another setting, with its hairline.
  expect(drawsRule(getByTestId("next"))).toBe(true);
});

function RiskRows() {
  const row = (id: string, props: Parameters<typeof ListRow>[0] = {}) => (
    <ListRow variant="plain" data-testid={id} {...props}>
      <ListRowIcon data-testid={`${id}-icon`}>
        <Settings />
      </ListRowIcon>
      <ListRowBody>
        <ListRowTitle data-testid={`${id}-title`}>Delete channel</ListRowTitle>
        <ListRowDescription data-testid={`${id}-description`}>
          Everyone loses it.
        </ListRowDescription>
      </ListRowBody>
    </ListRow>
  );
  return (
    <ListRowGroup>
      {row("plain")}
      {row("warning", { tone: "warning" })}
      {row("danger", { tone: "danger" })}
      {row("display", { tone: "danger", interactive: false })}
      {row("disabled", { tone: "danger", disabled: true })}
      {row("disabled-plain", { disabled: true })}
    </ListRowGroup>
  );
}

for (const mode of ["light", "dark"] as const) {
  it(`${mode}: a risk tone colours the title and the leading icon only, never a display-only or disabled row`, async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <div className={mode}>
          <RiskRows />
          <span className="text-warning-strong" data-testid="warning-ink" />
          <span className="text-danger-strong" data-testid="danger-ink" />
        </div>
      </ThemeProvider>,
    );
    const color = (id: string) => getComputedStyle(getByTestId(id)).color;
    const warning = await settled(() => color("warning-ink"));
    const danger = color("danger-ink");
    expect(warning).not.toBe(danger);
    expect(await settled(() => color("danger-title"))).toBe(danger);

    for (const [tone, ink] of [
      ["warning", warning],
      ["danger", danger],
    ] as const) {
      expect(color(`${tone}-title`), `${tone} title`).toBe(ink);
      expect(color(`${tone}-icon`), `${tone} icon`).toBe(ink);
      expect(getComputedStyle(getByTestId(`${tone}-icon`).querySelector("svg")!).color).toBe(ink);
      // The description keeps the row's ink-2.
      expect(color(`${tone}-description`), `${tone} description`).toBe(color("plain-description"));
    }
    // Only an action has a risk: a display-only row reads as a plain one.
    for (const part of ["title", "icon", "description"]) {
      expect(color(`display-${part}`), `display-only ${part}`).toBe(color(`plain-${part}`));
      expect(color(`disabled-${part}`), `disabled ${part}`).toBe(color(`disabled-plain-${part}`));
    }
    expect(color("plain-title")).not.toBe(danger);
    expect(color("plain-icon")).not.toBe(danger);
  });
}
