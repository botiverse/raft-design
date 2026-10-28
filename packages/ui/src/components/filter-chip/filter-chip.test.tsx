/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Pin } from "lucide-react";
import { FilterChip, FilterChipLabel, FilterChipRemove } from "./filter-chip";

afterEach(() => {
  cleanup();
});

function renderChip(onClick = vi.fn()) {
  render(
    <FilterChip data-testid="chip">
      <Pin aria-hidden />
      <FilterChipLabel>Pinned</FilterChipLabel>
      <FilterChipRemove aria-label="Clear Filter" onClick={onClick} />
    </FilterChip>,
  );
  return onClick;
}

describe("FilterChip", () => {
  it("is text with one button, named by its aria-label", () => {
    renderChip();
    const chip = screen.getByTestId("chip");
    expect(chip.tagName).toBe("SPAN");
    expect(chip.getAttribute("role")).toBeNull();
    expect(chip.textContent).toBe("Pinned");
    const remove = screen.getByRole("button", { name: "Clear Filter" });
    expect(remove.getAttribute("type")).toBe("button");
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("calls the remove handler on press", () => {
    const onClick = renderChip();
    fireEvent.click(screen.getByRole("button", { name: "Clear Filter" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("draws an X, hidden from assistive technology, unless given children", () => {
    renderChip();
    const glyph = screen.getByRole("button").querySelector("svg");
    expect(glyph?.getAttribute("aria-hidden")).toBe("true");
    cleanup();
    render(
      <FilterChipRemove aria-label="Show All">
        <span data-testid="custom" />
      </FilterChipRemove>,
    );
    expect(screen.getByTestId("custom")).toBeTruthy();
    expect(screen.getByRole("button").querySelector("svg")).toBeNull();
  });

  it("has the applied filter's fill and the slots its recipe targets", () => {
    renderChip();
    const chip = screen.getByTestId("chip");
    expect(chip.dataset.slot).toBe("filter-chip");
    expect(chip.className).toContain("bg-info-soft");
    expect(chip.className).toContain("h-8");
    expect(chip.querySelector('[data-slot="filter-chip-label"]')?.className).toContain("truncate");
    const remove = screen.getByRole("button");
    expect(remove.dataset.slot).toBe("filter-chip-remove");
    expect(remove.className).toContain("size-6");
  });

  it("reaches a 44px hit area on a touch screen: a transparent ::after 10px past the 24px ×", () => {
    renderChip();
    const remove = screen.getByRole("button");
    expect(remove.className).toContain("relative");
    expect(remove.className).toContain("after:absolute");
    expect(remove.className).toContain("pointer-coarse:after:-inset-2.5");
  });
});
