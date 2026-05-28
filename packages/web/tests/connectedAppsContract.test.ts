import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

function readSource(path: string): string {
  return readFileSync(resolve(repoRoot, path), "utf8");
}

test("Settings Connected Apps only manages registered apps", () => {
  const source = readSource("src/components/settings/SettingsPanel.tsx");
  const integrationsSectionStart = source.indexOf("function IntegrationsSection()");
  const nextSectionStart = source.indexOf("function PreJoinAgreementSection()");
  const integrationsSection = source.slice(integrationsSectionStart, nextSectionStart);

  assert.match(integrationsSection, /connectedAppsLabel/);
  assert.match(integrationsSection, /Connected Apps/);
  assert.match(integrationsSection, /<ExperimentalBadge\b/);
  assert.doesNotMatch(integrationsSection, />\s*Beta\s*</);
  assert.match(integrationsSection, /Registered Apps/);
  assert.match(integrationsSection, /api\.get\("\/integrations\/clients"\)/);
  assert.match(integrationsSection, /api\.post\("\/integrations\/clients"/);
  assert.doesNotMatch(integrationsSection, /api\.get\("\/integrations\/overview"\)/);
  assert.doesNotMatch(integrationsSection, /Pending Approvals/);
  assert.doesNotMatch(integrationsSection, /Active Connections/);
  assert.doesNotMatch(integrationsSection, /Approve & Remember/);
  assert.doesNotMatch(integrationsSection, /\/integrations\/requests/);
  assert.doesNotMatch(integrationsSection, /\/integrations\/grants/);
});

test("Agent Apps tab shows connected apps, not pending approvals", () => {
  const source = readSource("src/components/agent/AgentDetailPanel.tsx");
  const tabStart = source.indexOf("function AgentIntegrationsTab");
  const nextSectionStart = source.indexOf("function EnvVarsSection");
  const tabSource = source.slice(tabStart, nextSectionStart);

  assert.match(source, /\{ id: "integrations", icon: Link2, label: "Apps" \}/);
  assert.match(tabSource, /const active = items\.filter\(\(item\) => item\.type === "active"\)/);
  assert.match(tabSource, /<SectionHeader\s+label="Connected Apps"/);
  assert.match(tabSource, /<SurfaceListItem key=\{item\.id\} className="space-y-2" interactive=\{false\}>/);
  assert.match(tabSource, /Connected Apps/);
  assert.match(tabSource, /No connected apps yet/);
  assert.doesNotMatch(tabSource, /Pending Requests/);
  assert.doesNotMatch(tabSource, /External apps waiting for approval/);
  assert.doesNotMatch(tabSource, /const pending =/);
});
