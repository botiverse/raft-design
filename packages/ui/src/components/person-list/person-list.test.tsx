/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test, vi } from "vite-plus/test";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { Avatar, AvatarFallback } from "../avatar/avatar";
import {
  PersonList,
  PersonListItem,
  PersonListItemName,
  PersonListItemStatus,
} from "./person-list";

afterEach(cleanup);

function Viewers({ onOpen = () => {} }: { onOpen?: () => void }) {
  return (
    <PersonList aria-label="Who's here">
      <PersonListItem onClick={onOpen} data-testid="martin">
        <Avatar aria-hidden size="xs" type="human">
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <PersonListItemName>Martin</PersonListItemName>
        <PersonListItemStatus>viewing</PersonListItemStatus>
      </PersonListItem>
      <PersonListItem render={<a href="/agents/wug" />} data-testid="wug">
        <Avatar aria-hidden size="xs" type="agent" />
        <PersonListItemName>Wug</PersonListItemName>
        <PersonListItemStatus>updated since</PersonListItemStatus>
        <PersonListItemStatus>2 hours ago</PersonListItemStatus>
      </PersonListItem>
      <PersonListItem interactive={false} data-testid="atlas">
        <Avatar aria-hidden size="xs" type="agent" />
        <PersonListItemName>Atlas</PersonListItemName>
        <PersonListItemStatus>deleted</PersonListItemStatus>
      </PersonListItem>
    </PersonList>
  );
}

test("a list of list items, one per person", () => {
  render(<Viewers />);
  const list = screen.getByRole("list", { name: "Who's here" });
  expect(list.tagName).toBe("UL");
  expect(list.getAttribute("data-slot")).toBe("person-list");
  const items = within(list).getAllByRole("listitem");
  expect(items).toHaveLength(3);
  for (const item of items) expect(item.getAttribute("data-slot")).toBe("person-list-item");
});

// The comma in "Martin, viewing" is CSS (a ::after), which jsdom has no
// stylesheet for: the browser test checks the exact name.
test("a row is a native button inside its list item, named by its words, not the face", () => {
  const onOpen = vi.fn();
  render(<Viewers onOpen={onOpen} />);
  const martin = screen.getByRole("button", { name: /^Martin\s*viewing$/ });
  expect(martin).toBe(screen.getByTestId("martin"));
  expect(martin.getAttribute("type")).toBe("button");
  expect(martin.getAttribute("data-slot")).toBe("person-list-row");
  expect(martin.parentElement?.tagName).toBe("LI");
  fireEvent.click(martin);
  expect(onOpen).toHaveBeenCalledTimes(1);
});

test("render swaps the row for a link, and a second status joins its name", () => {
  render(<Viewers />);
  const wug = screen.getByRole("link", { name: /^Wug\s*updated since\s*2 hours ago$/ });
  expect(wug.tagName).toBe("A");
  expect(wug.getAttribute("href")).toBe("/agents/wug");
  expect(wug.hasAttribute("type")).toBe(false);
});

test("a row that opens nothing is a plain div: not a button, not focusable", () => {
  render(<Viewers />);
  const atlas = screen.getByTestId("atlas");
  expect(atlas.tagName).toBe("DIV");
  expect(atlas.hasAttribute("tabindex")).toBe(false);
  expect(atlas.hasAttribute("data-interactive")).toBe(false);
  expect(screen.queryByRole("button", { name: /Atlas/ })).toBeNull();
  // It stays a list item with its words.
  expect(atlas.parentElement?.getAttribute("data-slot")).toBe("person-list-item");
  expect(atlas.textContent).toBe("Atlasdeleted");
});

test("the hover, press and focus classes belong to the interactive row only", () => {
  render(<Viewers />);
  const martin = screen.getByTestId("martin").className;
  const atlas = screen.getByTestId("atlas").className;
  for (const cls of [
    "hover:before:bg-fill-cell-hover",
    "active:before:bg-fill-cell-press",
    "focus-visible:keyboard:before:inset-ring-2",
  ]) {
    expect(martin, cls).toContain(cls);
    expect(atlas, cls).not.toContain(cls);
  }
});
