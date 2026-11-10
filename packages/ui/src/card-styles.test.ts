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
 * Which components are cards isn't a list kept here: every component folder
 * under components/ is read, and one is a card's (or a popover's) when any of
 * its source files uses MessageEmbed, PreviewCard, `messageEmbed` or
 * `messageCard`, or imports message-embed. A new card built on them is in
 * scope the day it is written.
 *
 * In those folders the guard fails on every class that writes, by hand, a
 * value the recipes own:
 * - a radius (`rounded-*`): the frame's is the recipe's. Only the radii of a
 *   control or a mark inside a card pass (INNER_RADII);
 * - a width: arbitrary (`w-[…]`, `max-w-[…]`, `min-w-[…]`), named
 *   (`max-w-md`, `max-w-xl`, …) or from 96px up (`w-24`, `w-96`);
 * - a padding of 8px or more (`p-2`, `px-2.5`, `p-3`, `p-5`, `px-[14px]`, …,
 *   any side, any variant prefix): the inset is the recipe's. Less than 8px
 *   is a control's or a mark's own;
 * - a title size: the title scale (`text-headline`, `text-subhead`,
 *   `text-title`, `text-card-title`, `text-display`, `text-hero`) or an
 *   arbitrary size (`text-[17px]`).
 * Each failure names the file, the line and the class.
 *
 * The exceptions below are keyed by file and class, each with its reason: a
 * card not on the recipes yet, or a value that isn't a card's (a profile card,
 * a plain popover, a part inside a card). An allowed class that is no longer
 * in its file fails too, so the list stays the exceptions.
 */

const RECIPE = "components/message-embed/message-embed.recipe.ts";

const MARKERS =
  /\bMessageEmbed\w*\b|\bPreviewCard\w*\b|\bmessageEmbed\(|\bmessageCard\(|["'][./]*(?:message-embed\/)?message-embed(?:\.recipe)?["']/;

// The radii of what sits inside a card: a control, a chip, a sticker, an
// app icon's corner. A card's frame never has one of these.
const INNER_RADII = new Set([
  "rounded-none",
  "rounded-full",
  "rounded-control",
  "rounded-chip",
  "rounded-sticker",
  "rounded-[2px]",
]);

const RADIUS = /(?<![\w-])rounded(?:-\[[^\]\s"'`]+\]|-[a-z0-9-]+)?(?![\w[-])/g;
const WIDTH =
  /(?<![\w-])(?:min-|max-)?w-(?:\[[^\]\s"'`]+\]|(?:3xs|2xs|xs|sm|md|lg|xl|[2-7]xl|prose|screen-[a-z0-9]+)(?![\w-])|(?:2[4-9]|[3-9]\d|\d{3,})(?:\.5)?(?![\w./-]))/g;
const PADDING =
  /(?<![\w-])p[xytblrse]?-(?:\[(?:[89]|\d{2,})(?:\.\d+)?px\]|\[\d+(?:\.\d+)?rem\]|(?:[2-9]|\d{2,})(?:\.5)?(?![\w./-]))/g;
const TITLE_SIZE =
  /(?<![\w-])text-(?:(?:display|hero|title|headline|subhead|card-title)(?![\w-])|\[(?:length:)?\d+(?:\.\d+)?(?:px|rem|em)\])/g;

const ALLOWED: Record<string, Record<string, string>> = {
  "components/app-link-card/app-link-card.tsx": {
    "w-28": "The placeholder's id line: a line of skeleton.",
    "w-40": "The placeholder's details: a line of skeleton.",
  },
  "components/message-action-card/message-action-card.recipe.ts": {
    "pb-2": "The open header's 8px above the content; the rest of its inset is messageCard's.",
    "pb-3": "The folded header's 12px bottom; the rest of its inset is messageCard's.",
  },
  "components/message-action-card/message-action-card-content.recipe.ts": {
    "max-w-40": "A property's label column, at most 160px: a part of the card, not its width.",
    "px-2.5": "A permission's tile and the notice: blocks inside the card, 10px x 8px.",
    "py-2": "A permission's tile and the notice: blocks inside the card, 10px x 8px.",
    "pl-2.5": "The agent's reason, 10px from its seam rule: a quote inside the card.",
  },
  "components/message-quoted-preview/message-quoted-preview.recipe.ts": {
    "pl-2.5":
      "A quoted message is a bar beside the text, 10px from its seam rule, not a card (cards-in-messages.md#when-it-applies).",
  },
  "components/message-forwarded-bundle/message-forwarded-bundle.recipe.ts": {
    "px-3":
      "A forwarded message's row is a message's rhythm inside the card, not the card's inset.",
    "py-2.5":
      "A forwarded message's row is a message's rhythm inside the card, not the card's inset.",
  },
  "components/message-replies/message-replies.recipe.ts": {
    "px-2.5":
      "The replies are a filled, borderless summary of the thread, not a framed card: 10px x 8px on the fill (cards-in-messages.md#when-it-applies).",
    "py-2":
      "The replies are a filled, borderless summary of the thread, not a framed card: 10px x 8px on the fill (cards-in-messages.md#when-it-applies).",
  },
  "components/popover/popover.tsx": {
    "px-3": "A plain popover's header row; a popover isn't a card in a message.",
    "pl-4": "A plain popover's header row, 16px like its body.",
    "px-4":
      'A plain popover keeps its 16px inset (popover.md); a popover about an item takes messageCard\'s with size="item".',
    "pt-4": "A plain popover keeps its 16px inset (popover.md).",
    "pb-3": "A plain popover keeps its 16px inset (popover.md): 12px above its buttons.",
    "pb-4": "A plain popover keeps its 16px inset (popover.md).",
    "rounded-container": "The popover's own frame, the same radius as every floating panel.",
    "min-w-[220px]": "Every popover's floor.",
    "text-headline": "A plain popover's title; a popover about an item takes messageCard's title.",
  },
  "components/preview-card/preview-card.tsx": {
    "min-w-[220px]": "The popover's own floor, as every popover's.",
    "rounded-container": "The popover's own frame, the same radius as every floating panel.",
    "w-[300px]":
      "The profile card: a profile is about a person, not an item, and isn't a card in a message.",
    "px-4": "The profile card's 16px inset: a profile isn't a card in a message.",
    "pt-4": "The profile card's 16px inset.",
    "pb-3": "The profile card's 16px inset, 12px above the separator.",
    "pb-4": "The profile card's 16px inset.",
    "py-3": "The profile card's status line.",
    "text-headline": "The profile card's name, 17px: a person's name, not an item's title.",
  },
};

const SRC_DIR = fileURLToPath(new URL(".", import.meta.url));
const COMPONENTS_DIR = join(SRC_DIR, "components");

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

/** Blank out comments, keeping every line where it is: a reason in a comment isn't a class. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\/|(?<![:"'`\w])\/\/[^\n]*/g, (comment) =>
    comment.replace(/[^\n]/g, " "),
  );
}

type Site = { line: number; cls: string };

function cardStyleSites(source: string): Site[] {
  const lines = stripComments(source).split("\n");
  return lines.flatMap((text, index) =>
    [RADIUS, WIDTH, PADDING, TITLE_SIZE].flatMap((pattern) =>
      [...text.matchAll(pattern)]
        .map((m) => m[0])
        .filter((cls) => pattern !== RADIUS || !INNER_RADII.has(cls))
        .map((cls) => ({ line: index + 1, cls })),
    ),
  );
}

/** The component folders whose code builds a card in a message or a popover. */
function cardFolders(): string[] {
  return readdirSync(COMPONENTS_DIR)
    .map((entry) => join(COMPONENTS_DIR, entry))
    .filter((dir) => statSync(dir).isDirectory())
    .filter((dir) =>
      sourceFiles(dir).some((path) => {
        const file = relative(SRC_DIR, path).replaceAll("\\", "/");
        return file !== RECIPE && MARKERS.test(stripComments(readFileSync(path, "utf8")));
      }),
    );
}

test("the guard reads every card and popover folder, found by what it builds on", () => {
  const folders = cardFolders().map((dir) => relative(SRC_DIR, dir).replaceAll("\\", "/"));
  // Not a list to keep: these are a floor, so a folder that stops being found is noticed.
  expect(folders).toEqual(
    expect.arrayContaining([
      "components/app-link-card",
      "components/message-action-card",
      "components/message-embed",
      "components/message-forwarded-bundle",
      "components/message-replies",
      "components/popover",
      "components/preview-card",
    ]),
  );
});

test("cards take their frame, widths, inset and title from the card recipes", () => {
  const found = new Map<string, Site[]>();
  for (const dir of cardFolders()) {
    for (const path of sourceFiles(dir)) {
      const file = relative(SRC_DIR, path).replaceAll("\\", "/");
      if (file === RECIPE) continue;
      found.set(file, cardStyleSites(readFileSync(path, "utf8")));
    }
  }

  const unexpected = [...found].flatMap(([file, sites]) =>
    sites
      .filter(({ cls }) => !(cls in (ALLOWED[file] ?? {})))
      .map(({ line, cls }) => `packages/ui/src/${file}:${line}: ${cls}`),
  );
  expect(
    unexpected,
    `Take the frame and width from MessageEmbed (size="item" | "content") and the inset, ` +
      `source row, title, details and actions from messageCard, in ${RECIPE}; or add the ` +
      "exception, with its reason, to design/patterns/cards-in-messages.md and to ALLOWED " +
      "in card-styles.test.ts.",
  ).toEqual([]);

  // An allowed class that is gone from its file is removed, so the list stays the exceptions.
  const stale = Object.entries(ALLOWED).flatMap(([file, classes]) =>
    Object.keys(classes)
      .filter((cls) => !(found.get(file) ?? []).some((site) => site.cls === cls))
      .map((cls) => `${file}: ${cls}`),
  );
  expect(stale, "Remove these entries from ALLOWED: the class is gone.").toEqual([]);
});

test("the guard finds a card's own radius, width, inset and title size", () => {
  const classes = (source: string) => cardStyleSites(source).map(({ cls }) => cls);
  expect(
    classes(
      '"rounded-container rounded-lg rounded-[12px] border max-w-[440px] px-4 py-3 last:pb-4 text-headline"',
    ),
  ).toEqual([
    "rounded-container",
    "rounded-lg",
    "rounded-[12px]",
    "max-w-[440px]",
    "px-4",
    "py-3",
    "pb-4",
    "text-headline",
  ]);
  expect(
    classes('"md:p-[16px] min-w-[220px] w-[min(34rem,100%)] max-w-md max-w-xl w-96 p-2.5 p-5"'),
  ).toEqual([
    "min-w-[220px]",
    "w-[min(34rem,100%)]",
    "max-w-md",
    "max-w-xl",
    "w-96",
    "p-[16px]",
    "p-2.5",
    "p-5",
  ]);
  expect(classes('"px-[14px] text-[17px] text-subhead rounded"')).toEqual([
    "rounded",
    "px-[14px]",
    "text-[17px]",
    "text-subhead",
  ]);
  expect(
    classes(
      '"w-full max-w-none min-w-0 pt-0 size-[27px] text-callout text-footnote text-foreground"',
    ),
  ).toEqual([]);
  // Lines are counted, and comments are skipped.
  expect(cardStyleSites('// px-4\nconst a = "x";\n/* p-3\n */ const b = "max-w-xl";')).toEqual([
    { line: 4, cls: "max-w-xl" },
  ]);
});

test("a card is found by what it builds on, not by its folder's name", () => {
  expect(MARKERS.test('import { MessageEmbed } from "../message-embed";')).toBe(true);
  expect(MARKERS.test('import { messageCard } from "../message-embed/message-embed.recipe";')).toBe(
    true,
  );
  expect(MARKERS.test("<PreviewCardBody>")).toBe(true);
  expect(MARKERS.test('import { Button } from "../button";')).toBe(false);
});
