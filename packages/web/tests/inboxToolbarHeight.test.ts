import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("inbox filter toolbar keeps a fixed height when mark-all-read appears", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/thread/ThreadsInbox.tsx"),
    "utf8",
  );

  assert.match(
    source,
    /className="flex h-\[54px\] shrink-0 items-center justify-between gap-3 border-b-2 border-black bg-white px-4"/,
  );
  assert.match(
    source,
    /className="btn-brutal-sm inline-flex h-7 shrink-0 items-center whitespace-nowrap bg-white px-2 text-xs font-bold"/,
  );
});

test("inbox toolbar uses the same horizontal rail as inbox rows", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/thread/ThreadsInbox.tsx"),
    "utf8",
  );

  assert.match(
    source,
    /data-testid="inbox-toolbar"\s+className="[^"]*px-4"/,
    "filter tabs and mark-all-read should align with the inbox card rail",
  );
  assert.match(
    source,
    /data-testid="inbox-scroll"\s+className="[^"]*p-4/,
    "inbox row cards live inside the same 16px content inset",
  );
});

test("filter toolbars use the same horizontal rail as their result content", () => {
  const searchSource = readFileSync(
    resolve(repoRoot, "src/components/search/MessageSearchPage.tsx"),
    "utf8",
  );
  const tasksSource = readFileSync(
    resolve(repoRoot, "src/components/task/TasksPanel.tsx"),
    "utf8",
  );
  const channelTasksSource = readFileSync(
    resolve(repoRoot, "src/components/task/TaskBoard.tsx"),
    "utf8",
  );

  assert.match(
    searchSource,
    /className="shrink-0 border-b-2 border-black bg-white px-4 py-3"/,
    "search filter toolbar should align with its p-4 results rail",
  );
  assert.match(
    searchSource,
    /<div className="p-4">/,
    "search results should keep the matching 16px content rail",
  );
  assert.doesNotMatch(
    searchSource,
    /className="shrink-0 border-b-2 border-black bg-white px-5 py-3"/,
    "search filter toolbar must not drift back to the header px-5 rail",
  );

  assert.match(
    tasksSource,
    /className="shrink-0 border-b-2 border-black bg-white px-4 py-3"/,
    "tasks filter toolbar should align with its p-4 task board rail",
  );
  assert.match(
    tasksSource,
    /className="flex-1 overflow-auto bg-white p-4 safe-bottom"/,
    "tasks board should keep the matching 16px content rail",
  );
  assert.doesNotMatch(
    tasksSource,
    /className="shrink-0 border-b-2 border-black bg-white px-5 py-3"/,
    "tasks filter toolbar must not drift back to the header px-5 rail",
  );

  assert.match(
    channelTasksSource,
    /className="flex items-center gap-2 border-b-2 border-black bg-white px-3 py-3"/,
    "channel task toolbar keeps its compact embedded-panel rail",
  );
  assert.match(
    channelTasksSource,
    /className="flex-1 overflow-auto bg-white px-3 py-3"/,
    "channel task content matches the compact embedded-panel rail",
  );
});

test("inbox header uses the canonical main-panel horizontal padding", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/thread/ThreadsInbox.tsx"),
    "utf8",
  );
  const panelHeader = readFileSync(
    resolve(repoRoot, "src/components/ui/PanelHeader.tsx"),
    "utf8",
  );

  assert.match(source, /<PanelHeader\s+title="Activity"/);
  // stdrc 2026-05-14 #wg-theme:16123203 — PanelHeader flat `gap-3 px-5`,
  // no narrow-viewport shrink. Earlier `gap-2 px-3 sm:gap-3 sm:px-5`
  // (5/10 rule) was reverted; the wider BEFORE padding is canonical.
  assert.match(panelHeader, /className=\{`flex h-panel-header items-center gap-3 border-b-2 border-black bg-white px-5/);
});

test("main panel headers share the canonical horizontal padding contract", () => {
  const panelHeader = readFileSync(resolve(repoRoot, "src/components/ui/PanelHeader.tsx"), "utf8");
  // Flat `gap-3 px-5` at every breakpoint (stdrc 5/14). No `sm:` variant
  // in the className itself — the comment block above the className may
  // still reference the old rule for history.
  const panelHeaderClassName = panelHeader.match(/className=\{`([^`]+)`\}/)?.[1] ?? "";
  assert.match(panelHeaderClassName, /flex h-panel-header items-center gap-3 border-b-2 border-black bg-white px-5/);
  assert.doesNotMatch(panelHeaderClassName, /sm:gap-3|sm:px-5/, "PanelHeader className must not shrink at narrow breakpoints — stdrc 5/14 wants the wider BEFORE padding everywhere");

  const panelHeaderFiles = [
    "src/components/message/ChatPanel.tsx",
    "src/components/thread/ThreadsInbox.tsx",
    "src/components/saved/SavedPanel.tsx",
    "src/components/settings/SettingsPanel.tsx",
    "src/components/settings/ReleaseNotesPanel.tsx",
    "src/components/search/MessageSearchPage.tsx",
    "src/components/machine/MachineDetailPanel.tsx",
    "src/components/machine/MobileComputersPanel.tsx",
    "src/components/member/HumanDetailPanel.tsx",
    "src/components/message/ThreadPanel.tsx",
  ];

  for (const path of panelHeaderFiles) {
    const source = readFileSync(resolve(repoRoot, path), "utf8");
    assert.match(source, /<PanelHeader\b/, `${path} should use PanelHeader's canonical padding`);
  }

  const legacyRawHeaderFiles = [
    "src/components/task/TasksPanel.tsx",
    "src/components/task/LegacyTaskPanel.tsx",
  ];
  for (const path of legacyRawHeaderFiles) {
    const source = readFileSync(resolve(repoRoot, path), "utf8");
    assert.match(source, /className="flex h-panel-header items-center gap-3 border-b-2 border-black bg-(?:white|brutal-yellow) px-5/, `${path} should keep the legacy px-5 header contract until migrated`);
  }
});
