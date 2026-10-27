import "./filter-chip.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { ChevronDown, ListFilter, Pin } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../dropdown-menu/dropdown-menu";
import { PickerTriggerButton } from "../picker-trigger-button/picker-trigger-button";
import { FilterChip, FilterChipLabel, FilterChipRemove } from "./filter-chip";

// A FilterChip sits beside the Filter button (filter-chip.md): as high as the
// button, 32px, on a phone and on a desktop; its × a 24px square 4px from the
// chip's end, centred on the chip; in a narrow row only the label gives way.
// Real layout, computed colours and focus only: jsdom has no layout.

const it = test.skipIf(typeof window === "undefined");

const MODES = ["light", "dark"] as const;
const WIDTHS = [414, 1280] as const;

afterEach(() => {
  cleanup();
});

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(414, 896);
});

function Row({ mode, width = "auto" }: { mode: (typeof MODES)[number]; width?: string }) {
  return (
    <ThemeProvider mode={mode}>
      <div data-testid="row" className="flex min-w-0 items-center gap-2" style={{ width }}>
        <PickerTriggerButton data-testid="button">
          <ListFilter aria-hidden data-icon="inline-start" />
          Filter
          <span data-picker-trigger-indicator="" aria-hidden="true">
            <ChevronDown />
          </span>
        </PickerTriggerButton>
        <FilterChip data-testid="chip">
          <Pin aria-hidden data-testid="icon" />
          <FilterChipLabel data-testid="label">Pinned conversations</FilterChipLabel>
          <FilterChipRemove aria-label="Clear Filter" />
        </FilterChip>
      </div>
    </ThemeProvider>
  );
}

const box = (el: Element) => el.getBoundingClientRect();

for (const width of WIDTHS) {
  for (const mode of MODES) {
    it(`is as high as the Filter button, with its × 4px from the end (${width}px, ${mode})`, async () => {
      const { page } = await import("vite-plus/test/browser/context");
      await page.viewport(width, 800);
      render(<Row mode={mode} />);
      const button = box(screen.getByTestId("button"));
      const chip = box(screen.getByTestId("chip"));
      const remove = box(screen.getByRole("button", { name: "Clear Filter" }));
      const icon = box(screen.getByTestId("icon"));

      expect(chip.height).toBe(32);
      expect(chip.height).toBe(button.height);
      expect(chip.top).toBe(button.top);
      expect(chip.left - button.right).toBe(8);

      expect(remove.width).toBe(24);
      expect(remove.height).toBe(24);
      expect(chip.right - remove.right).toBe(4);
      expect(remove.top - chip.top).toBe(chip.bottom - remove.bottom);

      expect(icon.width).toBe(14);
      expect(icon.left - chip.left).toBe(10);
    });
  }
}

it("gives way only in its label when the row is narrow", async () => {
  render(<Row mode="light" width="200px" />);
  const row = box(screen.getByTestId("row"));
  const chip = box(screen.getByTestId("chip"));
  const label = screen.getByTestId("label");
  const remove = box(screen.getByRole("button", { name: "Clear Filter" }));

  expect(chip.right).toBeLessThanOrEqual(row.right);
  expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
  expect(remove.width).toBe(24);
  expect(chip.right - remove.right).toBe(4);
  expect(box(screen.getByTestId("icon")).width).toBe(14);
});

function colourOf(className: string, mode: (typeof MODES)[number]) {
  const { unmount } = render(
    <ThemeProvider mode={mode}>
      <span data-testid="probe" className={className} />
    </ThemeProvider>,
  );
  const colour = getComputedStyle(screen.getByTestId("probe")).backgroundColor;
  unmount();
  return colour;
}

for (const mode of MODES) {
  it(`fills the chip info-soft (${mode})`, () => {
    const infoSoft = colourOf("bg-info-soft", mode);
    render(
      <ThemeProvider mode={mode}>
        <FilterChip data-testid="chip">
          <FilterChipLabel>Unread</FilterChipLabel>
        </FilterChip>
      </ThemeProvider>,
    );
    expect(getComputedStyle(screen.getByTestId("chip")).backgroundColor).toBe(infoSoft);
  });
}

// The docs composition (filter-chip/compositions/filter-button) built the
// same way: packages/ui can't import apps/doc. The × removes itself, so its
// handler moves focus to the Filter button; without it focus falls to body.
function FilterButtonRow() {
  const [filter, setFilter] = useState<"all" | "unread">("unread");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const handleValueChange = useCallback((value: unknown) => {
    if (value === "all" || value === "unread") setFilter(value);
  }, []);
  const handleClear = useCallback(() => {
    setFilter("all");
    triggerRef.current?.focus();
  }, []);
  return (
    <ThemeProvider>
      <div className="flex min-w-0 items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger ref={triggerRef} render={<PickerTriggerButton />}>
            <ListFilter aria-hidden data-icon="inline-start" />
            Filter
          </DropdownMenuTrigger>
          <DropdownMenuContent aria-label="Filter activity">
            <DropdownMenuRadioGroup value={filter} onValueChange={handleValueChange}>
              <DropdownMenuRadioItem value="all">
                <DropdownMenuItemLabel>All</DropdownMenuItemLabel>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="unread">
                <DropdownMenuItemLabel>Unread</DropdownMenuItemLabel>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        {filter !== "all" && (
          <FilterChip>
            <FilterChipLabel>Unread</FilterChipLabel>
            <FilterChipRemove aria-label="Clear Filter" onClick={handleClear} />
          </FilterChip>
        )}
      </div>
    </ThemeProvider>
  );
}

it("leaves focus on the Filter button after × removes the chip", async () => {
  const { userEvent } = await import("vite-plus/test/browser/context");
  render(<FilterButtonRow />);
  await userEvent.click(screen.getByRole("button", { name: "Clear Filter" }));
  await waitFor(() => expect(document.querySelector('[data-slot="filter-chip"]')).toBeNull());
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Filter" }));
});
