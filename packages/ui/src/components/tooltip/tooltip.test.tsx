/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type * as BaseUiTooltip from "@base-ui/react/tooltip";
import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";

/**
 * Captures every props object our TooltipContent hands to the Base UI
 * Positioner. The default collision avoidance lives in our wrapper's default
 * parameter, so the only honest tooth is what actually crosses the boundary —
 * asserting "the popup rendered" would pass with any default (or none).
 */
const positionerCalls: Array<Record<string, unknown>> = [];

vi.mock("@base-ui/react/tooltip", async (importOriginal) => {
  const actual = await importOriginal<typeof BaseUiTooltip>();
  const PositionerSpy = (props: Record<string, unknown>) => {
    positionerCalls.push(props);
    return <actual.Tooltip.Positioner {...props} />;
  };
  return {
    ...actual,
    Tooltip: { ...actual.Tooltip, Positioner: PositionerSpy },
  };
});

afterEach(cleanup);
beforeEach(() => {
  positionerCalls.length = 0;
});

describe("Tooltip defaults and behaviors", () => {
  describe("① collisionAvoidance default", () => {
    it("passes flip/shift defaults to the Positioner when unset", () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>,
      );

      expect(positionerCalls).not.toHaveLength(0);
      expect(positionerCalls.at(-1)?.collisionAvoidance).toEqual({
        side: "flip",
        align: "shift",
        fallbackAxisSide: "none",
      });
    });

    it("forwards a caller's collisionAvoidance to the Positioner unchanged", () => {
      const custom = { side: "shift", align: "none", fallbackAxisSide: "start" } as const;
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent collisionAvoidance={custom}>Tooltip text</TooltipContent>
        </Tooltip>,
      );

      expect(positionerCalls.at(-1)?.collisionAvoidance).toBe(custom);
    });
  });

  describe("② pointer-events-none on content and positioner", () => {
    it("applies pointer-events-none to positioner and content by default", () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>,
      );

      const content = document.querySelector('[data-slot="tooltip-content"]');
      expect(content).not.toBeNull();
      expect(content?.className).toContain("pointer-events-none");

      const positioner = content?.parentElement;
      expect(positioner).not.toBeNull();
      expect(positioner?.className).toContain("pointer-events-none");
    });

    it("allows caller to override pointer-events on content via className", () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent className="pointer-events-auto">Interactive tooltip</TooltipContent>
        </Tooltip>,
      );

      const content = document.querySelector('[data-slot="tooltip-content"]');
      expect(content).not.toBeNull();
      expect(content?.className).toContain("pointer-events-auto");
      expect(content?.className).not.toContain("pointer-events-none");
    });
  });

  describe("③ trigger data-slot forwarding", () => {
    it("renders default data-slot='tooltip-trigger' when no custom slot is provided", () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Default Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>,
      );

      const button = screen.getByRole("button", { name: "Default Trigger" });
      expect(button.getAttribute("data-slot")).toBe("tooltip-trigger");
    });

    it("preserves child element data-slot when render is passed a ReactElement with data-slot", () => {
      render(
        <Tooltip open>
          <TooltipTrigger
            render={<button data-slot="sidebar-item-meta-icon">Icon Trigger</button>}
          />
          <TooltipContent>Content</TooltipContent>
        </Tooltip>,
      );

      const button = screen.getByRole("button", { name: "Icon Trigger" });
      expect(button.getAttribute("data-slot")).toBe("sidebar-item-meta-icon");
    });

    it("preserves child element data-slot on consumer components", () => {
      render(
        <Tooltip open>
          <TooltipTrigger
            render={
              <span data-slot="copyable-code-action">
                <button>Copy</button>
              </span>
            }
          />
          <TooltipContent>Copy code</TooltipContent>
        </Tooltip>,
      );

      const element = document.querySelector('[data-slot="copyable-code-action"]');
      expect(element).not.toBeNull();
    });
  });
});
