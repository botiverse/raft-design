/**
 * @vitest-environment jsdom
 *
 * Pins the item card's parts (preview-card.md, Item card): each renders its
 * slot with the product's words, the footer sits under a hairline, and in
 * `PreviewCardBody` the title wraps (up to 3 lines) instead of truncating as
 * it does in the profile card's header.
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import {
  PreviewCardActions,
  PreviewCardBody,
  PreviewCardEyebrow,
  PreviewCardFooter,
  PreviewCardMeta,
  PreviewCardTitle,
} from "./preview-card";

afterEach(cleanup);

function tokens(el: Element) {
  return el.className.split(/\s+/);
}

test("each part renders its slot and the product's words", () => {
  render(
    <>
      <PreviewCardBody data-testid="body">
        <PreviewCardEyebrow data-testid="eyebrow">botiverse/slock</PreviewCardEyebrow>
        <PreviewCardTitle>refactor(i18n): one display-locale source</PreviewCardTitle>
        <PreviewCardMeta data-testid="meta">Martin · +803 −498</PreviewCardMeta>
      </PreviewCardBody>
      <PreviewCardActions data-testid="actions" />
      <PreviewCardFooter data-testid="footer">Stamp · stamp.build</PreviewCardFooter>
    </>,
  );
  const expected: Record<string, string> = {
    body: "preview-card-body",
    eyebrow: "preview-card-eyebrow",
    meta: "preview-card-meta",
    actions: "preview-card-actions",
    footer: "preview-card-footer",
  };
  for (const [id, slot] of Object.entries(expected)) {
    expect(screen.getByTestId(id).getAttribute("data-slot")).toBe(slot);
  }
  expect(screen.getByTestId("eyebrow").textContent).toBe("botiverse/slock");
  expect(screen.getByTestId("footer").textContent).toBe("Stamp · stamp.build");
});

test("the footer is a caption under a hairline", () => {
  render(<PreviewCardFooter data-testid="footer">Stamp · stamp.build</PreviewCardFooter>);
  const classes = tokens(screen.getByTestId("footer"));
  expect(classes).toContain("border-t");
  expect(classes).toContain("border-line-hairline");
  expect(classes).toContain("text-caption");
});

test("in the body the title wraps, up to 3 lines; the profile card's title is untouched", () => {
  render(
    <>
      <PreviewCardBody data-testid="body">
        <PreviewCardTitle data-testid="title">refactor(i18n): one source</PreviewCardTitle>
      </PreviewCardBody>
    </>,
  );
  const body = tokens(screen.getByTestId("body"));
  expect(body).toContain("*:data-[slot=preview-card-title]:whitespace-normal");
  expect(body).toContain("*:data-[slot=preview-card-title]:line-clamp-3");
  const title = tokens(screen.getByTestId("title"));
  expect(title).toContain("truncate");
  expect(title).not.toContain("whitespace-normal");
});
