import "../select/select.test.css";
import { afterAll, afterEach, beforeEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { ComboboxSelect } from "./combobox-select";
import type { ComboboxSelectValue } from "./combobox-select.types";

// On a phone (a touch screen under 48rem) ComboboxSelect opens without focusing
// a text input, so the keyboard stays down: up to 10 options open the anchored
// list, more open a bottom sheet titled with the field's label. A desktop keeps
// the text field. Measured in a real browser with touch emulated through CDP;
// jsdom has no media queries, layout or focus management to speak of.

const it = test.skipIf(typeof window === "undefined");

async function context() {
  return import("vite-plus/test/browser/context");
}

async function emulatePhone(enabled: boolean) {
  const { cdp, page } = await context();
  await page.viewport(enabled ? 390 : 1280, 844);
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: enabled ? "coarse" : "fine" }],
  });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled, maxTouchPoints: 1 });
}

/** A finger tap at the element's center: touch pointer events, then the click. */
async function tap(element: Element) {
  const { cdp } = await context();
  element.scrollIntoView({ block: "nearest" });
  await settled();
  const rect = element.getBoundingClientRect();
  const point = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  await cdp().send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
  await cdp().send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

/** Waits for every running transition (a sheet sliding up, a list fading in) to end. */
async function settled() {
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await Promise.all(document.getAnimations().map((animation) => animation.finished));
}

/** A text input people could type into: Base UI's form inputs are hidden from everyone. */
const TEXT_INPUT = 'input:not([type="hidden"]):not([aria-hidden="true"])';

const fewOptions = [
  { value: "xxchan-linux", label: "xxchan-linux" },
  { value: "armbian-raft", label: "armbian-raft" },
  { value: "armbian-gx", label: "armbian-gx" },
  { value: "hetzner-ex63-4", label: "hetzner-ex63-4" },
];

const manyOptions = Array.from({ length: 14 }, (_, index) => ({
  value: `computer-${index + 1}`,
  label: `Computer ${index + 1}`,
}));

function Picker({
  options,
  multiple = false,
  create = false,
  top = 120,
}: {
  options: typeof fewOptions;
  multiple?: boolean;
  create?: boolean;
  top?: number;
}) {
  const [value, setValue] = useState<ComboboxSelectValue | ComboboxSelectValue[] | null>(
    multiple ? [] : "xxchan-linux",
  );
  return (
    <ThemeProvider>
      <div style={{ position: "absolute", top, left: 16, width: 358 }}>
        <span id="target-label">Target computer</span>
        <ComboboxSelect
          aria-labelledby="target-label"
          options={options}
          multiple={multiple as false}
          create={create}
          value={value as ComboboxSelectValue | null}
          onValueChange={setValue as (next: ComboboxSelectValue | null) => void}
          placeholder="Choose a computer"
        />
        <output data-testid="value">{JSON.stringify(value)}</output>
      </div>
    </ThemeProvider>
  );
}

function field() {
  return document.querySelector<HTMLElement>('[data-slot="combobox-select"]')!;
}

function trigger() {
  return document.querySelector<HTMLElement>('[data-slot="combobox-select-trigger"]');
}

function focusedTextInput() {
  const active = document.activeElement;
  return active instanceof HTMLInputElement && active.matches(TEXT_INPUT) ? active : null;
}

beforeEach(async () => {
  if (typeof window !== "undefined") await emulatePhone(true);
});

afterEach(async () => {
  cleanup();
  if (typeof window !== "undefined") await emulatePhone(false);
});

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await context();
  await page.viewport(414, 896);
});

it("on a phone, up to 10 options: a tap opens the list and focuses no text input", async () => {
  render(<Picker options={fewOptions} />);
  expect(document.querySelector(TEXT_INPUT)).toBeNull();
  expect(trigger()?.textContent).toBe("xxchan-linux");

  await tap(trigger()!);
  const listbox = await screen.findByRole("listbox");
  expect(listbox).toBeTruthy();
  expect(focusedTextInput()).toBeNull();
  expect(screen.queryByRole("dialog")).toBeNull();

  await tap(screen.getByRole("option", { name: "armbian-gx" }));
  await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  expect(screen.getByTestId("value").textContent).toBe('"armbian-gx"');
  expect(trigger()?.textContent).toBe("armbian-gx");
});

it("on a phone the list opens below the field and stays there as the viewport shrinks", async () => {
  const { page } = await context();
  render(<Picker options={fewOptions} top={480} />);

  await tap(trigger()!);
  const listbox = await screen.findByRole("listbox");
  const popup = listbox.closest<HTMLElement>('[data-slot="combobox-select-popup"]')!;
  await waitFor(() => expect(popup.getAttribute("data-side")).toBe("bottom"));
  expect(popup.getBoundingClientRect().top).toBeGreaterThanOrEqual(
    field().getBoundingClientRect().bottom,
  );

  // The keyboard of another field, or the browser's bars, shrink the window:
  // the list keeps its side and gets shorter instead of flipping above.
  await page.viewport(390, 600);
  await new Promise((resolve) => setTimeout(resolve, 100));
  expect(popup.getAttribute("data-side")).toBe("bottom");
  expect(popup.getBoundingClientRect().top).toBeGreaterThanOrEqual(
    field().getBoundingClientRect().bottom,
  );
});

it("on a phone the list works from a keyboard", async () => {
  const { userEvent } = await context();
  render(<Picker options={fewOptions} />);
  trigger()!.focus();
  await userEvent.keyboard("{ArrowDown}");
  await screen.findByRole("listbox");
  await waitFor(() => expect(document.activeElement?.getAttribute("role")).toBe("option"));
  await userEvent.keyboard("{ArrowDown}{Enter}");
  await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  expect(screen.getByTestId("value").textContent).toBe('"armbian-raft"');
});

it("on a phone, more than 10 options: a tap opens a bottom sheet titled with the label", async () => {
  render(<Picker options={manyOptions} />);
  expect(document.querySelector(TEXT_INPUT)).toBeNull();
  const field = trigger()!;
  expect(field.getAttribute("role")).toBe("combobox");
  expect(field.getAttribute("aria-haspopup")).toBe("dialog");

  await tap(field);
  const sheet = await screen.findByRole("dialog", { name: "Target computer" });
  expect(sheet.querySelector("h2")?.textContent).toBe("Target computer");
  const search = await screen.findByRole("combobox", { name: "Target computer" });
  expect(search.tagName).toBe("INPUT");
  expect(sheet.contains(search)).toBe(true);
  await waitFor(() => expect(sheet.contains(document.activeElement)).toBe(true));
  expect(focusedTextInput()).toBeNull();
  expect(screen.getAllByRole("option")).toHaveLength(14);

  await tap(screen.getByRole("option", { name: "Computer 12" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(screen.getByTestId("value").textContent).toBe('"computer-12"');
  expect(trigger()?.textContent).toBe("Computer 12");
  await waitFor(() => expect(document.activeElement).toBe(trigger()));
});

it("on a phone the sheet works from a keyboard, and Esc returns focus to the field", async () => {
  const { userEvent } = await context();
  render(<Picker options={manyOptions} />);
  trigger()!.focus();
  await userEvent.keyboard("{Enter}");
  const sheet = await screen.findByRole("dialog", { name: "Target computer" });
  await waitFor(() => expect(sheet.contains(document.activeElement)).toBe(true));

  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger()));

  await userEvent.keyboard("{Enter}");
  await screen.findByRole("dialog", { name: "Target computer" });
  screen.getByRole("combobox", { name: "Target computer" }).focus();
  await userEvent.keyboard("Computer 9");
  await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
  await userEvent.keyboard("{Enter}");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(screen.getByTestId("value").textContent).toBe('"computer-9"');
});

it("on a phone a multiple select keeps the sheet open and closes it with Done", async () => {
  render(<Picker options={manyOptions} multiple />);
  await tap(trigger()!);
  await screen.findByRole("dialog", { name: "Target computer" });

  await tap(screen.getByRole("option", { name: "Computer 2" }));
  await tap(screen.getByRole("option", { name: "Computer 5" }));
  expect(screen.getByRole("dialog")).toBeTruthy();
  expect(screen.getByTestId("value").textContent).toBe('["computer-2","computer-5"]');

  await tap(screen.getByRole("button", { name: "Done" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(trigger()?.textContent).toContain("Computer 2");
  expect(trigger()?.textContent).toContain("Computer 5");
});

it("on a phone, creating values opens the sheet with its input focused, even for a few options", async () => {
  render(<Picker options={fewOptions} create />);
  await tap(trigger()!);
  await screen.findByRole("dialog", { name: "Target computer" });
  const search = screen.getByRole("combobox", { name: "Target computer" });
  await waitFor(() => expect(document.activeElement).toBe(search));
});

it("CONTROL: on a desktop the field is a text input that filters as people type", async () => {
  const { userEvent } = await context();
  await emulatePhone(false);
  render(<Picker options={manyOptions} />);
  expect(trigger()).toBeNull();
  const input = screen.getByRole("combobox");
  expect(input.tagName).toBe("INPUT");

  await userEvent.click(input);
  expect(document.activeElement).toBe(input);
  await userEvent.clear(input);
  await userEvent.type(input, "Computer 1");
  await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(6));
  expect(screen.queryByRole("dialog")).toBeNull();
});
