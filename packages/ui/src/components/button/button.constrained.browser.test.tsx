import "./button.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "./button";

// A Button narrower than its content (the caller gave it `min-w-0 max-w-full`
// in a card) truncates its content instead of spilling past its border: the
// content span shrinks to the Button's content box, so a `truncate` label
// ellipsizes and the icon keeps its size. A Button nobody constrains keeps
// its content's width. Seen in slock: a card link Button, "Open in App Store
// Connect appstoreconnect.apple.com ↗", overflowed its outline on both sides.
// Real layout only: jsdom computes no sizes.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const LABEL = "Open in App Store Connect appstoreconnect.apple.com";

function renderButton({ constrained = true, loading = false } = {}) {
  render(
    <ThemeProvider>
      <div style={{ width: constrained ? "200px" : "800px" }}>
        <Button
          data-testid="button"
          className={constrained ? "min-w-0 max-w-full" : undefined}
          loading={loading}
          render={<a href="https://appstoreconnect.apple.com" />}
        >
          <span data-testid="label" className="truncate">
            {LABEL}
          </span>
          <svg data-testid="icon" data-icon="inline-end" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 17 17 7M8 7h9v9" />
          </svg>
        </Button>
      </div>
    </ThemeProvider>,
  );
  const button = screen.getByTestId("button");
  const content = button.querySelector<HTMLElement>("[data-slot=button-content]");
  if (!content) throw new Error("the button renders no content span");
  return {
    button,
    content,
    label: screen.getByTestId("label"),
    icon: screen.getByTestId("icon"),
  };
}

it("a constrained Button keeps its content inside its border", () => {
  const { button, content } = renderButton();
  const box = button.getBoundingClientRect();

  expect(box.width).toBeLessThanOrEqual(200);
  expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth);
  expect(content.getBoundingClientRect().left).toBeGreaterThanOrEqual(box.left - 0.5);
  expect(content.getBoundingClientRect().right).toBeLessThanOrEqual(box.right + 0.5);
});

it("a constrained Button truncates its label and keeps its icon", () => {
  const iconWidth = renderButton({ constrained: false }).icon.getBoundingClientRect().width;
  cleanup();
  const { button, label, icon } = renderButton();

  expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
  expect(iconWidth).toBeGreaterThan(0);
  expect(icon.getBoundingClientRect().width).toBe(iconWidth);
  expect(icon.getBoundingClientRect().right).toBeLessThanOrEqual(
    button.getBoundingClientRect().right,
  );
});

it("loading, a constrained Button keeps its hidden content inside its border", () => {
  const { button, content } = renderButton({ loading: true });

  expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth);
  expect(content.getBoundingClientRect().right).toBeLessThanOrEqual(
    button.getBoundingClientRect().right + 0.5,
  );
});

it("a Button nobody constrains keeps its content's width and doesn't truncate", () => {
  const { button, content, label } = renderButton({ constrained: false });

  expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth);
  expect(button.getBoundingClientRect().width).toBeGreaterThan(200);
  expect(content.getBoundingClientRect().width).toBeCloseTo(content.scrollWidth, 0);
});
