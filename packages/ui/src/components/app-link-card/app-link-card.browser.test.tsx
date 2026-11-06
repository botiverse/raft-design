import "./app-link-card.test.css";
import type { ReactNode } from "react";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import {
  AppLinkCard,
  AppLinkCardActions,
  AppLinkCardBadge,
  AppLinkCardBody,
  AppLinkCardEyebrow,
  AppLinkCardHeader,
  AppLinkCardHost,
  AppLinkCardIcon,
  AppLinkCardMeta,
  AppLinkCardName,
  AppLinkCardPlaceholder,
  AppLinkCardTitle,
} from "./app-link-card";

// The block card's sizes (app-link-card.md, Behavior): 400px on a desktop and
// never wider than the message; the message's full width in the phone layout
// (below 768px); the title wraps to 2 lines, then clamps; the host loses its
// start, never its end; the title's link keeps the title's ink and is
// underlined on hover; and the placeholder is the size of a card with a
// two-line title and a button, so the card that replaces it doesn't move the
// message. Real layout only: jsdom computes no sizes.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

async function viewport(width: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, 800);
}

const LONG_TITLE =
  "#10451 test(i18n): cover the zh-CN fallback when the locale cookie is missing, and the Accept-Language header is empty, and the user has never chosen a language in settings";

function header(host = "stamp.build") {
  return (
    <AppLinkCardHeader>
      <AppLinkCardIcon>
        <svg viewBox="0 0 16 16" />
      </AppLinkCardIcon>
      <AppLinkCardName>Stamp</AppLinkCardName>
      <AppLinkCardHost data-testid="host">{host}</AppLinkCardHost>
    </AppLinkCardHeader>
  );
}

function card(title: ReactNode = LONG_TITLE, host?: string) {
  return (
    <AppLinkCard data-testid="card">
      {header(host)}
      <AppLinkCardBody>
        <AppLinkCardEyebrow>botiverse/slock</AppLinkCardEyebrow>
        <AppLinkCardTitle data-testid="title">{title}</AppLinkCardTitle>
        <AppLinkCardMeta>
          <span>Jasper · +112 −8</span>
        </AppLinkCardMeta>
      </AppLinkCardBody>
      <AppLinkCardActions>
        <Button variant="outline">Approve</Button>
      </AppLinkCardActions>
    </AppLinkCard>
  );
}

function renderIn(width: number, children: ReactNode) {
  render(
    <ThemeProvider>
      <div style={{ width: `${width}px` }}>{children}</div>
    </ThemeProvider>,
  );
}

const width = (el: Element) => el.getBoundingClientRect().width;
const height = (el: Element) => el.getBoundingClientRect().height;

it("is 400px on a desktop, in a message wider than that", async () => {
  await viewport(1280);
  renderIn(720, card());
  expect(width(screen.getByTestId("card"))).toBe(400);
});

it("is never wider than the message", async () => {
  await viewport(1280);
  renderIn(320, card());
  expect(width(screen.getByTestId("card"))).toBe(320);
});

it("takes the message's full width in the phone layout", async () => {
  await viewport(600);
  renderIn(520, card());
  expect(width(screen.getByTestId("card"))).toBe(520);
});

it("wraps the title to 2 lines, then clamps it", async () => {
  await viewport(1280);
  renderIn(720, card());
  const title = screen.getByTestId("title");
  const lineHeight = parseFloat(getComputedStyle(title).lineHeight);
  expect(height(title)).toBeCloseTo(lineHeight * 2, 0);
  expect(title.scrollHeight).toBeGreaterThan(title.clientHeight);
});

it("keeps the end of a host that doesn't fit", async () => {
  await viewport(1280);
  const host = "a-very-long-subdomain-that-keeps-going.review.attacker.example";
  renderIn(240, card("Short", host));
  const box = screen.getByTestId("host").firstElementChild as HTMLElement;
  expect(box.scrollWidth).toBeGreaterThan(box.clientWidth);
  const text = box.firstElementChild as HTMLElement;
  // Cut at its start: the text's right edge stays at the box's right edge.
  expect(text.getBoundingClientRect().right).toBeCloseTo(box.getBoundingClientRect().right, 0);
  expect(text.getBoundingClientRect().left).toBeLessThan(box.getBoundingClientRect().left);
  expect(width(screen.getByTestId("card"))).toBe(240);
});

it("the title's link keeps the title's ink and is underlined on hover", async () => {
  await viewport(1280);
  const { page } = await import("vite-plus/test/browser/context");
  renderIn(
    720,
    card(
      // The title opens the item (app-link-card.md, Content).
      <a href="#item" data-testid="title-link">
        #10449 refactor(i18n)
      </a>,
    ),
  );
  const link = screen.getByTestId("title-link");
  const title = screen.getByTestId("title");
  expect(getComputedStyle(link).color).toBe(getComputedStyle(title).color);
  expect(getComputedStyle(link).textDecorationLine).toBe("none");
  await page.getByTestId("title-link").hover();
  expect(getComputedStyle(link).textDecorationLine).toBe("underline");
});

for (const vw of [1280, 600]) {
  it(`the placeholder is the card's size (viewport ${vw}px)`, async () => {
    await viewport(vw);
    renderIn(
      720,
      <>
        {card()}
        <AppLinkCardPlaceholder data-testid="placeholder">{header()}</AppLinkCardPlaceholder>
      </>,
    );
    const real = screen.getByTestId("card");
    const placeholder = screen.getByTestId("placeholder");
    expect(width(placeholder)).toBe(width(real));
    expect(Math.abs(height(placeholder) - height(real))).toBeLessThanOrEqual(1);
  });
}

// An app's colour on its badge (app-link-card.md, Rules): only the fill
// changes, the type is black or white, the same in both modes, and a hairline
// ring appears in the mode where the fill is too close to the card.
function badges(mode: "light" | "dark") {
  render(
    <ThemeProvider>
      <div className={mode}>
        <AppLinkCard>
          <AppLinkCardBody>
            <AppLinkCardMeta>
              <Badge appearance="soft" variant="success" data-testid="plain">
                Merged
              </Badge>
              <AppLinkCardBadge variant="success" fill="#218358" data-testid="green">
                Merged
              </AppLinkCardBadge>
              <AppLinkCardBadge fill="#111111" data-testid="near-black">
                Merged
              </AppLinkCardBadge>
              <AppLinkCardBadge fill="#F5D90A" data-testid="yellow">
                Merged
              </AppLinkCardBadge>
            </AppLinkCardMeta>
          </AppLinkCardBody>
        </AppLinkCard>
      </div>
    </ThemeProvider>,
  );
  return (id: string) => getComputedStyle(screen.getByTestId(id));
}

/** Whether the badge draws a visible 1px inset ring. */
function hasRing(style: CSSStyleDeclaration) {
  return /\/ 0\.1\d*\) 0px 0px 0px 1px inset/.test(style.boxShadow);
}

for (const mode of ["light", "dark"] as const) {
  it(`a fill keeps the badge's shape and type, and its own colours (${mode})`, async () => {
    await viewport(1280);
    const style = badges(mode);
    const plain = screen.getByTestId("plain").getBoundingClientRect();
    for (const id of ["green", "near-black", "yellow"]) {
      const box = screen.getByTestId(id).getBoundingClientRect();
      expect([box.width, box.height]).toEqual([plain.width, plain.height]);
      for (const prop of ["borderRadius", "fontSize", "fontWeight", "paddingLeft"] as const) {
        expect(style(id)[prop]).toBe(style("plain")[prop]);
      }
    }
    expect(style("green").backgroundColor).toBe("rgb(33, 131, 88)");
    expect(style("green").color).toBe("oklch(1 0 0)");
    expect(style("near-black").color).toBe("oklch(1 0 0)");
    expect(style("yellow").backgroundColor).toBe("rgb(245, 217, 10)");
    expect(style("yellow").color).toBe("oklch(0 0 0)");
    expect(hasRing(style("plain"))).toBe(false);
    expect(hasRing(style("green"))).toBe(false);
    // A pale yellow needs its edge on the white card, a near-black on the dark one.
    expect(hasRing(style("yellow"))).toBe(mode === "light");
    expect(hasRing(style("near-black"))).toBe(mode === "dark");
  });
}
