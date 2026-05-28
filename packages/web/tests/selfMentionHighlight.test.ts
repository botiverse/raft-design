import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("self mention uses the inbox mention-you yellow treatment", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/message/MentionLink.tsx"), "utf8");

  assert.match(source, /useAuthStore/);
  assert.match(source, /const viewerUserId = useAuthStore\(\(s\) => s\.user\?\.id \?\? null\);/);
  assert.match(source, /const isSelfMention = mentionType === "user" && viewerUserId === mentionId;/);
  // Self-mention keeps the yellow "you were mentioned" treatment but now
  // composes the shared MSG_REF_CHIP box so it's the same height as every
  // other ref chip + inline code (Huarong review #proj-message:ca65d96d,
  // task #28). Box recipe is pinned in messageReferencePatterns.test.ts.
  assert.match(source, /import \{ MSG_REF_CHIP \} from "\.\/messageRefChip"/);
  assert.match(source, /isSelfMention[\s\S]{0,80}`\$\{MSG_REF_CHIP\} bg-brutal-yellow hover:bg-brutal-yellow\/80`/);
  assert.doesNotMatch(source, /leading-\[21px\]/);
  assert.match(source, /"underline decoration-black\/30 decoration-2 underline-offset-2 hover:text-brutal-pink hover:decoration-brutal-pink"/);
});

test("agent mentions never use the self-mention highlight", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/message/MentionLink.tsx"), "utf8");

  assert.doesNotMatch(source, /mentionType !== "agent" && viewerUserId === mentionId/);
  assert.match(source, /mentionType === "user" && viewerUserId === mentionId/);
});
