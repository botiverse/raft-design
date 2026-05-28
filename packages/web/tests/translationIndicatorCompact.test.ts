import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("translated message indicator drops prefix text and sits above footer metadata", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/message/MessageItem.tsx"),
    "utf8",
  );
  const footerStart = source.indexOf("{/* Footer metadata/actions");
  const footerEnd = source.indexOf("{htmlPreview &&", footerStart);
  assert.notEqual(footerStart, -1, "MessageItem should keep a dedicated footer metadata/action block");
  assert.notEqual(footerEnd, -1, "MessageItem footer block should end before the HTML preview modal");
  const footerSource = source.slice(footerStart, footerEnd);

  assert.doesNotMatch(source, />Translated</);
  assert.doesNotMatch(source, />Original</);
  assert.match(source, /label: "Show original"/);
  assert.match(source, /label: "Show translation"/);
  assert.match(source, /title: "Translated\. Show original"/);
  assert.match(source, /title: "Original shown\. Show translation"/);
  assert.match(source, /font-bold underline decoration-black\/40/);
  assert.match(source, /<TranslationIndicator[\s\S]*?Footer metadata\/actions/);
  assert.match(source, /Footer metadata\/actions[\s\S]*?<MessageSquare size=\{12\}[^>]*\/>/);
  assert.doesNotMatch(source, /Footer metadata\/actions[\s\S]*?<TranslationIndicator/);
  assert.match(footerSource, /className="mt-1\.5 flex flex-wrap items-center gap-1\.5"/);
  assert.match(footerSource, /data-testid="message-thread-replies-badge"/);
  assert.match(footerSource, /<MessageSquare size=\{12\}[^>]*\/>/);
  assert.doesNotMatch(footerSource, /<TranslationIndicator/);
});
