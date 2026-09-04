import { describe, expect, it } from "vitest";

import { COMPONENT_SEARCH_ITEMS, filterComponentSearchItems } from "./sidebar.tsx";

describe("component navigation search", () => {
  it("indexes every component route with its navigation group", () => {
    expect(COMPONENT_SEARCH_ITEMS).toContainEqual({
      label: "Button",
      to: "/components/button",
      group: "Actions",
    });
    expect(COMPONENT_SEARCH_ITEMS).toContainEqual({
      label: "ComposerSuggestions",
      to: "/components/composer-suggestions",
      group: "Chat",
    });
    expect(COMPONENT_SEARCH_ITEMS).toContainEqual({
      label: "Icons",
      to: "/components/icons",
      group: "Foundations",
    });
  });

  it("matches component labels, groups, and routes case-insensitively", () => {
    expect(filterComponentSearchItems("  /components/button ")).toEqual([
      { label: "Button", to: "/components/button", group: "Actions" },
    ]);
    expect(filterComponentSearchItems("feedback").map((item) => item.label)).toEqual([
      "Banner",
      "EmptyState",
      "NotificationCenter",
      "Progress",
      "Skeleton",
      "Spinner",
      "Toast",
    ]);
    expect(filterComponentSearchItems("/components/dialog")).toEqual([
      { label: "Dialog", to: "/components/dialog", group: "Overlays" },
    ]);
  });

  it("returns the full index for an empty query and an empty list for misses", () => {
    expect(filterComponentSearchItems(" ")).toBe(COMPONENT_SEARCH_ITEMS);
    expect(filterComponentSearchItems("does-not-exist")).toEqual([]);
  });
});
