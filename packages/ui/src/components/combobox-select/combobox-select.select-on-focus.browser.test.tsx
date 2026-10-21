import "../select/select.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { ComboboxSelect } from "./combobox-select";
import type { ComboboxSelectValue } from "./combobox-select.types";

// With a value chosen, the single field shows its label. Focusing the field by a
// click, a tap or Tab selects that label, so typing replaces it instead of being
// appended to it ("studio-mac" + "node" would filter on "studio-macnode" and
// find nothing), and the list shows every option until people type. A click or
// tap places the caret after focus, which would undo a plain select() in the
// focus handler (in WebKit on the press's mouseup); jsdom has no selection or
// caret to speak of, so this runs in a real browser, with touch emulated
// through CDP.

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
  const rect = element.getBoundingClientRect();
  const point = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  await cdp().send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
  await cdp().send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

/** Waits two frames and every running transition, so a late caret move would have landed. */
async function settled() {
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await Promise.all(document.getAnimations().map((animation) => animation.finished));
}

const TEXT_INPUT = 'input:not([type="hidden"]):not([aria-hidden="true"])';

const computers = ["studio-mac", "node-a", "node-b", "build-node", "armbian-gx", "hetzner-1"].map(
  (name) => ({ value: name, label: name }),
);

function Picker({ multiple = false }: { multiple?: boolean }) {
  const [value, setValue] = useState<ComboboxSelectValue | ComboboxSelectValue[] | null>(
    multiple ? ["studio-mac"] : "studio-mac",
  );
  return (
    <ThemeProvider>
      <div style={{ position: "absolute", top: 120, left: 16, width: 358 }}>
        <button type="button">Before</button>
        <ComboboxSelect
          aria-label="Target computer"
          options={computers}
          multiple={multiple as never}
          value={value as never}
          onValueChange={setValue as never}
        />
        <output data-testid="value">{JSON.stringify(value)}</output>
      </div>
    </ThemeProvider>
  );
}

function input() {
  return document
    .querySelector<HTMLElement>('[data-slot="combobox-select"]')!
    .querySelector<HTMLInputElement>(TEXT_INPUT)!;
}

function selection(element: HTMLInputElement) {
  return element.value.slice(element.selectionStart ?? 0, element.selectionEnd ?? 0);
}

/** The label is selected, the full list shows, and typing replaces the label and filters. */
async function expectTypingReplacesLabel({ opened }: { opened: boolean }) {
  const { userEvent } = await context();
  const field = input();
  await waitFor(() => expect(document.activeElement).toBe(field));
  await settled();
  expect(field.value).toBe("studio-mac");
  expect(selection(field)).toBe("studio-mac");
  if (opened) {
    await screen.findByRole("listbox");
    expect(screen.getAllByRole("option")).toHaveLength(computers.length);
  }

  await userEvent.keyboard("node");
  await waitFor(() => expect(field.value).toBe("node"));
  await waitFor(() =>
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
      "node-a",
      "node-b",
      "build-node",
    ]),
  );
}

afterEach(async () => {
  cleanup();
  if (typeof window !== "undefined") await emulatePhone(false);
});

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await context();
  await page.viewport(414, 896);
});

it("on a desktop a click on a field with a value selects its label, and typing replaces it", async () => {
  const { userEvent } = await context();
  await emulatePhone(false);
  render(<Picker />);
  await userEvent.click(input());
  await expectTypingReplacesLabel({ opened: true });
});

it("CONTROL: Tab into a field with a value selects its label (browsers do), and typing replaces it", async () => {
  const { userEvent } = await context();
  await emulatePhone(false);
  render(<Picker />);
  screen.getByRole("button", { name: "Before" }).focus();
  await userEvent.keyboard("{Tab}");
  await expectTypingReplacesLabel({ opened: false });
});

it("on a phone a tap on a field with a value selects its label, and typing replaces it", async () => {
  await emulatePhone(true);
  render(<Picker />);
  await tap(input());
  await expectTypingReplacesLabel({ opened: true });
});

it("a second click on the focused field places the caret instead of selecting again", async () => {
  const { userEvent } = await context();
  await emulatePhone(false);
  render(<Picker />);
  const field = input();
  await userEvent.click(field);
  await waitFor(() => expect(selection(field)).toBe("studio-mac"));
  await userEvent.click(field);
  await settled();
  expect(selection(field)).toBe("");
});

it("CONTROL: with multiple, the input stays empty after the chips and typing filters", async () => {
  const { userEvent } = await context();
  await emulatePhone(true);
  render(<Picker multiple />);
  const field = input();
  await tap(field);
  await waitFor(() => expect(document.activeElement).toBe(field));
  expect(field.value).toBe("");
  await userEvent.keyboard("node");
  await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(3));
  expect(field.value).toBe("node");
});
