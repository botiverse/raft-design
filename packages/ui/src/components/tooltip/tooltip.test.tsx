/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";

afterEach(cleanup);

describe("Tooltip defaults and behaviors", () => {
  describe("① collisionAvoidance default", () => {
    it("renders popup correctly with default flip and shift collision avoidance", () => {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>,
      );

      const content = document.querySelector('[data-slot="tooltip-content"]');
      expect(content).not.toBeNull();
      expect(content?.textContent).toContain("Tooltip text");
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
