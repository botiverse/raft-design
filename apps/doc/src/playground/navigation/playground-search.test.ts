import { describe, expect, it } from "vitest";

import {
  getPlaygroundSidePanelOwner,
  validatePlaygroundChannelSearch,
} from "./playground-search.ts";

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
