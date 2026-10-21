import "./components/select/select.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "./lib/theme/theme-provider";
import {
  Combobox,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./components/combobox";
import { ComboboxSelect } from "./components/combobox-select";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./components/context-menu";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemCount,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./components/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemDescription,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "./components/select";

// An option's height follows its content and its padding is constant
// (design/patterns/forms.md#option-height): a one-line option stays 36px with a
// mouse and on a touch screen, and an option on two lines (a wrapped label, or
// a label and a description) is taller, with the same space above and below
// its text as the one-line option. Real layout only: jsdom has no boxes.

const it = test.skipIf(typeof window === "undefined");

async function context() {
  return import("vite-plus/test/browser/context");
}

const VIEWPORTS = [
  { name: "desktop", width: 1280, touch: false },
  { name: "touch", width: 390, touch: true },
] as const;

async function viewport(width: number, touch: boolean) {
  const { cdp, page } = await context();
  await page.viewport(width, 720);
  // Turning touch emulation off leaves no fine pointer, whatever the media
  // emulation says, so the desktop cases run first and never touch it.
  if (touch) {
    await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  }
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: touch ? "coarse" : "fine" }],
  });
  expect(matchMedia("(pointer: fine)").matches).toBe(!touch);
}

afterEach(cleanup);
afterAll(async () => {
  const { cdp, page } = await context();
  await page.viewport(1280, 720);
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false });
  await cdp().send("Emulation.setEmulatedMedia", { features: [] });
});

async function settled() {
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await Promise.all(document.getAnimations().map((animation) => animation.finished));
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

const ROW = 36;
const LONG = "Claude Opus with extended thinking and the long context window, billed per token";

const COMBOBOX_ITEMS = ["one", "two", "three"];
const COMBOBOX_SELECT_OPTIONS = [
  { value: "one", label: "Sonnet" },
  { value: "two", label: LONG },
];

/** The option's height, and the space between its edges and its text's line boxes. */
function measure(option: Element) {
  const box = option.getBoundingClientRect();
  const texts = [...option.querySelectorAll("[data-text]")].map((text) =>
    text.getBoundingClientRect(),
  );
  expect(texts.length).toBeGreaterThan(0);
  const top = Math.min(...texts.map((rect) => rect.top));
  const bottom = Math.max(...texts.map((rect) => rect.bottom));
  return { height: box.height, above: top - box.top, below: box.bottom - bottom };
}

async function options() {
  await settled();
  const one = screen.getByTestId("one");
  const two = screen.getByTestId("two");
  const extras = screen.queryAllByTestId("one-extra");
  return { one: measure(one), two: measure(two), extras: extras.map(measure) };
}

function expectConstantPadding({ one, two, extras }: Awaited<ReturnType<typeof options>>) {
  expect(one.height).toBeCloseTo(ROW, 1);
  for (const extra of extras) expect(extra.height).toBeCloseTo(ROW, 1);
  expect(two.height).toBeGreaterThan(one.height + 8);
  expect(one.above).toBeCloseTo(one.below, 1);
  expect(two.above).toBeCloseTo(one.above, 1);
  expect(two.below).toBeCloseTo(one.below, 1);
}

function Light({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider mode="light">
      <main className="p-4">{children}</main>
    </ThemeProvider>
  );
}

for (const { name, width, touch } of VIEWPORTS) {
  it(`Select (${name}): one line keeps 36px, two lines grow with the same padding`, async () => {
    await viewport(width, touch);
    render(
      <Light>
        <Select defaultValue="one" defaultOpen>
          <SelectTrigger className="w-56">
            <SelectValue />
            <SelectIcon />
          </SelectTrigger>
          <SelectContent className="w-56">
            <SelectList>
              <SelectItem value="one" data-testid="one">
                <SelectItemText data-text>Sonnet</SelectItemText>
                <SelectItemIndicator />
              </SelectItem>
              <SelectItem value="two" data-testid="two">
                <SelectItemText data-text>{LONG}</SelectItemText>
                <SelectItemIndicator />
              </SelectItem>
              <SelectItem value="three" data-testid="described">
                <SelectItemText data-text>Haiku</SelectItemText>
                <SelectItemDescription data-text>Fast and light</SelectItemDescription>
              </SelectItem>
            </SelectList>
          </SelectContent>
        </Select>
      </Light>,
    );
    await screen.findByTestId("two");
    const measured = await options();
    expectConstantPadding(measured);
    const described = measure(screen.getByTestId("described"));
    expect(described.height).toBeGreaterThan(ROW);
    expect(described.above).toBeCloseTo(measured.one.above, 1);
    expect(described.below).toBeCloseTo(measured.one.below, 1);
  });

  it(`Select with field type (${name}): one line keeps 36px, two lines grow with the same padding`, async () => {
    await viewport(width, touch);
    render(
      <Light>
        <Select defaultValue="one" defaultOpen chrome="field">
          <SelectTrigger className="w-56">
            <SelectValue />
            <SelectIcon />
          </SelectTrigger>
          <SelectContent className="w-56">
            <SelectList>
              <SelectItem value="one" data-testid="one">
                <SelectItemText data-text>Sonnet</SelectItemText>
              </SelectItem>
              <SelectItem value="two" data-testid="two">
                <SelectItemText data-text>{LONG}</SelectItemText>
              </SelectItem>
            </SelectList>
          </SelectContent>
        </Select>
      </Light>,
    );
    await screen.findByTestId("two");
    expectConstantPadding(await options());
  });

  it(`Combobox (${name}): one line keeps 36px, two lines grow with the same padding`, async () => {
    await viewport(width, touch);
    render(
      <Light>
        <Combobox<string> items={COMBOBOX_ITEMS} defaultOpen>
          <ComboboxControl className="w-56">
            <ComboboxInput aria-label="Model" />
          </ComboboxControl>
          <ComboboxContent className="w-56">
            <ComboboxList>
              <ComboboxItem value="one" data-testid="one">
                <span data-text>Sonnet</span>
              </ComboboxItem>
              <ComboboxItem value="two" data-testid="two">
                <span data-text>{LONG}</span>
              </ComboboxItem>
              <ComboboxItem value="three" data-testid="described">
                <span className="flex min-w-0 flex-col" data-text>
                  <span className="truncate">Claude Haiku</span>
                  <span className="truncate font-mono text-mono-meta text-foreground-hint">
                    claude-haiku-4-5
                  </span>
                </span>
              </ComboboxItem>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Light>,
    );
    await screen.findByTestId("two");
    const measured = await options();
    expectConstantPadding(measured);
    const described = measure(screen.getByTestId("described"));
    expect(described.height).toBeGreaterThan(ROW);
    expect(described.above).toBeCloseTo(measured.one.above, 1);
    expect(described.below).toBeCloseTo(measured.one.below, 1);
  });

  it(`ComboboxSelect (${name}): one line keeps 36px, two lines grow with the same padding`, async () => {
    await viewport(width, touch);
    render(
      <Light>
        <div className="w-56">
          <ComboboxSelect defaultOpen options={COMBOBOX_SELECT_OPTIONS} />
        </div>
      </Light>,
    );
    await waitFor(() =>
      expect(document.querySelectorAll(".r-combobox-select__option")).toHaveLength(2),
    );
    const [one, two] = document.querySelectorAll(".r-combobox-select__option");
    for (const [option, id] of [
      [one, "one"],
      [two, "two"],
    ] as const) {
      option!.setAttribute("data-testid", id);
      option!.querySelector(".r-combobox-select__text")!.setAttribute("data-text", "");
    }
    expectConstantPadding(await options());
  });

  it(`DropdownMenu (${name}): one line keeps 36px, two lines grow with the same padding`, async () => {
    await viewport(width, touch);
    render(
      <Light>
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem data-testid="one">
              <span data-text>Copy link</span>
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="one-extra">
              <span data-text>Unread</span>
              <DropdownMenuItemCount>12</DropdownMenuItemCount>
            </DropdownMenuItem>
            <DropdownMenuCheckboxItem data-testid="one-extra" defaultChecked>
              <span data-text>Show muted</span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuRadioGroup defaultValue="a">
              <DropdownMenuRadioItem value="a" data-testid="one-extra">
                Newest first
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuItem data-testid="two">
              <span className="flex min-w-0 flex-col" data-text>
                <span>Move to channel</span>
                <span className="text-caption font-normal text-foreground-hint">
                  Keeps the replies
                </span>
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Light>,
    );
    await screen.findByTestId("two");
    for (const radio of document.querySelectorAll("[data-slot=dropdown-menu-radio-item-label]")) {
      radio.setAttribute("data-text", "");
    }
    expectConstantPadding(await options());
  });

  it(`ContextMenu (${name}): one line keeps 36px, two lines grow with the same padding`, async () => {
    await viewport(width, touch);
    render(
      <Light>
        <ContextMenu>
          <ContextMenuTrigger data-testid="area" className="block h-20 w-40">
            Area
          </ContextMenuTrigger>
          <ContextMenuContent className="w-56">
            <ContextMenuItem data-testid="one">
              <span data-text>Copy link</span>
            </ContextMenuItem>
            <ContextMenuItem data-testid="two">
              <span data-text>{LONG}</span>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Light>,
    );
    fireEvent.contextMenu(screen.getByTestId("area"), { clientX: 20, clientY: 20 });
    await screen.findByTestId("two");
    expectConstantPadding(await options());
  });
}
