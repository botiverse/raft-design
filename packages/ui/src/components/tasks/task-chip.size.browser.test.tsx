import "./task-chip.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { TaskChip } from "./task-chip";
import { TaskStatusBadge } from "./task-status-badge";

// In the Activity card the task chip sits in one row with reply-count, mention
// and unread Badges and read one size too big. `size="sm"` gives the chip a
// compact box for those rows; the status badge is the same chip, so at `sm` it
// takes the same box. Real browser only: jsdom has no layout.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

it("an sm task chip is the compact chip, and an sm status badge has the same box", () => {
  render(
    <ThemeProvider mode="light">
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <TaskChip status="in-progress" size="sm" data-testid="chip-sm">
          #746 @Martin
        </TaskChip>
        <TaskStatusBadge status="done" size="sm" data-testid="status-sm">
          #743
        </TaskStatusBadge>
        <TaskChip status="in-progress" data-testid="chip-default">
          #746
        </TaskChip>
      </div>
    </ThemeProvider>,
  );
  const style = (id: string) => getComputedStyle(screen.getByTestId(id));
  const height = (id: string) => screen.getByTestId(id).getBoundingClientRect().height;
  // sm is 20px tall; the default chip keeps its own 22px for surfaces with no
  // Badge beside it, e.g. the task chip under a message.
  expect(height("chip-sm")).toBe(20);
  expect(height("chip-default")).toBe(22);
  expect(height("status-sm")).toBe(height("chip-sm"));
  for (const prop of [
    "fontSize",
    "fontWeight",
    "letterSpacing",
    "lineHeight",
    "paddingLeft",
    "paddingRight",
    "paddingTop",
    "paddingBottom",
    "borderTopWidth",
    "borderLeftWidth",
    "columnGap",
  ] as const) {
    expect(style("status-sm")[prop], `status-sm ${prop}`).toBe(style("chip-sm")[prop]);
  }
});
