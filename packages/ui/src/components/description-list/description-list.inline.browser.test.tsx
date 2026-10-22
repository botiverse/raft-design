import "./description-list.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { Ellipsis } from "../ellipsis/ellipsis";
import { TaskStatusBadge } from "../tasks/task-status-badge";
import { TooltipProvider } from "../tooltip/tooltip";
import {
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
} from "./description-list";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const facts = ["plain", "badge", "task", "button"] as const;

// A zero-size inline-block sits on its line's baseline, so its top is the
// baseline of the text it follows.
function Text({ id, children }: { id: string; children: string }) {
  return (
    <span data-testid={id}>
      {children}
      <span data-baseline style={{ display: "inline-block", width: 0, height: 0 }} />
    </span>
  );
}

function renderInline() {
  render(
    <ThemeProvider>
      <div style={{ width: "720px" }}>
        <DescriptionList direction="inline" data-testid="list">
          <DescriptionItem data-testid="item-plain">
            <DescriptionTerm>
              <Text id="term-plain">Created by</Text>
            </DescriptionTerm>
            <DescriptionDetails>
              <Text id="value-plain">Atlas</Text>
            </DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem data-testid="item-badge">
            <DescriptionTerm>
              <Text id="term-badge">Status</Text>
            </DescriptionTerm>
            <DescriptionDetails>
              <Badge appearance="soft" variant="information">
                <Text id="value-badge">In review</Text>
              </Badge>
            </DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem data-testid="item-task">
            <DescriptionTerm>
              <Text id="term-task">Task</Text>
            </DescriptionTerm>
            <DescriptionDetails>
              <TaskStatusBadge status="in-review">
                <Text id="value-task">In review</Text>
              </TaskStatusBadge>
            </DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem data-testid="item-button">
            <DescriptionTerm>
              <Text id="term-button">Assignee</Text>
            </DescriptionTerm>
            <DescriptionDetails>
              <Button variant="ghost" type="button">
                <Text id="value-button">Cali</Text>
              </Button>
            </DescriptionDetails>
          </DescriptionItem>
        </DescriptionList>
      </div>
    </ThemeProvider>,
  );
}

function baseline(id: string): number {
  return screen.getByTestId(id).querySelector("[data-baseline]")!.getBoundingClientRect().top;
}

function textRect(id: string): DOMRect {
  const range = document.createRange();
  range.selectNodeContents(screen.getByTestId(id).firstChild!);
  return range.getBoundingClientRect();
}

it("inline: every term and value sits on one baseline", () => {
  renderInline();
  const first = baseline("term-plain");
  for (const fact of facts) {
    expect(Math.abs(baseline(`term-${fact}`) - first)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(baseline(`value-${fact}`) - first)).toBeLessThanOrEqual(0.5);
  }
});

it("inline: a shaped value's text starts as far from its label as plain text", () => {
  renderInline();
  // A shape's first mark is its text, or its icon when it leads with one.
  const firstMark = (fact: (typeof facts)[number]) =>
    fact === "task"
      ? screen
          .getByTestId("item-task")
          .querySelector("[data-slot=task-status-icon]")!
          .getBoundingClientRect()
      : textRect(`value-${fact}`);
  const gaps = facts.map((fact) => firstMark(fact).left - textRect(`term-${fact}`).right);
  expect(gaps[0]).toBeCloseTo(12, 0);
  for (const gap of gaps) expect(Math.abs(gap - gaps[0]!)).toBeLessThanOrEqual(0.5);
});

it("inline: facts flow left to right, 24px apart, with no top padding on later facts", () => {
  renderInline();
  const items = facts.map((fact) => screen.getByTestId(`item-${fact}`));
  for (const item of items) expect(getComputedStyle(item).paddingTop).toBe("0px");
  for (let i = 1; i < items.length; i++) {
    const prev = items[i - 1]!.getBoundingClientRect();
    const next = items[i]!.getBoundingClientRect();
    expect(next.left - prev.right).toBeCloseTo(24, 0);
  }
});

it("inline: a value that wraps keeps its first line on the row's baseline", () => {
  render(
    <ThemeProvider>
      <div style={{ width: "720px" }}>
        <DescriptionList direction="inline">
          <DescriptionItem>
            <DescriptionTerm>
              <Text id="term-short">Status</Text>
            </DescriptionTerm>
            <DescriptionDetails>
              <Badge appearance="soft" variant="information">
                <Text id="value-short">In review</Text>
              </Badge>
            </DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem>
            <DescriptionTerm>
              <Text id="term-long">Notes</Text>
            </DescriptionTerm>
            <DescriptionDetails className="max-w-30">
              <Text id="value-long">Waiting on the release notes from Atlas</Text>
            </DescriptionDetails>
          </DescriptionItem>
        </DescriptionList>
      </div>
    </ThemeProvider>,
  );
  const first = baseline("term-short");
  expect(Math.abs(baseline("value-short") - first)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(baseline("term-long") - first)).toBeLessThanOrEqual(0.5);
  // The long value's first line, not its last, is on the row's baseline.
  const range = document.createRange();
  range.selectNodeContents(screen.getByTestId("value-long").firstChild!);
  const lines = range.getClientRects();
  expect(lines.length).toBeGreaterThan(1);
  const valueLine = textRect("value-short");
  expect(Math.abs(lines[0]!.bottom - valueLine.bottom)).toBeLessThanOrEqual(3);
});

// Every fact follows one flow: a long value is capped (24rem) and, put in an
// Ellipsis, cut there, sharing its line with the next fact instead of taking a
// line of its own; facts on a line are 24px apart and lines 8px apart.
it("an inline fact with a long value is capped and shares the line", async () => {
  render(
    <ThemeProvider>
      <TooltipProvider>
        <div style={{ width: "900px" }}>
          <DescriptionList direction="inline" data-testid="list">
            <DescriptionItem data-testid="fact-status">
              <DescriptionTerm>Status</DescriptionTerm>
              <DescriptionDetails>In Review</DescriptionDetails>
            </DescriptionItem>
            <DescriptionItem data-testid="fact-source">
              <DescriptionTerm>Source</DescriptionTerm>
              <DescriptionDetails>
                <Ellipsis data-testid="source-text">
                  {"A message long enough to fill the whole row on its own, and then some more words after that. ".repeat(
                    3,
                  )}
                </Ellipsis>
              </DescriptionDetails>
            </DescriptionItem>
            <DescriptionItem data-testid="fact-created-by">
              <DescriptionTerm>Created by</DescriptionTerm>
              <DescriptionDetails>Cody</DescriptionDetails>
            </DescriptionItem>
            <DescriptionItem data-testid="fact-created-at">
              <DescriptionTerm>Created at</DescriptionTerm>
              <DescriptionDetails>Oct 21, 2026, 23:24</DescriptionDetails>
            </DescriptionItem>
            <DescriptionItem data-testid="fact-more">
              <DescriptionTerm>Earlier discussion</DescriptionTerm>
              <DescriptionDetails>4 replies</DescriptionDetails>
            </DescriptionItem>
          </DescriptionList>
        </div>
      </TooltipProvider>
    </ThemeProvider>,
  );
  const box = (id: string) => screen.getByTestId(id).getBoundingClientRect();
  const status = box("fact-status");
  const source = box("fact-source");
  const createdBy = box("fact-created-by");
  expect(source.width).toBeLessThanOrEqual(24 * 16 + 0.5);
  // Source stays on Status's line, 24px after it, and the next fact follows.
  expect(Math.abs(source.top - status.top)).toBeLessThan(8);
  expect(source.left - status.right).toBeCloseTo(24, 0);
  expect(Math.abs(createdBy.top - status.top)).toBeLessThan(8);
  expect(createdBy.left - source.right).toBeCloseTo(24, 0);
  const text = () => screen.getByTestId("source-text").querySelector('[data-slot="ellipsis-text"]');
  await expect.poll(() => text()?.hasAttribute("data-truncated")).toBe(true);
  // A fact that wraps starts the next line 8px under the last one.
  const items = [
    "fact-status",
    "fact-source",
    "fact-created-by",
    "fact-created-at",
    "fact-more",
  ].map(box);
  const firstLine = items.filter((r) => r.top < status.top + 8);
  const nextLines = items.filter((r) => r.top >= status.top + 8);
  expect(nextLines.length).toBeGreaterThan(0);
  const firstLineBottom = Math.max(...firstLine.map((r) => r.bottom));
  const secondLineTop = Math.min(...nextLines.map((r) => r.top));
  expect(secondLineTop - firstLineBottom).toBeCloseTo(8, 0);
});
