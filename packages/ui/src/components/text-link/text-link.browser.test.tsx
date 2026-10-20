import "./text-link.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "../button/button";
import { TextLink } from "./text-link";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

function height(id: string) {
  return screen.getByTestId(id).getBoundingClientRect().height;
}

// A TextLink is a word in a line: putting one in a sentence must not make the
// line taller, at any of the sizes a sentence is set in.
for (const size of ["text-caption", "text-footnote", "text-callout", "text-body"]) {
  it(`${size}: a TextLink in a sentence keeps the line's height`, () => {
    render(
      <ThemeProvider>
        <p data-testid="plain" className={`m-0 w-[600px] ${size}`}>
          Don&apos;t have an account? Create One
        </p>
        <p data-testid="link" className={`m-0 w-[600px] ${size}`}>
          Don&apos;t have an account? <TextLink variant="strong">Create One</TextLink>
        </p>
      </ThemeProvider>,
    );
    expect(height("link")).toBe(height("plain"));
  });
}

it("CONTROL: a Button in the same sentence does make the line taller", () => {
  // Without this the test above could pass because the measurement never
  // sees a difference, rather than because TextLink adds none.
  render(
    <ThemeProvider>
      <p data-testid="plain" className="m-0 w-[600px] text-footnote">
        Don&apos;t have an account? Create One
      </p>
      <p data-testid="link" className="m-0 w-[600px] text-footnote">
        Don&apos;t have an account? <Button variant="ghost">Create One</Button>
      </p>
    </ThemeProvider>,
  );
  expect(height("link")).toBeGreaterThan(height("plain"));
});

it("sits on the sentence's baseline", () => {
  // An empty inline-block sits with its bottom edge on the baseline of the
  // line it is in, so one inside the link and one in the sentence mark both.
  render(
    <ThemeProvider>
      <p className="m-0 w-[600px] text-footnote">
        Account?
        <span data-testid="text-baseline" className="inline-block size-0" />{" "}
        <TextLink>
          Create
          <span data-testid="link-baseline" className="inline-block size-0" /> One
        </TextLink>
      </p>
    </ThemeProvider>,
  );
  const text = screen.getByTestId("text-baseline").getBoundingClientRect().top;
  const link = screen.getByTestId("link-baseline").getBoundingClientRect().top;
  expect(link).toBe(text);
});

// Clickable text underlines on hover and only on hover
// (design/foundations/states.md#clickable-text); a disabled TextLink can't be
// clicked, so hover changes nothing on it. A real CDP hover, so :hover applies.
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
  it(`${variant}: no underline at rest, an underline on hover`, async () => {
    render(
      <ThemeProvider>
        <p className="m-0 p-4 text-footnote">
          <TextLink data-testid="link" variant={variant}>
            Log Out
          </TextLink>
        </p>
      </ThemeProvider>,
    );
    const { page, userEvent } = await import("vite-plus/test/browser/context");
    // The pointer may still rest where the last test hovered.
    await userEvent.unhover(document.body);
    const el = screen.getByTestId("link");
    expect(getComputedStyle(el).textDecorationLine).toBe("none");
    await page.getByTestId("link").hover();
    expect(await settled(() => getComputedStyle(el).textDecorationLine)).toBe("underline");
    // In its own colour: the underline follows the text, never pink.
    const cs = getComputedStyle(el);
    expect(cs.textDecorationColor).toBe(cs.color);
  });
}

for (const variant of ["muted", "strong"] as const) {
  it(`${variant} disabled: no underline and no colour change on hover`, async () => {
    render(
      <ThemeProvider>
        <p className="m-0 p-4 text-footnote">
          <TextLink data-testid="control">Forgot Password</TextLink>{" "}
          <TextLink data-testid="disabled" variant={variant} disabled>
            Log Out
          </TextLink>
        </p>
      </ThemeProvider>,
    );
    const { page, userEvent } = await import("vite-plus/test/browser/context");
    await userEvent.unhover(document.body);
    // Positive control: the hover rule has landed in this run.
    const control = screen.getByTestId("control");
    await page.getByTestId("control").hover();
    expect(await settled(() => getComputedStyle(control).textDecorationLine)).toBe("underline");

    const disabled = screen.getByTestId("disabled");
    const restColor = getComputedStyle(disabled).color;
    await page.getByTestId("disabled").hover();
    await new Promise((r) => setTimeout(r, 300));
    expect(getComputedStyle(disabled).textDecorationLine).toBe("none");
    expect(getComputedStyle(disabled).color).toBe(restColor);
  });
}
