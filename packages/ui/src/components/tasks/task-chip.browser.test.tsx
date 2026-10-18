import "./task-chip.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { TaskChip } from "./task-chip";
import type { TaskStatusId } from "./task-status.recipe";

// Artea (#proj-frontend:1a32281f, 2026-09-29): a task chip inside a message
// shows `#N` in the same colours as the task chip under the message, in light
// and dark. Before, the inline chip was grey in light and yellow (in progress)
// in dark. Real browser only: jsdom does not resolve colours.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const STATUSES: TaskStatusId[] = ["todo", "in-progress", "in-review", "done", "closed"];

for (const mode of ["light", "dark"] as const) {
  it(`${mode}: the inline chip's text colour is the task chip's`, () => {
    render(
      <ThemeProvider mode={mode}>
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
    // Ink on the status wash: the status rides the fill (asserted below), the
    // text stays readable ink.
    for (const status of STATUSES) {
      expect(colour(`inline-${status}`), status).toBe(colour(`badge-${status}`));
    }
  });

  // Artea (#proj-frontend task #739, 2026-10-10): the inline chip's fill and
  // border are the task chip's too. Before, the inline chip sat on one neutral
  // grey fill with no visible border, whatever the status.
  it(`${mode}: the inline chip's fill and border are the task chip's`, () => {
    render(
      <ThemeProvider mode={mode}>
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
    const style = (id: string) => getComputedStyle(screen.getByTestId(id));
    for (const status of STATUSES) {
      expect(style(`inline-${status}`).backgroundColor, status).toBe(
        style(`badge-${status}`).backgroundColor,
      );
      expect(style(`inline-${status}`).borderTopColor, status).toBe(
        style(`badge-${status}`).borderTopColor,
      );
    }
    // The fills differ from each other, so matching the chip means following
    // the status rather than one shared neutral.
    expect(style("inline-in-progress").backgroundColor).not.toBe(
      style("inline-done").backgroundColor,
    );
  });
}
