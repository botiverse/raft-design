/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CopyableCode, CopyableCodeAction, CopyableCodeRoot } from "./copyable-code";

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

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderCopyable(props: {
  onCopy?: (value: string) => void;
  onCopyError?: (error: Error) => void;
}) {
  render(
    <CopyableCodeRoot {...props}>
      <CopyableCode>npm i raft-ui</CopyableCode>
      <CopyableCodeAction />
    </CopyableCodeRoot>,
  );
  return screen.getByRole("button");
}

function makeClipboardFail() {
  // Both the clipboard API and the execCommand fallback must fail: the hook only
  // reports an error once every fallback it tries has failed.
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: () => Promise.reject(new Error("denied")) },
  });
  document.execCommand = (() => false) as never;
}

describe("CopyableCode copy failure", () => {
  test("reports the failure to onCopyError and does not claim success", async () => {
    const onCopy = vi.fn();
    const onCopyError = vi.fn();
    makeClipboardFail();

    fireEvent.click(renderCopyable({ onCopy, onCopyError }));

    await waitFor(() => expect(onCopyError).toHaveBeenCalledTimes(1));
    expect(onCopyError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onCopy).not.toHaveBeenCalled();
  });

  test("a successful copy still calls onCopy and leaves onCopyError untouched", async () => {
    const onCopy = vi.fn();
    const onCopyError = vi.fn();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.resolve() },
    });

    fireEvent.click(renderCopyable({ onCopy, onCopyError }));

    await waitFor(() => expect(onCopy).toHaveBeenCalledWith("npm i raft-ui"));
    expect(onCopyError).not.toHaveBeenCalled();
  });

  test("a failed attempt does not poison the next successful one", async () => {
    const onCopy = vi.fn();
    const onCopyError = vi.fn();
    makeClipboardFail();
    const button = renderCopyable({ onCopy, onCopyError });

    fireEvent.click(button);
    await waitFor(() => expect(onCopyError).toHaveBeenCalledTimes(1));

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.resolve() },
    });
    fireEvent.click(button);

    await waitFor(() => expect(onCopy).toHaveBeenCalledTimes(1));
    expect(onCopyError).toHaveBeenCalledTimes(1);
  });
});
