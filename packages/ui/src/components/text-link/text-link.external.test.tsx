/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";
import { TextLink, TextLinkExternalIcon } from "./text-link";

afterEach(cleanup);

test("the ↗ is hidden from a screen reader, which reads the label after the text instead", () => {
  render(
    <TextLink
      render={<a href="https://raft.build/pricing" target="_blank" rel="noopener noreferrer" />}
    >
      Pricing
      <TextLinkExternalIcon label="(opens in a new tab)" />
    </TextLink>,
  );
  const link = screen.getByRole("link");
  expect(link.textContent).toBe("Pricing (opens in a new tab)");
  expect(link.querySelector(".sr-only")?.textContent).toBe(" (opens in a new tab)");
  expect(link.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
});

test("the mark is its own inline-flex box, so the link's underline doesn't run under it", () => {
  render(
    <TextLink render={<a href="https://raft.build" />}>
      Docs
      <TextLinkExternalIcon />
    </TextLink>,
  );
  const mark = screen.getByRole("link").querySelector("[data-slot=text-link-external-icon]");
  expect(mark?.className).toContain("inline-flex");
  expect(mark?.querySelector(".sr-only")).toBeNull();
});
