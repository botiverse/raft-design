/** @vitest-environment jsdom */
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { TaskBoardColumnChevron } from "./task-board";

afterEach(cleanup);

describe("TaskBoardColumnChevron", () => {
  it("draws a ChevronDown when given no children", () => {
    const { container } = render(<TaskBoardColumnChevron />);
    const chevron = container.querySelector('[data-slot="task-board-column-chevron"]');
    expect(chevron?.querySelector("svg")).not.toBeNull();
    expect(chevron?.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("keeps the icon it is given", () => {
    const { container } = render(
      <TaskBoardColumnChevron>
        <span data-testid="own" />
      </TaskBoardColumnChevron>,
    );
    expect(container.querySelectorAll("svg")).toHaveLength(0);
    expect(container.querySelector('[data-testid="own"]')).not.toBeNull();
  });
});
