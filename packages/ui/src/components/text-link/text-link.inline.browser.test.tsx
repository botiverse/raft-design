import "./text-link.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { TextLink } from "./text-link";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

// A link in the middle of a sentence wraps with the words around it
// (text-link.md, "In a sentence"). A button is one atomic inline box, so it
// moves to the next line whole and leaves the word before it alone on its
// line; the span form is inline text and breaks across lines. Real layout
// only: jsdom has no line boxes.
function Sentence({ inline }: { inline: boolean }) {
  return (
    <p className="m-0 w-[200px] text-footnote">
      Sign in, and Cindy will start. Or{" "}
      <TextLink
        data-testid="link"
        variant="strong"
        {...(inline ? { nativeButton: false, render: <span /> } : {})}
      >
        switch to another runtime
      </TextLink>
      .
    </p>
  );
}

it("the in-sentence form wraps across lines in a narrow box", () => {
  render(
    <ThemeProvider>
      <Sentence inline />
    </ThemeProvider>,
  );
  const link = screen.getByTestId("link");
  expect(link.tagName).toBe("SPAN");
  expect(link.getClientRects().length).toBeGreaterThanOrEqual(2);
  // Each line it wraps onto gets its own rounded corners and focus ring.
  expect(getComputedStyle(link).boxDecorationBreak).toBe("clone");
});

it("CONTROL: the button form stays one box in the same sentence", () => {
  // Without this the test above could pass because every link wraps, rather
  // than because the span form does.
  render(
    <ThemeProvider>
      <Sentence inline={false} />
    </ThemeProvider>,
  );
  const link = screen.getByTestId("link");
  expect(link.tagName).toBe("BUTTON");
  expect(link.getClientRects().length).toBe(1);
});

async function settled(read: () => string): Promise<string> {
  let prev = "";
  let next = read();
  for (let i = 0; i < 40 && next !== prev; i += 1) {
    prev = next;
    await new Promise((r) => setTimeout(r, 50));
    next = read();
  }
  return next;
}

for (const variant of ["muted", "strong"] as const) {
  it(`${variant} disabled span: the disabled colour, and nothing changes on hover`, async () => {
    render(
      <ThemeProvider>
        <p className="m-0 p-4 text-footnote">
          <TextLink data-testid="control" nativeButton={false} render={<span />}>
            Forgot password
          </TextLink>{" "}
          <TextLink data-testid="button" variant={variant} disabled>
            Sign out
          </TextLink>{" "}
          <TextLink
            data-testid="disabled"
            variant={variant}
            nativeButton={false}
            render={<span />}
            disabled
          >
            Sign out
          </TextLink>
        </p>
      </ThemeProvider>,
    );
    const { page, userEvent } = await import("vite-plus/test/browser/context");
    await userEvent.unhover(document.body);
    // Positive control: the hover rule has landed on the span form.
    const control = screen.getByTestId("control");
    await page.getByTestId("control").hover();
    expect(await settled(() => getComputedStyle(control).textDecorationLine)).toBe("underline");

    // At rest it looks like a disabled button form.
    const disabled = screen.getByTestId("disabled");
    const button = screen.getByTestId("button");
    expect(getComputedStyle(disabled).color).toBe(getComputedStyle(button).color);
    expect(getComputedStyle(disabled).cursor).toBe("not-allowed");

    const restColor = getComputedStyle(disabled).color;
    await page.getByTestId("disabled").hover();
    await new Promise((r) => setTimeout(r, 300));
    expect(getComputedStyle(disabled).textDecorationLine).toBe("none");
    expect(getComputedStyle(disabled).color).toBe(restColor);
  });
}
