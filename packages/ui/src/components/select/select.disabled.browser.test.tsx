import "./select.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Select, SelectIcon, SelectTrigger, SelectValue } from "./select";

// Disabled looks the same everywhere: a disabled Select's placeholder and
// chevron take `foreground-disabled`, like its value and like a disabled input
// (design/foundations/states.md). Measured in a real browser; jsdom has no
// cascade.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const ITEMS = [{ value: "a", label: "A" }];

function inkOf(name: string) {
  const probe = document.createElement("span");
  probe.style.color = `var(--${name})`;
  document.querySelector("[data-testid='scope']")!.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

function renderSelect(disabled: boolean) {
  render(
    <ThemeProvider>
      <div data-testid="scope" style={{ width: 320 }}>
        <Select items={ITEMS} disabled={disabled}>
          <SelectTrigger aria-label="Model" data-testid="trigger">
            <SelectValue placeholder="Choose a model" data-testid="value" />
            <SelectIcon data-testid="icon" />
          </SelectTrigger>
        </Select>
      </div>
    </ThemeProvider>,
  );
}

it("greys a disabled Select's placeholder and chevron with foreground-disabled", () => {
  renderSelect(true);
  const disabled = inkOf("foreground-disabled");
  expect(getComputedStyle(screen.getByTestId("value")).color).toBe(disabled);
  expect(getComputedStyle(screen.getByTestId("icon")).color).toBe(disabled);
});

it("keeps the hint ink on an enabled Select's placeholder and chevron", () => {
  renderSelect(false);
  const hint = inkOf("foreground-hint");
  expect(getComputedStyle(screen.getByTestId("value")).color).toBe(hint);
  expect(getComputedStyle(screen.getByTestId("icon")).color).toBe(hint);
});
