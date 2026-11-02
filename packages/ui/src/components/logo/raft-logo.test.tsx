/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { RaftLogo, RaftLogoLockup, RaftWordmark } from "./raft-logo";

afterEach(cleanup);

const YELLOW = "dark:fill-[oklch(0.8829_0.1623_91.9)]";
const INK = "dark:fill-[oklch(0.1813_0.005_17.62)]";

const paths = (ui: ReactElement) =>
  Array.from(render(ui).container.querySelectorAll("path")).map((path) => ({
    fill: path.getAttribute("fill"),
    className: path.getAttribute("class"),
  }));

test("in dark mode the ink outline turns yellow and the cream inside turns ink", () => {
  for (const Artwork of [RaftLogo, RaftWordmark, RaftLogoLockup]) {
    const drawn = paths(<Artwork />);
    expect(drawn.length).toBeGreaterThan(0);
    for (const { fill, className } of drawn) {
      expect(className).toBe(fill === "#141111" ? YELLOW : INK);
    }
    cleanup();
  }
});

test("the light artwork keeps its fill attributes, path by path as in the SVG files", () => {
  expect(paths(<RaftLogo />).map(({ fill }) => fill)).toEqual(["#141111", "#fffaef", "#fffaef"]);
  cleanup();
  expect(paths(<RaftWordmark />).map(({ fill }) => fill)).toEqual([
    "#141111",
    "#141111",
    "#fffaef",
  ]);
});
