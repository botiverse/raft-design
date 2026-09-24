/**
 * @vitest-environment jsdom
 *
 * Pins the inline-chip layout contract the message-reference root slot took
 * over from slock's local MSG_REF_CHIP constant (slock #proj-message
 * task #28): inline layout, zero vertical padding with baseline alignment,
 * em-based sizing at the inline-code box height, and the nowrap contract for
 * screenshot export. Also pins that themed compound variants still override
 * the base contract through the class merge (brutal stays pixel-identical).
 */
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { MessageReferenceChip, MessageReferenceText } from "./message-reference";

// jsdom ships no matchMedia; ThemeProvider reads it for system-theme detection.
if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as never;
}

afterEach(cleanup);

describe("message-reference root layout contract (slock MSG_REF_CHIP replacement)", () => {
  // The base slot's sizing (`[font-size:0.875em] leading-[1.3em] align-bottom`)
  // is the CHIP contract. It used to reach `secondary` too, because that was the
  // one variant with no sizing of its own — which is how a plain-text mention
  // ended up smaller than the body copy around it and sitting below its
  // baseline. `secondary` now opts out; these assertions cover the base layout
  // bits that still survive the merge on it.
  test("base root layout survives on the text variant", () => {
    render(
      <ThemeProvider theme="brutal">
        <MessageReferenceText>task #16</MessageReferenceText>
      </ThemeProvider>,
    );
    const cls = screen.getByText("task #16").className;
    expect(cls).toContain("items-center");
    expect(cls).toContain("gap-1");
    expect(cls).toContain("py-0");
    // truncate pins the nowrap contract: refs never split across lines in
    // screenshot export.
    expect(cls).toContain("truncate");
    expect(cls).toContain("max-w-full");
    // The secondary compound chooses inline flow; the base inline-flex must
    // not leak through the merge.
    expect(cls).toContain("inline");
    expect(cls).not.toContain("inline-flex");
  });

  // The defect this file now guards: a plain-text reference is body copy, so it
  // must render at the surrounding size and on the surrounding baseline. If the
  // chip sizing reaches it again, `@name` renders ~12.5% small and bottom-aligned
  // in a taller line box, which reads as a misaligned mention.
  for (const theme of ["brutal", "elegant"] as const) {
    test(`${theme} text variant is body-sized and baseline-aligned, never chip-sized`, () => {
      render(
        <ThemeProvider theme={theme}>
          <MessageReferenceText>@Josh</MessageReferenceText>
        </ThemeProvider>,
      );
      const cls = screen.getByText("@Josh").className;
      expect(cls).toContain("[font-size:inherit]");
      expect(cls).toContain("align-baseline");
      expect(cls).not.toContain("[font-size:0.875em]");
      expect(cls).not.toContain("align-bottom");
    });
  }

  test("brutal chip compound keeps its own sizing (base contract does not leak)", () => {
    render(
      <ThemeProvider theme="brutal">
        <MessageReferenceChip variant="accent">#general</MessageReferenceChip>
      </ThemeProvider>,
    );
    const cls = screen.getByText("#general").className;
    expect(cls).toContain("[font-size:inherit]");
    expect(cls).toContain("leading-tight");
    expect(cls).not.toContain("[font-size:0.875em]");
    expect(cls).not.toContain("leading-[1.3em]");
  });

  test("CONTROL: elegant chip compound keeps middle alignment and pill metrics", () => {
    render(
      <ThemeProvider theme="elegant">
        <MessageReferenceChip variant="muted">#general</MessageReferenceChip>
      </ThemeProvider>,
    );
    const cls = screen.getByText("#general").className;
    expect(cls).toContain("align-middle");
    expect(cls).toContain("leading-none");
    expect(cls).toContain("[font-size:inherit]");
    expect(cls).not.toContain("align-bottom");
    expect(cls).not.toContain("[font-size:0.875em]");
  });
});
