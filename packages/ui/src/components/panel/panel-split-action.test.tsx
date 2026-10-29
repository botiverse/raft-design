/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu/dropdown-menu";
import { PanelSplitAction, PanelSplitActionMain, PanelSplitActionMenu } from "./panel-split-action";

afterEach(cleanup);

function Split({ toggle = false }: { toggle?: boolean }) {
  const [pressed, setPressed] = useState(false);
  return (
    <PanelSplitAction aria-label="Comment">
      {toggle ? (
        <PanelSplitActionMain aria-label="Comment" pressed={pressed} onPressedChange={setPressed}>
          <svg />
        </PanelSplitActionMain>
      ) : (
        <PanelSplitActionMain aria-label="Comment">
          <svg />
        </PanelSplitActionMain>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger render={<PanelSplitActionMenu aria-label="Comments" />} />
        <DropdownMenuContent>
          <DropdownMenuItem>Show All Comments</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </PanelSplitAction>
  );
}

test("a split action is a named group of two buttons, main first", () => {
  render(<Split />);
  const group = screen.getByRole("group", { name: "Comment" });
  const buttons = Array.from(group.querySelectorAll("button"));
  expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual([
    "Comment",
    "Comments",
  ]);
  expect(buttons.every((button) => button.type === "button")).toBe(true);
  expect(group.dataset.slot).toBe("panel-split-action");
});

test("the menu part is the menu's trigger, with a chevron", () => {
  render(<Split />);
  const menu = screen.getByRole("button", { name: "Comments" });
  expect(menu.dataset.slot).toBe("panel-split-action-menu");
  expect(menu.getAttribute("aria-haspopup")).toBe("menu");
  expect(menu.getAttribute("aria-expanded")).toBe("false");
  expect(menu.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
});

test("a plain main part is a button without aria-pressed", () => {
  render(<Split />);
  const main = screen.getByRole("button", { name: "Comment" });
  expect(main.dataset.slot).toBe("panel-split-action-main");
  expect(main.hasAttribute("aria-pressed")).toBe(false);
});

test("a main part with pressed is a toggle", () => {
  render(<Split toggle />);
  const main = screen.getByRole("button", { name: "Comment" });
  expect(main.getAttribute("aria-pressed")).toBe("false");
  fireEvent.click(main);
  expect(main.getAttribute("aria-pressed")).toBe("true");
  expect(main.hasAttribute("data-pressed")).toBe(true);
});
