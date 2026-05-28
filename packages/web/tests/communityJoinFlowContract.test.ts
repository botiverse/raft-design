import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(repoRoot, path), "utf8");

test("community join agreement handling lives in one shared flow", () => {
  const flow = read("src/hooks/useJoinCommunityFlow.tsx");

  assert.match(flow, /export function useJoinCommunityFlow/);
  assert.match(flow, /CommunityAgreementDialog/);
  assert.match(flow, /response\?\.error === "agreement_required"/);
  assert.match(flow, /response\?\.error === "agreement_changed"/);
  assert.match(flow, /joinCommunityServer\(\{ agreementId, slug: pendingCommunitySlug \}\)/);
  assert.match(flow, /navigate\(`\/s\/\$\{server\.slug\}`\)/);
});

test("server switcher and onboarding wizard both consume the shared community join flow", () => {
  const serverSwitcher = read("src/components/ui/ServerSwitcherMenu.tsx");
  const onboarding = read("src/components/layout/OwnerOnboardingModal.tsx");

  assert.match(serverSwitcher, /import \{ useJoinCommunityFlow \} from "\.\.\/\.\.\/hooks\/useJoinCommunityFlow";/);
  assert.match(serverSwitcher, /const communityJoinFlow = useJoinCommunityFlow\(/);
  assert.match(serverSwitcher, /\{communityJoinFlow\.agreementDialog\}/);

  assert.match(onboarding, /import \{ useJoinCommunityFlow \} from "\.\.\/\.\.\/hooks\/useJoinCommunityFlow";/);
  assert.match(onboarding, /const communityJoinFlow = useJoinCommunityFlow\(/);
  assert.match(onboarding, /\{communityJoinFlow\.agreementDialog\}/);

  assert.doesNotMatch(
    onboarding,
    /joinCommunityServer = useServerStore/,
    "onboarding must not bypass the shared agreement + navigation flow",
  );
});
