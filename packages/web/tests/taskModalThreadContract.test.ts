import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

function readSource(path: string): string {
  return readFileSync(resolve(repoRoot, path), "utf8");
}

test("tasks route opens task threads in a centered modal instead of the side panel", () => {
  const layoutSource = readSource("src/components/layout/MainLayout.tsx");
  const threadSource = readSource("src/components/message/ThreadPanel.tsx");

  assert.match(layoutSource, /import Modal from "\.\.\/Modal";/);
  assert.match(layoutSource, /const isTasksRoute = \/\\\/tasks\\\/\?\$\/\.test\(location\.pathname\);/);
  assert.match(layoutSource, /isTasksRoute && threadIsTop[\s\S]*<Modal onClose=\{closeThread\} closeOnBackdrop>[\s\S]*<ThreadPanelWrapper presentation="modal" \/>/);
  assert.match(threadSource, /presentation = "side"/);
  // task-thread-modal testid is shared by desktop modal + mobile-modal
  // presentations so detail-panel-layout / focus contracts can target either.
  assert.match(threadSource, /data-testid=\{presentation === "modal" \|\| presentation === "mobile-modal" \? "task-thread-modal" : undefined\}/);
  assert.match(threadSource, /h-\[min\(86vh,900px\)\][\s\S]*w-\[min\(960px,calc\(100vw-2rem\)\)\]/);
});

test("tasks route opens legacy tasks in the same centered modal pattern", () => {
  const layoutSource = readSource("src/components/layout/MainLayout.tsx");
  const legacyTaskSource = readSource("src/components/task/LegacyTaskPanel.tsx");

  assert.match(layoutSource, /const closeLegacyTask = useLegacyTaskPanelStore\(\(s\) => s\.closeLegacyTask\);/);
  assert.match(layoutSource, /isTasksRoute && legacyTaskOpen[\s\S]*<Modal onClose=\{closeLegacyTask\} closeOnBackdrop>[\s\S]*<LegacyTaskPanelWrapper presentation="modal" \/>/);
  assert.match(legacyTaskSource, /presentation = "side"/);
  assert.match(legacyTaskSource, /presentation === "modal"[\s\S]*h-\[min\(78vh,720px\)\][\s\S]*w-\[min\(760px,calc\(100vw-2rem\)\)\]/);
  assert.match(legacyTaskSource, /const showResizeHandle = presentation === "side";/);
});

// Mobile (no Rail, <md): panel renders directly without a Modal wrapper so
// it behaves like a regular full-screen thread overlay. Per stdrc 2026-05-21
// #proj-task:287f18ce msg=59d4256c — "只要显示 Rail，就应该显示为中间弹窗" —
// the rail-visible threshold is the md breakpoint (matches LeftRail's own
// `hidden md:flex`). At <md the back chevron is the close affordance; at md+
// it's the backdrop click + ESC.
test("tasks route uses rail-visible (md) breakpoint and mobile-modal at <md (no Modal wrap)", () => {
  const layoutSource = readSource("src/components/layout/MainLayout.tsx");
  const threadSource = readSource("src/components/message/ThreadPanel.tsx");
  const legacyTaskSource = readSource("src/components/task/LegacyTaskPanel.tsx");

  // RightPanel tracks the md breakpoint (Rail visible) and only wraps in
  // <Modal> at md+; <md renders the panel directly as mobile-modal.
  assert.match(layoutSource, /matchMedia\("\(min-width: 768px\)"\)/);
  assert.match(layoutSource, /isTasksRoute && threadIsTop[\s\S]*if \(railVisible\)[\s\S]*<Modal onClose=\{closeThread\} closeOnBackdrop>[\s\S]*<ThreadPanelWrapper presentation="modal" \/>[\s\S]*return <ThreadPanelWrapper presentation="mobile-modal" \/>/);
  assert.match(layoutSource, /isTasksRoute && legacyTaskOpen[\s\S]*if \(railVisible\)[\s\S]*<Modal onClose=\{closeLegacyTask\} closeOnBackdrop>[\s\S]*<LegacyTaskPanelWrapper presentation="modal" \/>[\s\S]*return <LegacyTaskPanelWrapper presentation="mobile-modal" \/>/);

  // mobile-modal CSS: simple absolute full-screen overlay (no Modal wrapper,
  // no fixed inset-0 — the parent layout already provides positioning).
  assert.match(threadSource, /presentation === "mobile-modal"\s*\?\s*"absolute inset-0 z-30 flex flex-col bg-white"/);
  assert.match(legacyTaskSource, /presentation === "mobile-modal"\s*\?\s*"absolute inset-0 z-30 flex flex-col bg-white"/);
});

// X close button visibility per stdrc 2026-05-21 #proj-task:287f18ce
// msg=804c045d: "它作为弹窗就需要叉；如果它是直接覆盖整个页面，就是返回."
//   modal        — X visible (centered dialog needs an explicit close)
//   mobile-modal — NO X (full-screen overlay; back chevron is the close)
//   side         — X on desktop only (`hidden lg:flex`)
//
// Also pins the View-in-channel button collapsing to size-7 when the label
// hides at <sm (msg=d3d086e2: "去掉文字之后，比正常的纯 icon btn 宽"), and
// the back-chevron breakpoint flip between side (lg) and modal /
// mobile-modal (md).
test("X close visibility is modal-only / non-mobile-modal, View-in-channel collapses to size-7 when label hides", () => {
  const threadSource = readSource("src/components/message/ThreadPanel.tsx");
  const legacyTaskSource = readSource("src/components/task/LegacyTaskPanel.tsx");

  // X close button skipped only in mobile-modal — modal and side both render it.
  assert.match(threadSource, /\{presentation !== "mobile-modal" && \(\s*<button[\s\S]*onClick=\{closeThread\}[\s\S]*<X size=\{14\}/);
  assert.match(legacyTaskSource, /\{presentation !== "mobile-modal" && \(\s*<button[\s\S]*onClick=\{closeLegacyTask\}[\s\S]*<X size=\{14\}/);

  // closeButtonClassName: modal → always flex; side → hidden lg:flex.
  assert.match(threadSource, /const closeButtonClassName = presentation === "modal"\s*\?\s*"btn-brutal-sm flex size-7 items-center justify-center bg-white"\s*:\s*"btn-brutal-sm hidden size-7 items-center justify-center bg-white lg:flex"/);
  assert.match(legacyTaskSource, /const closeButtonClassName = presentation === "modal"\s*\?\s*"btn-brutal-sm flex size-7 items-center justify-center bg-white"\s*:\s*"btn-brutal-sm hidden size-7 items-center justify-center bg-white lg:flex"/);

  // View-in-channel button collapses square at <sm, expands at sm+
  assert.match(threadSource, /"btn-brutal-sm flex size-7 shrink-0 items-center justify-center bg-white text-xs font-bold sm:w-auto sm:gap-1\.5 sm:px-2\.5"/);

  // Back chevron breakpoint: side → lg, modal / mobile-modal → md.
  assert.match(threadSource, /mobileBreakpoint=\{presentation === "side" \? "lg" : "md"\}/);
  assert.match(legacyTaskSource, /className=\{presentation === "side" \? "lg:hidden" : "md:hidden"\}/);
});
