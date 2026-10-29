/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuTrigger,
} from "../context-menu/context-menu";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

afterEach(cleanup);

function FilterMenu({
  onOpenChange,
  keepOpen,
}: {
  onOpenChange: (open: boolean) => void;
  keepOpen?: boolean;
}) {
  return (
    <DropdownMenu defaultOpen onOpenChange={onOpenChange}>
      <DropdownMenuTrigger>Filter</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup defaultValue="all">
          <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="unread" closeOnClick={keepOpen ? false : undefined}>
            Unread
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuCheckboxItem>Show Muted</DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const closedByIt = (onOpenChange: ReturnType<typeof vi.fn>) =>
  onOpenChange.mock.calls.some(([open]) => open === false);

describe("radio items close the menu (dropdown-menu.md › Behavior)", () => {
  it("closes a DropdownMenu when a radio item is chosen", () => {
    const onOpenChange = vi.fn();
    render(<FilterMenu onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByText("Unread"));
    expect(closedByIt(onOpenChange)).toBe(true);
  });

  it("stays open when the item opts out with closeOnClick={false}", () => {
    const onOpenChange = vi.fn();
    render(<FilterMenu onOpenChange={onOpenChange} keepOpen />);
    fireEvent.click(screen.getByText("Unread"));
    expect(closedByIt(onOpenChange)).toBe(false);
  });

  it("leaves the menu open when a checkbox item is toggled", () => {
    const onOpenChange = vi.fn();
    render(<FilterMenu onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByText("Show Muted"));
    expect(closedByIt(onOpenChange)).toBe(false);
  });

  it("closes a ContextMenu when a radio item is chosen", () => {
    const onOpenChange = vi.fn();
    render(
      <ContextMenu defaultOpen onOpenChange={onOpenChange}>
        <ContextMenuTrigger>Row</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuRadioGroup defaultValue="a">
            <ContextMenuRadioItem value="a">Newest</ContextMenuRadioItem>
            <ContextMenuRadioItem value="b">Oldest</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.click(screen.getByText("Oldest"));
    expect(closedByIt(onOpenChange)).toBe(true);
  });
});
