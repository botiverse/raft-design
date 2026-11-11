import "./ricons-styles.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { UnfollowArtifactIcon } from "@botiverse/ricons";

// raft-ui's styles.css imports @botiverse/ricons/styles.css, so an app that
// loads raft-ui's stylesheet and draws ricons' UnfollowArtifactIcon gets its
// 16px mark with no stylesheet import of its own
// (packages/icons/src/icons.md#action-icons).

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

it("with raft-ui's stylesheet, UnfollowArtifactIcon draws the heavier minus at 16px", () => {
  const { container } = render(<UnfollowArtifactIcon className="size-4" />);
  const svg = container.querySelector("svg")!;
  const display = (mark: string) =>
    getComputedStyle(svg.querySelector(`[data-icon-mark="${mark}"]`)!).display;
  expect(svg.getBoundingClientRect().width).toBe(16);
  expect(display("small")).not.toBe("none");
  expect(display("default")).toBe("none");
});
