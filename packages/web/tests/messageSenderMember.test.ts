import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { resolveMessageSenderMember, resolveMessageSenderMemberFromList } from "../src/utils/messageSenderMember.js";
import type { User } from "../src/store/authStore.js";
import type { Message } from "../src/store/messageStore.js";
import type { ServerMember } from "../src/store/serverStore.js";

const currentUser: User = {
  id: "user-1",
  email: "me@slock.test",
  gravatarHash: "selfhash",
  name: "me",
  displayName: "Me",
  description: "Current user",
  avatarUrl: "/api/avatars/users/self.webp",
  emailVerified: true,
  preferredLanguage: null,
  preferredTimezone: null,
  autoTranslationEnabled: true,
  preferredTimeFormat: null,
  preferredMessageBodyFontSize: null,
  referralSource: null,
  referralSourceOther: null,
  referralSourceSkippedAt: null,
};

function userMessage(senderId: string): Pick<Message, "senderType" | "senderId"> {
  return { senderType: "user", senderId };
}

function member(overrides: Partial<ServerMember> = {}): ServerMember {
  return {
    userId: "user-1",
    email: "me@slock.test",
    gravatarHash: "hash",
    name: "me",
    displayName: "Me",
    description: null,
    avatarUrl: null,
    role: "owner",
    joinedAt: "2026-05-19T00:00:00.000Z",
    ...overrides,
  };
}

test("current user's message avatar falls back to auth profile when member cache is stale", () => {
  const resolved = resolveMessageSenderMember(
    userMessage("user-1"),
    new Map([["user-1", member({ avatarUrl: null })]]),
    currentUser,
  );

  assert.equal(resolved?.avatarUrl, "/api/avatars/users/self.webp");
  assert.equal(resolved?.role, "owner");
});

test("current user's message avatar still renders when member cache is missing", () => {
  const resolved = resolveMessageSenderMember(userMessage("user-1"), new Map(), currentUser);

  assert.equal(resolved?.avatarUrl, "/api/avatars/users/self.webp");
  assert.equal(resolved?.userId, "user-1");
  assert.equal(resolved?.email, null);
  assert.equal(resolved?.gravatarHash, "selfhash");
});

test("other users keep the server member profile", () => {
  const other = member({ userId: "user-2", avatarUrl: null });
  const resolved = resolveMessageSenderMember(
    userMessage("user-2"),
    new Map([["user-2", other]]),
    currentUser,
  );

  assert.equal(resolved, other);
});

test("member-list resolver keeps the current-user avatar fallback for preview surfaces", () => {
  const resolved = resolveMessageSenderMemberFromList(
    userMessage("user-1"),
    [member({ avatarUrl: null })],
    currentUser,
  );

  assert.equal(resolved?.avatarUrl, "/api/avatars/users/self.webp");
  assert.equal(resolved?.email, "me@slock.test");
  assert.equal(resolved?.gravatarHash, "hash");
});

test("current-user fallback member keeps auth gravatar hash when there is no uploaded avatar", () => {
  const resolved = resolveMessageSenderMember(
    userMessage("user-1"),
    new Map(),
    { ...currentUser, avatarUrl: null },
  );

  assert.equal(resolved?.avatarUrl, null);
  assert.equal(resolved?.gravatarHash, "selfhash");
  assert.equal(resolved?.email, null);
});

test("ThreadPanel uses current-user sender fallback for thread rows", () => {
  const source = readFileSync(
    resolve(import.meta.dirname, "../src/components/message/ThreadPanel.tsx"),
    "utf8",
  );

  assert.match(
    source,
    /import \{ resolveMessageSenderMember \} from "\.\.\/\.\.\/utils\/messageSenderMember";/,
    "ThreadPanel must use the same sender-member resolver as ChatPanel",
  );
  assert.match(
    source,
    /const currentUser = useAuthStore\(\(s\) => s\.user\);/,
    "ThreadPanel must read the auth profile for current-user avatar fallback",
  );
  assert.doesNotMatch(
    source,
    /senderMember=\{[^}]*memberById\.get\([^}]+senderId[^}]*\)/,
    "ThreadPanel must not bypass resolveMessageSenderMember when rendering user senders",
  );
  assert.doesNotMatch(
    source,
    /parentMessageSenderType === "user" \? memberById\.get\(followedThread\.parentMessageSenderId\)/,
    "ThreadPanel followed-thread fallback must not bypass resolveMessageSenderMember",
  );
  assert.match(
    source,
    /serverId: human\.serverId,[\s\S]*serverName: human\.serverName,[\s\S]*serverSlug: human\.serverSlug,/,
    "ThreadPanel must preserve joint peer server metadata when adapting channel humans",
  );
  assert.match(
    source,
    /previewSenderAgent=\{getPreviewSenderAgent\(msg\)\}/,
    "ThreadPanel replies must pass parent-channel agent previews into MessageItem",
  );
  assert.match(
    source,
    /previewSenderMember=\{getPreviewSenderMember\(msg\)\}/,
    "ThreadPanel replies must pass parent-channel human previews into MessageItem",
  );
});
