import "./task-chip.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Badge } from "../badge/badge";
import { TaskChip } from "./task-chip";
import { TaskStatusBadge } from "./task-status-badge";

// Artea (#proj-frontend task #748, 2026-10-12): in the Activity card the task
// chip sits in one row with reply-count / mention / unread Badges and read one
// size too big (Elegant 13px text vs the Badge's 11px). `size="sm"` gives the
// chip the `sm` Badge's text size and height. Real browser only: jsdom has no
// layout.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

for (const theme of ["elegant", "brutal"] as const) {
  it(`${theme}: an sm task chip has the sm Badge's text size and height`, () => {
    render(
      <ThemeProvider theme={theme} mode="light">
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <TaskChip status="in-progress" size="sm" data-testid="chip-sm">
            #746 @Josh
          </TaskChip>
          <TaskStatusBadge status="done" size="sm" data-testid="status-sm">
            #743
          </TaskStatusBadge>
          <Badge appearance="outline" variant="muted" data-testid="badge">
            12 replies
          </Badge>
          <TaskChip status="in-progress" data-testid="chip-default">
            #746
          </TaskChip>
        </div>
      </ThemeProvider>,
    );
    const style = (id: string) => getComputedStyle(screen.getByTestId(id));
    const height = (id: string) => screen.getByTestId(id).getBoundingClientRect().height;
    for (const id of ["chip-sm", "status-sm"]) {
      expect(style(id).fontSize, id).toBe(style("badge").fontSize);
      expect(height(id), id).toBe(height("badge"));
    }
    // The default chip keeps its own size (13px) for surfaces with no Badge
    // beside it, e.g. the task chip under a message.
    expect(style("chip-default").fontSize).toBe("13px");
  });
}
