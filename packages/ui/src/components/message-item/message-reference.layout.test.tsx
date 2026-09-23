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
  // The secondary text ref has no compound sizing/alignment of its own, so
  // the base contract must be what survives on the rendered node.
  test("base root carries the chip layout contract on an unopinionated variant", () => {
    render(
      <ThemeProvider theme="brutal">
        <MessageReferenceText>task #16</MessageReferenceText>
      </ThemeProvider>,
    );
    const cls = screen.getByText("task #16").className;
    expect(cls).toContain("items-center");
    expect(cls).toContain("gap-1");
    expect(cls).toContain("py-0");
    expect(cls).toContain("align-bottom");
    expect(cls).toContain("[font-size:0.875em]");
    expect(cls).toContain("leading-[1.3em]");
    // truncate pins the nowrap contract: refs never split across lines in
    // screenshot export.
    expect(cls).toContain("truncate");
    expect(cls).toContain("max-w-full");
    // The secondary compound chooses inline flow; the base inline-flex must
    // not leak through the merge.
    expect(cls).toContain("inline");
    expect(cls).not.toContain("inline-flex");
  });

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
