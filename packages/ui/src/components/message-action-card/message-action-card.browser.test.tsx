import "./message-action-card.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import type { Theme } from "../../lib/theme/theme-context";
import {
  MessageActionCard,
  MessageActionCardCollapseTrigger,
  MessageActionCardContent,
  MessageActionCardHeader,
  MessageActionCardHeaderDescription,
  MessageActionCardHeaderIcon,
  MessageActionCardHeaderTitle,
  MessageActionCardHint,
  MessageActionCardHintLabel,
  MessageActionCardNotice,
  MessageActionCardScope,
  MessageActionCardScopeDescription,
  MessageActionCardScopeList,
  MessageActionCardScopeListViewport,
  MessageActionCardScopeName,
  MessageActionCardStatus,
} from "./message-action-card";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

function renderCard(theme: Theme, options: { defaultOpen?: boolean; scopes?: number } = {}) {
  const { defaultOpen = true, scopes = 0 } = options;
  return render(
    <ThemeProvider theme={theme}>
      <div style={{ width: 480 }}>
        <MessageActionCard data-testid="card" defaultOpen={defaultOpen}>
          <MessageActionCardHeader data-testid="header">
            <MessageActionCardHeaderTitle>
              Create private channel #release-review
            </MessageActionCardHeaderTitle>
            <MessageActionCardStatus data-testid="status" variant="success">
              Done
            </MessageActionCardStatus>
            <MessageActionCardCollapseTrigger
              data-testid="toggle"
              aria-label="Show or hide details"
            />
          </MessageActionCardHeader>
          <MessageActionCardContent>
            <p data-testid="body">Coordinate the final release review.</p>
            {scopes > 0 ? (
              <MessageActionCardScopeList>
                <MessageActionCardScopeListViewport data-testid="viewport" aria-label="Permissions">
                  {Array.from({ length: scopes }, (_, n) => (
                    <MessageActionCardScope key={n}>
                      <MessageActionCardScopeName>scope-{n}</MessageActionCardScopeName>
                      <MessageActionCardScopeDescription>
                        Reads your basic profile fields. No access to messages.
                      </MessageActionCardScopeDescription>
                    </MessageActionCardScope>
                  ))}
                </MessageActionCardScopeListViewport>
              </MessageActionCardScopeList>
            ) : null}
          </MessageActionCardContent>
        </MessageActionCard>
      </div>
    </ThemeProvider>,
  );
}

const visibleHeight = (testId: string) => {
  const el = screen.queryByTestId(testId);
  return el === null ? 0 : el.getBoundingClientRect().height;
};

for (const theme of ["brutal", "elegant"] as const) {
  it(`${theme}: a folded card shows only its header; the toggle opens and folds it again`, async () => {
    renderCard(theme, { defaultOpen: false });
    const toggle = screen.getByTestId("toggle");
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(visibleHeight("body")).toBe(0);

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    await waitFor(() => expect(visibleHeight("body")).toBeGreaterThan(0));

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    await waitFor(() => expect(visibleHeight("body")).toBe(0));
  });

  it(`${theme}: the Reason label sits right above an italic quote; Raft's notice is a tinted block with its icon on the left`, () => {
    render(
      <ThemeProvider theme={theme}>
        <div style={{ width: 480 }}>
          <MessageActionCard defaultOpen>
            <MessageActionCardContent>
              <p>Body</p>
              <MessageActionCardHintLabel data-testid="hint-label">
                Reason
              </MessageActionCardHintLabel>
              <MessageActionCardHint data-testid="hint">
                I need to file the issues.
              </MessageActionCardHint>
              <MessageActionCardNotice data-testid="notice">
                Installs the app for this whole Server.
              </MessageActionCardNotice>
            </MessageActionCardContent>
          </MessageActionCard>
        </div>
      </ThemeProvider>,
    );
    const label = screen.getByTestId("hint-label").getBoundingClientRect();
    const quote = screen.getByTestId("hint");
    const gap = quote.getBoundingClientRect().top - label.bottom;
    expect(gap).toBeGreaterThanOrEqual(0);
    expect(gap).toBeLessThanOrEqual(6);
    expect(getComputedStyle(quote).fontStyle).toBe("italic");
    expect(Number.parseFloat(getComputedStyle(quote).borderLeftWidth)).toBeGreaterThan(0);

    const notice = getComputedStyle(screen.getByTestId("notice"));
    expect(notice.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(Number.parseFloat(notice.paddingLeft)).toBeGreaterThan(0);
    expect(notice.fontStyle).toBe("normal");
    // The info icon is there by default; the caller passed text only.
    const icon = screen.getByTestId("notice").querySelector("svg")!.getBoundingClientRect();
    const text = screen.getByTestId("notice").querySelector("span")!.getBoundingClientRect();
    expect(icon.width).toBeGreaterThan(0);
    expect(icon.right).toBeLessThanOrEqual(text.left);
    expect(icon.top).toBeGreaterThanOrEqual(text.top - 1);
  });

  it(`${theme}: a folded card keeps its description under the title; icon, status and toggle line up with the title's first line`, () => {
    render(
      <ThemeProvider theme={theme}>
        <div style={{ width: 280 }}>
          <MessageActionCard defaultOpen={false}>
            <MessageActionCardHeader>
              <MessageActionCardHeaderIcon data-testid="icon" />
              <MessageActionCardHeaderTitle data-testid="title">
                Create private channel #release-review
                <MessageActionCardHeaderDescription data-testid="description">
                  Declined by Ada. Nothing was changed.
                </MessageActionCardHeaderDescription>
              </MessageActionCardHeaderTitle>
              <MessageActionCardStatus data-testid="status" variant="muted">
                Declined
              </MessageActionCardStatus>
              <MessageActionCardCollapseTrigger
                data-testid="toggle"
                aria-label="Show or hide details"
              />
            </MessageActionCardHeader>
            <MessageActionCardContent>
              <p data-testid="body">Coordinate the final release review.</p>
            </MessageActionCardContent>
          </MessageActionCard>
        </div>
      </ThemeProvider>,
    );
    expect(visibleHeight("body")).toBe(0);
    const description = screen.getByTestId("description").getBoundingClientRect();
    const title = screen.getByTestId("title");
    expect(description.height).toBeGreaterThan(0);
    // Its own line: starts at the title's left edge, below the title text.
    const titleText = document.createRange();
    titleText.selectNodeContents(title.firstChild!);
    const titleRects = [...titleText.getClientRects()];
    expect(Math.abs(description.left - title.getBoundingClientRect().left)).toBeLessThanOrEqual(1);
    expect(description.top).toBeGreaterThanOrEqual(titleRects.at(-1)!.bottom - 1);

    // The title wraps at this width; measure its first line, not the block.
    const range = document.createRange();
    range.setStart(title.firstChild!, 0);
    range.setEnd(title.firstChild!, 1);
    const line = range.getClientRects()[0]!;
    const lineMid = line.top + line.height / 2;
    expect(title.getBoundingClientRect().height).toBeGreaterThan(line.height * 2.5);
    // The status badge's even height leaves up to 1.5px of rounding.
    for (const [id, tolerance] of [
      ["icon", 1],
      ["status", 1.5],
      ["toggle", 1],
    ] as const) {
      const box = screen.getByTestId(id).getBoundingClientRect();
      expect(Math.abs(box.top + box.height / 2 - lineMid), id).toBeLessThanOrEqual(tolerance);
    }
  });

  it(`${theme}: a long permission list scrolls inside a capped viewport instead of stretching the card`, () => {
    renderCard(theme, { scopes: 6 });
    const viewport = screen.getByTestId("viewport");
    expect(viewport.clientHeight).toBeLessThanOrEqual(172);
    expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
    // The third row is visibly cut, not just clipped at its last pixels.
    const third = viewport.children[2]!.getBoundingClientRect();
    const shown = (viewport.getBoundingClientRect().bottom - third.top) / third.height;
    expect(shown).toBeGreaterThan(0.2);
    expect(shown).toBeLessThan(0.8);
  });

  it(`${theme}: the permission viewport is a Tab stop only while it overflows`, async () => {
    const long = renderCard(theme, { scopes: 6 });
    await waitFor(() => expect(screen.getByTestId("viewport").tabIndex).toBe(0));
    long.unmount();

    renderCard(theme, { scopes: 1 });
    const short = screen.getByTestId("viewport");
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    expect(short.scrollHeight).toBeLessThanOrEqual(short.clientHeight);
    expect(short.hasAttribute("tabindex")).toBe(false);
  });
}

it("brutal: the card has a 2px frame and a 2px hard shadow, and the title band's rule goes away when folded", async () => {
  renderCard("brutal");
  const card = getComputedStyle(screen.getByTestId("card"));
  expect(card.borderTopWidth).toBe("2px");
  expect(card.boxShadow).toMatch(/2px 2px 0px/);
  expect(getComputedStyle(screen.getByTestId("header")).borderBottomWidth).toBe("2px");

  fireEvent.click(screen.getByTestId("toggle"));
  await waitFor(() =>
    expect(getComputedStyle(screen.getByTestId("header")).borderBottomWidth).toBe("0px"),
  );
});

it("the header icon falls back to a default icon when the caller passes none", () => {
  render(
    <ThemeProvider theme="brutal">
      <MessageActionCardHeaderIcon data-testid="default-icon" />
      <MessageActionCardHeaderIcon data-testid="own-icon">
        <svg data-testid="own" viewBox="0 0 16 16" />
      </MessageActionCardHeaderIcon>
    </ThemeProvider>,
  );
  const fallback = screen.getByTestId("default-icon").querySelector("svg");
  expect(fallback === null).toBe(false);
  expect(fallback!.getBoundingClientRect().width).toBeGreaterThan(0);
  const own = screen.getByTestId("own-icon").querySelectorAll("svg");
  expect(own.length).toBe(1);
  expect(own[0]!.getAttribute("data-testid")).toBe("own");
});

it("the status label is solid in Brutal and soft in Elegant", () => {
  const solid = renderCard("brutal");
  const brutalBg = getComputedStyle(screen.getByTestId("status")).backgroundColor;
  expect(screen.getByTestId("status").getAttribute("data-appearance")).toBe("solid");
  solid.unmount();

  renderCard("elegant");
  expect(screen.getByTestId("status").getAttribute("data-appearance")).toBe("soft");
  expect(getComputedStyle(screen.getByTestId("status")).backgroundColor).not.toBe(brutalBg);
});
