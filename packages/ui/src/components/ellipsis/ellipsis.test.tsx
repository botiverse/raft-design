/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Ellipsis, EllipsisToggle } from "./ellipsis";
import type { EllipsisState } from "./ellipsis";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function moreLess({ expanded }: EllipsisState) {
  return <EllipsisToggle>{expanded ? "Less" : "More"}</EllipsisToggle>;
}

describe("Ellipsis", () => {
  it("keeps the expand control hidden and out of reach until it knows the text is cut", () => {
    render(
      <Ellipsis lines={2} after={moreLess}>
        Some text
      </Ellipsis>,
    );
    const after = document.querySelector('[data-slot="ellipsis-after"]')!;
    expect(after.hasAttribute("data-hidden")).toBe(true);
    expect(after.hasAttribute("inert")).toBe(true);
  });

  it("wires the toggle to the text with aria-expanded and aria-controls", () => {
    render(
      <Ellipsis expanded lines={3} after={<EllipsisToggle>Less</EllipsisToggle>}>
        Some text
      </Ellipsis>,
    );
    const toggle = screen.getByRole("button", { name: "Less" });
    const text = document.querySelector('[data-slot="ellipsis-text"]')!;
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(toggle.getAttribute("aria-controls")).toBe(text.id);
    // Shown while expanded, so it can collapse the text again.
    const after = document.querySelector('[data-slot="ellipsis-after"]')!;
    expect(after.hasAttribute("data-hidden")).toBe(false);
  });

  it("passes the lines to the clamp and has no clamp when expanded", () => {
    const { rerender } = render(<Ellipsis lines={3}>Some text</Ellipsis>);
    const root = document.querySelector<HTMLElement>('[data-slot="ellipsis"]')!;
    const text = () => document.querySelector('[data-slot="ellipsis-text"]')!;
    expect(root.style.getPropertyValue("--ellipsis-lines")).toBe("3");
    expect(text().className).toContain("line-clamp-(--ellipsis-lines)");
    rerender(
      <Ellipsis lines={3} expanded>
        Some text
      </Ellipsis>,
    );
    expect(text().className).toContain("line-clamp-none");
  });

  it("is not a button before it is measured", () => {
    render(<Ellipsis expandOnClick>Some text</Ellipsis>);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("keeps an expanded text the button, with aria-expanded true, so it can collapse", () => {
    render(
      <Ellipsis expandOnClick defaultExpanded>
        Some text
      </Ellipsis>,
    );
    expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe("true");
  });

  it("never makes the text a button when it has an after", () => {
    render(
      <Ellipsis expandOnClick defaultExpanded lines={2} after={moreLess}>
        Some text
      </Ellipsis>,
    );
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByRole("button").textContent).toBe("Less");
  });

  it("refuses an EllipsisToggle outside an Ellipsis", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<EllipsisToggle>More</EllipsisToggle>)).toThrow(/inside an Ellipsis/);
  });
});
