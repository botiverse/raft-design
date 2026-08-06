import { describe, expect, it } from "vitest";

import {
  getPlaygroundSidePanelOwner,
  validatePlaygroundSearch,
  validatePlaygroundChannelSearch,
} from "./playground-search.ts";

describe("validatePlaygroundSearch", () => {
  it("keeps route-owned content slots and drops empty values", () => {
    expect(
      validatePlaygroundSearch({
        content: "channel:all",
        context: "thread:all:launch",
        detail: "member:cindy",
        query: "sidebar state",
        surface: "conversation:design",
      }),
    ).toEqual({
      content: "channel:all",
      context: "thread:all:launch",
      detail: "member:cindy",
      query: "sidebar state",
      surface: "conversation:design",
    });
    expect(validatePlaygroundSearch({ content: "", context: null })).toEqual({});
  });
});

describe("validatePlaygroundChannelSearch", () => {
  it("keeps registered synthetic task threads and rejects unknown task-shaped IDs", () => {
    expect(validatePlaygroundChannelSearch({ thread: "task:frontend:10" })).toEqual({
      thread: "task:frontend:10",
    });
    expect(validatePlaygroundChannelSearch({ thread: "task:frontend:999" })).toEqual({});
  });

  it("resolves the owning channel for message, synthetic-task, and legacy side panels", () => {
    expect(getPlaygroundSidePanelOwner({ thread: "frontend:reply" })).toBe("frontend");
    expect(getPlaygroundSidePanelOwner({ thread: "task:frontend:10" })).toBe("frontend");
    expect(getPlaygroundSidePanelOwner({ legacyTask: "task:all:1" })).toBe("all");
    expect(getPlaygroundSidePanelOwner({ legacyTask: "task:frontend:10" })).toBeUndefined();
  });
});
