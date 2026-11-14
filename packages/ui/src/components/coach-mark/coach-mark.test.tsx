/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test, vi } from "vite-plus/test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { Button } from "../button/button";
import { PopoverBody, PopoverDescription, PopoverTitle } from "../popover/popover";
import {
  CoachMark,
  CoachMarkActions,
  CoachMarkContent,
  CoachMarkCount,
  CoachMarkNext,
} from "./coach-mark";

afterEach(cleanup);

function Tour({
  open = true,
  onDismiss,
  withField = false,
}: {
  open?: boolean;
  onDismiss?: () => void;
  withField?: boolean;
}) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  return (
    <>
      <div data-testid="target" ref={setTarget}>
        Bell
      </div>
      {withField ? <textarea data-testid="field" autoFocus /> : null}
      {target ? (
        <CoachMark anchor={target} open={open} onDismiss={onDismiss}>
          <CoachMarkContent>
            <PopoverBody>
              <PopoverTitle>Notifications</PopoverTitle>
              <PopoverDescription>What needs you shows up here.</PopoverDescription>
            </PopoverBody>
            <CoachMarkActions>
              <CoachMarkCount>2 of 6</CoachMarkCount>
              <Button variant="ghost">Skip</Button>
              <CoachMarkNext>Next</CoachMarkNext>
            </CoachMarkActions>
          </CoachMarkContent>
        </CoachMark>
      ) : null}
    </>
  );
}

test("the target holds the located wash while its stop is open, and loses it after", async () => {
  const { rerender } = render(<Tour />);
  const target = screen.getByTestId("target");
  await waitFor(() => expect(target.getAttribute("data-located")).toBe("held"));
  rerender(<Tour open={false} />);
  expect(target.hasAttribute("data-located")).toBe(false);
});

test("the bubble is 300px, with the pink Next, the count and an arrow", async () => {
  render(<Tour />);
  const popup = await waitFor(() => {
    const el = document.querySelector('[data-slot="coach-mark-content"]');
    if (!el) throw new Error("no bubble");
    return el;
  });
  expect(popup.className).toContain("w-[300px]");
  expect(popup.className).toContain("overflow-visible");
  expect(popup.className).not.toContain("overflow-hidden");
  expect(popup.querySelector('[data-slot="popover-arrow"]')).not.toBeNull();
  expect(screen.getByText("2 of 6").className).toContain("font-mono");
  expect(screen.getByRole("button", { name: "Next" }).className).toContain("bg-attention-400");
});

test("focus goes to Next when the stop opens", async () => {
  render(<Tour />);
  await waitFor(() =>
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Next" })),
  );
});

test("focus stays in a field the person is typing in", async () => {
  render(<Tour withField />);
  const field = screen.getByTestId("field");
  field.focus();
  await screen.findByRole("button", { name: "Next" });
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  expect(document.activeElement).toBe(field);
});

test("Esc in the bubble dismisses the tour; Esc elsewhere and a press outside don't", async () => {
  const onDismiss = vi.fn();
  render(<Tour onDismiss={onDismiss} withField />);
  const next = await screen.findByRole("button", { name: "Next" });

  fireEvent.keyDown(screen.getByTestId("field"), { key: "Escape" });
  fireEvent.pointerDown(document.body);
  fireEvent.mouseDown(document.body);
  expect(onDismiss).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Next" })).toBe(next);

  fireEvent.keyDown(next, { key: "Escape" });
  expect(onDismiss).toHaveBeenCalledTimes(1);
});
