import "./description-list.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Avatar } from "../avatar/avatar";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import {
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
} from "./description-list";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const facts = ["plain", "badge", "button"] as const;

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
  const gaps = facts.map((fact) => textRect(`value-${fact}`).left - textRect(`term-${fact}`).right);
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

// A value that leads with an avatar takes its baseline from its text: a box
// with no text would give its bottom edge, and the whole value would stand
// above its label. The avatar centres on the text's line.
it("inline: a value led by an avatar keeps its text on the row's baseline", () => {
  render(
    <ThemeProvider>
      <div style={{ width: "720px" }}>
        <DescriptionList direction="inline">
          <DescriptionItem>
            <DescriptionTerm>
              <Text id="term-plain">Created by</Text>
            </DescriptionTerm>
            <DescriptionDetails>
              <Text id="value-plain">Atlas</Text>
            </DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem>
            <DescriptionTerm>
              <Text id="term-avatar">Source</Text>
            </DescriptionTerm>
            <DescriptionDetails>
              <Avatar size="xs" type="human" data-testid="value-avatar-face" />
              <Text id="value-avatar">Wang Lei</Text>
            </DescriptionDetails>
          </DescriptionItem>
        </DescriptionList>
      </div>
    </ThemeProvider>,
  );
  const first = baseline("term-plain");
  expect(Math.abs(baseline("term-avatar") - first)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(baseline("value-avatar") - first)).toBeLessThanOrEqual(0.5);
  const face = screen.getByTestId("value-avatar-face").getBoundingClientRect();
  const line = screen.getByTestId("value-avatar").getBoundingClientRect();
  expect(Math.abs(face.top + face.height / 2 - (line.top + line.height / 2))).toBeLessThanOrEqual(
    0.5,
  );
});
