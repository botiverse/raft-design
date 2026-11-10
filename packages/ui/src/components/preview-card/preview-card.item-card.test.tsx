/**
 * @vitest-environment jsdom
 *
 * Pins the item card's parts (preview-card.md, Item card): each renders its
 * slot with the product's words, the footer sits under a hairline, and in
 * `PreviewCardBody` the title is the shared card title (cards-in-messages.md):
 * up to 2 lines, instead of truncating as it does in the profile card's header.
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import {
  PreviewCard,
  PreviewCardActions,
  PreviewCardContent,
  PreviewCardBody,
  PreviewCardEyebrow,
  PreviewCardFooter,
  PreviewCardMeta,
  PreviewCardTitle,
  PreviewCardTrigger,
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

test("the buttons sit at the card's end, as in a Popover", () => {
  render(<PreviewCardActions data-testid="actions" />);
  expect(tokens(screen.getByTestId("actions"))).toContain("justify-end");
});

test("the footer is a caption under a hairline", () => {
  render(<PreviewCardFooter data-testid="footer">Stamp · stamp.build</PreviewCardFooter>);
  const classes = tokens(screen.getByTestId("footer"));
  expect(classes).toContain("border-t");
  expect(classes).toContain("border-line-hairline");
  expect(classes).toContain("text-caption");
});

test("in the body the title is a card's title, up to 2 lines; the profile card's title is untouched", () => {
  render(
    <>
      <PreviewCardBody>
        <PreviewCardTitle data-testid="title">refactor(i18n): one source</PreviewCardTitle>
      </PreviewCardBody>
      <PreviewCardTitle data-testid="profile-title">Ada Lovelace</PreviewCardTitle>
    </>,
  );
  const title = tokens(screen.getByTestId("title"));
  expect(title).toContain("line-clamp-2");
  expect(title).toContain("text-subhead");
  expect(title).not.toContain("truncate");
  const profile = tokens(screen.getByTestId("profile-title"));
  expect(profile).toContain("truncate");
  expect(profile).toContain("text-headline");
});

test("an item card is 400px wide; a profile card keeps 300px", () => {
  render(
    <>
      <PreviewCard open>
        <PreviewCardTrigger href="#item">item</PreviewCardTrigger>
        <PreviewCardContent size="item" data-testid="item-card">
          Item
        </PreviewCardContent>
      </PreviewCard>
      <PreviewCard open>
        <PreviewCardTrigger href="#profile">profile</PreviewCardTrigger>
        <PreviewCardContent data-testid="profile-card">Profile</PreviewCardContent>
      </PreviewCard>
    </>,
  );
  expect(tokens(screen.getByTestId("item-card"))).toContain("w-[400px]");
  expect(tokens(screen.getByTestId("item-card"))).not.toContain("w-[300px]");
  expect(tokens(screen.getByTestId("profile-card"))).toContain("w-[300px]");
});
