import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, relative } from "node:path";
import test from "node:test";
import {
  formatClock,
  formatClockWithSeconds,
  formatMessageTime,
  formatShortDateTime,
  normalizePreferredTimeFormat,
  resolveTimeFormatPreference,
} from "../src/utils/timeFormatting.js";

const repoRoot = resolve(import.meta.dirname, "..");

function readSource(path: string): string {
  return readFileSync(resolve(repoRoot, path), "utf8");
}

function sourceFilesUnder(path: string): string[] {
  const root = resolve(repoRoot, path);
  if (!existsSync(root)) return [];
  const results: string[] = [];
  const visit = (entry: string) => {
    const stat = statSync(entry);
    if (stat.isDirectory()) {
      for (const child of readdirSync(entry)) visit(resolve(entry, child));
      return;
    }
    if (/\.(tsx?|jsx?)$/.test(entry)) results.push(relative(repoRoot, entry));
  };
  visit(root);
  return results.sort();
}

test("time formatter honors explicit 12h and 24h UI preferences", () => {
  const value = "2026-05-14T13:05:00.000Z";
  const base = { locale: "en-US", timeZone: "UTC" };

  assert.equal(formatClock(value, { ...base, timeFormat: "24h" }), "13:05");
  assert.equal(formatClockWithSeconds(value, { ...base, timeFormat: "24h" }), "13:05:00");
  assert.equal(formatClock(value, { ...base, timeFormat: "12h" }), "01:05 PM");
  assert.equal(formatShortDateTime(value, { ...base, timeFormat: "24h" }), "May 14, 13:05");
  assert.equal(
    formatMessageTime(value, {
      ...base,
      timeFormat: "24h",
      now: new Date("2026-05-14T18:00:00.000Z"),
    }),
    "13:05",
  );
});

test("time format preference normalization keeps system-locale fallback separate from user override", () => {
  assert.equal(normalizePreferredTimeFormat("24H"), "24h");
  assert.equal(normalizePreferredTimeFormat("12h"), "12h");
  assert.equal(normalizePreferredTimeFormat("system"), null);
  assert.equal(resolveTimeFormatPreference("24h", "en-US"), "24h");
});

test("visible time display surfaces use the shared time formatter hook", () => {
  const surfaces = [
    "src/components/agent/AgentActivityLog.tsx",
    "src/components/agent/AgentDetailPanel.tsx",
    "src/components/agent/AgentRemindersSection.tsx",
    "src/components/agent/AgentWorkspace.tsx",
    "src/components/message/ChannelFilesPanel.tsx",
    "src/components/message/MessageItem.tsx",
    "src/components/message/QuotedMessagePermalinkPreview.tsx",
    "src/components/settings/SettingsPanel.tsx",
    "src/components/task/LegacyTaskPanel.tsx",
    "src/components/task/TaskItem.tsx",
  ];

  for (const surface of surfaces) {
    const source = readSource(surface);
    assert.match(source, /useTimeFormatter/, `${surface} should consume shared time formatting`);
  }
});

test("components and pages do not format UI times with raw browser APIs", () => {
  const offenders: string[] = [];
  const rawTimeFormatPattern = /toLocaleTimeString|toLocaleString\(|Intl\.DateTimeFormat/;

  for (const sourcePath of [
    ...sourceFilesUnder("src/components"),
    ...sourceFilesUnder("src/pages"),
  ]) {
    const source = readSource(sourcePath);
    if (rawTimeFormatPattern.test(source)) offenders.push(sourcePath);
  }

  assert.deepEqual(offenders, []);
});

test("display surfaces do not read the 24-hour preference outside the settings toggle", () => {
  const offenders: string[] = [];
  const preferencePattern = /preferredTimeFormat|effectiveTimeFormat/;
  const allowed = new Set(["src/components/settings/SettingsPanel.tsx"]);

  for (const sourcePath of [
    ...sourceFilesUnder("src/components"),
    ...sourceFilesUnder("src/pages"),
  ]) {
    if (allowed.has(sourcePath)) continue;
    const source = readSource(sourcePath);
    if (preferencePattern.test(source)) offenders.push(sourcePath);
  }

  assert.deepEqual(offenders, []);
});
