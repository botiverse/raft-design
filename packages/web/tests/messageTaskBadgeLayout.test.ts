import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("message task badge renders below content and constrains overflowing assignee text", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/message/MessageItem.tsx"), "utf8");
  const badgeSource = readFileSync(resolve(repoRoot, "src/components/ui/Badge.tsx"), "utf8");
  const statusBadgeSource = readFileSync(resolve(repoRoot, "src/components/task/StatusBadge.tsx"), "utf8");

  // MessageItem now renders the task badge through the shared <StatusBadge>
  // component (extracted in the action-cards refactor — both the task
  // status badge in MessageItem and the Done pill on action cards reuse
  // identical chrome). The editable trigger reuses the same badge class
  // recipe instead of the task-panel editor's larger trigger chrome.
  assert.match(source, /import \{ BadgeButton, brutalBadgeClassName \} from "\.\.\/ui\/Badge";/);
  assert.match(source, /import \{ StatusBadge \} from "\.\.\/task\/StatusBadge";/);
  // Base recipe stays one line; the `uppercase tracking-wide` axis is now
  // a separate array entry gated on the `uppercase` prop (default true).
  // stdrc msg=ce25da45 + msg=65681d15 (option B) — status badges that mix
  // label content with case-sensitive identifiers (`@assignee`) opt out.
  assert.match(badgeSource, /inline-flex h-5 min-w-0 max-w-full items-center gap-1 overflow-hidden whitespace-nowrap border border-black px-1\.5 text-\[10px\] font-bold leading-none/);
  assert.match(badgeSource, /uppercase \? "uppercase tracking-wide" : null,/);
  assert.match(statusBadgeSource, /<Badge tone=\{cfg\.tone\} uppercase=\{false\} className=\{className\} data-status=\{status\}/);
  assert.match(source, /<StatusBadge[\s\S]*?status=\{linkedTask\.status\}[\s\S]*?data-testid="message-task-badge"/);
  assert.match(source, /buttonTestId="message-task-badge"[\s\S]*?buttonClassName=\{brutalBadgeClassName\(\{ tone: cfg\.tone, uppercase: false, className: "transition-\[filter,opacity\] duration-100 hover:brightness-90/);
  assert.match(source, /buttonChildren=\{\([\s\S]*?<Icon size=\{10\} className="shrink-0" \/>[\s\S]*?<span className="shrink-0">#\{linkedTask\.taskNumber\}<\/span>/);
  assert.doesNotMatch(source, /<Pencil size=\{10\} className="shrink-0 opacity-40" \/>/);
  assert.doesNotMatch(source, /taskBadgePosition/);
  assert.match(source, /Placement contract: task status is footer metadata/);

  const assigneeSpans = Array.from(source.matchAll(/<span className="([^"]*min-w-0[^"]*truncate[^"]*)"[^>]*>@\{linkedTask\.claimedByName\}<\/span>/g));
  assert.equal(assigneeSpans.length, 1, "assignee label must be the truncating flex child in the footer badge");
});

test("message footer badges use one compact height recipe", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/message/MessageItem.tsx"), "utf8");

  // Task badge now via <StatusBadge> (which wraps Badge); thread
  // replies still uses BadgeButton directly.
  assert.match(source, /<StatusBadge[\s\S]*?data-testid="message-task-badge"/);
  assert.match(source, /<BadgeButton[\s\S]*?data-testid="message-thread-replies-badge"/);
  assert.match(source, /data-testid="message-thread-replies-badge"[\s\S]*?bg-brutal-cyan\/20/);
  assert.doesNotMatch(source, /message-thread-replies-badge[\s\S]{0,240}\btext-xs\b/);
  assert.doesNotMatch(source, /message-thread-replies-badge[\s\S]{0,240}\bgap-1\.5\b/);
  assert.doesNotMatch(source, /message-thread-replies-badge[\s\S]{0,240}\bpx-2\b/);
});

test("thread reply badge includes unread reply count in the same pill", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/message/MessageItem.tsx"), "utf8");
  const threadStoreSource = readFileSync(resolve(repoRoot, "src/store/threadStore.ts"), "utf8");

  assert.match(threadStoreSource, /unreadCount: number;/);
  assert.match(threadStoreSource, /firstUnreadMessageId: string \| null;/);
  assert.match(source, /const threadUnreadCount = threadSummary\?\.unreadCount \?\? 0;/);
  assert.match(source, /const firstUnreadThreadMessageId = threadUnreadCount > 0 \? threadSummary\?\.firstUnreadMessageId \?\? null : null;/);
  assert.match(source, /const handleOpenThreadReplies = useCallback/);
  assert.match(source, /openThread\(chId, message\.id, firstUnreadThreadMessageId\);/);
  assert.match(source, /data-testid="message-thread-replies-badge"[\s\S]*?onClick=\{handleOpenThreadReplies\}/);
  assert.match(source, /threadUnreadCount > 0[\s\S]*?<span className="text-black\/45">·<\/span>[\s\S]*?<span>\{threadUnreadCount\} new<\/span>/);
  assert.doesNotMatch(source, /message-thread-replies-badge[\s\S]{0,420}\bbg-brutal-pink\b/);
});

test("channel member count stays inside a compact icon-text button", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/agent/ChannelMembers.tsx"), "utf8");
  const buttonSource = readFileSync(resolve(repoRoot, "src/components/ui/Button.tsx"), "utf8");

  assert.match(source, /<Button[\s\S]*?shape="iconText"[\s\S]*?className="min-w-7 gap-1 px-1\.5"/);
  assert.match(source, /<Users size=\{14\} className="shrink-0" \/>/);
  assert.match(source, /<span className="min-w-\[1ch\] text-center font-mono text-\[11px\] font-bold leading-none tabular-nums">/);
  assert.doesNotMatch(source, /h-8 min-w-8/);
  assert.doesNotMatch(source, /badge=/);
  assert.match(buttonSource, /iconText: "h-7 gap-1\.5 px-2\.5 text-xs"/);
  assert.doesNotMatch(buttonSource, /\bcount:/);
});
