// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  SegmentedControl,
  SegmentedControlCount,
  SegmentedControlItem,
  SegmentedControlLabel,
  ThemeProvider,
} from "raft-ui";

afterEach(cleanup);

Object.defineProperty(window, "matchMedia", {
  configurable: true,
  value: () => ({
    matches: false,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }),
});

function renderControl(theme: "brutal" | "elegant", mode: "light" | "dark" = "light") {
  return render(
    <ThemeProvider theme={theme} mode={mode} syncDom={false}>
      <SegmentedControl value="selected" aria-label="View">
        <SegmentedControlItem value="selected" data-testid="selected">
          <SegmentedControlLabel>Selected</SegmentedControlLabel>
          <SegmentedControlCount>2</SegmentedControlCount>
        </SegmentedControlItem>
        <SegmentedControlItem value="other" data-testid="other">
          <SegmentedControlLabel>Other</SegmentedControlLabel>
        </SegmentedControlItem>
      </SegmentedControl>
    </ThemeProvider>,
  );
}

describe("SegmentedControl theme selection", () => {
  it.each(["light", "dark"] as const)(
    "keeps Elegant %s selection neutral, readable, and ordered above the unchecked fill",
    (mode) => {
      const { getByTestId } = renderControl("elegant", mode);
      const selected = getByTestId("selected");
      const other = getByTestId("other");

      expect(selected.className).toContain("data-checked:bg-fill-strong");
      expect(selected.className).toContain("data-checked:text-foreground-strong");
      expect(selected.className).toContain("data-checked:shadow-raft-sm");
      expect(selected.className).toContain("dark:data-checked:bg-fill-strong");
      expect(selected.className).not.toContain("data-checked:bg-primary-400");
      expect(selected.className).not.toContain("dark:data-checked:bg-layer-card");
      expect(other.className).toContain("dark:data-unchecked:bg-fill-muted");
      expect(getByTestId("selected").textContent).toBe("Selected2");
    },
  );

  it("preserves Brutal's yellow selected recipe", () => {
    const { getByTestId } = renderControl("brutal");
    const selected = getByTestId("selected");

    expect(selected.className).toContain("data-checked:bg-primary-400");
    expect(selected.className).toContain("data-checked:text-foreground");
  });
});
