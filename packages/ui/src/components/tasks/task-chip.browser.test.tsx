import "./task-chip.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { TaskChip } from "./task-chip";
import type { TaskStatusId } from "./task-status.recipe";

// Artea (#proj-frontend:1a32281f, 2026-09-29): a task chip inside a message
// shows `#N` in the task's status colour — the same colour as the task badge
// under the message — in both Elegant Light and Elegant Dark. Before, the
// inline chip was grey in light and yellow (in progress) in dark.
// Real browser only: jsdom does not resolve colours.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const STATUSES: TaskStatusId[] = ["todo", "in-progress", "in-review", "done", "closed"];

for (const mode of ["light", "dark"] as const) {
  it(`elegant/${mode}: the inline chip's text colour is the task's status colour`, () => {
    render(
      <ThemeProvider theme="elegant" mode={mode}>
        {STATUSES.map((status) => (
          <p key={status}>
            <TaskChip variant="inline" status={status} data-testid={`inline-${status}`}>
              #1
            </TaskChip>{" "}
            <TaskChip status={status} data-testid={`badge-${status}`}>
              #1
            </TaskChip>
          </p>
        ))}
      </ThemeProvider>,
    );
    const colour = (id: string) => getComputedStyle(screen.getByTestId(id)).color;
    for (const status of STATUSES) {
      expect(colour(`inline-${status}`), status).toBe(colour(`badge-${status}`));
    }
    // The status colours differ from each other, so matching the badge means
    // following the status rather than one shared neutral.
    expect(colour("inline-in-progress")).not.toBe(colour("inline-done"));
  });
}
