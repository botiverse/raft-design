/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";
import { Avatar, AvatarFallback, AvatarGroupButton, AvatarGroupCount } from "./avatar";

afterEach(cleanup);

test("a native button holding the stack's faces, named by the caller", () => {
  render(
    <AvatarGroupButton aria-label="Martin viewing, Bugen writing">
      <Avatar size="xs" type="human">
        <AvatarFallback>M</AvatarFallback>
      </Avatar>
      <Avatar size="xs" type="agent" />
      <AvatarGroupCount size="xs">+2</AvatarGroupCount>
    </AvatarGroupButton>,
  );
  const button = screen.getByRole("button", { name: "Martin viewing, Bugen writing" });
  expect(button.tagName).toBe("BUTTON");
  expect(button.getAttribute("type")).toBe("button");
  expect(button.getAttribute("data-slot")).toBe("avatar-group-button");
  // The faces are the AvatarGroup's direct children: they overlap and ring as in a group.
  expect(button.className).toContain("stack-x-[-5px]");
  expect(button.querySelectorAll(":scope > [data-slot=avatar]")).toHaveLength(2);
  // Laid out inline (not the group's block flex), so it sits in a header row.
  expect(button.className.split(/\s+/)).toContain("inline-flex");
  expect(button.className.split(/\s+/)).not.toContain("flex");
});

test("as a PopoverTrigger's render, it opens the list and says so", () => {
  render(
    <Popover>
      <PopoverTrigger render={<AvatarGroupButton aria-label="2 people viewing" />}>
        <Avatar size="xs" type="agent" />
        <Avatar size="xs" type="agent" />
      </PopoverTrigger>
      <PopoverContent aria-label="Who's here">
        <p>Bugen viewing</p>
      </PopoverContent>
    </Popover>,
  );
  const button = screen.getByRole("button", { name: "2 people viewing" });
  expect(button.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(button);
  expect(button.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByText("Bugen viewing")).toBeTruthy();
});

test("disabled, it is a disabled button", () => {
  render(
    <AvatarGroupButton aria-label="Members" disabled>
      <Avatar size="xs" type="agent" />
    </AvatarGroupButton>,
  );
  expect((screen.getByRole("button", { name: "Members" }) as HTMLButtonElement).disabled).toBe(
    true,
  );
});
