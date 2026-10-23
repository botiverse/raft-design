import "./located.test.css";
import type { CSSProperties } from "react";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "./lib/theme/theme-provider";
import { LOCATED_MS } from "./lib/located";
import {
  MessageItem,
  MessageItemContent,
  MessageItemSearchMatch,
  MessageMultiSelectCheckbox,
} from "./components/message-item";
import { ListRow, ListRowBody, ListRowGroup } from "./components/list-row";

// The located highlight (design/foundations/states.md#located): info-soft at
// once, held 1.2s, faded out by 2s, layered over the item's own fill, no hover
// change while it lasts, a stronger mark always wins, and held still for 2s
// under reduced motion. The animation is paused and seeked, so the checks
// don't depend on timing.
//
// Colours are compared as pixels, never as strings: the animated registered
// colour serializes as oklab() and the token as oklch(), the same colour in
// two notations. Each side is painted on a canvas over white and over black,
// so alpha counts too, and the channels may differ by 1.

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

function pixels(color: string): number[] {
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("no 2d context");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = "#000";
  ctx.fillRect(1, 0, 1, 1);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 2, 1);
  const data = ctx.getImageData(0, 0, 2, 1).data;
  return [data[0]!, data[1]!, data[2]!, data[4]!, data[5]!, data[6]!];
}

function expectSameColor(actual: string, expected: string) {
  const a = pixels(actual);
  const e = pixels(expected);
  const off = a.some((v, i) => Math.abs(v - e[i]!) > 1);
  expect(
    off,
    `${actual} should look like ${expected} (${JSON.stringify(a)} vs ${JSON.stringify(e)})`,
  ).toBe(false);
}

function expectDifferentColor(actual: string, expected: string) {
  const a = pixels(actual);
  const e = pixels(expected);
  expect(
    a.some((v, i) => Math.abs(v - e[i]!) > 1),
    `${actual} should differ from ${expected}`,
  ).toBe(true);
}

/** The colour of a computed `linear-gradient(c, c)`, or null for `none`. */
function gradientColor(backgroundImage: string): string | null {
  if (backgroundImage === "none") return null;
  const prefix = "linear-gradient(";
  if (!backgroundImage.startsWith(prefix)) throw new Error(`not a gradient: ${backgroundImage}`);
  let depth = 0;
  for (let i = prefix.length; i < backgroundImage.length; i += 1) {
    const ch = backgroundImage[i];
    if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;
    else if (ch === "," && depth === 0) return backgroundImage.slice(prefix.length, i).trim();
  }
  throw new Error(`no colour stop: ${backgroundImage}`);
}

/** The located layer's colour on an element, or null when it isn't painted. */
function layer(el: HTMLElement): string | null {
  return gradientColor(getComputedStyle(el).backgroundImage);
}

function located(el: HTMLElement): Animation {
  const animation = el
    .getAnimations()
    .find((a) => (a as CSSAnimation).animationName?.startsWith("raft-located"));
  if (!animation) throw new Error("no located animation");
  animation.pause();
  return animation;
}

function seek(animation: Animation, ms: number) {
  animation.currentTime = ms;
}

function token(name: string): string {
  return getComputedStyle(screen.getByTestId(`token-${name}`)).backgroundColor;
}

function Tokens() {
  return (
    <>
      {["info-soft", "fill-subtle"].map((name) => (
        <div
          key={name}
          data-testid={`token-${name}`}
          style={{ backgroundColor: `var(--${name})` }}
        />
      ))}
    </>
  );
}

it.each(["light", "dark"] as const)(
  "a located row shows info-soft at once, holds it, and is clear at 2s (%s)",
  (mode) => {
    render(
      <ThemeProvider mode={mode}>
        <Tokens />
        <div data-testid="row" data-located="" className="h-10 bg-layer-card">
          Row
        </div>
      </ThemeProvider>,
    );
    const row = screen.getByTestId("row");
    const ownFill = getComputedStyle(row).backgroundColor;
    const infoSoft = token("info-soft");
    const animation = located(row);

    seek(animation, 0);
    expectSameColor(layer(row)!, infoSoft);
    seek(animation, 1150);
    expectSameColor(layer(row)!, infoSoft);
    seek(animation, 1600);
    expectDifferentColor(layer(row)!, infoSoft);
    expectDifferentColor(layer(row)!, "transparent");
    animation.finish();
    expectSameColor(layer(row) ?? "transparent", "transparent");
    // Layered over the row's own fill, never in place of it.
    expect(getComputedStyle(row).backgroundColor).toBe(ownFill);
  },
);

it("LOCATED_MS is the animation's length", () => {
  render(<div data-testid="row" data-located="" />);
  const animation = located(screen.getByTestId("row"));
  expect(animation.effect?.getTiming().duration).toBe(LOCATED_MS);
});

it("a located row doesn't answer hover", async () => {
  render(
    <ThemeProvider>
      <Tokens />
      <button
        type="button"
        data-testid="row"
        data-located=""
        className="h-10 w-40 hover:overlay-subtle"
      >
        Row
      </button>
    </ThemeProvider>,
  );
  const { page, userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.unhover(document.body);
  const row = screen.getByTestId("row");
  seek(located(row), 500);
  expectSameColor(layer(row)!, token("info-soft"));
  await page.getByTestId("row").hover();
  expectSameColor(layer(row)!, token("info-soft"));
});

// :active can't be forced from a test, so check the rule itself: the located
// paint leaves out a pressed item, and the press tier's utility takes over.
it("a pressed located item shows its press: the paint leaves out :active", () => {
  const paint = [...document.styleSheets]
    .flatMap((sheet) => [...sheet.cssRules])
    .find(
      (r): r is CSSStyleRule =>
        r instanceof CSSStyleRule &&
        r.selectorText.startsWith("[data-located]") &&
        r.style.backgroundImage.includes("--located-fill"),
    );
  expect(paint?.selectorText).toContain(":active");
});

it("a located message takes the fill as its row fill, so the delegated ring matches", () => {
  render(
    <ThemeProvider>
      <Tokens />
      <MessageItem data-testid="message" located>
        <MessageItemContent>Hello</MessageItemContent>
      </MessageItem>
    </ThemeProvider>,
  );
  const message = screen.getByTestId("message");
  expect(message.hasAttribute("data-located")).toBe(true);
  const animation = located(message);
  seek(animation, 0);
  expectSameColor(getComputedStyle(message).backgroundColor, token("info-soft"));
  // Painted once: no second info-soft layer over the row fill.
  expect(getComputedStyle(message).backgroundImage).toBe("none");
  animation.finish();
  expectSameColor(getComputedStyle(message).backgroundColor, "transparent");
});

it("without located, a message has no located animation", () => {
  render(
    <MessageItem data-testid="message">
      <MessageItemContent>Hello</MessageItemContent>
    </MessageItem>,
  );
  const message = screen.getByTestId("message");
  expect(message.hasAttribute("data-located")).toBe(false);
  expect(message.getAnimations()).toHaveLength(0);
});

// A stronger mark wins: located never takes a row's own mark away, during the
// highlight or after it.
it.each(["light", "dark"] as const)(
  "a search match, a checked row and a row with its menu open keep their fill while located (%s)",
  (mode) => {
    render(
      <ThemeProvider mode={mode}>
        <Tokens />
        <MessageItem data-testid="match" located>
          <MessageItemContent>
            Ship the <MessageItemSearchMatch>release</MessageItemSearchMatch>
          </MessageItemContent>
        </MessageItem>
        <MessageItem data-testid="checked" located>
          <MessageMultiSelectCheckbox checked aria-label="Select message" />
          <MessageItemContent>Hello</MessageItemContent>
        </MessageItem>
        <MessageItem data-testid="menu" data-popup-open="" located>
          <MessageItemContent>Hello</MessageItemContent>
        </MessageItem>
      </ThemeProvider>,
    );
    const expected = {
      match: token("info-soft"),
      checked: token("info-soft"),
      menu: token("fill-subtle"),
    };
    for (const [id, fill] of Object.entries(expected)) {
      const row = screen.getByTestId(id);
      const animation = located(row);
      for (const t of [0, 1700]) {
        seek(animation, t);
        expectSameColor(getComputedStyle(row).backgroundColor, fill);
      }
      animation.finish();
      expectSameColor(getComputedStyle(row).backgroundColor, fill);
    }
  },
);

it("a selected row keeps info-soft and gets no located layer", () => {
  render(
    <ThemeProvider>
      <Tokens />
      <ListRow data-testid="row" data-located="" selected>
        <ListRowBody>Selected row</ListRowBody>
      </ListRow>
      <div data-testid="current" data-located="" aria-current="page" />
      <div data-testid="active" data-located="" data-active="true" />
      <div data-testid="not-current" data-located="" aria-current="false" />
    </ThemeProvider>,
  );
  const row = screen.getByTestId("row");
  seek(located(row), 1700);
  expectSameColor(getComputedStyle(row).backgroundColor, token("info-soft"));
  expect(layer(row)).toBeNull();
  for (const id of ["current", "active"]) {
    expect(layer(screen.getByTestId(id))).toBeNull();
  }
  const notCurrent = screen.getByTestId("not-current");
  seek(located(notCurrent), 0);
  expectSameColor(layer(notCurrent)!, token("info-soft"));
});

it("reduced motion holds the highlight still for 2s, with no fade", () => {
  const rule = [...document.styleSheets]
    .flatMap((sheet) => [...sheet.cssRules])
    .flatMap((r) =>
      r instanceof CSSMediaRule ? [r] : r instanceof CSSLayerBlockRule ? [...r.cssRules] : [],
    )
    .filter(
      (r): r is CSSMediaRule =>
        r instanceof CSSMediaRule && r.conditionText.includes("prefers-reduced-motion: reduce"),
    )
    .flatMap((r) => [...r.cssRules])
    .find(
      (r): r is CSSStyleRule => r instanceof CSSStyleRule && r.selectorText === "[data-located]",
    );
  expect(rule?.style.getPropertyValue("--located-animation").trim()).toBe("raft-located-still");

  render(
    <ThemeProvider>
      <Tokens />
      <div
        data-testid="row"
        data-located=""
        className="h-10"
        style={{ "--located-animation": "raft-located-still" } as CSSProperties}
      />
    </ThemeProvider>,
  );
  const row = screen.getByTestId("row");
  const animation = located(row);
  expect((animation as CSSAnimation).animationName).toBe("raft-located-still");
  for (const t of [0, 1000, 1999]) {
    seek(animation, t);
    expectSameColor(layer(row)!, token("info-soft"));
  }
  animation.finish();
  expectSameColor(layer(row) ?? "transparent", "transparent");
});

// The highlight has no shape of its own: it takes the item's corners, like the
// hover. It is a background layer on the item, which CSS clips to the item's
// border radius, and a rounded group clips its rows (overflow: hidden). A
// pseudo-element or a box-shadow would ignore both, so neither may carry it.
it("a located row keeps its own corners: a rounded row, and a row in a rounded group", () => {
  render(
    <ThemeProvider>
      <Tokens />
      <ListRow data-testid="rounded" data-located="" className="rounded-container">
        <ListRowBody>Rounded row</ListRowBody>
      </ListRow>
      <ListRowGroup data-testid="group">
        <ListRow data-testid="grouped" data-located="">
          <ListRowBody>First row</ListRowBody>
        </ListRow>
      </ListRowGroup>
    </ThemeProvider>,
  );
  for (const id of ["rounded", "grouped"]) {
    const row = screen.getByTestId(id);
    const radius = getComputedStyle(row).borderTopLeftRadius;
    seek(located(row), 0);
    const style = getComputedStyle(row);
    expectSameColor(layer(row)!, token("info-soft"));
    expect(style.backgroundClip).toBe("border-box");
    expect(style.borderTopLeftRadius).toBe(radius);
    expect(style.boxShadow).not.toContain("inset");
    for (const pseudo of ["::before", "::after"]) {
      expect(getComputedStyle(row, pseudo).backgroundImage).not.toContain("gradient");
    }
  }
  expect(getComputedStyle(screen.getByTestId("rounded")).borderTopLeftRadius).not.toBe("0px");
  const group = getComputedStyle(screen.getByTestId("group"));
  expect(group.borderTopLeftRadius).not.toBe("0px");
  expect(group.overflow).toBe("hidden");
});
