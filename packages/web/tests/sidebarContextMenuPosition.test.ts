import assert from "node:assert/strict";
import test from "node:test";
import { placeSidebarContextMenu } from "../src/components/layout/sidebarContextMenuPosition";

test("sidebar context menu opens upward from a bottom-edge trigger", () => {
  const position = placeSidebarContextMenu({
    x: 640,
    y: 620,
    menuWidth: 192,
    menuHeight: 226,
    viewportWidth: 700,
    viewportHeight: 650,
  });

  assert.equal(position.x, 448);
  assert.equal(position.y, 394);
});

test("sidebar context menu keeps a viewport margin on very small screens", () => {
  const position = placeSidebarContextMenu({
    x: -20,
    y: -40,
    menuWidth: 192,
    menuHeight: 226,
    viewportWidth: 180,
    viewportHeight: 200,
  });

  assert.deepEqual(position, { x: 8, y: 8 });
});
