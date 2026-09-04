import { cleanup, render } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "raft-ui";

type ThemeObservation = {
  context: string;
  root: string;
  light: boolean;
  dark: boolean;
  colorScheme: string;
};

function ThemeCommitProbe({ observations }: { observations: ThemeObservation[] }) {
  const { resolvedMode, theme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    observations.push({
      context: `${theme}:${resolvedMode}`,
      root: root.dataset.theme ?? "",
      light: root.classList.contains("light"),
      dark: root.classList.contains("dark"),
      colorScheme: root.style.colorScheme,
    });
  }, [observations, resolvedMode, theme]);

  return null;
}

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((media: string) => ({
      matches: false,
      media,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  cleanup();
  const root = document.documentElement;
  delete root.dataset.theme;
  root.classList.remove("light", "dark");
  root.style.removeProperty("color-scheme");
  Reflect.deleteProperty(window, "matchMedia");
});

describe("ThemeProvider root synchronization", () => {
  it("synchronizes controlled context and root DOM before descendant passive effects", () => {
    const observations: ThemeObservation[] = [];
    const { rerender } = render(
      <ThemeProvider theme="elegant" mode="light">
        <ThemeCommitProbe observations={observations} />
      </ThemeProvider>,
    );

    rerender(
      <ThemeProvider theme="elegant" mode="dark">
        <ThemeCommitProbe observations={observations} />
      </ThemeProvider>,
    );

    expect(observations).toEqual([
      {
        context: "elegant:light",
        root: "elegant",
        light: true,
        dark: false,
        colorScheme: "light",
      },
      {
        context: "elegant:dark",
        root: "elegant",
        light: false,
        dark: true,
        colorScheme: "dark",
      },
    ]);
  });

  it("does not write the document root for a syncDom=false island", () => {
    const root = document.documentElement;
    root.dataset.theme = "brutal";
    root.classList.add("light");
    root.style.colorScheme = "light";

    render(
      <ThemeProvider theme="elegant" mode="dark" syncDom={false}>
        <div>Island</div>
      </ThemeProvider>,
    );

    expect(root.dataset.theme).toBe("brutal");
    expect(root.classList.contains("light")).toBe(true);
    expect(root.classList.contains("dark")).toBe(false);
    expect(root.style.colorScheme).toBe("light");
  });
});
