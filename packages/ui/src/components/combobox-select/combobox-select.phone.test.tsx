/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";
import { PHONE_MEDIA_QUERY } from "../../lib/phone-media";
import { ComboboxSelect } from "./combobox-select";

// Which field ComboboxSelect renders, from the phone query and the options.
// jsdom has no media queries: matchMedia is stubbed to answer the phone query.

let phone = false;

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query === PHONE_MEDIA_QUERY && phone,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  phone = false;
});

const few = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
];

const many = Array.from({ length: 11 }, (_, index) => ({
  value: index,
  label: `Option ${index}`,
}));

const grouped = [
  { type: "group" as const, key: "a", label: "A", children: many.slice(0, 6) },
  { type: "group" as const, key: "b", label: "B", children: many.slice(6) },
];

function textInput() {
  return document.querySelector('input:not([type="hidden"]):not([aria-hidden="true"])');
}

test("a desktop keeps the text input", () => {
  render(<ComboboxSelect options={many} aria-label="Option" />);
  expect(screen.getByRole("combobox", { name: "Option" }).tagName).toBe("INPUT");
});

test("a phone with up to 10 options renders a select trigger and no text input", () => {
  phone = true;
  render(<ComboboxSelect options={few} defaultValue="vue" aria-label="Framework" />);
  const trigger = screen.getByRole("combobox", { name: "Framework" });
  expect(trigger.tagName).toBe("BUTTON");
  expect(trigger.getAttribute("aria-haspopup")).toBe("listbox");
  expect(trigger.textContent).toBe("Vue");
  expect(textInput()).toBeNull();
});

test("a phone with more than 10 options, flat or grouped, opens a sheet", () => {
  phone = true;
  for (const options of [many, grouped] as const) {
    render(<ComboboxSelect options={options} aria-label="Option" />);
    const trigger = screen.getByRole("combobox", { name: "Option" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(textInput()).toBeNull();
    cleanup();
  }
});

const manyWithOneDisabled = many.map((option, index) => ({ ...option, disabled: index === 0 }));

test("disabled options don't count toward the sheet threshold", () => {
  phone = true;
  render(<ComboboxSelect options={manyWithOneDisabled} aria-label="Option" />);
  expect(screen.getByRole("combobox").getAttribute("aria-haspopup")).toBe("listbox");
});

test("sheetThreshold moves the threshold", () => {
  phone = true;
  render(<ComboboxSelect options={few} sheetThreshold={1} aria-label="Framework" />);
  expect(screen.getByRole("combobox").getAttribute("aria-haspopup")).toBe("dialog");
});

test("create mode on a phone opens the sheet whatever the count", () => {
  phone = true;
  render(<ComboboxSelect options={few} create aria-label="Framework" />);
  expect(screen.getByRole("combobox").getAttribute("aria-haspopup")).toBe("dialog");
});

test("the phone sheet field submits its value with the form", () => {
  phone = true;
  const { container } = render(
    <ComboboxSelect options={many} name="option" defaultValue={3} aria-label="Option" />,
  );
  const hidden = container.querySelector<HTMLInputElement>('input[type="hidden"][name="option"]');
  expect(hidden?.value).toBe("3");
});
