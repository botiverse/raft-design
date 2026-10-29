import { expect, test, vi } from "vite-plus/test";
import { holdEscape, releaseEscape } from "./drag-escape";

// Escape during a drag belongs to the drag (design/patterns/drag-and-drop.md#drop-and-cancel).
// The guard is a capture-phase listener on the window, and listeners on one
// target run in the order they were added, so it is installed when this module
// loads, before the app adds its own (drag-escape.entries.test.ts: every entry
// loads it). In a real browser: jsdom's `window` global is not the `this` its
// listeners get.

const it = test.skipIf(typeof window === "undefined");

it("takes Escape during a drag before an app listener added after it loaded", () => {
  const app = vi.fn();
  window.addEventListener("keydown", app, { capture: true });
  const cancel = vi.fn();
  const sensor = {};
  try {
    holdEscape(window, sensor, cancel);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", cancelable: true }));
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(app).not.toHaveBeenCalled();

    releaseEscape(window, sensor);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", cancelable: true }));
    expect(app).toHaveBeenCalledTimes(1);
  } finally {
    releaseEscape(window, sensor);
    window.removeEventListener("keydown", app, { capture: true });
  }
});
