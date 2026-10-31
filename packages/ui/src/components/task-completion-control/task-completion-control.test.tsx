/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { MouseEvent } from "react";
import { TaskCompletionControl } from "./task-completion-control";

afterEach(cleanup);

function preventDefault(event: MouseEvent) {
  event.preventDefault();
}

describe("TaskCompletionControl", () => {
  test("is a button with checkbox semantics, named by the task", () => {
    render(<TaskCompletionControl checked={false} aria-label="#25 Fix onboarding copy" />);
    const control = screen.getByRole("checkbox", { name: "#25 Fix onboarding copy" });
    expect(control.tagName).toBe("BUTTON");
    expect(control.getAttribute("type")).toBe("button");
    expect(control.getAttribute("aria-checked")).toBe("false");
    expect(control.hasAttribute("aria-disabled")).toBe(false);
    expect(control.getAttribute("data-slot")).toBe("task-completion-control");
  });

  test("is checked only when the task is done, and keeps its name", () => {
    const { rerender } = render(
      <TaskCompletionControl checked={false} aria-label="#25 Fix onboarding copy" />,
    );
    rerender(<TaskCompletionControl checked aria-label="#25 Fix onboarding copy" />);
    const control = screen.getByRole("checkbox", { name: "#25 Fix onboarding copy" });
    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(control.hasAttribute("data-checked")).toBe(true);
  });

  test("draws a round indicator, hidden from assistive technology", () => {
    render(<TaskCompletionControl checked aria-label="#25 Fix onboarding copy" />);
    const indicator = screen
      .getByRole("checkbox")
      .querySelector("[data-slot=checkbox-indicator-graphic]");
    expect(indicator).not.toBeNull();
    expect(indicator!.getAttribute("aria-hidden")).toBe("true");
    expect(indicator!.className).toContain("rounded-full");
  });

  test("a press asks for the other state and stops at the control", () => {
    const onCheckedChange = vi.fn();
    const onRowClick = vi.fn();
    const { rerender } = render(
      <div onClick={onRowClick}>
        <TaskCompletionControl
          checked={false}
          onCheckedChange={onCheckedChange}
          aria-label="#25 Fix onboarding copy"
        />
      </div>,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange.mock.calls[0][0]).toBe(true);
    expect(onRowClick).not.toHaveBeenCalled();

    rerender(
      <div onClick={onRowClick}>
        <TaskCompletionControl
          checked
          onCheckedChange={onCheckedChange}
          aria-label="#25 Fix onboarding copy"
        />
      </div>,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onCheckedChange.mock.calls[1][0]).toBe(false);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  test("an onClick that prevents the default keeps the state", () => {
    const onCheckedChange = vi.fn();
    render(
      <TaskCompletionControl
        checked={false}
        onClick={preventDefault}
        onCheckedChange={onCheckedChange}
        aria-label="#25 Fix onboarding copy"
      />,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  test("Space and Enter stay on the control; Enter does not toggle it", () => {
    const onRowKeyDown = vi.fn();
    render(
      <div onKeyDown={onRowKeyDown}>
        <TaskCompletionControl checked={false} aria-label="#25 Fix onboarding copy" />
      </div>,
    );
    const control = screen.getByRole("checkbox");
    fireEvent.keyDown(control, { key: " " });
    expect(onRowKeyDown).not.toHaveBeenCalled();
    const enter = fireEvent.keyDown(control, { key: "Enter" });
    expect(enter, "Enter's default (a click) is prevented").toBe(false);
    expect(onRowKeyDown).not.toHaveBeenCalled();
    fireEvent.keyDown(control, { key: "ArrowDown" });
    expect(onRowKeyDown, "arrow keys still reach the list").toHaveBeenCalledTimes(1);
  });

  test("disabled: aria-disabled only, still focusable, a press does nothing", () => {
    const onCheckedChange = vi.fn();
    const onClick = vi.fn();
    const onRowClick = vi.fn();
    render(
      <div onClick={onRowClick}>
        <TaskCompletionControl
          checked={false}
          disabled
          onClick={onClick}
          onCheckedChange={onCheckedChange}
          aria-label="#25 Fix onboarding copy"
        />
      </div>,
    );
    const control = screen.getByRole("checkbox") as HTMLButtonElement;
    expect(control.disabled, "never the native disabled").toBe(false);
    expect(control.hasAttribute("disabled")).toBe(false);
    expect(control.getAttribute("aria-disabled")).toBe("true");
    expect(control.hasAttribute("data-disabled")).toBe(true);
    control.focus();
    expect(document.activeElement, "it keeps its focus").toBe(control);
    expect(control.className).not.toContain("hover:");
    expect(control.querySelector("svg"), "no check to preview").toBeNull();

    fireEvent.click(control);
    const space = fireEvent.keyDown(control, { key: " " });
    expect(space, "Space's default is prevented").toBe(false);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
    expect(onRowClick, "a press on it still doesn't open the row").not.toHaveBeenCalled();
  });

  test("previews the check on its own hover, never on an ancestor group's", () => {
    render(
      <div className="group">
        <TaskCompletionControl checked={false} aria-label="#25 Fix onboarding copy" />
      </div>,
    );
    const control = screen.getByRole("checkbox");
    const indicator = control.querySelector("[data-slot=checkbox-indicator-graphic]")!;
    // The faint check is in the DOM, transparent until the control is hovered.
    expect(indicator.querySelector("svg")).not.toBeNull();
    expect(indicator.className).toContain("group-hover:text-transparent");
    expect(indicator.className).not.toContain("group-hover:text-foreground/20");
    expect(control.className).toContain(
      "hover:*:data-[slot=checkbox-indicator-graphic]:text-foreground/20",
    );
  });

  test("a hit area 8px past the circle with a mouse, 12px by touch", () => {
    render(<TaskCompletionControl checked={false} aria-label="#25 Fix onboarding copy" />);
    const classes = screen.getByRole("checkbox").className.split(/\s+/);
    expect(classes).toContain("size-5");
    expect(classes).toContain("after:-inset-2");
    expect(classes).toContain("pointer-coarse:after:-inset-3");
  });
});
