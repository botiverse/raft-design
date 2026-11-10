import "./app-link-card.test.css";
import type { ReactNode } from "react";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { messageCard } from "../message-embed/message-embed.recipe";
import { Button } from "../button/button";
import {
  AppLinkCard,
  AppLinkCardActions,
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

// The buttons row (cards-in-messages.md#buttons): two buttons stay on one line
// whenever the card has room for them; in a column narrower than both, the
// bordered one goes under the frameless one, whole. A label is never cut and
// never runs past the card. A status line beside the buttons, in
// messageCard's actionGroup, goes onto a line of its own first.
function cardWithButtons(status?: string) {
  const buttons = (
    <>
      <Button variant="ghost" data-testid="first">
        Request changes
      </Button>
      <Button variant="outline" data-testid="last">
        Approve and merge
      </Button>
    </>
  );
  return (
    <AppLinkCard data-testid="card">
      {header()}
      <AppLinkCardBody>
        <AppLinkCardTitle>Short</AppLinkCardTitle>
      </AppLinkCardBody>
      <AppLinkCardActions>
        {status ? (
          <>
            <span data-testid="status">{status}</span>
            <div className={messageCard().actionGroup()}>{buttons}</div>
          </>
        ) : (
          buttons
        )}
      </AppLinkCardActions>
    </AppLinkCard>
  );
}

function expectWhole(button: HTMLElement, card: HTMLElement) {
  const b = button.getBoundingClientRect();
  const c = card.getBoundingClientRect();
  expect(b.left).toBeGreaterThanOrEqual(c.left);
  expect(b.right).toBeLessThanOrEqual(c.right);
  expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth);
}

it("keeps two long labels on one line in a 400px card", async () => {
  await viewport(1280);
  renderIn(720, cardWithButtons());
  const card = screen.getByTestId("card");
  const first = screen.getByTestId("first");
  const last = screen.getByTestId("last");
  expect(first.getBoundingClientRect().top).toBe(last.getBoundingClientRect().top);
  expectWhole(first, card);
  expectWhole(last, card);
});

it("in a column narrower than two long labels, puts the last under the first, whole", async () => {
  await viewport(1280);
  renderIn(240, cardWithButtons());
  const card = screen.getByTestId("card");
  const first = screen.getByTestId("first");
  const last = screen.getByTestId("last");
  expect(width(card)).toBe(240);
  expect(last.getBoundingClientRect().top).toBeGreaterThanOrEqual(
    first.getBoundingClientRect().bottom,
  );
  expectWhole(first, card);
  expectWhole(last, card);
});

it("moves a status line onto its own line before the buttons wrap (actionGroup)", async () => {
  await viewport(1280);
  renderIn(720, cardWithButtons("Working… checking the branch"));
  const card = screen.getByTestId("card");
  const first = screen.getByTestId("first");
  const last = screen.getByTestId("last");
  const status = screen.getByTestId("status");
  expect(first.getBoundingClientRect().top).toBe(last.getBoundingClientRect().top);
  expect(first.getBoundingClientRect().top).toBeGreaterThanOrEqual(
    status.getBoundingClientRect().bottom,
  );
  expectWhole(first, card);
  expectWhole(last, card);
});
