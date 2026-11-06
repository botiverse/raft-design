/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { KbdShortcut } from "../kbd/kbd-shortcut";
import type { KbdKeyName } from "../kbd/kbd-keys";
import { KbdButton, KbdButtonCaret, KbdButtonPlaceholder } from "./kbd-button";

afterEach(cleanup);

const MOD_K: KbdKeyName[] = ["mod", "k"];

describe("KbdButton", () => {
  test("is a native button named by the consumer, with the shortcut passed through", () => {
    render(
      <KbdButton aria-label="Change the shortcut for Search" aria-keyshortcuts="Meta+K">
        <KbdShortcut keys={MOD_K} size="md" platform="mac" />
      </KbdButton>,
    );
    const button = screen.getByRole("button", { name: "Change the shortcut for Search" });
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("aria-keyshortcuts")).toBe("Meta+K");
    expect(button.getAttribute("data-slot")).toBe("kbd-button");
    expect(button.hasAttribute("data-recording")).toBe(false);
    expect(button.hasAttribute("data-invalid")).toBe(false);
    expect(button.hasAttribute("aria-pressed")).toBe(false);
  });

  test("says recording and invalid in data attributes, with no words of its own", () => {
    render(
      <KbdButton recording invalid aria-label="Change the shortcut for Search">
        <KbdButtonPlaceholder>Press a shortcut</KbdButtonPlaceholder>
        <KbdButtonCaret data-testid="caret" />
      </KbdButton>,
    );
    const button = screen.getByRole("button");
    expect(button.hasAttribute("data-recording")).toBe(true);
    expect(button.hasAttribute("data-invalid")).toBe(true);
    expect(button.hasAttribute("aria-invalid")).toBe(false);
    expect(button.textContent).toBe("Press a shortcut");
    expect(screen.getByTestId("caret").getAttribute("aria-hidden")).toBe("true");
  });
});
