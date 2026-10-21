import { describe, expect, it } from "vite-plus/test";

import { FenwickTree } from "../utils/fenwick-tree";

describe("FenwickTree", () => {
  it("sums estimated sizes plus the added deltas", () => {
    const tree = new FenwickTree(5, 10);
    expect(tree.sum()).toBe(50);
    expect(tree.sum(0)).toBe(0);
    expect(tree.sum(-1)).toBe(0);
    tree.add(2, 5);
    tree.add(4, -3);
    expect(tree.get(2)).toBe(15);
    expect(tree.get(4)).toBe(7);
    expect(tree.get(0)).toBe(10);
    expect(tree.sum(2)).toBe(20);
    expect(tree.sum(3)).toBe(35);
    expect(tree.sum()).toBe(52);
  });

  it("ignores a zero delta and keeps a zeroed internal array of length + 1", () => {
    const tree = new FenwickTree(3, 4);
    tree.add(1, 0);
    expect(tree.ft).toEqual([0, 0, 0, 0]);
    expect(tree.l).toBe(3);
    expect(tree.estimated).toBe(4);
  });

  it("throws past the end", () => {
    const tree = new FenwickTree(2, 1);
    expect(() => tree.sum(3)).toThrow("[FenwickTree.sum]: `i` is larger than length.");
  });

  it("maps an offset to the item that contains it (getBound)", () => {
    const tree = new FenwickTree(5, 10);
    tree.add(2, 5); // offsets 0, 10, 20, 35, 45, end 55
    expect(tree.getBound(-50)).toBe(0);
    expect(tree.getBound(0)).toBe(0);
    expect(tree.getBound(9)).toBe(0);
    expect(tree.getBound(10)).toBe(1);
    expect(tree.getBound(25)).toBe(2);
    expect(tree.getBound(35)).toBe(3);
    expect(tree.getBound(54)).toBe(4);
    expect(tree.getBound(55)).toBe(5);
    expect(tree.getBound(1000)).toBe(5);
  });

  it("works as the column tree (estimated 0, widths added)", () => {
    const columns = new FenwickTree(3, 0);
    [100, 50, 25].forEach((width, index) => columns.add(index, width));
    expect(columns.sum(1)).toBe(100);
    expect(columns.sum(2)).toBe(150);
    expect(columns.sum()).toBe(175);
    expect(columns.getBound(120)).toBe(1);
  });

  it("is empty with length 0 (virtualization off)", () => {
    const tree = new FenwickTree(0, 0);
    expect(tree.sum()).toBe(0);
    expect(tree.getBound(100)).toBe(0);
  });
});
