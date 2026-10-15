/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Combobox, ComboboxTrigger } from "../combobox/combobox";
import { PickerTriggerButton } from "../picker-trigger-button/index";
import { Select, SelectTrigger, SelectValue } from "./select";

afterEach(cleanup);

test("SelectTrigger by default wraps children in select-trigger-content span", () => {
  render(
    <Select>
      <SelectTrigger data-testid="trigger-default">
        <SelectValue placeholder="Pick an option" />
      </SelectTrigger>
    </Select>,
  );

  const trigger = screen.getByTestId("trigger-default");
  const contentSpan = trigger.querySelector('[data-slot="select-trigger-content"]');
  expect(contentSpan).not.toBeNull();
  expect(contentSpan?.getAttribute("data-picker-trigger-content")).toBe("select");
  expect(contentSpan?.className).toContain("flex min-w-0 flex-1 items-center gap-1.5");
});

test("SelectTrigger with wrapContent={false} renders children directly without wrapper span", () => {
  render(
    <Select>
      <SelectTrigger data-testid="trigger-unwrapped" wrapContent={false}>
        <span data-testid="custom-child">Custom Content</span>
      </SelectTrigger>
    </Select>,
  );

  const trigger = screen.getByTestId("trigger-unwrapped");
  expect(trigger.querySelector('[data-slot="select-trigger-content"]')).toBeNull();
  const customChild = screen.getByTestId("custom-child");
  expect(trigger.contains(customChild)).toBe(true);
});

test("SelectTrigger with contentClassName merges custom classes into wrapper span", () => {
  render(
    <Select>
      <SelectTrigger
        data-testid="trigger-custom-class"
        contentClassName="justify-center custom-test-class"
      >
        <SelectValue placeholder="Pick an option" />
      </SelectTrigger>
    </Select>,
  );

  const trigger = screen.getByTestId("trigger-custom-class");
  const contentSpan = trigger.querySelector('[data-slot="select-trigger-content"]');
  expect(contentSpan).not.toBeNull();
  expect(contentSpan?.className).toContain("justify-center");
  expect(contentSpan?.className).toContain("custom-test-class");
});

test("PickerTriggerButton with SelectTrigger preserves wrapper span and layout classes", () => {
  render(
    <Select>
      <SelectTrigger render={<PickerTriggerButton />} data-testid="picker-trigger">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
    </Select>,
  );

  const trigger = screen.getByTestId("picker-trigger");
  const contentSpan = trigger.querySelector('[data-slot="select-trigger-content"]');
  expect(contentSpan).not.toBeNull();
  expect(contentSpan?.getAttribute("data-picker-trigger-content")).toBe("select");
  expect(contentSpan?.className).toBe("flex min-w-0 flex-1 items-center gap-1.5");
});

test("ComboboxTrigger by default wraps children and supports wrapContent={false}", () => {
  render(
    <Combobox items={["one", "two"]}>
      <ComboboxTrigger data-testid="combo-default">
        <span>Combobox Child</span>
      </ComboboxTrigger>
    </Combobox>,
  );

  const comboDefault = screen.getByTestId("combo-default");
  const comboSpan = comboDefault.querySelector('[data-slot="combobox-trigger-content"]');
  expect(comboSpan).not.toBeNull();
  expect(comboSpan?.getAttribute("data-picker-trigger-content")).toBe("combobox");

  cleanup();

  render(
    <Combobox items={["one", "two"]}>
      <ComboboxTrigger data-testid="combo-unwrapped" wrapContent={false}>
        <span data-testid="combo-child">Combobox Child</span>
      </ComboboxTrigger>
    </Combobox>,
  );

  const comboUnwrapped = screen.getByTestId("combo-unwrapped");
  expect(comboUnwrapped.querySelector('[data-slot="combobox-trigger-content"]')).toBeNull();
  const comboChild = screen.getByTestId("combo-child");
  expect(comboUnwrapped.contains(comboChild)).toBe(true);
});
