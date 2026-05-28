import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

/**
 * Per stdrc 2026-05-15 #wg-theme:25bb834a (task #8):
 *   "channel/dm 的 Files tab 里的 list item 样式应该和其他某些 list item
 *    复用，找一下"
 *
 * Followed by stdrc msg=a2448dad on the migration PR:
 *   "这里好像没必要显示原消息的 id，应该是 item 点击打开预览，右边则是有
 *    '跳转到消息'和'下载'按钮，都不需要文字，icon btn 就行"
 *
 * The Files tab (`ChannelFilesPanel`) rows are migrated to the canonical
 * `<AvatarListRow>` primitive (introduced in task #2 per stdrc 2026-05-11
 * #wg-theme:eb11794c). This contract locks in:
 *
 *   1. ChannelFilesPanel imports and uses AvatarListRow.
 *   2. The old hand-rolled row shell (`divide-y-2 divide-black`, the
 *      `grid grid-cols-[1fr_auto] ... hover:bg-brutal-yellow/10` inline
 *      shell, and the bespoke `border-b-2 border-black` outer divider)
 *      is gone.
 *   3. AvatarListRow exposes the `align="start"` option so callers can
 *      top-align tall avatars per stdrc 2026-05-10 #wg-theme:7470ca2a
 *      ("头像在左边都应顶在左上角").
 *   4. AvatarListRow exposes a peer `actionContent` slot for the action
 *      buttons so they remain independent click targets (no nested
 *      `<button>` inside `<button>`).
 *   5. Row click opens a preview of the file itself (image lightbox /
 *      signed URL in a new tab), NOT a jump-to-message. The action slot
 *      holds two icon-only buttons: ExternalLink ("Jump to original
 *      message") + Download ("Download file"). The previous bespoke
 *      `#thread:` / `#dm:` / `#channel:` source pill is gone, along
 *      with its `Link2` icon and `sourceLabel()` helper.
 */

test("ChannelFilesPanel routes rows through the shared AvatarListRow primitive", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/message/ChannelFilesPanel.tsx"),
    "utf8",
  );

  // Imports & uses the shared primitive.
  assert.match(source, /import AvatarListRow from "\.\.\/ui\/AvatarListRow";/);
  assert.match(source, /<AvatarListRow\b/);

  // Top-aligned per the "avatar 顶在左上角" doctrine; action buttons live
  // in the peer action slot, not nested inside the row button.
  assert.match(source, /align="start"/);
  assert.match(source, /actionContent=\{/);

  // The previous hand-rolled row shell is gone.
  assert.doesNotMatch(source, /divide-y-2 divide-black/);
  assert.doesNotMatch(source, /grid grid-cols-\[1fr_auto\]/);
  assert.doesNotMatch(source, /hover:bg-brutal-yellow\/10/);
});

test("ChannelFilesPanel row click opens preview, peer slot holds icon-only Jump + Download buttons", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/message/ChannelFilesPanel.tsx"),
    "utf8",
  );

  // Row click opens an in-app preview. Images go through the shared
  // image lightbox; everything else falls back to opening the signed
  // URL in a new tab.
  assert.match(source, /useImageLightboxStore/);
  assert.match(source, /onClick=\{\(\) => void openPreview\(file\)\}/);

  // Action slot exposes exactly the two icon-only buttons stdrc asked
  // for — labelled by `title` / `aria-label`, no text label inside the
  // button body.
  assert.match(source, /title="Jump to original message"/);
  assert.match(source, /aria-label="Jump to original message"/);
  assert.match(source, /<ExternalLink size=\{14\} \/>/);
  assert.match(source, /title="Download file"/);
  assert.match(source, /aria-label="Download file"/);
  assert.match(source, /<Download size=\{14\} \/>/);

  // The old text-label Download button and the source-id pill are gone.
  assert.doesNotMatch(source, />\s*Download\s*</);
  assert.doesNotMatch(source, /sourceLabel/);
  assert.doesNotMatch(source, /Link2/);
});

test("AvatarListRow exposes align + actionContent slots for tall avatar rows with peer actions", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/ui/AvatarListRow.tsx"),
    "utf8",
  );

  // Prop surface.
  assert.match(source, /align\?: "start" \| "center";/);
  assert.match(source, /actionContent\?: ReactNode;/);

  // `align="start"` must top-align both the row container and the inner
  // text column; `actionContent` must NOT live inside the row button.
  assert.match(source, /align === "start" \? "items-start" : "items-center"/);
  assert.match(source, /\{hasAction && \(/);

  // Both right-side slots vertically center themselves even when the row
  // is top-aligned, per stdrc 2026-05-15 #wg-theme:25bb834a — first
  // ("右边的按钮应该垂直居中") for `actionContent`, then broadened to
  // ("这个组件的按钮都应该是垂直居中") covering `rightContent` too.
  // `self-center` overrides the outer `items-start` cross-axis alignment
  // on each child individually, so both the `rightContent` wrapper
  // (inside the row body) and the `actionContent` peer wrapper carry it.
  const selfCenterMatches = source.match(/flex shrink-0 self-center items-center gap-1\.5/g) ?? [];
  assert.ok(
    selfCenterMatches.length >= 2,
    `expected both rightContent and actionContent wrappers to carry "self-center" (found ${selfCenterMatches.length})`,
  );
});
