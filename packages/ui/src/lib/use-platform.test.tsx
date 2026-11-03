/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { detectKeyboardPlatform, resetDetectedPlatform, usePlatform } from "./use-platform";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  resetDetectedPlatform();
});

describe("detectKeyboardPlatform", () => {
  test("Client Hints come first", () => {
    expect(
      detectKeyboardPlatform({ platform: "Win32", userAgentData: { platform: "macOS" } }),
    ).toBe("mac");
    expect(
      detectKeyboardPlatform({ platform: "MacIntel", userAgentData: { platform: "Windows" } }),
    ).toBe("other");
  });

  test("navigator.platform when there are no hints: Mac, iPhone and iPad are mac", () => {
    expect(detectKeyboardPlatform({ platform: "MacIntel" })).toBe("mac");
    expect(detectKeyboardPlatform({ platform: "iPhone" })).toBe("mac");
    expect(detectKeyboardPlatform({ platform: "iPad" })).toBe("mac");
    expect(detectKeyboardPlatform({ platform: "Win32" })).toBe("other");
    expect(detectKeyboardPlatform({ platform: "Linux x86_64" })).toBe("other");
    expect(detectKeyboardPlatform({ platform: "" })).toBe("other");
  });

  test("empty hints fall back to navigator.platform", () => {
    expect(detectKeyboardPlatform({ platform: "MacIntel", userAgentData: { platform: "" } })).toBe(
      "mac",
    );
  });

  test("without a navigator it is other", () => {
    expect(detectKeyboardPlatform(undefined)).toBe("other");
  });
});

function Probe() {
  return <span data-testid="p">{usePlatform()}</span>;
}

describe("usePlatform", () => {
  test("reads the navigator on the client", () => {
    vi.spyOn(navigator, "platform", "get").mockReturnValue("MacIntel");
    render(<Probe />);
    expect(screen.getByTestId("p").textContent).toBe("mac");
  });

  test("detects once: a later navigator change is not read again", () => {
    const platform = vi.spyOn(navigator, "platform", "get").mockReturnValue("Win32");
    render(<Probe />);
    expect(screen.getByTestId("p").textContent).toBe("other");
    platform.mockReturnValue("MacIntel");
    cleanup();
    render(<Probe />);
    expect(screen.getByTestId("p").textContent).toBe("other");
  });

  test("the server render is other, whatever the navigator says", () => {
    vi.spyOn(navigator, "platform", "get").mockReturnValue("MacIntel");
    expect(renderToString(<Probe />)).toContain(">other<");
  });
});
