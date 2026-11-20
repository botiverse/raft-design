import "./avatar.test.css";
/**
 * The avatar's corners (avatar.md, "The corners"): the attention dot on the
 * top-right at the presence light's size and overhang for each size step,
 * mirrored to the top; another server's tile on the top-left, sized by the
 * step and never by the width the avatar is drawn at, and below `sm` the logo
 * in a 10px circle once it loads, else a round dot. Real layout: only a browser computes it.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/avatar/avatar.corners.browser.test.tsx`
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage, AvatarOrigin } from "./avatar";
import type { AvatarSize } from "./avatar";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

const SIZES: AvatarSize[] = ["xl", "lg", "md", "sm", "xs", "2xs", "3xs"];

const rect = (id: string) => screen.getByTestId(id).getBoundingClientRect();

it("a top-right badge mirrors the bottom-right light at every size step", () => {
  render(
    <ThemeProvider>
      <div className="flex gap-8 p-8">
        {SIZES.map((size) => (
          <div key={size} className="flex gap-8">
            <Avatar size={size} type="agent" data-testid={`${size}-a`}>
              <AvatarBadge data-testid={`${size}-light`} />
            </Avatar>
            <Avatar size={size} type="agent" data-testid={`${size}-b`}>
              <AvatarBadge position="top-right" data-testid={`${size}-dot`} />
            </Avatar>
          </div>
        ))}
      </div>
    </ThemeProvider>,
  );
  for (const size of SIZES) {
    const a = rect(`${size}-a`);
    const light = rect(`${size}-light`);
    const b = rect(`${size}-b`);
    const dot = rect(`${size}-dot`);
    expect({ size, width: dot.width }).toEqual({ size, width: light.width });
    expect({ size, right: dot.right - b.right }).toEqual({ size, right: light.right - a.right });
    expect({ size, top: b.top - dot.top }).toEqual({ size, top: light.bottom - a.bottom });
  }
});

// [size, tile px, its offset from the avatar's padding box (inside the
// border), a dot?]
const ORIGIN: [AvatarSize, number, number, boolean][] = [
  ["xl", 19, 5, false],
  ["lg", 19, 4, false],
  ["md", 14, 3, false],
  ["sm", 10, 3, false],
  ["xs", 7, 3, true],
  ["2xs", 7, 3, true],
  ["3xs", 6, 2, true],
];

it("the origin tile takes its size from the size step, and is a dot below sm", () => {
  render(
    <ThemeProvider>
      <div className="flex gap-8 p-8">
        {ORIGIN.map(([size]) => (
          <Avatar key={size} size={size} type="human" data-testid={`${size}-avatar`}>
            <AvatarOrigin data-testid={`${size}-origin`}>
              <AvatarFallback data-testid={`${size}-initial`}>A</AvatarFallback>
            </AvatarOrigin>
          </Avatar>
        ))}
      </div>
    </ThemeProvider>,
  );
  for (const [size, px, offset, dot] of ORIGIN) {
    const avatar = rect(`${size}-avatar`);
    const origin = rect(`${size}-origin`);
    // The sticker's 1.5px edge is drawn 1px wide at 1x: measure it.
    const edge = parseFloat(getComputedStyle(screen.getByTestId(`${size}-avatar`)).borderTopWidth);
    const out = offset - edge;
    expect({ size, width: origin.width, height: origin.height }).toEqual({
      size,
      width: px,
      height: px,
    });
    expect({ size, left: avatar.left - origin.left, top: avatar.top - origin.top }).toEqual({
      size,
      left: out,
      top: out,
    });
    const style = getComputedStyle(screen.getByTestId(`${size}-origin`));
    const round = parseFloat(style.borderTopLeftRadius) >= px / 2;
    expect({ size, round }).toEqual({ size, round: dot });
    const initial = getComputedStyle(screen.getByTestId(`${size}-initial`)).visibility;
    expect({ size, initial }).toEqual({ size, initial: dot ? "hidden" : "visible" });
  }
});

it("the origin tile keeps its step's size on an avatar drawn smaller", () => {
  render(
    <ThemeProvider>
      <div className="p-8">
        <Avatar size="md" type="human" className="size-6">
          <AvatarOrigin data-testid="origin">
            <AvatarFallback>A</AvatarFallback>
          </AvatarOrigin>
        </Avatar>
      </div>
    </ThemeProvider>,
  );
  expect(rect("origin").width).toBe(14);
});

// A 1x1 logo, so the image loads without the network.
const LOGO =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1" fill="red"/></svg>',
  );

it("below sm, a loaded logo is a 10px circle instead of the dot", async () => {
  const small: AvatarSize[] = ["xs", "2xs", "3xs"];
  render(
    <ThemeProvider>
      <div className="flex gap-8 p-8">
        {small.map((size) => (
          <Avatar key={size} size={size} type="human">
            <AvatarOrigin data-testid={`${size}-origin`}>
              <AvatarImage src={LOGO} alt="" />
              <AvatarFallback>A</AvatarFallback>
            </AvatarOrigin>
          </Avatar>
        ))}
      </div>
    </ThemeProvider>,
  );
  for (const size of small) {
    await waitFor(() =>
      expect(
        screen.getByTestId(`${size}-origin`).querySelector('[data-slot="avatar-image"]'),
      ).not.toBeNull(),
    );
    const origin = rect(`${size}-origin`);
    expect({ size, width: origin.width, height: origin.height }).toEqual({
      size,
      width: 10,
      height: 10,
    });
    const style = getComputedStyle(screen.getByTestId(`${size}-origin`));
    expect({ size, round: parseFloat(style.borderTopLeftRadius) >= 5 }).toEqual({
      size,
      round: true,
    });
    const image = screen.getByTestId(`${size}-origin`).querySelector('[data-slot="avatar-image"]')!;
    expect({ size, visibility: getComputedStyle(image).visibility }).toEqual({
      size,
      visibility: "visible",
    });
  }
});
