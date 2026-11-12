/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";
import { TextLink, TextLinkDownloadIcon } from "./text-link";

afterEach(cleanup);

test("the download mark is hidden from a screen reader, which reads the label after the text instead", () => {
  render(
    <TextLink render={<a href="/exports/members.csv" download />}>
      members.csv
      <TextLinkDownloadIcon label="(downloads a file)" />
    </TextLink>,
  );
  const link = screen.getByRole("link");
  expect(link.textContent).toBe("members.csv (downloads a file)");
  expect(link.querySelector(".sr-only")?.textContent).toBe(" (downloads a file)");
  expect(link.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
});

test("the download mark is its own inline-flex box, in the same box as the ↗", () => {
  render(
    <TextLink render={<a href="/exports/members.csv" download />}>
      members.csv
      <TextLinkDownloadIcon />
    </TextLink>,
  );
  const mark = screen.getByRole("link").querySelector("[data-slot=text-link-download-icon]");
  expect(mark?.className).toContain("inline-flex");
  expect(mark?.className).toContain("ml-0.5");
  expect(mark?.querySelector("svg")?.getAttribute("class")).toContain("size-[0.857em]");
  expect(mark?.querySelector(".sr-only")).toBeNull();
});
