import "../components/popover/popover.test.css";
import { afterAll, afterEach, describe, expect, test } from "vite-plus/test";
import { cleanup, render, waitFor } from "@testing-library/react";
import type { CSSProperties } from "react";
import { ThemeProvider } from "./theme/theme-provider";
import {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from "../components/popover/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/dropdown-menu/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "../components/select/select";
import { ComboboxSelect } from "../components/combobox-select/combobox-select";

// A list popup stays on the side it asks for and shrinks to the room there,
// scrolling its list, as long as that room holds five rows; with less it
// flips, and it opens beside its trigger only when neither side holds five
// rows (lib/list-popup.ts, elevation.md › Popups). Before, Base UI's flip()
// measured the whole list: a 30-person readers list under "4 viewing" in a
// 900px window fit on neither side, so it opened beside its trigger at full
// height, and a menu with 300px below its trigger flipped above it.
// Revert to fail: styles.css `max-h-popup-list` back to `--available-height`
// (every row below but the flip and the side-axis ones), or the components'
// LIST_POPUP_COLLISION_AVOIDANCE default (the side-axis ones).

const it = test.skipIf(typeof window === "undefined");

const settle = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));
const rect = (element: Element) => element.getBoundingClientRect();

async function setViewport(width: number, height: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, height);
}

afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  await setViewport(414, 896);
});

const NAMES = Array.from({ length: 30 }, (_, index) => `Reader ${index + 1}`);
const OPTIONS = NAMES.map((name) => ({ value: name, label: name }));

type Kind = "popover" | "menu" | "select" | "combobox-select";

const places = new Map<string, CSSProperties>();

/** A trigger's fixed place, 240px from the left: one style object per place. */
function placeAt(top: number, height?: number, width?: number): CSSProperties {
  const key = `${top} ${height} ${width}`;
  let place = places.get(key);
  if (!place) {
    place = { position: "fixed", top, left: 240, height, width };
    places.set(key, place);
  }
  return place;
}

function List({ kind, top }: { kind: Kind; top: number }) {
  const place = placeAt(top, 28);
  if (kind === "popover")
    return (
      <Popover open>
        <PopoverTrigger style={place} data-testid="trigger">
          4 viewing
        </PopoverTrigger>
        <PopoverContent className="w-[300px]" aria-label="Readers">
          <PopoverBody>
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
              {NAMES.map((name) => (
                <li key={name} className="min-h-7">
                  {name}
                </li>
              ))}
            </ul>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  if (kind === "menu")
    return (
      <DropdownMenu open>
        <DropdownMenuTrigger style={place} data-testid="trigger">
          More
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {NAMES.map((name) => (
            <DropdownMenuItem key={name}>{name}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  if (kind === "select")
    return (
      <Select open defaultValue={NAMES[0]}>
        <SelectTrigger aria-label="Reader" style={placeAt(top, 28, 220)} data-testid="trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectList>
            {NAMES.map((name) => (
              <SelectItem key={name} value={name}>
                <SelectItemText>{name}</SelectItemText>
              </SelectItem>
            ))}
          </SelectList>
        </SelectContent>
      </Select>
    );
  return (
    <div style={placeAt(top, undefined, 280)} data-testid="trigger">
      <ComboboxSelect aria-label="Reader" options={OPTIONS} placeholder="Choose a reader" />
    </div>
  );
}

const POPUP: Record<Kind, string> = {
  popover: '[data-slot="popover-content"]',
  menu: '[data-slot="dropdown-menu-content"]',
  select: '[data-slot="select-content"]',
  "combobox-select": '[data-slot="combobox-select-popup"]',
};

/** Whether something inside the popup scrolls its list up and down. */
function scrolls(popup: HTMLElement) {
  return Array.from(popup.querySelectorAll<HTMLElement>("*")).some((element) => {
    const { overflowY } = getComputedStyle(element);
    return (
      (overflowY === "auto" || overflowY === "scroll") &&
      element.scrollHeight > element.clientHeight + 1
    );
  });
}

async function open(kind: Kind, viewport: number, top: number) {
  await setViewport(1024, viewport);
  render(
    <ThemeProvider mode="light">
      <List kind={kind} top={top} />
    </ThemeProvider>,
  );
  const trigger = document.querySelector<HTMLElement>('[data-testid="trigger"]')!;
  if (kind === "combobox-select") {
    const { userEvent } = await import("vite-plus/test/browser/context");
    await userEvent.click(trigger.querySelector("input:not([type=hidden])")!);
  }
  const popup = await waitFor(() => {
    const found = document.querySelector<HTMLElement>(POPUP[kind]);
    expect(found?.getAttribute("data-side")).toBeTruthy();
    return found!;
  });
  await settle();
  const box = rect(popup);
  return {
    side: popup.getAttribute("data-side"),
    box,
    anchor: rect(trigger),
    scrolls: scrolls(popup),
    // The popup clips nothing: its list shrinks inside it instead.
    clipped: popup.scrollHeight > popup.clientHeight + 1,
  };
}

// The room a side has: the window less 8px of collision padding, less the side offset.
const WINDOW_PADDING = 8;

describe.each(["popover", "menu", "select", "combobox-select"] as const)("%s", (kind) => {
  // Select and ComboboxSelect lists stop at 16rem; a list of 30 fills the others' room.
  const long = kind === "popover" || kind === "menu";

  it("opens below a trigger near the top of a short (480px) window, shrunk to the room", async () => {
    const result = await open(kind, 480, 24);
    expect(result.side).toBe("bottom");
    expect(result.box.top).toBeGreaterThan(result.anchor.bottom);
    expect(result.box.bottom).toBeLessThanOrEqual(480 - WINDOW_PADDING);
    expect(result.clipped).toBe(false);
    if (long) expect(result.scrolls).toBe(true);
  });

  it("opens below a trigger near the top of a 900px window, not beside it", async () => {
    const result = await open(kind, 900, 24);
    expect(result.side).toBe("bottom");
    expect(result.box.top).toBeGreaterThan(result.anchor.bottom);
    expect(result.box.left).toBeLessThan(result.anchor.right);
    expect(result.box.bottom).toBeLessThanOrEqual(900 - WINDOW_PADDING);
    expect(result.clipped).toBe(false);
    if (long) expect(result.scrolls).toBe(true);
  });

  it("stays below with five rows of room there, shrinking and scrolling instead of flipping", async () => {
    // 900 - 660 - 28 = 212px below the trigger: room for five rows (178px), not for the list.
    const result = await open(kind, 900, 660);
    expect(result.side).toBe("bottom");
    expect(result.box.top).toBeGreaterThan(result.anchor.bottom);
    expect(result.box.bottom).toBeLessThanOrEqual(900 - WINDOW_PADDING);
    expect(result.box.height).toBeGreaterThan(150);
    expect(result.clipped).toBe(false);
    expect(result.scrolls).toBe(true);
  });

  it("flips above a trigger with less than five rows of room below it", async () => {
    // 900 - 780 - 28 = 92px below.
    const result = await open(kind, 900, 780);
    expect(result.side).toBe("top");
    expect(result.box.bottom).toBeLessThan(result.anchor.top);
    expect(result.box.top).toBeGreaterThanOrEqual(WINDOW_PADDING - 0.5);
    expect(result.clipped).toBe(false);
  });

  it("opens beside its trigger only when neither side has five rows of room", async () => {
    // A 320px window, the trigger in its middle: about 140px above it and 150px below.
    const result = await open(kind, 320, 140);
    expect(result.side).toBe("right");
    expect(result.box.left).toBeGreaterThanOrEqual(result.anchor.right);
    // Inside the window. Beside its trigger Base UI's size() leaves it a few
    // pixels more than the padded room, so it isn't held to the 8px padding.
    expect(result.box.top).toBeGreaterThanOrEqual(0);
    expect(result.box.bottom).toBeLessThanOrEqual(320);
    expect(result.clipped).toBe(false);
  });
});
