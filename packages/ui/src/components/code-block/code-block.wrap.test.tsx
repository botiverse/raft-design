/**
 * @vitest-environment jsdom
 *
 * Code in a message wraps its long lines; where people read code as code it
 * scrolls them sideways (code-block.md, "Behavior"). `defaultWrap` on
 * CodeBlock picks the start, and CodeBlockWrapToggle, before Copy, switches
 * that one block: pressed (`aria-pressed`) means the block scrolls. jsdom has
 * no layout, so this checks the classes and the pressed state; whether a line
 * really wraps is a layout question for a browser.
 */
import { afterEach, describe, expect, test } from "vite-plus/test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  CodeBlock,
  CodeBlockAction,
  CodeBlockActions,
  CodeBlockBody,
  CodeBlockHeader,
  CodeBlockPre,
  CodeBlockWrapToggle,
} from "./code-block";
import type { CodeBlockProps } from "./code-block";

// jsdom has no ResizeObserver; CodeBlockPre only uses it to measure overflow.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

afterEach(cleanup);

const COMMAND =
  'curl -X POST https://api.raft.chat/v1/channels/general/messages -H "Authorization: Bearer $RAFT_TOKEN"';

function Block({ name, ...props }: CodeBlockProps & { name: string }) {
  return (
    <CodeBlock data-testid={name} {...props}>
      <CodeBlockHeader>
        <CodeBlockActions>
          <CodeBlockWrapToggle aria-label={`Don't Wrap Lines (${name})`} />
          <CodeBlockAction aria-label="Copy code" />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockBody>
        <CodeBlockPre aria-label={`${name} code`} className="shiki">
          <code>{COMMAND}</code>
        </CodeBlockPre>
      </CodeBlockBody>
    </CodeBlock>
  );
}

const preOf = (name: string) =>
  screen.getByTestId(name).querySelector<HTMLElement>("[data-slot=code-block-pre]")!;

describe("CodeBlock wrap", () => {
  test("a block with defaultWrap wraps, and its toggle is a named, unpressed toggle", () => {
    render(<Block name="message" defaultWrap />);
    const toggle = screen.getByRole("button", { name: "Don't Wrap Lines (message)" });
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    expect(toggle.getAttribute("data-slot")).toBe("code-block-wrap-toggle");
    expect(toggle.getAttribute("type")).toBe("button");

    const pre = preOf("message");
    expect(pre.classList).toContain("whitespace-pre-wrap");
    expect(pre.classList).toContain("wrap-anywhere");
    expect(pre.classList).toContain("shiki");
    expect(screen.getByTestId("message").hasAttribute("data-wrap")).toBe(true);
  });

  test("pressing the toggle makes the block scroll; pressing it again wraps", () => {
    render(<Block name="message" defaultWrap />);
    const toggle = screen.getByRole("button", { name: "Don't Wrap Lines (message)" });

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    expect(toggle.hasAttribute("data-pressed")).toBe(true);
    expect(preOf("message").classList).not.toContain("whitespace-pre-wrap");
    expect(preOf("message").classList).not.toContain("wrap-anywhere");
    expect(preOf("message").className).toBe("shiki");
    expect(screen.getByTestId("message").hasAttribute("data-wrap")).toBe(false);

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    expect(preOf("message").classList).toContain("whitespace-pre-wrap");
  });

  test("without defaultWrap a block scrolls as before, with the toggle pressed", () => {
    render(<Block name="file" />);
    expect(
      screen.getByRole("button", { name: "Don't Wrap Lines (file)" }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(preOf("file").className).toBe("shiki");
    expect(screen.getByTestId("file").hasAttribute("data-wrap")).toBe(false);
  });

  test("the toggle changes only its own block", () => {
    render(
      <>
        <Block name="first" defaultWrap />
        <Block name="second" defaultWrap />
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Don't Wrap Lines (first)" }));
    expect(preOf("first").classList).not.toContain("whitespace-pre-wrap");
    expect(preOf("second").classList).toContain("whitespace-pre-wrap");
    expect(
      screen.getByRole("button", { name: "Don't Wrap Lines (second)" }).getAttribute("aria-pressed"),
    ).toBe("false");
  });

  test("the toggle styles its pressed state as a pressed toggle: the yellow sticker", () => {
    render(<Block name="message" defaultWrap />);
    const toggle = screen.getByRole("button", { name: "Don't Wrap Lines (message)" });
    expect(toggle.className).toContain("data-pressed:bg-selected");
    expect(toggle.className).toContain("data-pressed:border-sticker-ink");
    expect(toggle.className).toContain("rounded-chip");
  });
});
