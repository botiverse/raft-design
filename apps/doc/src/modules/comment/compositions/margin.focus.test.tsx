import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";

import type { DiscussionId } from "../release-checklist-comments.ts";
import { Discussion } from "./margin.composition.tsx";

// Opening a card replaces its trigger with the open card, so focus would
// fall to <body> and Esc would never reach the card. The card takes focus
// when it opens (the reply box from the keyboard, the card after a click),
// and Esc closes it and returns focus to the trigger.

afterEach(() => cleanup());

function Margin() {
  const [active, setActive] = useState<DiscussionId | null>(null);
  return (
    <Discussion
      id="guard"
      quote="Re-run the guard suites on staging"
      active={active === "guard"}
      onActiveChange={setActive}
    />
  );
}

const trigger = () => screen.getByRole("button", { name: "Comment from Martin" });
const card = () => document.querySelector<HTMLElement>("[data-slot=comment-card]")!;

test("a card opened with a click takes focus, and Esc closes it and returns focus to it", () => {
  render(<Margin />);
  fireEvent.click(trigger(), { detail: 1 });
  expect(card().hasAttribute("data-active")).toBe(true);
  expect(document.activeElement).toBe(card());

  fireEvent.keyDown(document.activeElement!, { key: "Escape" });
  expect(card().hasAttribute("data-active")).toBe(false);
  expect(document.activeElement).toBe(trigger());
});

test("a card opened from the keyboard moves focus into its reply box, and Esc there closes it", () => {
  render(<Margin />);
  fireEvent.click(trigger(), { detail: 0 });
  expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Reply" }));

  fireEvent.keyDown(document.activeElement!, { key: "Escape" });
  expect(card().hasAttribute("data-active")).toBe(false);
  expect(document.activeElement).toBe(trigger());
});

test("the trigger is described by the passage the card is about", () => {
  render(<Margin />);
  const description = document.getElementById(trigger().getAttribute("aria-describedby")!);
  expect(description?.textContent).toBe("On “Re-run the guard suites on staging”");
});
