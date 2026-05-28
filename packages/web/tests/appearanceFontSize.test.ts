import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("message body font size preference exposes the three locked size classes", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/store/appearanceStore.ts"),
    "utf8",
  );

  assert.match(source, /value: "sm", label: "Small", sizeLabel: "12px", className: "text-xs"/);
  assert.match(source, /value: "md", label: "Medium", sizeLabel: "14px", className: "text-sm"/);
  assert.match(source, /value: "lg", label: "Large", sizeLabel: "16px", className: "text-base"/);
  assert.match(source, /sm: "text-xs"/);
  assert.match(source, /md: "text-sm"/);
  assert.match(source, /lg: "text-base"/);
  assert.match(source, /return value === "sm" \|\| value === "lg" \? value : "md"/);
  assert.match(source, /messageBodyFontSize: "md"/);
  assert.match(source, /hydrateMessageBodyFontSize: \(size\) =>/);
  assert.doesNotMatch(source, /localStorage/);
});

test("Settings exposes an Appearance page backed by persisted message-body font size preference", () => {
  const settingsPanel = readFileSync(
    resolve(repoRoot, "src/components/settings/SettingsPanel.tsx"),
    "utf8",
  );
  const sidebar = readFileSync(
    resolve(repoRoot, "src/components/layout/Sidebar.tsx"),
    "utf8",
  );

  assert.match(settingsPanel, /\{ id: "appearance", label: "Appearance", icon: Type \}/);
  assert.match(settingsPanel, /settingsTab === "appearance" && <AppearanceSection \/>/);
  assert.match(settingsPanel, /<SegmentedControl/);
  assert.match(settingsPanel, /ariaLabel="Message font size"/);
  assert.match(settingsPanel, /handleMessageBodyFontSizeSave/);
  assert.match(settingsPanel, /updateProfile\(\{ preferredMessageBodyFontSize: messageBodyFontSize \}\)/);
  assert.match(settingsPanel, /messageBodyFontSizeDirty/);
  assert.match(settingsPanel, /savingMessageBodyFontSize \? "Saving…" : savedMessageBodyFontSize/);
  assert.match(settingsPanel, /hydrateMessageBodyFontSize\(persistedMessageBodyFontSize\)/);
  assert.match(settingsPanel, /testId: `message-font-size-\$\{option\.value\}`/);
  assert.doesNotMatch(settingsPanel, /<Button/);
  assert.doesNotMatch(settingsPanel, /option\.sizeLabel/);
  assert.match(settingsPanel, /<MessageItem[\s\S]*?message=\{previewMessage\}[\s\S]*?mentionMap=\{APPEARANCE_PREVIEW_MENTION_MAP\}[\s\S]*?channels=\{\[APPEARANCE_PREVIEW_CHANNEL\]\}[\s\S]*?previewSenderAgent=\{APPEARANCE_PREVIEW_AGENT\}/);
  assert.match(settingsPanel, /aria-label="Message font size preview"/);
  assert.doesNotMatch(settingsPanel, /size-8 shrink-0 items-center justify-center overflow-hidden border border-black bg-/);
  assert.doesNotMatch(settingsPanel, /<AgentAvatar avatarUrl="pixel:random:cindy-preview"/);
  assert.doesNotMatch(settingsPanel, /<span className="text-xs font-bold text-black">Cindy<\/span>/);
  assert.doesNotMatch(settingsPanel, /<span className="text-\[10px\] font-mono text-black\/45">just now<\/span>/);
  assert.doesNotMatch(settingsPanel, /<code className="border border-black bg-brutal-yellow\/40 px-1 text-sm font-mono">git pull<\/code>/);
  assert.match(settingsPanel, /Preview/);
  assert.match(settingsPanel, /@Joy/);
  assert.match(settingsPanel, /#proj-uiux/);
  assert.match(settingsPanel, /git pull/);
  assert.doesNotMatch(settingsPanel, /border-2 border-black bg-brutal-cream\/60 p-3/);
  assert.match(sidebar, /settings\/appearance/);
  assert.match(sidebar, /id: "appearance", label: "Appearance"/);
});

test("server persists message body font size as an account preference", () => {
  const schema = readFileSync(
    resolve(repoRoot, "../server/src/db/schema.ts"),
    "utf8",
  );
  const authRoute = readFileSync(
    resolve(repoRoot, "../server/src/routes/auth.ts"),
    "utf8",
  );
  const userService = readFileSync(
    resolve(repoRoot, "../server/src/services/userService.ts"),
    "utf8",
  );

  assert.match(schema, /preferredMessageBodyFontSize: text\("preferred_message_body_font_size", \{ enum: \["sm", "md", "lg"\] \}\)/);
  assert.match(authRoute, /parsePreferredMessageBodyFontSize/);
  assert.match(authRoute, /preferredMessageBodyFontSize must be sm, md, lg, or null/);
  assert.match(authRoute, /profileFields\.preferredMessageBodyFontSize = preferredMessageBodyFontSize/);
  assert.match(userService, /preferredMessageBodyFontSize: users\.preferredMessageBodyFontSize/);
  assert.match(userService, /preferredMessageBodyFontSize: user\.preferredMessageBodyFontSize \?\? null/);
});

test("auth restore hydrates the message font size preference before Settings is opened", () => {
  const authStore = readFileSync(
    resolve(repoRoot, "src/store/authStore.ts"),
    "utf8",
  );

  assert.match(authStore, /import \{ useAppearanceStore \} from "\.\/appearanceStore";/);
  assert.match(authStore, /function syncAppearancePreference\(user: User \| null \| undefined\)/);
  assert.match(authStore, /hydrateMessageBodyFontSize\(user\?\.preferredMessageBodyFontSize \?\? null\)/);
  assert.match(authStore, /syncAppearancePreference\(data\.user\)/);
  assert.match(authStore, /syncAppearancePreference\(data\)/);
  assert.match(authStore, /syncAppearancePreference\(null\)/);
});

test("MessageItem applies the preference only to the message body container", () => {
  const messageItem = readFileSync(
    resolve(repoRoot, "src/components/message/MessageItem.tsx"),
    "utf8",
  );
  const markdownContent = readFileSync(
    resolve(repoRoot, "src/components/markdown/MarkdownContent.tsx"),
    "utf8",
  );

  assert.match(messageItem, /useAppearanceStore\(\(s\) => s\.messageBodyFontSize\)/);
  assert.match(messageItem, /getMessageBodyFontSizeClass\(messageBodyFontSize\)/);
  assert.match(messageItem, /data-message-font-size=\{messageBodyFontSize\}/);
  assert.match(messageItem, /className=\{`\$\{messageBodyFontSizeClass\} text-black break-words select-text/);
  assert.doesNotMatch(messageItem, /className="text-sm text-black break-words select-text/);

  // Code typography remains independent of the message-body display preference.
  assert.match(markdownContent, /text-sm text-white font-mono/);
  assert.match(markdownContent, /px-1 text-sm font-mono/);
});
