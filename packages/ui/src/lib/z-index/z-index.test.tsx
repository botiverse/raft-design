/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { render, renderHook, screen } from "@testing-library/react";
import { ZIndexScope, useZIndex, MAX_Z_INDEX_NESTING } from "./z-index";

describe("useZIndex and ZIndexScope", () => {
  it("returns pure CSS variable for root tier with zero offset", () => {
    const { result } = renderHook(() => useZIndex({ tier: "dropdown" }));
    expect(result.current.tier).toBe("dropdown");
    expect(result.current.level).toBe(0);
    expect(result.current.zIndex).toBe("var(--r-z-dropdown)");
    expect(result.current.style).toEqual({ zIndex: "var(--r-z-dropdown)" });
  });

  it("calculates offset when provided explicitly", () => {
    const { result } = renderHook(() => useZIndex({ tier: "modal", offset: 10 }));
    expect(result.current.zIndex).toBe("calc(var(--r-z-modal) + 10)");
  });

  it("increments level across nested ZIndexScope of the same tier", () => {
    function NestedConsumer() {
      const modalZ = useZIndex({ tier: "modal" });
      return (
        <div>
          <div data-testid="level-1" style={modalZ.style} />
          <ZIndexScope tier="modal">
            <InnerLevel2 />
          </ZIndexScope>
        </div>
      );
    }

    function InnerLevel2() {
      const modalZ = useZIndex({ tier: "modal" });
      return (
        <div>
          <div data-testid="level-2" style={modalZ.style} />
          <ZIndexScope tier="modal">
            <InnerLevel3 />
          </ZIndexScope>
        </div>
      );
    }

    function InnerLevel3() {
      const modalZ = useZIndex({ tier: "modal" });
      return <div data-testid="level-3" style={modalZ.style} />;
    }

    render(
      <ZIndexScope tier="modal">
        <NestedConsumer />
      </ZIndexScope>,
    );

    const l1 = screen.getByTestId("level-1");
    const l2 = screen.getByTestId("level-2");
    const l3 = screen.getByTestId("level-3");

    expect(l1.style.zIndex).toBe("var(--r-z-modal)");
    expect(l2.style.zIndex).toBe("calc(var(--r-z-modal) + 100)");
    expect(l3.style.zIndex).toBe("calc(var(--r-z-modal) + 200)");
  });

  it("clamps nesting to MAX_Z_INDEX_NESTING and issues dev warning", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    function RecursiveScope({ depth }: { depth: number }) {
      if (depth === 0) {
        const modalZ = useZIndex({ tier: "modal" });
        return <div data-testid="deepest" style={modalZ.style} />;
      }
      return (
        <ZIndexScope tier="modal">
          <RecursiveScope depth={depth - 1} />
        </ZIndexScope>
      );
    }

    // Wrap 8 layers
    render(<RecursiveScope depth={8} />);

    const deepest = screen.getByTestId("deepest");
    // Clamped to level 5 (5 * 100 = 500)
    expect(deepest.style.zIndex).toBe(`calc(var(--r-z-modal) + ${MAX_Z_INDEX_NESTING * 100})`);
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it("elevates dropdown when nested inside modal, and resets when inner tier is higher", () => {
    function NestedDropdown() {
      const dropdownZ = useZIndex({ tier: "dropdown" });
      return <div data-testid="nested-dropdown" style={dropdownZ.style} />;
    }

    function NestedTooltip() {
      const tooltipZ = useZIndex({ tier: "tooltip" });
      return <div data-testid="nested-tooltip" style={tooltipZ.style} />;
    }

    render(
      <ZIndexScope tier="modal">
        <ZIndexScope tier="dropdown">
          <NestedDropdown />
        </ZIndexScope>
        <ZIndexScope tier="tooltip">
          <NestedTooltip />
        </ZIndexScope>
      </ZIndexScope>,
    );

    const dropdown = screen.getByTestId("nested-dropdown");
    const tooltip = screen.getByTestId("nested-tooltip");

    // Dropdown nested in modal (2000) inherits modal base and steps up +100
    expect(dropdown.style.zIndex).toBe("calc(var(--r-z-modal) + 100)");
    // Tooltip tier is higher than modal (6000 > 2000), so it stays at tooltip tier
    expect(tooltip.style.zIndex).toBe("var(--r-z-tooltip)");
  });
});
