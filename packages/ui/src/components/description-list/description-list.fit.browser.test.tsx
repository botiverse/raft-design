import "./description-list.test.css";
import type { ReactNode } from "react";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Badge } from "../badge/badge";
import {
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
} from "./description-list";

// A horizontal list stacks its labels when a value has a piece that can't
// break (one chip of a wrapping chip row) wider than the value column but no
// wider than the list: beside the label that chip would be cut. A chip row
// wider than the list wraps either way, so its one-line width doesn't decide;
// its widest chip does. Real layout only: jsdom measures nothing.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const longChip = "Qwen Code (experimental) (not installed)";
const shortChips = ["Claude Code", "Codex", "Gemini CLI", "Cursor", "Aider", "Goose", "Amp"];

function Chip({ children, id }: { children: string; id?: string }) {
  return (
    <Badge appearance="soft" variant="muted" data-testid={id}>
      {children}
    </Badge>
  );
}

/**
 * The list's width, from the long chip's own: 60px wider, so the chip fits a
 * line of its own, but the value column (the list less a label column of at
 * least 88px and the 16px gap) is narrower than it.
 */
async function listWidth(): Promise<number> {
  await document.fonts.ready;
  render(
    <ThemeProvider>
      <Chip id="probe">{longChip}</Chip>
    </ThemeProvider>,
  );
  const width = Math.ceil(screen.getByTestId("probe").getBoundingClientRect().width) + 60;
  cleanup();
  return width;
}

function renderList(width: number, value: ReactNode) {
  render(
    <ThemeProvider>
      <div style={{ width: `${width}px` }}>
        <DescriptionList direction="horizontal" data-testid="list">
          <DescriptionItem>
            <DescriptionTerm>Detected runtimes</DescriptionTerm>
            <DescriptionDetails data-testid="value">{value}</DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem>
            <DescriptionTerm>Status</DescriptionTerm>
            <DescriptionDetails>Online</DescriptionDetails>
          </DescriptionItem>
        </DescriptionList>
      </div>
    </ThemeProvider>,
  );
  return screen.getByTestId("list");
}

/** The value's width with nothing wrapping: what the one-line rule reads. */
function oneLineWidth(el: HTMLElement): number {
  const { width, maxWidth, flexWrap } = el.style;
  Object.assign(el.style, { width: "max-content", maxWidth: "none", flexWrap: "nowrap" });
  const natural = el.getBoundingClientRect().width;
  Object.assign(el.style, { width, maxWidth, flexWrap });
  return natural;
}

it("stacks when one chip of a wrapping chip row is wider than the value column", async () => {
  const width = await listWidth();
  const list = renderList(
    width,
    <>
      <Chip>Claude Code</Chip>
      <Chip id="long">{longChip}</Chip>
      <Chip>Codex</Chip>
    </>,
  );
  // The old rule can't decide: the whole row doesn't fit the list either.
  expect(oneLineWidth(screen.getByTestId("value"))).toBeGreaterThan(width);
  await expect.poll(() => list.hasAttribute("data-stacked")).toBe(true);
  // Stacked, the long chip is shown whole on a line of its own.
  const chip = screen.getByTestId("long");
  expect(chip.scrollWidth - chip.clientWidth).toBeLessThanOrEqual(1);
  expect(chip.getBoundingClientRect().right).toBeLessThanOrEqual(
    list.getBoundingClientRect().right + 0.5,
  );
});

it("stays beside its labels when every chip of a wrapping row fits the value column", async () => {
  const width = await listWidth();
  const list = renderList(
    width,
    shortChips.map((chip) => <Chip key={chip}>{chip}</Chip>),
  );
  // Wider than the list on one line, so it wraps; each chip fits the column.
  expect(oneLineWidth(screen.getByTestId("value"))).toBeGreaterThan(width);
  await document.fonts.ready;
  expect(list.hasAttribute("data-stacked")).toBe(false);
});

it("stays beside its labels when a few short chips fit the value column on one line", async () => {
  const width = await listWidth();
  const list = renderList(
    width,
    <>
      <Chip>Claude Code</Chip>
      <Chip>Codex</Chip>
    </>,
  );
  await document.fonts.ready;
  expect(list.hasAttribute("data-stacked")).toBe(false);
});

it("stays beside its labels for a paragraph that wraps either way", async () => {
  const width = await listWidth();
  const list = renderList(
    width,
    "The agent found these runtimes on the computer it runs on, and will use the first one that is installed when it starts a task. ".repeat(
      2,
    ),
  );
  expect(oneLineWidth(screen.getByTestId("value"))).toBeGreaterThan(width);
  await document.fonts.ready;
  expect(list.hasAttribute("data-stacked")).toBe(false);
});
