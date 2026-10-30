import "./select.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import type { ReactElement } from "react";
import { PickerTriggerButton } from "../picker-trigger-button/picker-trigger-button";
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

type Case = {
  disabled?: boolean;
  triggerDisabled?: boolean;
  fieldset?: boolean;
  render?: ReactElement;
};

function renderSelect({ disabled, triggerDisabled, fieldset, render: trigger }: Case) {
  const select = (
    <Select items={ITEMS} disabled={disabled}>
      <SelectTrigger aria-label="Model" disabled={triggerDisabled} render={trigger}>
        <SelectValue placeholder="Choose a model" data-testid="value" />
        <SelectIcon data-testid="icon" />
      </SelectTrigger>
    </Select>
  );
  render(
    <ThemeProvider>
      <div data-testid="scope" style={{ width: 320 }}>
        {fieldset ? <fieldset disabled>{select}</fieldset> : select}
      </div>
    </ThemeProvider>,
  );
}

const DISABLED_CASES: [string, Case][] = [
  ["the Select's disabled prop", { disabled: true }],
  ["the trigger's disabled prop", { triggerDisabled: true }],
  ["a disabled fieldset", { fieldset: true }],
  ["a PickerTriggerButton trigger", { disabled: true, render: <PickerTriggerButton /> }],
];

it.each(DISABLED_CASES)("greys the placeholder and chevron when disabled by %s", (_, c) => {
  renderSelect(c);
  const disabled = inkOf("foreground-disabled");
  expect(getComputedStyle(screen.getByTestId("value")).color).toBe(disabled);
  expect(getComputedStyle(screen.getByTestId("icon")).color).toBe(disabled);
});

it("keeps the hint ink on an enabled Select's placeholder and chevron", () => {
  renderSelect({});
  const hint = inkOf("foreground-hint");
  expect(getComputedStyle(screen.getByTestId("value")).color).toBe(hint);
  expect(getComputedStyle(screen.getByTestId("icon")).color).toBe(hint);
});
