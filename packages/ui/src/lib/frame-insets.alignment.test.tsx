/**
 * @vitest-environment jsdom
 *
 * A popup with an arrow stays on its trigger while a host shell keeps frame
 * insets (window controls at the top corners). Base UI sizes its shift
 * limiter from the collision padding (limitShift offset = arrow / 2 +
 * (left + right) / 2), so when the insets were added to the padding, a short
 * tooltip opened up to that half-sum off its trigger with nothing in the way:
 * ~69px right of a top-bar icon with insets 70 / 136 / 40 (the installed web
 * app on macOS). The insets now bound the collision area instead
 * (frameCollision). jsdom places nothing, so the trigger, popup and arrow
 * boxes are stubbed and Base UI's floating-ui does the arithmetic.
 */
import { act, cleanup, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/dropdown-menu/dropdown-menu";
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "../components/popover/popover";
import {
  PreviewCard,
  PreviewCardArrow,
  PreviewCardContent,
  PreviewCardTrigger,
} from "../components/preview-card/preview-card";
import {
  Select,
  SelectArrow,
  SelectContent,
  SelectItem,
  SelectList,
  SelectTrigger,
} from "../components/select/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/tooltip/tooltip";

const VIEWPORT = { width: 1280, height: 800 };
const ARROW = { width: 12, height: 6 };
// A top-bar icon, as the strip's: 32px, 4px under the top edge.
const STRIP_TRIGGER = { x: 200, y: 4, width: 32, height: 32 };

const MACOS_OVERLAY = { start: 70, end: 136, top: 40 };
const MACOS_DESKTOP = { start: 70, end: 0, top: 40 };
const CAPTION_BUTTONS = { start: 0, end: 138, top: 48 };

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

let trigger: Box = STRIP_TRIGGER;
let popup = { width: 48, height: 24 };
let popupSlot = "tooltip-content";
let arrowSlot = "tooltip-arrow";

function rect({ x, y, width, height }: Box): DOMRect {
  return {
    x,
    y,
    width,
    height,
    left: x,
    top: y,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({}),
  } as DOMRect;
}

const isPopupBox = (el: Element) =>
  el.matches(`[data-slot="${popupSlot}"]`) ||
  el.querySelector(`:scope > [data-slot="${popupSlot}"]`) !== null;

function installLayout() {
  const restore: Array<() => void> = [];
  const define = (target: object, key: string, get: (this: Element) => number) => {
    const own = Object.getOwnPropertyDescriptor(target, key);
    Object.defineProperty(target, key, { configurable: true, get });
    restore.push(() => {
      if (own) Object.defineProperty(target, key, own);
      else delete (target as Record<string, unknown>)[key];
    });
  };
  const root = document.documentElement;
  define(root, "clientWidth", () => VIEWPORT.width);
  define(root, "clientHeight", () => VIEWPORT.height);
  define(HTMLElement.prototype, "offsetWidth", function (this: Element) {
    return isPopupBox(this) ? popup.width : 0;
  });
  define(HTMLElement.prototype, "offsetHeight", function (this: Element) {
    return isPopupBox(this) ? popup.height : 0;
  });
  const boxes = vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (
    this: Element,
  ) {
    if (this.matches('[data-testid="trigger"]')) return rect(trigger);
    if (this.closest(`[data-slot="${arrowSlot}"]`)) return rect({ x: 0, y: 0, ...ARROW });
    if (isPopupBox(this)) return rect({ x: 0, y: 0, ...popup });
    return rect({ x: 0, y: 0, width: 0, height: 0 });
  });
  restore.push(() => boxes.mockRestore());
  return () => {
    for (const undo of restore.reverse()) undo();
  };
}

function setFrameInsets(insets: { start: number; end: number; top: number }) {
  for (const side of ["start", "end", "top"] as const) {
    document.documentElement.style.setProperty(`--raft-frame-inset-${side}`, `${insets[side]}px`);
  }
}

/** Where the popup opened: its left edge, and its side of the trigger. */
async function place(ui: ReactNode) {
  render(ui);
  for (let i = 0; i < 5; i += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
  const box = document.querySelector(`[data-slot="${popupSlot}"]`);
  const positioner = box?.parentElement;
  if (!positioner) throw new Error(`${popupSlot} is not rendered`);
  // Base UI places a fixed positioner at left / top, or at 0,0 moved by a translate.
  const translate = /translate\((-?[\d.]+)px,/.exec(positioner.style.transform);
  const left =
    (Number.parseFloat(positioner.style.left) || 0) +
    (translate ? Number.parseFloat(translate[1]!) : 0);
  return { left, side: positioner.getAttribute("data-side") };
}

let uninstall: (() => void) | null = null;

beforeEach(() => {
  trigger = STRIP_TRIGGER;
  uninstall = installLayout();
});

afterEach(() => {
  cleanup();
  for (const side of ["top", "start", "end"]) {
    document.documentElement.style.removeProperty(`--raft-frame-inset-${side}`);
  }
  uninstall?.();
  uninstall = null;
});

describe("a tooltip", () => {
  beforeEach(() => {
    popup = { width: 48, height: 24 };
    popupSlot = "tooltip-content";
    arrowSlot = "tooltip-arrow";
  });

  async function openTooltip() {
    const { left, side } = await place(
      <Tooltip open>
        <TooltipTrigger data-testid="trigger">R</TooltipTrigger>
        <TooltipContent>Raft</TooltipContent>
      </Tooltip>,
    );
    const offset = left + popup.width / 2 - (trigger.x + trigger.width / 2);
    return { left, side, offset };
  }

  test("is centered on its trigger with no frame insets (a browser tab)", async () => {
    const { offset } = await openTooltip();
    expect(offset).toBe(0);
  });

  test("stays centered under the macOS window controls overlay, flipped below the band", async () => {
    setFrameInsets(MACOS_OVERLAY);
    const { offset, side } = await openTooltip();
    expect(side).toBe("bottom");
    expect(offset).toBe(0);
  });

  test("stays centered under the Windows and Linux caption buttons", async () => {
    setFrameInsets(CAPTION_BUTTONS);
    const { offset, side } = await openTooltip();
    expect(side).toBe("bottom");
    expect(offset).toBe(0);
  });

  test("stays centered beside the macOS traffic lights alone (the desktop app)", async () => {
    setFrameInsets(MACOS_DESKTOP);
    const { offset, side } = await openTooltip();
    expect(side).toBe("bottom");
    expect(offset).toBe(0);
  });

  test("still shifts clear of the left inset when its trigger sits against it", async () => {
    setFrameInsets(MACOS_OVERLAY);
    // Centered, a 48px tooltip under a trigger at x = 72 would start at 64,
    // inside the traffic lights' corner; it shifts to the inset's edge.
    trigger = { x: 72, y: 4, width: 32, height: 32 };
    const { left } = await openTooltip();
    expect(left).toBe(70);
  });
});

// A popup aligned to its trigger's start opens at the trigger's left edge; the
// inflated limiter (half of 78 + 144, plus the arrow's half) was wider than
// the 32px trigger and pulled it left, off its trigger.
describe("a popup with an arrow, aligned to its trigger's start", () => {
  beforeEach(() => {
    popup = { width: 200, height: 120 };
  });

  test("a popover opens at its trigger under the window controls", async () => {
    popupSlot = "popover-content";
    arrowSlot = "popover-arrow";
    setFrameInsets(MACOS_OVERLAY);
    const { left } = await place(
      <Popover open>
        <PopoverTrigger data-testid="trigger">R</PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          Raft
        </PopoverContent>
      </Popover>,
    );
    expect(left).toBe(trigger.x);
  });

  test("a preview card opens at its trigger under the window controls", async () => {
    popupSlot = "preview-card-content";
    arrowSlot = "preview-card-arrow";
    setFrameInsets(CAPTION_BUTTONS);
    const { left } = await place(
      <PreviewCard open>
        <PreviewCardTrigger data-testid="trigger" href="#raft">
          R
        </PreviewCardTrigger>
        <PreviewCardContent>
          <PreviewCardArrow />
          Raft
        </PreviewCardContent>
      </PreviewCard>,
    );
    expect(left).toBe(trigger.x);
  });

  test("a select list opens at its trigger under the window controls", async () => {
    popupSlot = "select-content";
    arrowSlot = "select-arrow";
    setFrameInsets(MACOS_OVERLAY);
    const { left } = await place(
      <Select open defaultValue="a">
        <SelectTrigger data-testid="trigger">R</SelectTrigger>
        <SelectContent>
          <SelectArrow />
          <SelectList>
            <SelectItem value="a">Alpha</SelectItem>
          </SelectList>
        </SelectContent>
      </Select>,
    );
    expect(left).toBe(trigger.x);
  });

  test("a popover still keeps 8px clear of the left inset", async () => {
    popupSlot = "popover-content";
    arrowSlot = "popover-arrow";
    setFrameInsets(MACOS_OVERLAY);
    trigger = { x: 72, y: 4, width: 32, height: 32 };
    const { left } = await place(
      <Popover open>
        <PopoverTrigger data-testid="trigger">R</PopoverTrigger>
        <PopoverContent align="center">
          <PopoverArrow />
          Raft
        </PopoverContent>
      </Popover>,
    );
    expect(left).toBe(78);
  });
});

// A menu has no arrow part, so Base UI's limiter has no offset and the padding
// never moved it; it takes the same path all the same.
test("a dropdown menu opens at its trigger under the window controls", async () => {
  popup = { width: 200, height: 120 };
  popupSlot = "dropdown-menu-content";
  arrowSlot = "dropdown-menu-arrow";
  setFrameInsets(MACOS_OVERLAY);
  const { left } = await place(
    <DropdownMenu open>
      <DropdownMenuTrigger data-testid="trigger">R</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Raft</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  expect(left).toBe(trigger.x);
});
