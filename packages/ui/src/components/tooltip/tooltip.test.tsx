/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Search } from "lucide-react";
import { Kbd, KbdGroup } from "../kbd/kbd";
import { KbdShortcut } from "../kbd/kbd-shortcut";
import type { KbdKeyName } from "../kbd/kbd-keys";
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

const MOD_K: KbdKeyName[] = ["mod", "k"];

describe("Kbd in a tooltip", () => {
  const body = () => document.querySelector('[data-slot="tooltip-body"]')!;

  it("puts the 6px gap before a group, not before each cap in it", () => {
    render(
      <Tooltip open>
        <TooltipTrigger>Trigger</TooltipTrigger>
        <TooltipContent>
          Search <KbdShortcut keys={MOD_K} platform="other" />
        </TooltipContent>
      </Tooltip>,
    );
    const list = body().className.split(/\s+/);
    expect(list).toEqual(
      expect.arrayContaining([
        "**:data-[slot=kbd]:ml-1.5",
        "**:data-[slot=kbd-group]:ml-1.5",
        "[&_[data-slot=kbd-group]_[data-slot=kbd]]:ml-0",
        "[&_[data-slot=kbd][data-glyph=icon]]:px-0",
      ]),
    );
    // The caps sit in a group, which those rules target.
    const caps = body().querySelectorAll('[data-slot="kbd-group"] > [data-slot="kbd"]');
    expect(caps).toHaveLength(2);
  });

  it("never takes a leading Kbd, KbdGroup or KbdShortcut for the leading icon", () => {
    for (const lead of [
      <Kbd key="kbd">Esc</Kbd>,
      <KbdGroup key="group">
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>,
      <KbdShortcut key="shortcut" keys={MOD_K} platform="mac" />,
    ]) {
      render(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>{lead} to search</TooltipContent>
        </Tooltip>,
      );
      expect(document.querySelector('[data-slot="tooltip-body-icon"]')).toBeNull();
      cleanup();
    }
  });

  it("still takes a leading icon component for the leading icon", () => {
    render(
      <Tooltip open>
        <TooltipTrigger>Trigger</TooltipTrigger>
        <TooltipContent>
          <Search />
          Search
        </TooltipContent>
      </Tooltip>,
    );
    expect(document.querySelector('[data-slot="tooltip-body-icon"]')).not.toBeNull();
  });

  it("takes a component alone in the tooltip for its content, not a leading icon", () => {
    function Names({ children }: { children: string }) {
      return <span data-testid="names">{children}</span>;
    }
    render(
      <Tooltip open>
        <TooltipTrigger>Trigger</TooltipTrigger>
        <TooltipContent>
          <Names>Lagoon</Names>
        </TooltipContent>
      </Tooltip>,
    );
    const body = document.querySelector('[data-slot="tooltip-body"]');
    expect(document.querySelector('[data-slot="tooltip-body-icon"]')).toBeNull();
    expect(document.querySelector('[data-slot="tooltip-body-text"]')).toBeNull();
    expect(body?.className).not.toContain("gap-x-1.5");
    expect(screen.getByTestId("names").parentElement).toBe(body);
  });
});
