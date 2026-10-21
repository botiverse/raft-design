import "./description-list.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Avatar } from "../avatar/avatar";
import { Badge } from "../badge/badge";
import { TaskStatusBadge } from "../tasks/task-status-badge";
import {
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
} from "./description-list";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

// One center line (design/foundations/alignment.md): every fact is one 28px
// row with align-items: center, and its text boxes are trimmed to their cap
// band, so labels, values, chips and avatars share one center, and wrapped
// lines are 36px apart (28 + 8), whatever they hold.
function renderFacts(width: number) {
  render(
    <ThemeProvider>
      <div style={{ width: `${width}px` }}>
        <DescriptionList direction="inline">
          <DescriptionItem data-testid="fact">
            <DescriptionTerm>Status</DescriptionTerm>
            <DescriptionDetails>
              <TaskStatusBadge status="in-review" data-testid="chip">
                In Review
              </TaskStatusBadge>
            </DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem data-testid="fact">
            <DescriptionTerm>Assignee</DescriptionTerm>
            <DescriptionDetails>
              <Avatar size="xs" type="human" data-testid="avatar" />
              Mia
            </DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem data-testid="fact">
            <DescriptionTerm>Created by</DescriptionTerm>
            <DescriptionDetails>Cody</DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem data-testid="fact">
            <DescriptionTerm>Created at</DescriptionTerm>
            <DescriptionDetails>
              <Badge appearance="soft">Oct 21, 2026</Badge>
            </DescriptionDetails>
          </DescriptionItem>
        </DescriptionList>
      </div>
    </ThemeProvider>,
  );
}

const center = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.top + r.height / 2;
};

it("inline: plain text in a term or a value is trimmed to its cap band", () => {
  renderFacts(720);
  const trimmed = document.querySelectorAll("[data-slot=description-term] > [data-slot=text-trim]");
  expect(trimmed.length).toBe(4);
  for (const span of trimmed) {
    const style = getComputedStyle(span);
    expect(`${style.textBoxTrim} ${style.textBoxEdge}`).toContain("trim-both");
    // Trimmed: the box is about the cap height (0.7em), not the line.
    expect(span.getBoundingClientRect().height).toBeLessThan(parseFloat(style.fontSize) * 0.8);
  }
  expect(
    document.querySelectorAll("[data-slot=description-details] > [data-slot=text-trim]").length,
  ).toBe(2);
});

it("inline: labels, values, chips and avatars share one center line", () => {
  renderFacts(720);
  for (const fact of screen.getAllByTestId("fact")) {
    const line = center(fact);
    expect(fact.getBoundingClientRect().height).toBeCloseTo(28, 0);
    for (const part of fact.querySelectorAll(
      "[data-slot=text-trim], [data-slot=task-status-badge], [data-slot=badge], [data-slot=avatar]",
    )) {
      expect(Math.abs(center(part) - line)).toBeLessThanOrEqual(0.5);
    }
  }
});

it("inline: wrapped lines are 36px apart, whatever they hold", () => {
  renderFacts(200);
  const lines = [
    ...new Set(screen.getAllByTestId("fact").map((fact) => Math.round(center(fact)))),
  ].sort((a, b) => a - b);
  expect(lines.length).toBeGreaterThanOrEqual(3);
  for (let i = 1; i < lines.length; i++) expect(lines[i]! - lines[i - 1]!).toBeCloseTo(36, 0);
});
