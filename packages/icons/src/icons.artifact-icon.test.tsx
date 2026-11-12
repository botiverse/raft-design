/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { FileCode } from "lucide-react";
import { ArtifactIcon, FollowArtifactIcon, UnfollowArtifactIcon } from "./index";

// ArtifactIcon is Lucide's file-code with its page drawn 2 wider (x 3 to 21), so beside
// the rail's and the menus' icons it reads as their size (icons.md, Anatomy). The `< >`
// is Lucide's, unchanged: a Lucide upgrade that redraws it fails here.

afterEach(cleanup);

const paths = (svg: Element) =>
  Array.from(svg.querySelectorAll("path"), (path) => path.getAttribute("d"));

test("draws Lucide's file-code `< >` on a page from x 3 to 21", () => {
  const ours = paths(render(<ArtifactIcon />).container.querySelector("svg")!);
  const lucide = paths(render(<FileCode />).container.querySelector("svg")!);
  expect(ours.slice(2)).toEqual(lucide.slice(2));
  expect(ours[0]).toMatch(/^M5 22a2 2 0 0 1-2-2V4/);
  expect(ours[0]).toContain("A2.4 2.4 0 0 1 21 8v12");
  expect(ours[1]).toBe("M15 2v5a1 1 0 0 0 1 1h5");
});

test("following and unfollowing an Artifact are drawn on the same page", () => {
  for (const Icon of [FollowArtifactIcon, UnfollowArtifactIcon]) {
    const d = paths(render(<Icon />).container.querySelector("svg")!);
    expect(d[0]).toMatch(/^M21 12\.5V8/);
    expect(d[0]).toContain("H5a2 2 0 0 0-2 2v16");
    expect(d[1]).toBe("M15 2v5a1 1 0 0 0 1 1h5");
    cleanup();
  }
});
