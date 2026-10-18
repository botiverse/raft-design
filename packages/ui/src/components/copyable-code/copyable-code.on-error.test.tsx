/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
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
  onError?: (error: Error) => void;
}) {
  render(
    <CopyableCodeRoot {...props}>
      <CopyableCode>npm i @botiverse/raft-ui</CopyableCode>
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

describe("CopyableCode copy failure reporting", () => {
  test("reports the failure to onError and does not claim success", async () => {
    const onCopy = vi.fn();
    const onError = vi.fn();
    makeClipboardFail();

    fireEvent.click(renderCopyable({ onCopy, onError }));

    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onCopy).not.toHaveBeenCalled();
  });

  test("a successful copy still calls onCopy and leaves onError untouched", async () => {
    const onCopy = vi.fn();
    const onError = vi.fn();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.resolve() },
    });

    fireEvent.click(renderCopyable({ onCopy, onError }));

    await waitFor(() => expect(onCopy).toHaveBeenCalledWith("npm i @botiverse/raft-ui"));
    expect(onError).not.toHaveBeenCalled();
  });

  test("a failed attempt does not poison the next successful one", async () => {
    const onCopy = vi.fn();
    const onError = vi.fn();
    makeClipboardFail();
    const button = renderCopyable({ onCopy, onError });

    fireEvent.click(button);
    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.resolve() },
    });
    fireEvent.click(button);

    await waitFor(() => expect(onCopy).toHaveBeenCalledTimes(1));
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
