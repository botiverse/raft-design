import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

/**
 * Width contract for the diff-patch and document-preview attachment chips.
 *
 * Provenance:
 *   tygg 2026-05-10 #proj-uiux:28ac87a7 — `web-frontend-tracing-rfc-2026-05-10.md`
 *   filename overflowed the chip on mobile. Cause: each chip is a flex item
 *   inside `<div className="flex flex-wrap items-start gap-2">`; flex items
 *   default to `min-width: auto`, which resolves to the content's min-content
 *   width. With `truncate` (white-space: nowrap) on the inner filename row,
 *   that min-content equals the FULL filename width, so a long name
 *   stretches the chip past the intended `w-44` and the inner truncate never
 *   activates.
 *
 *   The fix pins both `min-w-44` and `max-w-44` (and `shrink-0` for the
 *   flex-wrap parent) so the chip stays at exactly 11rem regardless of
 *   content.
 *
 *   Pre-existing prior fix #proj-uiux:c513b19e PR #1456 only patched the
 *   modal header / workspace header / lightbox-error surfaces; the chip
 *   itself was missed and silently regressed.
 */

test("attachment chip width is pinned to w-44 with min/max guards + overflow-hidden", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/message/AttachmentChip.tsx"),
    "utf8",
  );

  // The compact attachment variant used by diff-patch and document-preview
  // chips must carry the full pinning recipe so the long-filename truncate works:
  //   - `min-w-44 max-w-44 shrink-0` pin the chip at exactly 11rem so the
  //     flex-item min-width: auto rule can't widen it past w-44.
  //   - `overflow-hidden` ALSO resets that flex-item min-width: auto to 0
  //     (CSS Flexbox §4.5) and clips any sub-pixel overflow on mobile.
  const compactClassMatch = source.match(/const COMPACT_CHIP_LAYOUT = "([^"]+)";/);
  assert.ok(compactClassMatch, "expected compact attachment chip layout contract");
  const compactClassName = compactClassMatch[1];
  assert.match(compactClassName, /\bw-44\b/);
  assert.match(compactClassName, /\bmin-w-44\b/);
  assert.match(compactClassName, /\bmax-w-44\b/);
  assert.match(compactClassName, /\bshrink-0\b/);
  assert.match(compactClassName, /\boverflow-hidden\b/);

  // The inner filename row must also be a full-width clipping boundary so the
  // truncate ellipsis activates inside the chip's content area.
  assert.match(
    source,
    /<div className="w-full min-w-0 max-w-full overflow-hidden">[\s\S]{0,200}?<div className="block w-full max-w-full truncate /,
  );
});

test("attachment chip wide variant is unified with the compact variant", () => {
  // stdrc 2026-05-20 #proj-theme:441c8b2b: "包括整个不同的 attachment chip 内容物
  // 的 layout 和字体大小也全都要统一". The two visual variants merged into a
  // single canonical chip (filename / meta / optional summary stacked
  // vertically, affordance icon pinned bottom-right). The wide-variant export
  // remains as a public alias so any downstream width-contract callers still
  // resolve to the same width recipe.
  const source = readFileSync(
    resolve(repoRoot, "src/components/message/AttachmentChip.tsx"),
    "utf8",
  );
  assert.match(
    source,
    /const WIDE_CHIP_LAYOUT = COMPACT_CHIP_LAYOUT;/,
    "wide chip layout must be aliased to the compact chip layout — variants are visually unified",
  );
  // Inner DOM no longer has the horizontal `flex-1 / text-sm` layout; both
  // variants share the COMPACT vertical-stack structure. The old wide-only
  // node tree is gone, by design.
  assert.doesNotMatch(
    source,
    /<div className="min-w-0 flex-1 overflow-hidden">[\s\S]{0,120}?<div className="truncate text-sm font-bold text-black">/,
    "wide-variant horizontal layout (leading icon-box + flex-1 filename column) must be gone",
  );
  assert.doesNotMatch(
    source,
    /border border-black bg-black\/5/,
    "leading file-type icon-box border must be gone (icons inside the chip lost their borders per stdrc 2026-05-20)",
  );
});

test("message item constrains non-image attachment rows to two chips", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/message/MessageItem.tsx"),
    "utf8",
  );

  // 2 * w-44 (11rem) + gap-2 (0.5rem) = 22.5rem, so four non-image
  // attachments naturally wrap to 2x2 while preserving the same rule for 3/5+.
  assert.match(source, /<div className="flex max-w-\[22\.5rem\] flex-wrap items-start gap-2">/);
});

test("message item routes attachment branches through the shared AttachmentChip", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/message/MessageItem.tsx"),
    "utf8",
  );

  assert.match(source, /import \{ AttachmentChip \} from "\.\/AttachmentChip";/);
  assert.equal((source.match(/variant="compact"/g) ?? []).length, 2, "diff and document preview should use compact chips");
  assert.equal((source.match(/variant="wide"/g) ?? []).length, 1, "generic fallback should use the wide chip");
  assert.doesNotMatch(source, /min-w-44 max-w-44 shrink-0/);
  assert.doesNotMatch(source, /flex w-56 items-start/);
  assert.doesNotMatch(source, /w-56/);
});
