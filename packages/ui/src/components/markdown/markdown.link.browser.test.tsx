import "./markdown.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { MarkdownLink } from "./markdown-parts";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

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

// A prose link keeps an underline at rest, because the link blue alone is
// below 3:1 against body text (design/foundations/states.md#clickable-text).
// On hover the underline takes the full colour and the text moves toward the
// body ink; it never turns pink.
for (const mode of ["light", "dark"] as const) {
  it(`${mode}: underlined at rest, a fuller underline and a deeper blue on hover`, async () => {
    render(
      <ThemeProvider mode={mode}>
        <p className="m-0 bg-layer-canvas p-4 text-body text-foreground">
          See{" "}
          <MarkdownLink data-testid="link" href="#docs">
            the docs
          </MarkdownLink>{" "}
          first.
        </p>
      </ThemeProvider>,
    );
    const { page, userEvent } = await import("vite-plus/test/browser/context");
    // The pointer may still rest where the last test hovered.
    await userEvent.unhover(document.body);
    const el = screen.getByTestId("link");
    const rest = getComputedStyle(el);
    const restColor = rest.color;
    const restDecoration = rest.textDecorationColor;
    expect(rest.textDecorationLine).toBe("underline");
    expect(restDecoration).not.toBe(restColor);

    await page.getByTestId("link").hover();
    const hoverColor = await settled(() => getComputedStyle(el).color);
    expect(hoverColor).not.toBe(restColor);
    const hover = getComputedStyle(el);
    expect(hover.textDecorationLine).toBe("underline");
    expect(hover.textDecorationColor).toBe(hover.color);
  });
}
