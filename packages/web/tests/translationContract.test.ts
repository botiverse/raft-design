import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { shouldHideTranslationIndicator } from "../src/utils/translationContract.js";

class MemoryStorage {
  private readonly map = new Map<string, string>();

  getItem(key: string) {
    return this.map.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.map.set(key, value);
  }

  removeItem(key: string) {
    this.map.delete(key);
  }
}

test("silent skip reasons do not render a translation indicator", () => {
  assert.equal(shouldHideTranslationIndicator("skipped", "same_language"), true);
  assert.equal(shouldHideTranslationIndicator("skipped", "own_message"), true);
  assert.equal(shouldHideTranslationIndicator("skipped", "system_message"), true);
  assert.equal(shouldHideTranslationIndicator("skipped", "code_or_link_only"), true);
  assert.equal(shouldHideTranslationIndicator("skipped", "low_confidence"), true);
});

test("legacy quota reasons and provider failures still render visible translation states", () => {
  assert.equal(shouldHideTranslationIndicator("skipped", "server_disabled"), false);
  assert.equal(shouldHideTranslationIndicator("skipped", "user_quota_exceeded"), false);
  assert.equal(shouldHideTranslationIndicator("failed", "provider"), false);
  assert.equal(shouldHideTranslationIndicator("failed", "provider_timeout"), false);
  assert.equal(shouldHideTranslationIndicator("failed", "placeholder"), false);
  assert.equal(shouldHideTranslationIndicator("translated", null), false);
});

test("not_found stays silent so visibility boundaries are not exposed", () => {
  assert.equal(shouldHideTranslationIndicator("not_found", "not_found"), true);
});

test("translation language option values match normalized API settings", async () => {
  Object.defineProperty(globalThis, "localStorage", {
    value: new MemoryStorage(),
    configurable: true,
  });

  const {
    TRANSLATION_LANGUAGE_OPTIONS,
    formatTimezoneLabel,
    getTimezoneOptions,
    getTranslationLanguageOptions,
    normalizeTranslationLanguageCode,
  } = await import("../src/store/translationStore.js");

  assert.equal(normalizeTranslationLanguageCode("zh-CN"), "zh-cn");
  assert.equal(normalizeTranslationLanguageCode("zh-TW"), "zh-tw");
  assert.equal(normalizeTranslationLanguageCode("zh-Hans"), "zh-cn");
  assert.equal(normalizeTranslationLanguageCode("zh-Hant"), "zh-tw");
  assert.equal(normalizeTranslationLanguageCode("pt-BR"), "pt-br");
  assert.equal(normalizeTranslationLanguageCode("en-US"), "en");

  const optionValues = new Set(TRANSLATION_LANGUAGE_OPTIONS.map((option) => option.value));
  assert.equal(optionValues.has("zh-cn"), false);
  assert.equal(optionValues.has("zh-tw"), false);
  assert.equal(optionValues.has("pt-br"), false);
  assert.equal(optionValues.has("other"), true);
  assert.equal(optionValues.has("en"), true);

  assert.deepEqual(getTranslationLanguageOptions("en").map((option) => option.label), ["Others", "English"]);
  assert.deepEqual(getTranslationLanguageOptions(null).map((option) => option.label), ["Others", "English"]);
  assert.match(formatTimezoneLabel("Asia/Shanghai"), /^UTC\+08:00 Asia\/Shanghai$/);
  assert.equal(getTimezoneOptions("Asia/Shanghai")[0].label, "UTC+08:00 Asia/Shanghai");
  assert.equal(getTimezoneOptions("Asia/Shanghai").some((option) => option.value === "Asia/Shanghai"), true);
  assert.equal(getTimezoneOptions("America/Indiana/Indianapolis").some((option) => option.value === "America/Indiana/Indianapolis"), true);
  assert.equal(getTimezoneOptions("Asia/Shanghai").length < 50, true);
});

test("browser language only auto-detects English for auto-translation", async () => {
  Object.defineProperty(globalThis, "navigator", {
    value: { languages: ["zh-CN"], language: "zh-CN" },
    configurable: true,
  });

  const { detectBrowserLanguage } = await import("../src/store/translationStore.js");
  assert.equal(detectBrowserLanguage(), null);

  Object.defineProperty(globalThis, "navigator", {
    value: { languages: ["en-US"], language: "en-US" },
    configurable: true,
  });
  assert.equal(detectBrowserLanguage(), "en");
});

test("language settings expose display preference but not auto-translation control", () => {
  const source = readFileSync(
    new URL("../src/components/settings/SettingsPanel.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /Preferred language/);
  assert.match(source, /Message translation uses it in servers where an owner or admin has turned translation on/);
  assert.match(source, /Translated asks for translated text when this server supports it/);
  assert.match(source, /ariaLabel="Message translation display"/);
  assert.match(source, /testId: "translation-display-translated"/);
  assert.match(source, /testId: "translation-display-original"/);
  assert.doesNotMatch(source, /Auto-translate messages/);
  assert.doesNotMatch(source, /server-level gate/i);
});

test("original display preference does not auto-request translations", () => {
  const source = readFileSync(
    new URL("../src/hooks/useTranslationBatch.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /settings\.preferredTranslationDisplay !== "translated"/);
  assert.match(source, /settings\.preferredTranslationDisplay,/);
});

test("original display preference renders source content instead of translation pending placeholder", () => {
  const source = readFileSync(
    new URL("../src/components/message/MessageItem.tsx", import.meta.url),
    "utf8",
  );

  assert.match(
    source,
    /const isTranslationPending =\s*translationEligible &&\s*!activeTranslationShowOriginal &&\s*\(!activeTranslationEntry \|\| activeTranslationEntry\.status === "pending"\)/,
  );
  assert.match(source, /const visibleMessageContent = translatedContent \?\? message\.content/);
});
