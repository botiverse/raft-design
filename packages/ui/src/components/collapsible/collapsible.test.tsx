// @vitest-environment jsdom
import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "./collapsible";

afterEach(cleanup);

describe("Collapsible", () => {
  test("renders with default slots and classes", () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsiblePanel>Content</CollapsiblePanel>
      </Collapsible>,
    );

    const root = screen.getByRole("region", { hidden: true }).parentElement;
    expect(root?.getAttribute("data-slot")).toBe("collapsible");
    expect(root?.className).toContain("r-collapsible");

    const trigger = screen.getByRole("button", { name: "Toggle" });
    expect(trigger.getAttribute("data-slot")).toBe("collapsible-trigger");
    expect(trigger.className).toContain("r-collapsible-trigger");

    const panel = screen.getByRole("region");
    expect(panel.getAttribute("data-slot")).toBe("collapsible-panel");
    expect(panel.className).toContain("r-collapsible-panel");
  });

  test("maintains accessible ARIA attributes between trigger and panel", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Disclosure</CollapsibleTrigger>
        <CollapsiblePanel>Details</CollapsiblePanel>
      </Collapsible>,
    );

    const trigger = screen.getByRole("button", { name: "Disclosure" });
    const triggerId = trigger.getAttribute("id");
    const controlsId = trigger.getAttribute("aria-controls");

    expect(triggerId).toBeTruthy();
    expect(controlsId).toBeTruthy();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    // Click to open
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    const panel = screen.getByRole("region");
    expect(panel.getAttribute("id")).toBe(controlsId);
    expect(panel.getAttribute("aria-labelledby")).toBe(triggerId);
  });

  test("supports uncontrolled open state changes via trigger click", () => {
    render(
      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsiblePanel>Hidden content</CollapsiblePanel>
      </Collapsible>,
    );

    const trigger = screen.getByRole("button", { name: "Toggle" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Hidden content")).toBeDefined();

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  test("supports controlled open state and onOpenChange callback", () => {
    const handleOpenChange = vi.fn();
    const { rerender } = render(
      <Collapsible open={false} onOpenChange={handleOpenChange}>
        <CollapsibleTrigger>Controlled</CollapsibleTrigger>
        <CollapsiblePanel>Controlled content</CollapsiblePanel>
      </Collapsible>,
    );

    const trigger = screen.getByRole("button", { name: "Controlled" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(trigger);
    expect(handleOpenChange).toHaveBeenCalledWith(true, expect.anything());

    // State remains closed until prop update
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    // Parent updates open prop
    rerender(
      <Collapsible open={true} onOpenChange={handleOpenChange}>
        <CollapsibleTrigger>Controlled</CollapsibleTrigger>
        <CollapsiblePanel>Controlled content</CollapsiblePanel>
      </Collapsible>,
    );
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  test("supports disabled state", () => {
    const handleOpenChange = vi.fn();
    render(
      <Collapsible disabled onOpenChange={handleOpenChange}>
        <CollapsibleTrigger>Disabled</CollapsibleTrigger>
        <CollapsiblePanel>Disabled content</CollapsiblePanel>
      </Collapsible>,
    );

    const trigger = screen.getByRole("button", { name: "Disabled" });
    expect(trigger.getAttribute("aria-disabled")).toBe("true");
    expect(trigger.hasAttribute("data-disabled")).toBe(true);

    fireEvent.click(trigger);
    expect(handleOpenChange).not.toHaveBeenCalled();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  test("allows custom explicit IDs and custom ARIA labels", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger id="custom-trigger" aria-controls="custom-panel">
          Custom Trigger
        </CollapsibleTrigger>
        <CollapsiblePanel id="custom-panel" aria-labelledby="custom-trigger">
          Custom Panel
        </CollapsiblePanel>
      </Collapsible>,
    );

    const trigger = screen.getByRole("button", { name: "Custom Trigger" });
    expect(trigger.getAttribute("id")).toBe("custom-trigger");
    expect(trigger.getAttribute("aria-controls")).toBe("custom-panel");

    fireEvent.click(trigger);
    const panel = screen.getByRole("region");
    expect(panel.getAttribute("id")).toBe("custom-panel");
    expect(panel.getAttribute("aria-labelledby")).toBe("custom-trigger");
  });

  test("retains .r-collapsible-trigger class when custom render prop is provided", () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger render={<button type="button" data-custom="test" />}>
          Custom Trigger
        </CollapsibleTrigger>
        <CollapsiblePanel>Content</CollapsiblePanel>
      </Collapsible>,
    );

    const trigger = screen.getByRole("button", { name: "Custom Trigger" });
    expect(trigger.getAttribute("data-custom")).toBe("test");
    expect(trigger.className).toContain("r-collapsible-trigger");
  });

  test("preserves DOM node when keepMounted is enabled on panel", () => {
    render(
      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsiblePanel keepMounted>Preserved Content</CollapsiblePanel>
      </Collapsible>,
    );

    // Panel is present in DOM even though closed
    const panel = screen.getByRole("region", { hidden: true });
    expect(panel).toBeDefined();
    expect(panel.hasAttribute("hidden")).toBe(true);
    expect(panel.textContent).toBe("Preserved Content");
  });
});
