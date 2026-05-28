import assert from "node:assert/strict";
import test from "node:test";
import {
  getAgentDaemonReleaseNotesBetween,
  getAgentDaemonReleaseNotice,
} from "./agentDaemonReleaseNotes.js";

// 0.40.2 is the bootstrap baseline: every agent-facing change shipped from
// 0.40.2 onward is in the catalog. These tests pin that contract so that the
// baseline can't drift forward (e.g. to 0.40.3) without an explicit decision.

test("agent-facing release notes: 0.40.1 -> 0.41.0 surfaces both v0.40.2 and v0.41.0 entries", () => {
  const notes = getAgentDaemonReleaseNotesBetween("0.40.1", "0.41.0");
  const versions = notes.map((n) => n.version);
  assert.deepEqual(versions, ["0.40.2", "0.41.0"]);
});

test("agent-facing release notes: 0.40.2 -> 0.41.0 surfaces only v0.41.0 entries (baseline floor not redelivered)", () => {
  const notes = getAgentDaemonReleaseNotesBetween("0.40.2", "0.41.0");
  const versions = notes.map((n) => n.version);
  assert.deepEqual(versions, ["0.41.0"]);
});

test("agent-facing release notice: 0.40.1 -> 0.41.0 includes Activity Log mirror (v0.40.2) and wake-up redirect (v0.41.0) copy", () => {
  const notice = getAgentDaemonReleaseNotice("0.40.1", "0.41.0");
  assert.ok(notice);
  const allCopy = notice.notes
    .flatMap((n) => n.entries)
    .map((e) => e.summary)
    .join(" | ");
  assert.match(allCopy, /Runtime Profile.*mirrored into Activity Log/);
  assert.match(allCopy, /wake-up tools.*route through Slock reminders/);
});

test("agent-facing release notice: 0.40.2 -> 0.41.0 omits Activity Log mirror copy", () => {
  const notice = getAgentDaemonReleaseNotice("0.40.2", "0.41.0");
  assert.ok(notice);
  const allCopy = notice.notes
    .flatMap((n) => n.entries)
    .map((e) => e.summary)
    .join(" | ");
  assert.doesNotMatch(allCopy, /Runtime Profile.*mirrored into Activity Log/);
  assert.match(allCopy, /wake-up tools.*route through Slock reminders/);
});

test("agent-facing release notes: 0.41.0 -> 0.42.0 surfaces only v0.42.0 entries", () => {
  const notes = getAgentDaemonReleaseNotesBetween("0.41.0", "0.42.0");
  const versions = notes.map((n) => n.version);
  assert.deepEqual(versions, ["0.42.0"]);
});

test("agent-facing release notice: 0.41.0 -> 0.42.0 includes runtime switch + runtime context + profile CLI + channel members copy", () => {
  const notice = getAgentDaemonReleaseNotice("0.41.0", "0.42.0");
  assert.ok(notice);
  const allCopy = notice.notes
    .flatMap((n) => n.entries)
    .map((e) => e.summary)
    .join(" | ");
  assert.match(allCopy, /runtime can be switched.*Claude.*Codex.*Kimi/);
  assert.match(allCopy, /current runtime and model are now exposed/);
  assert.match(allCopy, /slock profile show and slock profile update/);
  assert.match(allCopy, /slock channel members is now advertised/);
});

test("agent-facing release notes: 0.42.0 -> 0.43.0 surfaces only v0.43.0 entries", () => {
  const notes = getAgentDaemonReleaseNotesBetween("0.42.0", "0.43.0");
  const versions = notes.map((n) => n.version);
  assert.deepEqual(versions, ["0.43.0"]);
});

test("agent-facing release notice: 0.42.0 -> 0.43.0 includes OpenCode runtime + public channel write contract + profile flags + workspace contract copy", () => {
  const notice = getAgentDaemonReleaseNotice("0.42.0", "0.43.0");
  assert.ok(notice);
  const allCopy = notice.notes
    .flatMap((n) => n.entries)
    .map((e) => e.summary)
    .join(" | ");
  assert.match(allCopy, /OpenCode joins.*supported agent runtime/);
  assert.match(allCopy, /Public channels enforce join-to-write/);
  assert.match(allCopy, /slock profile update now accepts --display-name/);
  assert.match(allCopy, /flexible, agent-owned workspace/);
});

test("agent-facing release notes: 0.43.0 -> 0.44.0 surfaces only v0.44.0 entries", () => {
  const notes = getAgentDaemonReleaseNotesBetween("0.43.0", "0.44.0");
  const versions = notes.map((n) => n.version);
  assert.deepEqual(versions, ["0.44.0"]);
});

test("agent-facing release notice: 0.43.0 -> 0.44.0 includes reminder snooze + silent claim failure + online recovery", () => {
  const notice = getAgentDaemonReleaseNotice("0.43.0", "0.44.0");
  assert.ok(notice);
  const allCopy = notice.notes
    .flatMap((n) => n.entries)
    .map((e) => e.summary)
    .join(" | ");
  assert.match(allCopy, /slock reminder gains snooze, update/);
  assert.match(allCopy, /slock task claim now stays silent/);
  assert.match(allCopy, /Agents stay online through daemon reconnects/);
  // Status dot sweep is not agent-observable (pure UI), so it does not
  // ship in the agent-facing notice. Per tygg 2026-05-03
  // #proj-release:29e3073f msg=52af2b56.
  assert.doesNotMatch(allCopy, /sweep-from-daemon/);
});

test("agent-facing release notes: 0.44.0 -> 0.46.0 surfaces only v0.46.0 entries", () => {
  const notes = getAgentDaemonReleaseNotesBetween("0.44.0", "0.46.0");
  const versions = notes.map((n) => n.version);
  assert.deepEqual(versions, ["0.46.0"]);
});

test("agent-facing release notes: 0.46.0 -> 0.46.1 surfaces only v0.46.1 entries", () => {
  const notes = getAgentDaemonReleaseNotesBetween("0.46.0", "0.46.1");
  const versions = notes.map((n) => n.version);
  assert.deepEqual(versions, ["0.46.1"]);
});

test("agent-facing release notice: 0.46.0 -> 0.46.1 includes Gemini Windows fix + reply-target hints + membership notifications + workspace scoping + txt preview", () => {
  const notice = getAgentDaemonReleaseNotice("0.46.0", "0.46.1");
  assert.ok(notice);
  const allCopy = notice.notes
    .flatMap((n) => n.entries)
    .map((e) => e.summary)
    .join(" | ");
  assert.match(allCopy, /Gemini agents on Windows.*8191-char/);
  assert.match(allCopy, /Daemon delivery prompts now include a reply-target hint/);
  assert.match(allCopy, /Channel membership changes.*delivered as a system message/);
  assert.match(allCopy, /Other agents' workspaces and activity logs are no longer visible/);
  assert.match(allCopy, /Plain-text.*attachments now preview inline/);
});

test("agent-facing release notice: 0.44.0 -> 0.46.0 includes stdin recovery + non-stdin recovery + Gemini transport unify + delivery-state guard + N26 release_notice prompt fix + private channels + search sort/sender + attachment limits + runtime error persist + gated/startup notice + Claude MCP preserve + stalled stdin restart + OpenCode model + reminder lifecycle prompt", () => {
  const notice = getAgentDaemonReleaseNotice("0.44.0", "0.46.0");
  assert.ok(notice);
  const allCopy = notice.notes
    .flatMap((n) => n.entries)
    .map((e) => e.summary)
    .join(" | ");
  // Original 0.45.0 entries (5/4 prep, never published; consolidated into the
  // 5/7 publish as 0.46.0 per tygg #proj-release:145d82c4 msg=1ced8605 —
  // skip the never-shipped 0.45.0 tag to keep daemon version history
  // aligned with npm-visible tags).
  assert.match(allCopy, /stdin-driven runtimes.*recover automatically/);
  assert.match(allCopy, /Non-stdin runtimes.*Cursor, Gemini, OpenCode.*recover stale deliveries/);
  assert.match(allCopy, /If you run on Gemini.*same Slock CLI transport/);
  assert.match(allCopy, /guards in-flight delivery state/);
  // 5/4 -> 5/7 additions appended into the same 0.46.0 block.
  assert.match(allCopy, /Daemon release notices no longer claim a runtime control action/);
  assert.match(allCopy, /Channels can be private \(membership-gated\)/);
  assert.match(allCopy, /slock message search adds --sort relevance\|recent/);
  assert.match(allCopy, /Attachment uploads cap at 50MB and reject empty files/);
  assert.match(allCopy, /Visible runtime errors persist after turn end/);
  assert.match(allCopy, /Runtime Profile notice delivery now also fires reliably for gated and startup runtimes/);
  assert.match(allCopy, /your user-side MCP plugins are preserved/);
  assert.match(allCopy, /Stalled stdin runtimes are restarted automatically/);
  assert.match(allCopy, /OpenCode model is detected from the OpenCode CLI itself/);
  assert.match(allCopy, /Reminder lifecycle.*described fully in your system prompt/);
  assert.match(allCopy, /Gemini's static model catalog matches what the runtime actually supports/);
});

test("agent-facing release notes: 0.53.0 -> 0.54.0 surfaces only v0.54.0 entries", () => {
  const notes = getAgentDaemonReleaseNotesBetween("0.53.0", "0.54.0");
  const versions = notes.map((n) => n.version);
  assert.deepEqual(versions, ["0.54.0"]);
});

test("agent-facing release notice: 0.53.0 -> 0.54.0 includes Antigravity runtime + Runtime Profile session reset + 0.53.x informational-notice delivery fix + Codex premature-terminal fix + action-card computer constraints + Cursor Windows env", () => {
  const notice = getAgentDaemonReleaseNotice("0.53.0", "0.54.0");
  assert.ok(notice);
  const allCopy = notice.notes
    .flatMap((n) => n.entries)
    .map((e) => e.summary)
    .join(" | ");
  assert.match(allCopy, /Antigravity joins.*supported agent runtime/);
  assert.match(allCopy, /Runtime Profile change applies, the session is treated as a fresh start/);
  assert.match(allCopy, /Informational daemon notices no longer block ordinary message delivery/);
  assert.match(allCopy, /Codex-runtime turns no longer wedge silently after a terminal event/);
  assert.match(allCopy, /Action cards that target a specific computer/);
  assert.match(allCopy, /Runtime mute and false-stall observability is sharper/);
  assert.match(allCopy, /On Windows, Cursor runtimes now inherit the user's environment/);
  assert.match(allCopy, /Stuck runtime startup now times out/);
  // Daemon-internal items dropped from agent-facing catalog per tygg
  // #proj-release:60302ee8 msg=7189aa2d 2026-05-26 ("这些 Agent 看不到。这些偏向于 Daemon 的改动"):
  // login-required diagnostic class, Codex OAuth invalidation auth-required,
  // daemon-refresh wakeability re-arm, Windows Claude/Gemini/credential-proxy
  // launch-path fixes — all observable to humans/operators in diagnostic
  // surfaces, not by the agent itself.
  assert.doesNotMatch(allCopy, /Runtime login-required failures are now surfaced/);
  assert.doesNotMatch(allCopy, /Codex OAuth invalidation is now treated as auth-required/);
  assert.doesNotMatch(allCopy, /After a daemon refresh, the wakeability path/);
  assert.doesNotMatch(allCopy, /Windows Claude launches no longer hit `spawn EINVAL`/);
  // Joint-channel items are botiverse-scoped and intentionally NOT in the
  // general release catalog (stdrc #proj-release:60302ee8 msg=4fe885d2/a2384580
  // 2026-05-26).
  assert.doesNotMatch(allCopy, /Joint channels.*Activity feed/);
});

test("agent-facing release notes: 0.54.0 -> 0.54.2 surfaces v0.54.1 and v0.54.2 entries", () => {
  const notes = getAgentDaemonReleaseNotesBetween("0.54.0", "0.54.2");
  const versions = notes.map((n) => n.version);
  assert.deepEqual(versions, ["0.54.1", "0.54.2"]);
});

test("agent-facing release notice: 0.54.0 -> 0.54.2 includes proxy env honor + credential proxy streaming guard + local slock proxy bypass + structured spawn failure + OpenCode replay recovery", () => {
  const notice = getAgentDaemonReleaseNotice("0.54.0", "0.54.2");
  assert.ok(notice);
  const allCopy = notice.notes
    .flatMap((n) => n.entries)
    .map((e) => e.summary)
    .join(" | ");
  assert.match(allCopy, /honor `HTTP_PROXY` \/ `HTTPS_PROXY`/);
  assert.match(allCopy, /credential proxy.*guards against streaming failures/);
  assert.match(allCopy, /local `slock` CLI wrapper now bypasses `HTTP_PROXY`/);
  assert.match(allCopy, /Runtime spawn failures now surface a structured error/);
  assert.match(allCopy, /OpenCode runtimes recover automatically when the upstream rejects a session replay/);
});
