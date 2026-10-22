/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";

import { SegmentedControlLink, SegmentedControlNav } from "./segmented-control";

afterEach(cleanup);

describe("SegmentedControlLink", () => {
  it("is a link, and the current one is marked for assistive technology and drawn selected", () => {
    render(
      <SegmentedControlNav aria-label="Language">
        <SegmentedControlLink current href="/a">
          English
        </SegmentedControlLink>
        <SegmentedControlLink href="/zh/a">简体中文</SegmentedControlLink>
      </SegmentedControlNav>,
    );
    expect(screen.getByRole("navigation", { name: "Language" })).toBeTruthy();
    const current = screen.getByRole("link", { name: "English" });
    const other = screen.getByRole("link", { name: "简体中文" });
    expect(current.getAttribute("href")).toBe("/a");
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(current.hasAttribute("data-checked")).toBe(true);
    expect(other.getAttribute("aria-current")).toBeNull();
    expect(other.hasAttribute("data-checked")).toBe(false);
    expect(other.getAttribute("data-slot")).toBe("segmented-control-item");
  });
});
