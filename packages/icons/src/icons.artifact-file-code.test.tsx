/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { FileCode } from "lucide-react";
import { ArtifactIcon } from "./object-icons";

// ArtifactIcon is Lucide's file-code drawn unchanged, because it is the icon an
// HTML Artifact's chip shows in a message (icons.md, Anatomy). A
// Lucide upgrade that redraws file-code fails here: redraw ArtifactIcon to match.

afterEach(cleanup);

const paths = (svg: Element) =>
  Array.from(svg.querySelectorAll("path"), (path) => path.getAttribute("d"));

test("draws the same paths as Lucide's file-code", () => {
  const ours = render(<ArtifactIcon />).container.querySelector("svg")!;
  const lucide = render(<FileCode />).container.querySelector("svg")!;
  expect(paths(lucide).length).toBeGreaterThan(0);
  expect(paths(ours)).toEqual(paths(lucide));
});
