/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

afterEach(cleanup);

describe("DropdownMenuLinkItem", () => {
  it("is a link, and the current page is marked for assistive technology and drawn chosen", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Language</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLinkItem current href="/a">
            English
          </DropdownMenuLinkItem>
          <DropdownMenuLinkItem href="/zh/a">简体中文</DropdownMenuLinkItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const current = screen.getByText("English").closest("a")!;
    const other = screen.getByText("简体中文").closest("a")!;
    expect(current.getAttribute("href")).toBe("/a");
    expect(other.getAttribute("href")).toBe("/zh/a");
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(current.hasAttribute("data-checked")).toBe(true);
    expect(current.querySelector("svg")).not.toBeNull();
    expect(other.getAttribute("aria-current")).toBeNull();
    expect(other.hasAttribute("data-checked")).toBe(false);
    expect(other.querySelector("svg")).toBeNull();
  });
});
