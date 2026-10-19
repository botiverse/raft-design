import "./computer-icon.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ComputerIcon } from "./computer-icon";
import type { ComputerDevice } from "./computer-icon";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

/* Which mark paints: the icon is its own size container (`@container/computer-icon`). */
function visibleMarks(size: number) {
  const { container } = render(
    <ComputerIcon device="server" platform="linux" distro="ubuntu" width={size} height={size} />,
  );
  const marks = [...container.querySelectorAll("path[fill='currentColor']")];
  const shown = marks.map((mark) => getComputedStyle(mark).display !== "none");
  cleanup();
  return shown;
}

it("the distro mark shows from 18px up, Tux below", () => {
  expect(visibleMarks(14)).toEqual([true, false]);
  expect(visibleMarks(16)).toEqual([true, false]);
  expect(visibleMarks(18)).toEqual([false, true]);
  expect(visibleMarks(24)).toEqual([false, true]);
  expect(visibleMarks(48)).toEqual([false, true]);
});

it("the default 18px icon (no class) shows the distro mark", () => {
  const { container } = render(<ComputerIcon platform="linux" distro="fedora" />);
  const marks = [...container.querySelectorAll("path[fill='currentColor']")];
  expect(container.querySelector("svg")!.getBoundingClientRect().width).toBe(18);
  expect(marks.map((mark) => getComputedStyle(mark).display !== "none")).toEqual([false, true]);
});

const SHAPES: (ComputerDevice | null)[] = [
  null,
  "laptop",
  "mini",
  "studio",
  "imac",
  "desktop",
  "server",
  "vm",
  "container",
];

it("every shape, container included, keeps its 2-unit stroke inside the 24-unit grid", () => {
  for (const device of SHAPES) {
    const { container } = render(<ComputerIcon device={device} />);
    const box = (container.querySelector("path[stroke]") as SVGPathElement).getBBox();
    expect(box.x, `${device}`).toBeGreaterThanOrEqual(1);
    expect(box.y, `${device}`).toBeGreaterThanOrEqual(1);
    expect(box.x + box.width, `${device}`).toBeLessThanOrEqual(23);
    expect(box.y + box.height, `${device}`).toBeLessThanOrEqual(23);
    cleanup();
  }
});
