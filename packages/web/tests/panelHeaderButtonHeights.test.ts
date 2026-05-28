import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("thread panel header action buttons share fixed h-7 height", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/message/ThreadPanel.tsx"),
    "utf8",
  );

  // View-in-channel button: square size-7 when label hides (<sm), expands
  // at sm+. Stops icon-only width from looking wider than canonical icon
  // btn (msg=d3d086e2).
  assert.match(
    source,
    /className="btn-brutal-sm flex size-7 shrink-0 items-center justify-center bg-white text-xs font-bold sm:w-auto sm:gap-1\.5 sm:px-2\.5"/,
  );
  // X close button: visible in modal (centered dialog), hidden in
  // mobile-modal (full-screen, back chevron), and `hidden lg:flex` in side
  // (msg=804c045d clarification).
  assert.match(
    source,
    /const closeButtonClassName = presentation === "modal"\s*\?\s*"btn-brutal-sm flex size-7 items-center justify-center bg-white"\s*:\s*"btn-brutal-sm hidden size-7 items-center justify-center bg-white lg:flex"/,
  );
});

test("profile panel header action buttons share fixed h-7 height", () => {
  const agentSource = readFileSync(
    resolve(repoRoot, "src/components/agent/AgentDetailPanel.tsx"),
    "utf8",
  );
  const humanSource = readFileSync(
    resolve(repoRoot, "src/components/member/HumanDetailPanel.tsx"),
    "utf8",
  );

  assert.match(
    agentSource,
    /className="btn-brutal-sm flex h-7 items-center justify-center gap-1\.5 bg-white px-2 text-xs font-bold sm:px-2\.5"/,
  );
  assert.match(
    humanSource,
    /className="btn-brutal-sm flex h-7 items-center gap-1\.5 bg-white px-2\.5 text-xs font-bold"/,
  );
  assert.match(
    agentSource,
    /className="btn-brutal-sm hidden size-7 items-center justify-center bg-white md:flex"/,
  );
  assert.match(
    humanSource,
    /className="btn-brutal-sm hidden size-7 items-center justify-center bg-white md:flex"/,
  );
  assert.doesNotMatch(
    agentSource,
    /h-panel-header[\s\S]{0,2000}title=\{diagnosticCopied \? "Diagnostic info copied" : "Copy Diagnostic Info"\}/,
  );
});

test("secondary panel header icon actions use the shared h-7 icon button contract", () => {
  const panelFiles = [
    "src/components/message/ChatPanel.tsx",
    "src/components/thread/ThreadsInbox.tsx",
    "src/components/saved/SavedPanel.tsx",
    "src/components/settings/SettingsPanel.tsx",
    "src/components/settings/ReleaseNotesPanel.tsx",
    "src/components/search/MessageSearchPage.tsx",
    "src/components/machine/MachineDetailPanel.tsx",
    "src/components/machine/MobileComputersPanel.tsx",
    "src/components/task/LegacyTaskPanel.tsx",
    "src/components/message/SelectShareLightbox.tsx",
  ];

  for (const file of panelFiles) {
    const source = readFileSync(resolve(repoRoot, file), "utf8");
    assert.doesNotMatch(source, /h-panel-header[\s\S]{0,1200}btn-brutal-sm[^"]*p-1\.5/);
  }

  const buttonSource = readFileSync(resolve(repoRoot, "src/components/ui/Button.tsx"), "utf8");
  assert.match(buttonSource, /icon: "size-7 text-xs"/);
  assert.match(buttonSource, /text: "h-7 px-2\.5 text-xs"/);
  assert.match(buttonSource, /iconText: "h-7 gap-1\.5 px-2\.5 text-xs"/);
  assert.doesNotMatch(buttonSource, /\bcount:/);
});
