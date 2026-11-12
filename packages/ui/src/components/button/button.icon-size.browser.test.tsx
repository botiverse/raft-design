import "./button.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "./button";

// An icon marked `data-icon` that isn't an svg, such as the App Store and
// Google Play marks drawn as an `<img>`, takes the same size as an svg icon
// in that Button (Iconography › Sizes): 18px in `lg` and `xl`, 16px in `md`.
// Seen in slock: in an `lg` Button the mark fell to 1em (the 15px label)
// while the ↗ svg beside it was 18px. Real layout only: jsdom computes no
// sizes.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const MARK =
  "data:image/svg+xml," +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"/>');

function renderButton(size: "md" | "lg" | "xl") {
  render(
    <ThemeProvider>
      <Button size={size} render={<a href="https://apps.apple.com" />}>
        <img data-testid="mark" data-icon="inline-start" src={MARK} alt="" />
        App Store
        <svg data-testid="arrow" data-icon="inline-end" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 17 17 7M8 7h9v9" />
        </svg>
      </Button>
    </ThemeProvider>,
  );
  const box = (id: string) => {
    const rect = screen.getByTestId(id).getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  };
  return { mark: box("mark"), arrow: box("arrow") };
}

for (const [size, px] of [
  ["lg", 18],
  ["xl", 18],
  ["md", 16],
] as const) {
  it(`in a ${size} Button an <img data-icon> is ${px}px, like the svg beside it`, () => {
    const { mark, arrow } = renderButton(size);
    expect(arrow).toEqual({ width: px, height: px });
    expect(mark).toEqual({ width: px, height: px });
  });
}

it("an <img data-icon> with a size- class of its own keeps it", () => {
  render(
    <ThemeProvider>
      <Button size="lg">
        <img data-testid="mark" data-icon="inline-start" src={MARK} alt="" className="size-5" />
        App Store
      </Button>
    </ThemeProvider>,
  );
  const rect = screen.getByTestId("mark").getBoundingClientRect();
  expect({ width: rect.width, height: rect.height }).toEqual({ width: 20, height: 20 });
});
