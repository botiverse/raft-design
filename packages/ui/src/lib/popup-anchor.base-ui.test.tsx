/**
 * @vitest-environment jsdom
 *
 * findPopupAnchor reads attributes Base UI renders (`data-popup-open`,
 * `aria-controls`, `data-base-ui-tooltip-trigger`) and raft-ui's own
 * data-slots. popup-boundary.test.tsx builds that DOM by hand, and CI doesn't
 * run browser tests, so a Base UI upgrade that renamed one of them would pass
 * CI. This renders the real components open and asks for each one's anchor.
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";
import { Button } from "../components/button/index";
import { ComboboxSelect } from "../components/combobox-select/combobox-select";
import {
  Combobox,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "../components/combobox/combobox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSubmenu,
  DropdownMenuSubmenuTrigger,
  DropdownMenuTrigger,
} from "../components/dropdown-menu/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../components/popover/popover";
import {
  PreviewCard,
  PreviewCardContent,
  PreviewCardTrigger,
} from "../components/preview-card/preview-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "../components/select/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/tooltip/tooltip";
import { findPopupAnchor } from "./popup-boundary";

// jsdom ships no matchMedia; ComboboxSelect asks it whether this is a phone.
if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as never;
}

afterEach(cleanup);

/** The positioner: the outermost element around the content that carries `data-side`. */
function positionerOf(node: Element) {
  let found: Element | null = null;
  for (let current: Element | null = node; current; current = current.parentElement) {
    if (current.hasAttribute("data-side")) found = current;
  }
  return found;
}

const COMBOBOX_SELECT_OPTIONS = [
  { label: "a", value: "a" },
  { label: "b", value: "b" },
];
const COMBOBOX_SELECT_INPUT = { "data-testid": "trigger" } as never;
const COMBOBOX_SELECT_POPUP = { "data-testid": "pop" } as never;

const cases = {
  popover: (
    <Popover open>
      <PopoverTrigger render={<Button data-testid="trigger" />}>open</PopoverTrigger>
      <PopoverContent data-testid="pop">x</PopoverContent>
    </Popover>
  ),
  menu: (
    <DropdownMenu open>
      <DropdownMenuTrigger render={<Button data-testid="trigger" />}>menu</DropdownMenuTrigger>
      <DropdownMenuContent data-testid="pop">
        <DropdownMenuItem>One</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  submenu: (
    <DropdownMenu open>
      <DropdownMenuTrigger render={<Button />}>menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSubmenu open>
          <DropdownMenuSubmenuTrigger data-testid="trigger">More</DropdownMenuSubmenuTrigger>
          <DropdownMenuContent data-testid="pop">
            <DropdownMenuItem>Two</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuSubmenu>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  select: (
    <Select defaultValue="a" open>
      <SelectTrigger data-testid="trigger">
        <SelectValue />
      </SelectTrigger>
      <SelectContent data-testid="pop">
        <SelectList>
          <SelectItem value="a">
            <SelectItemText>a</SelectItemText>
          </SelectItem>
        </SelectList>
      </SelectContent>
    </Select>
  ),
  combobox: (
    <Combobox items={["a", "b"]} open>
      <ComboboxControl>
        <ComboboxInput data-testid="trigger" />
      </ComboboxControl>
      <ComboboxContent data-testid="pop">
        <ComboboxList>
          {(option: string) => (
            <ComboboxItem key={option} value={option}>
              {option}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  "combobox-select": (
    <ComboboxSelect
      options={COMBOBOX_SELECT_OPTIONS}
      open
      inputProps={COMBOBOX_SELECT_INPUT}
      popupProps={COMBOBOX_SELECT_POPUP}
    />
  ),
  tooltip: (
    <TooltipProvider>
      <Tooltip open>
        <TooltipTrigger render={<Button data-testid="trigger" />}>i</TooltipTrigger>
        <TooltipContent data-testid="pop">tip</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  "preview-card": (
    <PreviewCard open>
      <PreviewCardTrigger data-testid="trigger" href="#">
        link
      </PreviewCardTrigger>
      <PreviewCardContent data-testid="pop">card</PreviewCardContent>
    </PreviewCard>
  ),
};

for (const [name, node] of Object.entries(cases)) {
  test(`Base UI still marks the ${name}'s open trigger the way findPopupAnchor reads it`, async () => {
    render(node);
    const positioner = positionerOf(await screen.findByTestId("pop"));
    expect(positioner).not.toBeNull();
    expect(findPopupAnchor(positioner)).toBe(screen.getByTestId("trigger"));
  });
}

test("a submenu's anchor is its own trigger, and the menu's stays the menu's", async () => {
  render(cases.submenu);
  const submenu = positionerOf(await screen.findByTestId("pop"));
  const menu = positionerOf(screen.getByTestId("trigger"));
  expect(menu).not.toBe(submenu);
  expect(findPopupAnchor(menu)).toBe(screen.getByRole("button", { name: "menu" }));
  expect(findPopupAnchor(submenu)).toBe(screen.getByTestId("trigger"));
});
