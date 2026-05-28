import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("add-members action dialog reuses the Channel Members list chrome", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/channel/AddMembersDialog.tsx"), "utf8");
  const membersSource = readFileSync(resolve(repoRoot, "src/components/agent/ChannelMembers.tsx"), "utf8");
  const primitiveSource = readFileSync(resolve(repoRoot, "src/components/channel/ChannelMemberList.tsx"), "utf8");

  assert.match(source, /ChannelMemberListShell/);
  assert.match(source, /ChannelMemberRow/);
  assert.match(membersSource, /ChannelMemberListShell/);
  assert.match(membersSource, /ChannelMemberRow/);
  assert.doesNotMatch(source, /import PixelAvatar/);

  assert.match(source, /data-testid="add-members-action-list"/);
  assert.match(primitiveSource, /max-h-72 overflow-y-auto border-2 border-black bg-white shadow-brutal-sm/);
  assert.match(primitiveSource, /import SectionEyebrow from "\.\.\/ui\/SectionEyebrow";/);
  assert.match(primitiveSource, /<SectionEyebrow as="div" className="bg-white\/50 px-3 py-1\.5">/);
  assert.match(primitiveSource, /context="members-row"[\s\S]*?type=\{type\}/);
  assert.match(primitiveSource, /AgentActivityDot/);
  assert.match(primitiveSource, /hover:bg-brutal-yellow\/30/);
});

test("add-members action dialog removes candidates with the Members-page X affordance", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/channel/AddMembersDialog.tsx"), "utf8");

  const primitiveSource = readFileSync(resolve(repoRoot, "src/components/channel/ChannelMemberList.tsx"), "utf8");

  assert.match(source, /ChannelMemberRemoveButton/);
  assert.doesNotMatch(source, /revealOnRowHover=\{false\}/);
  assert.match(primitiveSource, /revealOnRowHover = true/);
  assert.match(primitiveSource, /flex md:hidden md:group-hover:flex/);
  assert.match(primitiveSource, /bg-brutal-red\/20 text-black transition-colors hover:bg-brutal-red\/60/);
  assert.match(primitiveSource, /<X size=\{12\} \/>/);
  assert.match(source, /if \(!selectedHumanIds\.has\(m\.userId\)\) return null;/);
  assert.match(source, /if \(!selectedAgentIds\.has\(a\.id\)\) return null;/);
  assert.ok(
    source.indexOf("<ChannelMemberSectionHeader>Agents</ChannelMemberSectionHeader>") <
      source.indexOf("<ChannelMemberSectionHeader>Humans</ChannelMemberSectionHeader>"),
    "ADD MEMBERS should keep the same Agents-before-Humans order as Channel Members",
  );
  assert.doesNotMatch(source, /SelectionMark/);
  assert.doesNotMatch(source, /aria-pressed=\{selected\}/);
  assert.match(source, /Add \$\{selectedHumanIds\.size \+ selectedAgentIds\.size\} member/);
});

test("channel member remove affordance is not hover-gated on mobile", () => {
  const primitiveSource = readFileSync(resolve(repoRoot, "src/components/channel/ChannelMemberList.tsx"), "utf8");

  assert.match(
    primitiveSource,
    /revealOnRowHover \? "flex md:hidden md:group-hover:flex" : "flex"/,
    "touch users cannot hover member rows; default remove buttons must be visible below md and hover-gated only on desktop",
  );
  assert.doesNotMatch(
    primitiveSource,
    /revealOnRowHover \? "hidden group-hover:flex" : "flex"/,
    "the old hover-only recipe made channel agent removal unreachable on mobile",
  );
});
