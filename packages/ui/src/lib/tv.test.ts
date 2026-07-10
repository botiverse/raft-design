import { describe, expect, it } from "vite-plus/test";

import { tv } from "./tv";

describe("tv", () => {
  it("returns an empty class name for an empty recipe", () => {
    expect(tv({})()).toBe("");
  });

  it("merges classes returned by a string recipe", () => {
    const recipe = tv({ base: "px-2" });

    expect(recipe({ class: "px-4" })).toBe("px-4");
  });

  it("merges classes returned by each slot recipe", () => {
    const recipe = tv({
      slots: {
        root: "px-2",
        label: "text-sm",
      },
    });

    const slots = recipe();

    expect(slots.root({ class: "px-4" })).toBe("px-4");
    expect(slots.label()).toBe("text-sm");
  });
});
