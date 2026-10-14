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
  MessageActionCardHeaderTitle,
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

it("the status label is solid in Brutal and soft in Elegant", () => {
  const solid = renderCard("brutal");
  const brutalBg = getComputedStyle(screen.getByTestId("status")).backgroundColor;
  expect(screen.getByTestId("status").getAttribute("data-appearance")).toBe("solid");
  solid.unmount();

  renderCard("elegant");
  expect(screen.getByTestId("status").getAttribute("data-appearance")).toBe("soft");
  expect(getComputedStyle(screen.getByTestId("status")).backgroundColor).not.toBe(brutalBg);
});
