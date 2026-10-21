import "../select/select.test.css";
import { afterAll, afterEach, beforeEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { ComboboxSelect } from "./combobox-select";
import type { ComboboxSelectValue } from "./combobox-select.types";

// On a phone (a touch screen under 48rem) ComboboxSelect is the same text field
// as on a desktop: a tap focuses it and brings up the keyboard, and typing
// filters. Its list picks a side as it opens and keeps it while the keyboard
// shrinks the viewport and the filtered list shrinks and grows, so it never
// jumps. Measured in a real browser with touch emulated through CDP; jsdom has
// no media queries, layout or focus management to speak of. A headless browser
// has no keyboard: shrinking the viewport stands in for it.

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

const computers = [
  "xxchan-linux",
  "armbian-raft",
  "armbian-gx",
  "botiversemac-mini",
  "macmini-agent-1",
  "macmini-agent-2",
  "macmini-agent-3",
  "hetzner-ex63-1",
  "hetzner-ex63-2",
  "hetzner-ex63-3",
  "hetzner-ex63-4",
  "studio-m4",
  "build-runner-1",
  "build-runner-2",
].map((name) => ({ value: name, label: name }));

function Picker({
  top = 120,
  size,
  create = false,
  listMaxHeight,
}: {
  top?: number;
  size?: "sm" | "md" | "lg";
  create?: boolean;
  listMaxHeight?: number | string;
}) {
  const [value, setValue] = useState<ComboboxSelectValue | null>(null);
  return (
    <ThemeProvider>
      <div style={{ position: "absolute", top, left: 16, width: 358 }}>
        <span id="target-label">Target computer</span>
        <ComboboxSelect
          aria-labelledby="target-label"
          options={computers}
          create={create}
          size={size}
          listMaxHeight={listMaxHeight}
          value={value}
          onValueChange={setValue}
          placeholder="Choose a computer"
          emptyContent="No computers match"
        />
        <output data-testid="value">{JSON.stringify(value)}</output>
      </div>
    </ThemeProvider>
  );
}

function field() {
  return document.querySelector<HTMLElement>('[data-slot="combobox-select"]')!;
}

function input() {
  return field().querySelector<HTMLInputElement>(TEXT_INPUT)!;
}

function popup() {
  return document.querySelector<HTMLElement>('[data-slot="combobox-select-popup"]');
}

/** Stands in for the keyboard: the layout and the visual viewport get shorter. */
async function raiseKeyboard(height = 480) {
  const { page } = await context();
  await page.viewport(390, height);
  window.visualViewport?.dispatchEvent(new Event("resize"));
  await new Promise((resolve) => setTimeout(resolve, 100));
  await settled();
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

it("on a phone the field is a text input: a tap focuses it and typing filters", async () => {
  const { userEvent } = await context();
  render(<Picker />);
  const field = input();
  expect(field.getAttribute("role")).toBe("combobox");
  expect(field.readOnly).toBe(false);

  await tap(field);
  await waitFor(() => expect(document.activeElement).toBe(field));
  await screen.findByRole("listbox");
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getAllByRole("option")).toHaveLength(14);

  await userEvent.keyboard("hetzner");
  await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(4));
  await tap(screen.getByRole("option", { name: "hetzner-ex63-2" }));
  await waitFor(() => expect(screen.getByTestId("value").textContent).toBe('"hetzner-ex63-2"'));
  expect(screen.queryByRole("dialog")).toBeNull();
});

/** How many options the field's filter keeps for `query`. */
function matching(query: string) {
  return computers.filter((option) => option.label.includes(query)).length;
}

/**
 * Types `text` one key at a time with the list open, and checks after every key
 * that nothing jumps: focus and the typed text stay, the popup is the same
 * element (it never closed and reopened), on the same side, and the edge
 * against the field doesn't move.
 */
async function typeWithoutJumping(text: string) {
  const { userEvent } = await context();
  const opened = popup()!;
  const side = opened.getAttribute("data-side");
  const edge = () =>
    side === "top" ? opened.getBoundingClientRect().bottom : opened.getBoundingClientRect().top;
  const start = edge();
  let typed = input().value;
  for (const key of text) {
    await userEvent.keyboard(key);
    typed += key;
    await settled();
    expect(document.activeElement).toBe(input());
    expect(input().value).toBe(typed);
    expect(popup()).toBe(opened);
    expect(opened.getAttribute("data-side")).toBe(side);
    expect(Math.abs(edge() - start)).toBeLessThanOrEqual(1);
    expect(screen.queryAllByRole("option")).toHaveLength(matching(typed));
  }
}

async function eraseWithoutJumping(count: number) {
  const { userEvent } = await context();
  const opened = popup()!;
  const side = opened.getAttribute("data-side");
  const edge = () =>
    side === "top" ? opened.getBoundingClientRect().bottom : opened.getBoundingClientRect().top;
  const start = edge();
  let typed = input().value;
  for (let index = 0; index < count; index += 1) {
    await userEvent.keyboard("{Backspace}");
    typed = typed.slice(0, -1);
    await settled();
    expect(document.activeElement).toBe(input());
    expect(input().value).toBe(typed);
    expect(popup()).toBe(opened);
    expect(opened.getAttribute("data-side")).toBe(side);
    expect(Math.abs(edge() - start)).toBeLessThanOrEqual(1);
    expect(screen.queryAllByRole("option")).toHaveLength(matching(typed));
  }
}

it("on a phone, with the keyboard up, typing filters and the list below never jumps", async () => {
  // Low enough that the keyboard leaves more room above the field than below it,
  // where a list that flips would jump above.
  render(<Picker top={300} />);
  await tap(input());
  await screen.findByRole("listbox");
  await waitFor(() => expect(popup()?.getAttribute("data-side")).toBe("bottom"));
  await settled();
  await raiseKeyboard();
  expect(popup()!.getAttribute("data-side")).toBe("bottom");
  expect(popup()!.getBoundingClientRect().top).toBeGreaterThanOrEqual(
    field().getBoundingClientRect().bottom,
  );

  // The list narrows ("mac", 4), empties ("macz") and grows back to all 14.
  await typeWithoutJumping("macz");
  expect(matching("macz")).toBe(0);
  expect(screen.getByText("No computers match")).toBeTruthy();
  await eraseWithoutJumping(4);
  expect(screen.getAllByRole("option")).toHaveLength(14);
});

it("on a phone a list that opened above stays above as the keyboard comes up and typing filters", async () => {
  render(<Picker top={640} />);
  await tap(input());
  await screen.findByRole("listbox");
  await waitFor(() => expect(popup()?.getAttribute("data-side")).toBe("top"));
  await settled();
  // The keyboard shrinks the window: the list keeps its side, it doesn't flip below.
  const { page } = await context();
  await page.viewport(390, 760);
  window.visualViewport?.dispatchEvent(new Event("resize"));
  await new Promise((resolve) => setTimeout(resolve, 100));
  await settled();
  expect(popup()!.getAttribute("data-side")).toBe("top");
  expect(popup()!.getBoundingClientRect().bottom).toBeLessThanOrEqual(
    field().getBoundingClientRect().top,
  );
  await typeWithoutJumping("hetzq");
  expect(screen.getByText("No computers match")).toBeTruthy();
  await eraseWithoutJumping(5);
  expect(screen.getAllByRole("option")).toHaveLength(14);
});

it("on a phone the list opens below the field and stays there as the viewport shrinks", async () => {
  const { page } = await context();
  render(<Picker top={480} />);

  await tap(input());
  await screen.findByRole("listbox");
  const opened = popup()!;
  await waitFor(() => expect(opened.getAttribute("data-side")).toBe("bottom"));
  expect(opened.getBoundingClientRect().top).toBeGreaterThanOrEqual(
    field().getBoundingClientRect().bottom,
  );

  // The keyboard, or the browser's bars, shrink the window: the list keeps its
  // side and gets shorter instead of flipping above, and its last rows stay reachable.
  await page.viewport(390, 600);
  await new Promise((resolve) => setTimeout(resolve, 100));
  await settled();
  expect(opened.getAttribute("data-side")).toBe("bottom");
  expect(opened.getBoundingClientRect().top).toBeGreaterThanOrEqual(
    field().getBoundingClientRect().bottom,
  );
  const listbox = screen.getByRole("listbox");
  expect(listbox.getBoundingClientRect().bottom).toBeLessThanOrEqual(
    opened.getBoundingClientRect().bottom + 0.5,
  );
  expect(listbox.scrollHeight).toBeGreaterThan(listbox.clientHeight);
});

it("on a phone the list is capped at 16rem and scrolls, with a part row showing more", async () => {
  render(<Picker />);
  await tap(input());
  const listbox = await screen.findByRole("listbox");
  await settled();
  const row = screen.getAllByRole("option")[0].getBoundingClientRect().height;
  // 16rem of rows and the list's 6px padding above and below.
  expect(listbox.getBoundingClientRect().height).toBeCloseTo(256 + 12, 0);
  expect(listbox.scrollHeight).toBeGreaterThan(listbox.clientHeight);
  expect(((listbox.clientHeight - 6) / row) % 1).toBeGreaterThan(0.1);
});

it("listMaxHeight sets the cap: rows, or any CSS length", async () => {
  render(<Picker listMaxHeight={180} />);
  await tap(input());
  let listbox = await screen.findByRole("listbox");
  await settled();
  expect(listbox.getBoundingClientRect().height).toBeCloseTo(180 + 12, 0);
  cleanup();

  render(<Picker listMaxHeight="24rem" />);
  await tap(input());
  listbox = await screen.findByRole("listbox");
  await settled();
  expect(listbox.getBoundingClientRect().height).toBeCloseTo(384 + 12, 0);
  expect(popup()!.getBoundingClientRect().height).toBeGreaterThanOrEqual(384 + 12);
});

it("on a phone creating a value is typed into the field, with no sheet", async () => {
  const { userEvent } = await context();
  render(<Picker create />);
  await tap(input());
  await waitFor(() => expect(document.activeElement).toBe(input()));
  await userEvent.keyboard("pi-cluster");
  await screen.findByRole("option", { name: /pi-cluster/ });
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("on a phone the input stays at 16px or more, so iOS doesn't zoom, even at size sm", async () => {
  render(<Picker size="sm" />);
  expect(parseFloat(getComputedStyle(input()).fontSize)).toBeGreaterThanOrEqual(16);
});

it("CONTROL: on a desktop the list is 16rem with its padding, and the field filters as people type", async () => {
  const { userEvent } = await context();
  await emulatePhone(false);
  render(<Picker />);
  const field = input();
  await userEvent.click(field);
  const listbox = await screen.findByRole("listbox");
  await settled();
  expect(listbox.getBoundingClientRect().height).toBeCloseTo(256, 0);
  await userEvent.type(field, "build");
  await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(2));
});
