/**
 * @vitest-environment jsdom
 *
 * A menu shortcut is a bare Kbd with no cap (kbd.md, "Menus"). Kbd draws its
 * cap line with `inset-ring`, which `ring-0` does not reset, so the shortcut
 * resets the inset ring itself. The computed box-shadow, in light and dark, is
 * measured by dropdown-menu-shortcut.browser.test.tsx; this guards the classes
 * in CI, which runs no browser tests.
 */
import { afterEach, describe, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ContextMenuShortcut } from "../context-menu/context-menu";
import { DropdownMenuShortcut } from "./dropdown-menu";

afterEach(cleanup);

const classes = (element: Element) => element.getAttribute("class")!.split(/\s+/);

describe("menu shortcuts", () => {
  test.each([
    ["DropdownMenuShortcut", DropdownMenuShortcut],
    ["ContextMenuShortcut", ContextMenuShortcut],
  ] as const)("%s resets Kbd's inset ring", (_name, Shortcut) => {
    render(<Shortcut data-testid="shortcut">⌘C</Shortcut>);
    const list = classes(screen.getByTestId("shortcut"));
    expect(list).toContain("inset-ring-0");
    expect(list).not.toContain("inset-ring");
  });
});
