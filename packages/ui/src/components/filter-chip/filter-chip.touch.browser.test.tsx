import "./filter-chip.test.css";
import { afterAll, afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ChevronDown, ListFilter, Pin } from "lucide-react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { PickerTriggerButton } from "../picker-trigger-button/picker-trigger-button";
import { FilterChip, FilterChipLabel, FilterChipRemove } from "./filter-chip";

// The ×'s hit area on a touch screen (filter-chip.md, Behavior): 44px high and
// wide, grown up, down and toward the chip's end, never over the label beside
// it, so a tap on the label's end isn't taken as a tap on ×. Measured in a real
// browser with touch emulated through CDP; it stays on to the end of the file.

const it = test.skipIf(typeof window === "undefined");

async function setCoarsePointer(enabled: boolean) {
  const { cdp } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: enabled ? "coarse" : "" }],
  });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled, maxTouchPoints: 1 });
}

beforeAll(async () => {
  if (typeof window === "undefined") return;
  await setCoarsePointer(true);
});

afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  await setCoarsePointer(false);
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(414, 896);
});

function Row() {
  return (
    <ThemeProvider>
      <div className="flex min-w-0 items-center gap-2 p-8">
        <PickerTriggerButton data-testid="button">
          <ListFilter aria-hidden data-icon="inline-start" />
          Filter
          <span data-picker-trigger-indicator="" aria-hidden="true">
            <ChevronDown />
          </span>
        </PickerTriggerButton>
        <FilterChip data-testid="chip">
          <Pin aria-hidden />
          <FilterChipLabel data-testid="label">Pinned conversations</FilterChipLabel>
          <FilterChipRemove aria-label="Clear Filter" />
        </FilterChip>
      </div>
    </ThemeProvider>
  );
}

/** The ×'s hit area: its transparent `::after`, placed against the × itself. */
function hitArea(remove: HTMLElement) {
  const box = remove.getBoundingClientRect();
  const after = getComputedStyle(remove, "::after");
  const left = box.left + parseFloat(after.left);
  const top = box.top + parseFloat(after.top);
  return {
    left,
    top,
    right: left + parseFloat(after.width),
    bottom: top + parseFloat(after.height),
  };
}

for (const width of [414, 1280] as const) {
  it(`keeps the ×'s 44px hit area off the label (${width}px)`, async () => {
    const { page } = await import("vite-plus/test/browser/context");
    await page.viewport(width, 800);
    expect(matchMedia("(pointer: coarse)").matches).toBe(true);
    render(<Row />);
    const remove = screen.getByRole("button", { name: "Clear Filter" });
    const label = screen.getByTestId("label").getBoundingClientRect();
    const button = screen.getByTestId("button").getBoundingClientRect();
    const chip = screen.getByTestId("chip").getBoundingClientRect();
    const hit = hitArea(remove);

    expect(hit.right - hit.left).toBeGreaterThanOrEqual(44);
    expect(hit.bottom - hit.top).toBeGreaterThanOrEqual(44);
    expect(hit.left).toBeGreaterThanOrEqual(label.right);
    expect(hit.left).toBeGreaterThan(button.right);
    expect(hit.top - chip.top).toBe(chip.bottom - hit.bottom);

    // A tap at the label's end lands on the label, not on × (hit testing
    // rounds to whole pixels, so 2px in from the fractional edge).
    const y = label.top + label.height / 2;
    expect(document.elementFromPoint(label.right - 2, y)).toBe(screen.getByTestId("label"));
    // Across the gap, and past the chip's end, it is the ×'s.
    expect(document.elementFromPoint(label.right + 2, y)).toBe(remove);
    expect(document.elementFromPoint(chip.right + 1, y)).toBe(remove);
  });
}
