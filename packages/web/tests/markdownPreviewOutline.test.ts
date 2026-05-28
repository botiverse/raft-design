import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { extractMarkdownOutline } from "../src/components/markdown/MarkdownOutline";

const repoRoot = resolve(import.meta.dirname, "..");

test("markdown outline extracts h1-h3 headings with stable duplicate ids", () => {
  const outline = extractMarkdownOutline([
    "# Title",
    "",
    "```",
    "# ignored code heading",
    "```",
    "## Usage `API`",
    "### [Usage API](https://example.com)",
    "#### Too deep",
    "## Usage API",
  ].join("\n"));

  assert.deepEqual(outline, [
    { id: "title", level: 1, sourceLine: 1, title: "Title" },
    { id: "usage-api", level: 2, sourceLine: 6, title: "Usage API" },
    { id: "usage-api-2", level: 3, sourceLine: 7, title: "Usage API" },
    { id: "usage-api-3", level: 2, sourceLine: 9, title: "Usage API" },
  ]);
});

test("markdown preview renders sticky outline only on large screens", () => {
  const messageItemSource = readFileSync(
    resolve(repoRoot, "src/components/message/MessageItem.tsx"),
    "utf8",
  );
  const outlineSource = readFileSync(
    resolve(repoRoot, "src/components/markdown/MarkdownOutline.tsx"),
    "utf8",
  );

  assert.match(messageItemSource, /extractMarkdownOutline\(markdown\)/);
  assert.match(messageItemSource, /createMarkdownOutlineHeadingComponents\(outline\)/);
  assert.match(messageItemSource, /className="hidden xl:sticky xl:top-20 xl:block xl:max-h-\[calc\(100vh-7rem\)\] xl:self-start xl:overflow-auto"/);
  assert.match(messageItemSource, /<MarkdownOutlineNav outline=\{outline\} \/>/);
  assert.match(outlineSource, /aria-label="Markdown outline"/);
  assert.match(outlineSource, /href=\{`#\$\{item\.id\}`\}/);
});
