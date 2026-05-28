import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("message store exposes durable reaction summaries on messages", () => {
  const source = readFileSync(resolve(repoRoot, "src/store/messageStore.ts"), "utf8");

  assert.match(source, /export interface MessageReaction \{/);
  assert.match(source, /emoji: string;/);
  assert.match(source, /count: number;/);
  assert.match(source, /reactorIds: string\[\];/);
  assert.match(source, /reactorNames: string\[\];/);
  assert.match(source, /reactions\?: MessageReaction\[\];/);
});

test("message item renders existing reactions and toggles them through the reactions API", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/message/MessageItem.tsx"), "utf8");
  const reactionConstants = readFileSync(resolve(repoRoot, "src/components/message/reactionConstants.ts"), "utf8");
  const css = readFileSync(resolve(repoRoot, "src/index.css"), "utf8");

  assert.match(reactionConstants, /export const QUICK_REACTION_EMOJIS = \[/);
  assert.match(source, /import \{ QUICK_REACTION_EMOJIS \} from "\.\/reactionConstants";/);
  assert.doesNotMatch(source, /const QUICK_REACTION_EMOJIS = \[/);
  assert.match(source, /function ReactionGlyph\(\{ emoji, size, className = "" \}: ReactionGlyphProps\)/);
  assert.match(source, /function ReactionCount\(\{ count \}: \{ count: number \}\)/);
  assert.match(source, /reaction-count-bump/);
  assert.match(css, /@keyframes reaction-count-bump/);
  assert.match(css, /\.reaction-count-bump/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(source, /case "🔥":/);
  assert.match(source, /case "😂":/);
  assert.match(source, /const reactions = message\.reactions \?\? \[\];/);
  assert.match(source, /const visibleReactions = reactions\.filter\(\(reaction\) => reaction\.count > 0\);/);
  assert.match(source, /function buildOptimisticReactionMessage\(/);
  assert.match(source, /function replaceReactionForEmoji\(/);
  assert.match(source, /function mergeReactionResponsePreservingPending\(/);
  assert.match(source, /const pendingReactionEmojisRef = useRef<Set<string>>\(new Set\(\)\);/);
  assert.match(source, /const \[reactionFailureEmoji, setReactionFailureEmoji\] = useState<string \| null>\(null\);/);
  assert.match(source, /useMessageStore\.getState\(\)\.updateMessage\(optimisticMessage\);/);
  assert.match(source, /mergeReactionResponsePreservingPending\(/);
  assert.match(source, /replaceReactionForEmoji\(currentMessage, previousMessage, emoji\)/);
  assert.match(source, /url: `\/messages\/\$\{message\.id\}\/reactions`/);
  assert.match(source, /method: alreadyReacted \? "delete" : "post"/);
  assert.match(source, /useMessageStore\.getState\(\)\.updateMessage\(reconciledMessage\);/);
  assert.match(source, /data-message-affordance="reaction"/);
  assert.match(source, /title="Add Reaction"/);
  assert.match(source, /aria-label="Add Reaction"/);
  assert.match(source, /import \{[\s\S]*SmilePlus[\s\S]*\} from "lucide-react"/);
  assert.match(source, /import \{[\s\S]*Plus[\s\S]*\} from "lucide-react"/);
  assert.match(source, /<SmilePlus size=\{13\} strokeWidth=\{2\} \/>/);
  assert.match(source, /data-message-affordance="reaction-picker"/);
  assert.match(source, /const REACTION_PICKER_EVENT = "slock:message-reaction-picker-open";/);
  assert.match(source, /const REACTION_PICKER_WIDTH = 194;/);
  assert.match(source, /const reactionPickerCloseTimerRef = useRef<ReturnType<typeof setTimeout> \| null>\(null\);/);
  assert.match(source, /window\.dispatchEvent\(new CustomEvent\(REACTION_PICKER_EVENT, \{ detail: \{ messageId: message\.id \} \}\)\);/);
  assert.match(source, /window\.addEventListener\(REACTION_PICKER_EVENT, handlePeerPickerOpen\);/);
  assert.match(source, /document\.addEventListener\("pointerdown", handlePointerDown, true\);/);
  assert.match(source, /target\?\.closest\("\[data-message-affordance='reaction'\], \[data-message-affordance='reaction-picker'\]"\)/);
  assert.match(source, /document\.addEventListener\("keydown", handleKeyDown, true\);/);
  assert.match(source, /window\.addEventListener\("scroll", handleViewportChange, true\);/);
  assert.match(source, /window\.addEventListener\("resize", handleViewportChange\);/);
  assert.match(source, /onMouseEnter=\{handleReactionPickerBoundaryEnter\}/);
  assert.match(source, /onMouseLeave=\{handleReactionPickerBoundaryLeave\}/);
  assert.match(source, /target\.closest\("\[data-message-affordance='reaction-picker'\]"\)/);
  assert.match(source, /reactionPickerCloseTimerRef\.current = setTimeout\(\(\) => \{/);
  assert.match(source, /style=\{\{\s*left: reactionPicker\.x,\s*top: reactionPicker\.y,\s*\}\}/);
  assert.doesNotMatch(source, /className="absolute right-1 top-8[\s\S]{0,160}data-message-affordance="reaction-picker"/);
  assert.match(source, /className="flex size-7 items-center justify-center rounded bg-transparent transition-colors hover:bg-brutal-pink\/20"/);
  assert.doesNotMatch(source, /hover:-translate-y/);
  assert.match(source, /handleQuickReactionClick\(emoji\)/);
  assert.match(source, /<BadgeButton[\s\S]*?message-thread-replies-badge[\s\S]*?<\/BadgeButton>[\s\S]*?\{visibleReactions\.map/);
  assert.match(source, /const currentViewerReacted = hasCurrentUserReaction\(reaction\.emoji\);/);
  assert.match(source, /<ReactionGlyph emoji=\{reaction\.emoji\} size=\{15\} className="block" \/>/);
  assert.match(source, /inline-flex h-5[\s\S]*?rounded px-1\.5 text-\[12px\]/);
  assert.doesNotMatch(source, /translate-y-px items-center leading-none/);
  assert.match(source, /currentViewerReacted[\s\S]*?bg-brutal-pink\/20 hover:bg-brutal-pink\/30[\s\S]*?bg-\[#EEEDE6\] hover:bg-\[#E0DED4\]/);
  assert.match(source, /showFailureFlash[\s\S]*?bg-brutal-orange\/30/);
  assert.doesNotMatch(source, /<BadgeButton[\s\S]{0,200}aria-label=\{`\$\{reaction\.emoji\} reaction/);
  assert.doesNotMatch(source, /isActive[\s\S]{0,220}bg-brutal-pink\/30/);
  assert.doesNotMatch(source, /hover:bg-brutal-yellow\/35/);
  assert.match(source, /<ReactionCount count=\{reaction\.count\} \/>/);
  assert.doesNotMatch(source, /animate-spin rounded-full border border-black border-t-transparent/);
  assert.doesNotMatch(source, /const isPending = reactingEmoji === reaction\.emoji;/);
  assert.doesNotMatch(source, /disabled=\{!!reactingEmoji\}/);
  assert.match(source, /<ReactionGlyph emoji=\{emoji\} size=\{24\} className="block" \/>/);
  assert.match(source, /data-message-affordance="mobile-reaction-add"/);
  assert.match(source, /<Plus size=\{13\} strokeWidth=\{2\.5\} \/>/);
  assert.match(source, /className="inline-flex md:hidden"/);
  assert.match(source, /!isSystem && visibleReactions\.length > 0/);
  assert.match(source, /import \{ placeTouchMessageContextMenu \} from "\.\/messageContextMenuPosition";/);
  assert.match(source, /setCtxMenu\(placeTouchMessageContextMenu\(\{ x, y \}\)\)/);
  assert.doesNotMatch(source, /positionTouchActionMenuFromRect/);
  assert.match(source, /positionReactionPickerFromRect\(target\.getBoundingClientRect\(\)\)/);
  assert.match(source, /QUICK_REACTION_EMOJIS\.map\(\(emoji\) => \(/);
  assert.match(source, /active:bg-\[#E0DED4\]/);
  // Quick-reaction row appears in BOTH the desktop right-click menu and the
  // mobile long-press menu (stdrc 2026-05-14 #proj-mobile:a8293493
  // msg=2cebeb18 "桌面端和移动端的菜单保持一致"). Previously gated on
  // `ctxMenu.source === "touch"`; now rendered unconditionally for any
  // non-system message. Data attribute renamed from
  // `mobile-reaction-quick-row` to `reaction-quick-row` since it is no
  // longer mobile-only.
  assert.match(source, /data-message-affordance="reaction-quick-row"/);
  assert.doesNotMatch(source, /data-message-affordance="mobile-reaction-quick-row"/);
  assert.match(source, /<ReactionGlyph emoji=\{emoji\} size=\{18\} className="block" \/>/);
  assert.match(source, /className="flex size-7 items-center justify-center/);
  // Row itself no longer carries `border-b border-black/20` — the visual
  // separator below it is a standalone `<div className="border-t-2
  // border-black" />` matching the in-menu section dividers (CLAUDE.md
  // "Menu dividers") so it's the same weight/color as the divider above
  // the action section that now starts with "Open Thread" and continues into
  // "Save Message" (stdrc msg=ed2eee8c "不需要比 save message 上面的线
  // 更粗 ... 只要一样就行"; cindyz msg=ea046014 later inserted Open Thread
  // above Save Message in that same section).
  assert.match(source, /className="flex h-9 items-center gap-1 bg-white px-2"/);
  assert.doesNotMatch(source, /flex h-9 items-center gap-1 border-b border-black\/20 bg-white px-2/);
  // Structural invariant: the divider immediately following the
  // quick-reaction row must equal the divider immediately preceding the
  // action section that contains "Open Thread" and then "Save Message"
  // (extracted from source, compared as strings).
  // The two dividers are physically the same in-menu section separator;
  // if the canonical menu-divider primitive migrates, BOTH must move
  // together — single-sided drift fails this assertion. We match the
  // canonical `<ContextMenuDivider />` primitive (extracted 2026-05-24)
  // OR any legacy `<div className="…" />` inline form so the test
  // surfaces drift in either direction.
  const reactionRowFollowingDivider = source.match(
    /data-message-affordance="reaction-quick-row"[\s\S]*?<\/div>\s*(<ContextMenuDivider \/>|<div className="[^"]+" \/>)/,
  );
  const actionSectionPrecedingDivider = source.match(
    /(<ContextMenuDivider \/>|<div className="[^"]+" \/>)\s*\{!\s*hideThreadActions && \([\s\S]*?Open Thread[\s\S]*?\)\}\s*<MenuItem[\s\S]*?\{isSaved \? <BookmarkMinus/,
  );
  assert.ok(
    reactionRowFollowingDivider,
    "reaction-quick-row must be followed by a ContextMenuDivider",
  );
  assert.ok(
    actionSectionPrecedingDivider,
    "Open Thread / Save Message action section must be preceded by a ContextMenuDivider",
  );
  assert.equal(
    reactionRowFollowingDivider![1],
    actionSectionPrecedingDivider![1],
    "reaction-quick-row's trailing divider must equal the Open Thread / Save Message section divider — they are the same in-menu section separator and cannot drift independently",
  );
  // "Share Messages…" sits in the same section as Copy Link / Copy
  // Markdown, immediately after Copy Markdown, with NO divider between
  // Copy Markdown and Share Messages (stdrc msg=ad3320ce "share
  // messages 可能应该放到 copy markdown 下面，并且跟 copy markdown 在
  // 同一个 section 里面").
  assert.match(
    source,
    /Copy Markdown\s*<\/MenuItem>\s*\{\(\(\) => \{[\s\S]*?<Share2 size=\{14\} \/>[\s\S]*?Share Messages…/,
  );
  assert.doesNotMatch(source, /bottom: "calc\(env\(safe-area-inset-bottom, 0px\) \+ 12px\)"/);
  assert.doesNotMatch(source, /handleContextQuickReactionClick/);
  assert.doesNotMatch(source, /More…|More\.\.\./);
  assert.match(source, /data-message-affordance="reaction-reactors-popover"/);
  assert.match(source, /role="tooltip"/);
  assert.match(source, /onMouseEnter=\{\(event\) => showReactionPopover\(reaction, event\.currentTarget\)\}/);
  assert.match(source, /onFocus=\{\(event\) => showReactionPopover\(reaction, event\.currentTarget\)\}/);
  assert.match(source, /className="pointer-events-none fixed z-\[80\]/);
  assert.doesNotMatch(source, /reaction-reactors-popover[\s\S]{0,220}shadow-brutal-sm/);
  // The reaction picker is a transient, click-outside-dismissable overlay,
  // so it gets the `shadow-soft-popover` token (`0 4px 12px rgba(0,0,0,0.08)`
  // in index.css) instead of `shadow-brutal*`. See CLAUDE.md "Shadow
  // Boundary — Hard vs Soft". Don't replace this with an inline rgba
  // shadow — the contract requires the named token.
  assert.match(source, /shadow-soft-popover[\s\S]{0,400}data-message-affordance="reaction-picker"/);
  assert.match(source, /className="flex max-w-60 flex-wrap items-center gap-y-0\.5"/);
  assert.match(source, /<span className="max-w-28 truncate">\{name\}<\/span>/);
  assert.match(source, /const currentViewerReacted = !!viewerUserId && reaction\.reactorIds\.includes\(viewerUserId\);/);
  assert.match(source, /"You",/);
  assert.match(source, /const visibleNames = reactorNames\.slice\(0, 5\);/);
  assert.match(source, /<span className="shrink-0 text-black\/45">, <\/span>/);
  assert.match(source, /x: rect\.left/);
  assert.match(source, /y: rect\.bottom \+ 4/);
  assert.doesNotMatch(source, /transform: "translateX\(-50%\)"/);
  assert.match(source, /\+{reactionPopover\.hiddenCount} more/);
  assert.match(source, /visibleReactions\.length > 0 \|\|/);
  assert.doesNotMatch(source, /text-\[11px\] font-bold uppercase tracking-wide text-black\/50">React</);
  assert.doesNotMatch(source, /bg-brutal-yellow text-black/);
});


test("message store reaction updates also patch the currently visible sparse window", () => {
  const source = readFileSync(resolve(repoRoot, "src/store/messageStore.ts"), "utf8");

  assert.match(source, /const mergeIntoRows = \(rows: Message\[\]\) => \{/);
  assert.match(source, /const bucketUpdate = bucket \? mergeIntoRows\(bucket\) : \{ changed: false, merged: \[\] as Message\[\] \};/);
  assert.match(source, /const visibleUpdate = mergeIntoRows\(state\.messages\);/);
  assert.match(source, /if \(!bucketUpdate\.changed && !visibleUpdate\.changed\) return state;/);
  assert.match(source, /messages: visibleUpdate\.changed \? visibleUpdate\.merged : state\.messages,/);
});
