import "./corner-tag.test.css";
/**
 * CornerTag (corner-tag.md): the tag lies on the card's top-right corner,
 * flush with its two outer edges and rounded only on the corner facing in,
 * and CornerTagSpacer makes a long name truncate before it instead of running
 * under it, without adding a row. Real layout: only a browser computes it.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/corner-tag`
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { CornerTag, CornerTagSpacer } from "./corner-tag";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

function ProfileCard({ name }: { name: string }) {
  return (
    <ThemeProvider>
      <div
        data-testid="card"
        className="relative w-[300px] overflow-hidden rounded-container bg-layer-popover"
      >
        <CornerTag data-testid="tag">Owner</CornerTag>
        <div className="flex items-start gap-3 p-4  ">
          <div className="size-[51px] shrink-0" />
          <div className="min-w-0 flex-1">
            <div data-testid="line" className="flex items-center gap-1.5">
              <p data-testid="name" className="m-0 truncate text-headline font-bold">
                {name}
              </p>
              <CornerTagSpacer data-testid="spacer">Owner</CornerTagSpacer>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

const box = (id: string) => screen.getByTestId(id).getBoundingClientRect();

it("sits flush on the card's top-right corner, rounded only on its inner corner", () => {
  render(<ProfileCard name="Mina Chen" />);
  const card = box("card");
  const tag = box("tag");
  expect(tag.top).toBe(card.top);
  expect(tag.right).toBe(card.right);
  expect(tag.height).toBe(24);
  const style = getComputedStyle(screen.getByTestId("tag"));
  expect(style.borderBottomLeftRadius).toBe("10px");
  expect(style.borderTopLeftRadius).toBe("0px");
  expect(style.borderBottomRightRadius).toBe("0px");
});

it("a long name truncates before the tag, and the spacer adds no height", () => {
  render(
    <ProfileCard name="Alexandra Wilhelmina Featherstonehaugh-Montgomery of the Northern Reaches" />,
  );
  const name = screen.getByTestId("name");
  expect(name.scrollWidth).toBeGreaterThan(name.clientWidth);
  expect(box("name").right).toBeLessThanOrEqual(box("tag").left);
  expect(box("spacer").height).toBe(0);
  expect(box("line").height).toBe(box("name").height);
  expect(screen.getByTestId("spacer").getAttribute("aria-hidden")).toBe("true");
});
