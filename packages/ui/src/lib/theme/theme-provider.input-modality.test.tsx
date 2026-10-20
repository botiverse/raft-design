/**
 * @vitest-environment jsdom
 */
/**
 * ThemeProvider installs the input-modality tracker, so every app that uses it
 * gets keyboard-only focus rings with no code of its own
 * (design/foundations/states.md#focus).
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "./theme-provider";

if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

afterEach(cleanup);

const modality = () => document.documentElement.getAttribute("data-input-modality");

test("the app-level provider tracks the modality on the root, and stops when it unmounts", () => {
  const { unmount } = render(<ThemeProvider>app</ThemeProvider>);
  expect(modality()).toBe("pointer");
  document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
  expect(modality()).toBe("keyboard");
  unmount();
  expect(modality()).toBeNull();
});

test("a nested scope (syncDom={false}) leaves the page root alone", () => {
  render(<ThemeProvider syncDom={false}>preview</ThemeProvider>);
  expect(modality()).toBeNull();
});
