import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

/**
 * Cards in messages and item popovers look alike because they take their
 * styles from one place (design/patterns/cards-in-messages.md): the frame and
 * its two widths from MessageEmbed (`messageEmbed`, `size="item" | "content"`),
 * and the source row, title, details, actions and the 12px inset from
 * `messageCard`, both in components/message-embed/message-embed.recipe.ts.
 * Change a value there and every card follows.
 *
 * This guard reads the code of every card component and fails on a file that
 * writes one of those values itself: the card radius (`rounded-container`), a
 * fixed width (`w-[…]`, `max-w-[…]`, `min-w-[…]`), the card's 12px or 16px
 * inset (`p-3`, `px-4`, `pb-3` and the other sides, any variant prefix), or a
 * title size (`text-headline`, `text-subhead`, `text-card-title`,
 * `text-title`). Each entry below is a card that hasn't moved onto the
 * recipes yet, or a value that isn't a card's, with its reason and how many
 * such classes it has. Moving a card onto the recipes lowers its count: lower
 * the entry with it, or remove it.
 */

type Allowed = { count: number; reason: string };

const RECIPE = "components/message-embed/message-embed.recipe.ts";

const CARD_DIRS = [
  "components/message-embed",
  "components/app-link-card",
  "components/preview-card",
  "components/message-action-card",
  "components/message-attachment",
  "components/message-forwarded-bundle",
  "components/message-quoted-preview",
  "components/message-replies",
];

const ALLOWED: Record<string, Allowed> = {
  "components/preview-card/preview-card.tsx": {
    count: 11,
    reason:
      "The popover's own frame (its radius and 220px floor) and the profile card (300px, a 16px inset, a 17px name): a profile isn't a card in a message. Its item parts are messageCard's.",
  },
  "components/message-action-card/message-action-card.recipe.ts": {
    count: 1,
    reason: "The folded header's 12px bottom; the rest of its inset is messageCard's.",
  },
  "components/message-attachment/message-attachment.recipe.ts": {
    count: 2,
    reason:
      "The file tile (176 x 80, a 10px inset tied to its corner button) and its group's 360px: a tile, not a card with a title; it moves to the 12px inset in a later pass.",
  },
  "components/message-attachment/message-image-gallery.recipe.ts": {
    count: 3,
    reason:
      "Media, not a card: images keep the gallery's widths, on tiles with the frame's radius.",
  },
  "components/message-attachment/message-video-preview.recipe.ts": {
    count: 4,
    reason:
      "Media, not a card: a video keeps the gallery's widths, on a tile with the frame's radius.",
  },
  "components/message-forwarded-bundle/message-forwarded-bundle.recipe.ts": {
    count: 1,
    reason:
      "A forwarded message's row (px-3 py-2.5) is a message's rhythm inside the card, not the card's inset.",
  },
};

const SRC_DIR = fileURLToPath(new URL(".", import.meta.url));

const PATTERNS = [
  /(?<![\w-])rounded-container(?![\w-])/g,
  /(?<![\w-])(?:min-|max-)?w-\[[^\]\s"']+\]/g,
  /(?<![\w-])p[xytblrse]?-(?:3|4|\[(?:12|16)px\])(?![\w.-])/g,
  /(?<![\w-])text-(?:headline|subhead|card-title|title)(?![\w-])/g,
];

function sourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) files.push(...sourceFiles(path));
    else if (/\.tsx?$/.test(entry) && !/\.test\.|(?:^|[-.])test-|\.d\.ts$/.test(entry)) {
      files.push(path);
    }
  }
  return files;
}

function cardStyleSites(source: string): string[] {
  return PATTERNS.flatMap((pattern) => [...source.matchAll(pattern)].map((m) => m[0]));
}

test("cards take their frame, widths, inset and title from the card recipes", () => {
  const found: Record<string, string[]> = {};
  for (const dir of CARD_DIRS) {
    for (const path of sourceFiles(join(SRC_DIR, dir))) {
      const file = relative(SRC_DIR, path).replaceAll("\\", "/");
      if (file === RECIPE) continue;
      const sites = cardStyleSites(readFileSync(path, "utf8"));
      if (sites.length > 0) found[file] = sites;
    }
  }

  const unexpected = Object.entries(found)
    .filter(([file, sites]) => sites.length > (ALLOWED[file]?.count ?? 0))
    .map(
      ([file, sites]) =>
        `${file}: ${sites.join(", ")} (allowed ${ALLOWED[file]?.count ?? 0}). ` +
        `Take the frame and width from MessageEmbed (size="item" | "content") and the ` +
        `inset, source row, title, details and actions from messageCard, in ${RECIPE}; ` +
        "or add the exception to design/patterns/cards-in-messages.md and this list.",
    );
  expect(unexpected).toEqual([]);

  // An entry whose classes are gone is lowered or removed, so the list stays the exceptions.
  const stale = Object.entries(ALLOWED)
    .filter(([file, { count }]) => (found[file]?.length ?? 0) < count)
    .map(([file, { count }]) => `${file}: ${found[file]?.length ?? 0} < ${count}`);
  expect(stale).toEqual([]);
});

test("the guard finds a card's own frame, width, inset and title size", () => {
  expect(
    cardStyleSites('"rounded-container border max-w-[440px] px-4 py-3 last:pb-4 text-headline"'),
  ).toEqual(["rounded-container", "max-w-[440px]", "px-4", "py-3", "pb-4", "text-headline"]);
  expect(cardStyleSites('"md:p-[16px] min-w-[220px] w-[min(34rem,100%)]"')).toEqual([
    "min-w-[220px]",
    "w-[min(34rem,100%)]",
    "p-[16px]",
  ]);
  expect(
    cardStyleSites('"rounded-control px-2.5 py-2 p-1.5 pt-0 size-[27px] text-callout max-w-40"'),
  ).toEqual([]);
});
