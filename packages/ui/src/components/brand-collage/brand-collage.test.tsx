/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { Avatar } from "../avatar/avatar";
import { BrandCollage } from "./brand-collage";

afterEach(cleanup);

test("the illustration sits flat at 8px a cell; each face gets its own tilt and the sticker shadow", () => {
  const { container } = render(
    <BrandCollage illustration="task-collab">
      {Array.from({ length: 6 }, (_, i) => (
        <Avatar key={i} type="agent" size={i % 2 ? "md" : "lg"} />
      ))}
    </BrandCollage>,
  );
  const root = container.querySelector("[data-slot=brand-collage]")!;
  expect(root.getAttribute("aria-hidden")).toBe("true");
  const art = root.querySelector("[data-slot=brand-illustration]")!;
  expect(art.getAttribute("width")).toBe("296");
  expect(art.getAttribute("class")).not.toMatch(/rotate|shadow/);
  const faces = Array.from(root.querySelectorAll("[data-slot=brand-collage-face]"));
  expect(faces).toHaveLength(5);
  const tilts = faces.map((face) => face.className.match(/-?rotate-\d/)![0]);
  expect(new Set(tilts).size).toBe(5);
  for (const face of faces) {
    expect(face.className).toContain("shadow-sticker");
    expect(face.querySelector("[data-slot=avatar]")).not.toBeNull();
  }
});
