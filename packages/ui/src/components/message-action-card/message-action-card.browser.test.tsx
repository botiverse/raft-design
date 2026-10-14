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
  MessageActionCardHeaderIcon,
  MessageActionCardHeaderTitle,
  MessageActionCardHint,
  MessageActionCardHintLabel,
  MessageActionCardNotice,
  MessageActionCardScope,
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
                <MessageActionCardScopeListViewport data-testid="viewport">
                  {Array.from({ length: scopes }, (_, n) => (
                    <MessageActionCardScope key={n}>
                      <MessageActionCardScopeName>scope-{n}</MessageActionCardScopeName>
                      Reads something narrow and explains it in one full sentence here.
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

  it(`${theme}: the Reason label sits right above an italic quote; Raft's notice is a plain line with its icon on the left`, () => {
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
    expect(notice.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(notice.borderTopWidth).toBe("0px");
    expect(notice.fontStyle).toBe("normal");
    // The info icon is there by default; the caller passed text only.
    const icon = screen.getByTestId("notice").querySelector("svg")!.getBoundingClientRect();
    const text = screen.getByTestId("notice").querySelector("span")!.getBoundingClientRect();
    expect(icon.width).toBeGreaterThan(0);
    expect(icon.right).toBeLessThanOrEqual(text.left);
    expect(icon.top).toBeGreaterThanOrEqual(text.top - 1);
  });

  it(`${theme}: a long permission list scrolls inside a capped viewport instead of stretching the card`, () => {
    renderCard(theme, { scopes: 6 });
    const viewport = screen.getByTestId("viewport");
    expect(viewport.clientHeight).toBeLessThanOrEqual(172);
    expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
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
