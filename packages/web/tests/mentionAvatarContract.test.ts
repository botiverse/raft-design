import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");
const messageInputSource = readFileSync(resolve(repoRoot, "src/components/message/MessageInput.tsx"), "utf8");
const mentionCandidatesSource = readFileSync(resolve(repoRoot, "src/components/message/mentionCandidates.ts"), "utf8");

test("@mention autocomplete candidates preserve human avatar identity data", () => {
  assert.match(
    mentionCandidatesSource,
    /gravatarHash\?: string \| null;/,
    "mention candidates must carry human Gravatar hashes for avatar fallback",
  );
  assert.match(
    mentionCandidatesSource,
    /email\?: string \| null;/,
    "mention candidates must carry the current user's email for self Gravatar fallback",
  );
  assert.match(
    messageInputSource,
    /gravatarHash: human\.gravatarHash/,
    "server members in @mention autocomplete must keep their Gravatar hash",
  );
  assert.match(
    messageInputSource,
    /email: currentUser\.email/,
    "the current user candidate must keep email for AvatarSlot's Gravatar fallback",
  );
});

test("@mention autocomplete uses AvatarSlot for humans instead of forced placeholders", () => {
  assert.match(
    messageInputSource,
    /function MentionCandidateAvatar[\s\S]*?<AvatarSlot[\s\S]*?type="human"[\s\S]*?humanAvatarUrl=\{candidate\.avatarUrl\}[\s\S]*?gravatarHash=\{candidate\.gravatarHash\}[\s\S]*?email=\{candidate\.email\}/,
    "human @mention suggestions should render the candidate's uploaded avatar and Gravatar fallback through AvatarSlot",
  );
  assert.match(
    messageInputSource,
    /humanPlaceholder=\{!candidate\.avatarUrl && !candidate\.gravatarHash && !candidate\.email\}/,
    "human @mention suggestions should only use the default placeholder when no avatar identity exists",
  );

  const dropdownSource = messageInputSource.slice(messageInputSource.indexOf("{/* @mention dropdown */"));
  assert.doesNotMatch(
    dropdownSource,
    /type="human"\s+humanPlaceholder(?!\=)/,
    "@mention dropdown must not force default human placeholders",
  );
});
