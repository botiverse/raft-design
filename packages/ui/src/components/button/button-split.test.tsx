/**
 * @vitest-environment jsdom
 *
 * A split button is a named group of two Buttons: the main part, rounded on
 * its start side with no end border, then the menu part, rounded on its end
 * side, whose start border is the divider. Its layout and hover are measured
 * in button-split.browser.test.tsx.
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu/dropdown-menu";
import { ButtonSplit, ButtonSplitMain, ButtonSplitMenu } from "./button-split";
import type { ButtonSplitSize, ButtonSplitVariant } from "./button-split";

afterEach(cleanup);

function Split({
  variant,
  size,
  disabled,
  mainDisabled,
  menuDisabled,
}: {
  variant?: ButtonSplitVariant;
  size?: ButtonSplitSize;
  disabled?: boolean;
  mainDisabled?: boolean;
  menuDisabled?: boolean;
}) {
  return (
    <ButtonSplit aria-label="New agent" disabled={disabled}>
      <ButtonSplitMain variant={variant} size={size} disabled={mainDisabled}>
        Create agent
      </ButtonSplitMain>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <ButtonSplitMenu
              variant={variant}
              size={size}
              disabled={menuDisabled}
              aria-label="More ways to create an agent"
            />
          }
        />
        <DropdownMenuContent>
          <DropdownMenuItem>Take over a local session</DropdownMenuItem>
          <DropdownMenuItem>Connect an external agent</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonSplit>
  );
}

const classes = (element: Element) => element.className.split(/\s+/);

function parts() {
  return {
    main: screen.getByRole<HTMLButtonElement>("button", { name: "Create agent" }),
    menu: screen.getByRole<HTMLButtonElement>("button", { name: "More ways to create an agent" }),
  };
}

test("a split button is a group named on its own, holding the main part, then the menu part", () => {
  render(<Split />);
  const group = screen.getByRole("group", { name: "New agent" });
  expect(group.dataset.slot).toBe("button-split");
  const buttons = Array.from(group.querySelectorAll("button"));
  expect(buttons.map((button) => button.textContent || button.getAttribute("aria-label"))).toEqual([
    "Create agent",
    "More ways to create an agent",
  ]);
  expect(buttons.every((button) => button.dataset.slot === "button")).toBe(true);
  expect(buttons.map((button) => button.dataset.splitPart)).toEqual(["main", "menu"]);
});

test("the menu part is the menu's trigger, with a hidden chevron", () => {
  render(<Split />);
  const { menu } = parts();
  expect(menu.getAttribute("aria-haspopup")).toBe("menu");
  expect(menu.getAttribute("aria-expanded")).toBe("false");
  expect(menu.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
});

test.each(["primary", "default"] as const)(
  "%s: the parts make one shape, and the menu part's start border is the divider",
  (variant) => {
    render(<Split variant={variant} />);
    const { main, menu } = parts();
    expect(classes(main)).toEqual(
      expect.arrayContaining(["rounded-control", "rounded-e-none", "border-e-0"]),
    );
    expect(classes(main)).not.toContain("rounded-s-none");
    expect(classes(menu)).toEqual(
      expect.arrayContaining(["rounded-control", "rounded-s-none", "border-[1.5px]", "w-7"]),
    );
    expect(classes(menu)).not.toContain("rounded-e-none");
    expect(classes(menu).some((name) => name.startsWith("border-s-"))).toBe(false);
    expect(classes(menu)).toContain(
      variant === "primary" ? "border-sticker-ink" : "border-line-strong",
    );
  },
);

test("each part's focus ring is drawn above its neighbour", () => {
  render(<Split />);
  const { main, menu } = parts();
  expect(classes(main)).toContain("focus-visible:z-raised");
  expect(classes(menu)).toContain("focus-visible:z-raised");
});

test("a sticker's die-cut edge goes around the group, not around each part", () => {
  render(<Split variant="primary" />);
  const { main, menu } = parts();
  expect(classes(main)).toContain("ring-0");
  expect(classes(menu)).toContain("ring-0");
  expect(classes(main)).not.toContain("ring-[1.5px]");
  expect(main.hasAttribute("data-split-sticker")).toBe(true);
  expect(menu.hasAttribute("data-split-sticker")).toBe(true);
  expect(screen.getByRole("group").hasAttribute("data-sticker-edge")).toBe(true);
  cleanup();
  render(<Split variant="primary" disabled />);
  expect(screen.getByRole("group").hasAttribute("data-sticker-edge")).toBe(false);
  cleanup();
  render(<Split variant="primary" menuDisabled />);
  expect(screen.getByRole("group").hasAttribute("data-sticker-edge")).toBe(true);
  cleanup();
  render(<Split variant="default" />);
  expect(parts().main.hasAttribute("data-split-sticker")).toBe(false);
  expect(screen.getByRole("group").hasAttribute("data-sticker-edge")).toBe(false);
});

test("the open menu part keeps its variant's medium tier", () => {
  render(<Split variant="primary" />);
  expect(classes(parts().menu)).toContain("data-popup-open:overlay-sticker-medium");
  cleanup();
  render(<Split variant="default" />);
  expect(classes(parts().menu)).toContain("data-popup-open:overlay-medium");
});

test("both parts take the same size: lg widens the menu part on a touch screen", () => {
  render(<Split size="lg" />);
  const { main, menu } = parts();
  expect(classes(main)).toContain("h-control");
  expect(classes(menu)).toEqual(
    expect.arrayContaining(["h-control", "w-9", "md:pointer-fine:w-7"]),
  );
});

test("either part can be disabled on its own", () => {
  render(<Split menuDisabled />);
  expect(parts().main.disabled).toBe(false);
  expect(parts().menu.disabled).toBe(true);
  cleanup();
  render(<Split mainDisabled />);
  expect(parts().main.disabled).toBe(true);
  expect(parts().menu.disabled).toBe(false);
});

test("disabled on the group disables both parts", () => {
  render(<Split disabled />);
  expect(parts().main.disabled).toBe(true);
  expect(parts().menu.disabled).toBe(true);
});
