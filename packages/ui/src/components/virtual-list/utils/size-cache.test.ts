import { describe, expect, it } from "vite-plus/test";

import { createTypicalSizeCache, getTypicalSize, recordMeasuredSize } from "./size-cache";

describe("recordMeasuredSize", () => {
  it("records a row measured at the estimate as measured", () => {
    const offsets = new Map<string, number>();
    expect(recordMeasuredSize(offsets, "a", 72, 72)).toBe(true);
    expect(offsets.has("a")).toBe(true);
    expect(offsets.get("a")).toBe(0);
  });

  it("keeps a measured row measured when it resizes to the estimate", () => {
    const offsets = new Map([["a", 128]]);
    expect(recordMeasuredSize(offsets, "a", 72, 72)).toBe(true);
    expect(offsets.get("a")).toBe(0);
  });

  it("reports no change when the size is the recorded one", () => {
    const offsets = new Map([["a", 128]]);
    expect(recordMeasuredSize(offsets, "a", 200, 72)).toBe(false);
    expect(recordMeasuredSize(offsets, "a", 210, 72)).toBe(true);
    expect(offsets.get("a")).toBe(138);
  });
});

describe("getTypicalSize", () => {
  it("is the estimate before any row is measured", () => {
    expect(getTypicalSize(createTypicalSizeCache(), new Map(), 0, 72, 20)).toBe(72);
  });

  it("is the mean size of the measured rows", () => {
    const offsets = new Map([
      ["a", 128],
      ["b", 228],
    ]);
    // 200px and 300px.
    expect(getTypicalSize(createTypicalSizeCache(), offsets, 0, 72, 20)).toBe(250);
  });

  it("counts a row measured at the estimate in the mean", () => {
    const offsets = new Map<string, number>();
    recordMeasuredSize(offsets, "a", 200, 72);
    recordMeasuredSize(offsets, "b", 72, 72);
    expect(getTypicalSize(createTypicalSizeCache(), offsets, 0, 72, 20)).toBe(136);
  });

  it("is at least the minimum size, and 1", () => {
    const offsets = new Map([["a", -60]]);
    expect(getTypicalSize(createTypicalSizeCache(), offsets, 0, 72, 20)).toBe(20);
    expect(getTypicalSize(createTypicalSizeCache(), new Map(), 0, 0, 0)).toBe(1);
  });

  it("is computed again when the measurements' version changes, not before", () => {
    const cache = createTypicalSizeCache();
    const offsets = new Map([["a", 128]]);
    expect(getTypicalSize(cache, offsets, 1, 72, 20)).toBe(200);
    offsets.set("b", 228);
    expect(getTypicalSize(cache, offsets, 1, 72, 20)).toBe(200);
    expect(getTypicalSize(cache, offsets, 2, 72, 20)).toBe(250);
  });

  it("is computed again when the estimate changes", () => {
    const cache = createTypicalSizeCache();
    expect(getTypicalSize(cache, new Map(), 1, 72, 20)).toBe(72);
    expect(getTypicalSize(cache, new Map(), 1, 100, 20)).toBe(100);
    const offsets = new Map([["a", 128]]);
    expect(getTypicalSize(cache, offsets, 2, 72, 20)).toBe(200);
    expect(getTypicalSize(cache, offsets, 2, 80, 20)).toBe(208);
  });
});
