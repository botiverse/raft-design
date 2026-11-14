/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../dropdown-menu/dropdown-menu";
import { PanelTitleTrigger } from "./panel-title-trigger";

afterEach(cleanup);

test("a title trigger is a button named by its title, with a chevron after it", () => {
  render(<PanelTitleTrigger>Q3 launch plan</PanelTitleTrigger>);
  const trigger = screen.getByRole("button", { name: "Q3 launch plan" });
  expect(trigger.dataset.slot).toBe("panel-title-trigger");
  expect((trigger as HTMLButtonElement).type).toBe("button");
  const [label, chevron] = Array.from(trigger.children);
  expect(label.tagName).toBe("SPAN");
  expect(label.textContent).toBe("Q3 launch plan");
  expect(label.className).toContain("truncate");
  expect(chevron.tagName.toLowerCase()).toBe("svg");
  expect(chevron.getAttribute("aria-hidden")).toBe("true");
  expect(trigger.children).toHaveLength(2);
});

test("it passes className, ref and data attributes to the button", () => {
  const ref = createRef<HTMLButtonElement>();
  render(
    <PanelTitleTrigger ref={ref} className="custom-class" data-testid="trigger">
      Q3 launch plan
    </PanelTitleTrigger>,
  );
  const trigger = screen.getByTestId("trigger");
  expect(ref.current).toBe(trigger);
  expect(trigger.className).toContain("custom-class");
  expect(trigger.className).toContain("text-headline");
});

test("as a DropdownMenuTrigger's render, it takes the trigger's title and menu attributes", () => {
  render(
    <DropdownMenu>
      <DropdownMenuTrigger render={<PanelTitleTrigger />}>Q3 launch plan</DropdownMenuTrigger>
      <DropdownMenuContent aria-label="Recent Artifacts">
        <DropdownMenuRadioGroup value="q3">
          <DropdownMenuRadioItem value="q3">Q3 launch plan</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  const trigger = screen.getByRole("button", { name: "Q3 launch plan" });
  expect(trigger.dataset.slot).toBe("panel-title-trigger");
  expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(trigger.querySelector("[data-slot=panel-title-trigger-label]")?.textContent).toBe(
    "Q3 launch plan",
  );
  expect(trigger.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
});
