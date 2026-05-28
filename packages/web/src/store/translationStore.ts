import { create } from "zustand";
import api from "../api/client";
import type { Message } from "./messageStore";
import { useAuthStore } from "./authStore";
import { shouldHideTranslationIndicator } from "../utils/translationContract";
import {
  normalizeTimeFormatPreference,
  normalizeTranslationLanguageCode,
  type TimeFormatPreference,
} from "@slock-ai/shared";
import { detectBrowserTimeFormat, detectBrowserTimezone } from "../utils/timeFormatting";

export { normalizeTranslationLanguageCode } from "@slock-ai/shared";

export type TranslationStatus = "pending" | "translated" | "skipped" | "failed" | "not_found";
export type PreferredTranslationDisplay = "translated" | "original";
export type TranslationReason =
  | "same_language"
  | "own_message"
  | "system_message"
  | "code_or_link_only"
  | "low_confidence"
  | "provider"
  | "provider_failed"
  | "provider_timeout"
  | "placeholder"
  | "placeholder_mismatch"
  | "not_found"
  | string;

export interface TranslationEntry {
  messageId: string;
  status: TranslationStatus;
  reason?: TranslationReason | null;
  translatedContent?: string | null;
  sourceLanguage?: string | null;
  targetLanguage?: string | null;
  originalContent?: string;
  pendingSince?: number;
  showOriginal?: boolean;
}

interface TranslationSettings {
  preferredLanguage: string | null;
  effectiveLanguage: string | null;
  preferredTimezone: string | null;
  effectiveTimezone: string | null;
  autoTranslationEnabled: boolean;
  preferredTranslationDisplay: PreferredTranslationDisplay;
  preferredTimeFormat: TimeFormatPreference | null;
  effectiveTimeFormat: TimeFormatPreference;
  available: boolean;
  serverTranslationEnabled: boolean;
  providerAvailable: boolean;
  canManageServerTranslation: boolean;
}

interface TranslationState {
  entries: Record<string, TranslationEntry>;
  settings: TranslationSettings;
  settingsServerId: string | null;
  settingsLoading: boolean;
  settingsError: string | null;
  inFlightBatchKeys: Record<string, true>;
  loadSettings: (serverId: string | null | undefined) => Promise<void>;
  updatePreferredLanguage: (language: string | null) => Promise<void>;
  updatePreferredTimezone: (timezone: string | null) => Promise<void>;
  updateAutoTranslationEnabled: (enabled: boolean) => Promise<void>;
  updatePreferredTranslationDisplay: (display: PreferredTranslationDisplay) => Promise<void>;
  updateServerTranslationEnabled: (enabled: boolean) => Promise<void>;
  updatePreferredTimeFormat: (timeFormat: TimeFormatPreference | null) => Promise<void>;
  requestTranslations: (messages: Message[], options: { targetLanguage: string; viewerUserId?: string | null; force?: boolean }) => Promise<void>;
  retryMessage: (message: Message, options: { targetLanguage: string; viewerUserId?: string | null }) => Promise<void>;
  setShowOriginal: (messageId: string, showOriginal: boolean) => void;
}

const PENDING_TIMEOUT_MS = 30_000;
const AUTO_TRANSLATION_TARGET_LANGUAGE = "en";
export const TRANSLATION_LANGUAGE_OPTIONS = [
  { value: "other", label: "Others" },
  { value: AUTO_TRANSLATION_TARGET_LANGUAGE, label: "English" },
];

const COMMON_TIMEZONE_IDS = [
  "UTC",
  "America/Anchorage",
  "America/Los_Angeles",
  "America/Denver",
  "America/Phoenix",
  "America/Chicago",
  "America/New_York",
  "America/Toronto",
  "America/Mexico_City",
  "America/Bogota",
  "America/Lima",
  "America/Sao_Paulo",
  "America/Argentina/Buenos_Aires",
  "Europe/London",
  "Europe/Dublin",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Amsterdam",
  "Europe/Zurich",
  "Europe/Stockholm",
  "Europe/Warsaw",
  "Europe/Istanbul",
  "Europe/Moscow",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Taipei",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Pacific/Auckland",
];

function getTimezoneIds(selectedTimezone?: string | null) {
  return Array.from(new Set([
    ...COMMON_TIMEZONE_IDS,
    ...(selectedTimezone ? [selectedTimezone] : []),
  ]));
}

function getTimezoneOffsetMinutes(timezone: string, date = new Date()) {
  if (timezone === "UTC") return 0;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  });
  const token = formatter.formatToParts(date).find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  if (token === "GMT" || token === "UTC") return 0;
  const match = token.match(/(?:GMT|UTC)([+-])(\d{1,2})(?::?(\d{2}))?/);
  if (!match) return 0;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? "0");
  return (match[1] === "-" ? -1 : 1) * (hours * 60 + minutes);
}

function formatUtcOffset(minutes: number) {
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  const hours = String(Math.floor(abs / 60)).padStart(2, "0");
  const mins = String(abs % 60).padStart(2, "0");
  return `UTC${sign}${hours}:${mins}`;
}

export function formatTimezoneLabel(timezone: string) {
  return `${formatUtcOffset(getTimezoneOffsetMinutes(timezone))} ${timezone}`;
}

export function getTranslationLanguageOptions(effectiveLanguage: string | null | undefined) {
  void effectiveLanguage;
  return TRANSLATION_LANGUAGE_OPTIONS;
}

export function getTimezoneOptions(effectiveTimezone: string | null | undefined) {
  const options = getTimezoneIds(effectiveTimezone)
    .map((timezone) => ({
      value: timezone,
      label: formatTimezoneLabel(timezone),
      offset: getTimezoneOffsetMinutes(timezone),
    }))
    .sort((a, b) => a.offset - b.offset || a.value.localeCompare(b.value))
    .map(({ value, label }) => ({ value, label }));
  const selectedLabel = effectiveTimezone ? formatTimezoneLabel(effectiveTimezone) : "Select timezone";
  return [{ value: "", label: selectedLabel }, ...options];
}

function isApiUnavailable(error: any) {
  const status = error?.response?.status;
  return status === 404 || status === 501;
}

function normalizeTimezone(timezone: string | null | undefined): string | null {
  const normalized = timezone?.trim();
  return normalized || null;
}

function normalizeAutoTranslationLanguage(language: string | null | undefined): string | null {
  const normalized = normalizeTranslationLanguageCode(language);
  return normalized === AUTO_TRANSLATION_TARGET_LANGUAGE ? AUTO_TRANSLATION_TARGET_LANGUAGE : null;
}

function normalizePreferredTranslationDisplay(display: unknown): PreferredTranslationDisplay {
  return display === "original" ? "original" : "translated";
}

export function detectBrowserLanguage(): string | null {
  if (typeof navigator === "undefined") return null;
  return normalizeAutoTranslationLanguage(navigator.languages?.[0] ?? navigator.language ?? null);
}

function normalizeSettings(data: any): TranslationSettings {
  const preferredLanguage = normalizeAutoTranslationLanguage(data?.preferredLanguage ?? data?.targetLanguage ?? null);
  const preferredTimezone = normalizeTimezone(data?.preferredTimezone ?? data?.timezone ?? null);
  const preferredTimeFormat = normalizeTimeFormatPreference(data?.preferredTimeFormat ?? data?.timeFormat ?? null);
  const serverTranslationEnabled = data?.serverTranslationEnabled ?? data?.translationEnabled ?? false;
  const providerAvailable = data?.providerAvailable ?? data?.translationAvailable ?? data?.available ?? true;
  return {
    preferredLanguage,
    effectiveLanguage: preferredLanguage ?? detectBrowserLanguage(),
    preferredTimezone,
    effectiveTimezone: preferredTimezone ?? detectBrowserTimezone(),
    autoTranslationEnabled: data?.autoTranslationEnabled ?? true,
    preferredTranslationDisplay: normalizePreferredTranslationDisplay(data?.preferredTranslationDisplay),
    preferredTimeFormat,
    effectiveTimeFormat: preferredTimeFormat ?? detectBrowserTimeFormat(),
    available: serverTranslationEnabled && providerAvailable,
    serverTranslationEnabled,
    providerAvailable,
    canManageServerTranslation: data?.canManageServerTranslation ?? data?.canManageTranslation ?? false,
  };
}

function serverTranslationSettings(settings: TranslationSettings) {
  return {
    translationEnabled: settings.serverTranslationEnabled,
    translationAvailable: settings.providerAvailable,
    canManageTranslation: settings.canManageServerTranslation,
  };
}

function normalizeReason(raw: any): TranslationReason | null {
  const reason = raw?.quotaReason ?? raw?.skipReason ?? raw?.failureReason ?? raw?.reason ?? null;
  if (reason === "provider_failed") return "provider";
  if (reason === "placeholder_mismatch") return "placeholder";
  return reason;
}

function normalizeEntry(raw: any, originalContent?: string): TranslationEntry {
  return {
    messageId: String(raw.messageId),
    status: (raw.status ?? "not_found") as TranslationStatus,
    reason: normalizeReason(raw),
    translatedContent: raw.translatedContent ?? raw.translation ?? null,
    sourceLanguage: raw.sourceLanguage ?? raw.sourceLang ?? null,
    targetLanguage: raw.targetLanguage ?? raw.targetLang ?? null,
    originalContent,
  };
}

function shouldSkipClientSide(message: Message, viewerUserId?: string | null) {
  if (message.messageType === "system") return true;
  return message.senderType === "user" && !!viewerUserId && message.senderId === viewerUserId;
}

function schedulePendingTimeout(messageIds: string[]) {
  if (typeof window === "undefined") return;
  window.setTimeout(() => {
    const now = Date.now();
    useTranslationStore.setState((state) => {
      let changed = false;
      const nextEntries = { ...state.entries };
      for (const messageId of messageIds) {
        const entry = nextEntries[messageId];
        if (entry?.status !== "pending") continue;
        if (!entry.pendingSince || now - entry.pendingSince < PENDING_TIMEOUT_MS) continue;
        nextEntries[messageId] = {
          ...entry,
          status: "failed",
          reason: "provider_timeout",
        };
        changed = true;
      }
      return changed ? { entries: nextEntries } : state;
    });
  }, PENDING_TIMEOUT_MS + 250);
}

export function isSilentTranslationEntry(entry: TranslationEntry | undefined | null) {
  if (!entry) return false;
  return shouldHideTranslationIndicator(entry.status, entry.reason);
}

export const useTranslationStore = create<TranslationState>((set, get) => ({
  entries: {},
  settings: {
    preferredLanguage: null,
    effectiveLanguage: detectBrowserLanguage(),
    preferredTimezone: null,
    effectiveTimezone: detectBrowserTimezone(),
    autoTranslationEnabled: true,
    preferredTranslationDisplay: "translated",
    preferredTimeFormat: null,
    effectiveTimeFormat: detectBrowserTimeFormat(),
    available: false,
    serverTranslationEnabled: false,
    providerAvailable: false,
    canManageServerTranslation: false,
  },
  settingsServerId: null,
  settingsLoading: false,
  settingsError: null,
  inFlightBatchKeys: {},

  loadSettings: async (serverId) => {
    if (!serverId) return;
    const state = get();
    if (state.settingsServerId === serverId && !state.settingsLoading) return;
    set((current) => ({
      settingsLoading: true,
      settingsError: null,
      ...(current.settingsServerId !== serverId
        ? { settings: { ...current.settings, available: false } }
        : {}),
    }));
    try {
      const [{ data: user }, { data: serverSettings }] = await Promise.all([
        api.get("/auth/me"),
        api.get(`/servers/${serverId}/translation-settings`),
      ]);
      useAuthStore.setState((authState) => ({ user: authState.user ? { ...authState.user, ...user } : user }));
      set({
        settings: normalizeSettings({
          preferredLanguage: user?.preferredLanguage ?? null,
          preferredTimezone: user?.preferredTimezone ?? null,
          autoTranslationEnabled: user?.autoTranslationEnabled ?? true,
          preferredTranslationDisplay: user?.preferredTranslationDisplay ?? "translated",
          preferredTimeFormat: user?.preferredTimeFormat ?? null,
          translationEnabled: serverSettings?.translationEnabled ?? false,
          translationAvailable: serverSettings?.translationAvailable ?? serverSettings?.available ?? true,
          canManageTranslation: serverSettings?.canManageTranslation ?? false,
        }),
        settingsServerId: serverId,
        settingsLoading: false,
        settingsError: null,
      });
    } catch (error: any) {
      if (isApiUnavailable(error)) {
        set({
          settings: { ...get().settings, available: false },
          settingsServerId: serverId,
          settingsLoading: false,
          settingsError: null,
        });
        return;
      }
      set({ settingsLoading: false, settingsError: error?.response?.data?.error || "Failed to load translation settings" });
    }
  },

  updatePreferredLanguage: async (language) => {
    const previous = get().settings.preferredLanguage;
    const nextLanguage = normalizeAutoTranslationLanguage(language);
    set((state) => ({
      settings: normalizeSettings({
        preferredLanguage: nextLanguage,
        preferredTimezone: state.settings.preferredTimezone,
        autoTranslationEnabled: state.settings.autoTranslationEnabled,
        preferredTranslationDisplay: state.settings.preferredTranslationDisplay,
        preferredTimeFormat: state.settings.preferredTimeFormat,
        ...serverTranslationSettings(state.settings),
      }),
    }));
    try {
      const { data } = await api.patch("/auth/me", { preferredLanguage: nextLanguage });
      useAuthStore.setState((state) => ({ user: state.user ? { ...state.user, ...data } : data }));
      set((state) => ({
        settings: normalizeSettings({
          preferredLanguage: data?.preferredLanguage ?? nextLanguage,
          preferredTimezone: state.settings.preferredTimezone,
          autoTranslationEnabled: state.settings.autoTranslationEnabled,
          preferredTranslationDisplay: state.settings.preferredTranslationDisplay,
          preferredTimeFormat: state.settings.preferredTimeFormat,
          ...serverTranslationSettings(state.settings),
        }),
      }));
    } catch (error) {
      set((state) => ({
        settings: normalizeSettings({
          preferredLanguage: previous,
          preferredTimezone: state.settings.preferredTimezone,
          autoTranslationEnabled: state.settings.autoTranslationEnabled,
          preferredTranslationDisplay: state.settings.preferredTranslationDisplay,
          preferredTimeFormat: state.settings.preferredTimeFormat,
          ...serverTranslationSettings(state.settings),
        }),
      }));
      throw error;
    }
  },

  updatePreferredTimezone: async (timezone) => {
    const previous = get().settings.preferredTimezone;
    const nextTimezone = normalizeTimezone(timezone);
    set((state) => ({
      settings: normalizeSettings({
        preferredLanguage: state.settings.preferredLanguage,
        preferredTimezone: nextTimezone,
        autoTranslationEnabled: state.settings.autoTranslationEnabled,
        preferredTranslationDisplay: state.settings.preferredTranslationDisplay,
        preferredTimeFormat: state.settings.preferredTimeFormat,
        ...serverTranslationSettings(state.settings),
      }),
    }));
    try {
      const { data } = await api.patch("/auth/me", { preferredTimezone: nextTimezone });
      useAuthStore.setState((state) => ({ user: state.user ? { ...state.user, ...data } : data }));
      set((state) => ({
        settings: normalizeSettings({
          preferredLanguage: state.settings.preferredLanguage,
          preferredTimezone: data?.preferredTimezone ?? nextTimezone,
          autoTranslationEnabled: state.settings.autoTranslationEnabled,
          preferredTranslationDisplay: state.settings.preferredTranslationDisplay,
          preferredTimeFormat: state.settings.preferredTimeFormat,
          ...serverTranslationSettings(state.settings),
        }),
      }));
    } catch (error) {
      set((state) => ({
        settings: normalizeSettings({
          preferredLanguage: state.settings.preferredLanguage,
          preferredTimezone: previous,
          autoTranslationEnabled: state.settings.autoTranslationEnabled,
          preferredTranslationDisplay: state.settings.preferredTranslationDisplay,
          preferredTimeFormat: state.settings.preferredTimeFormat,
          ...serverTranslationSettings(state.settings),
        }),
      }));
      throw error;
    }
  },

  updateAutoTranslationEnabled: async (enabled) => {
    const previous = get().settings.autoTranslationEnabled;
    set((state) => ({
      settings: normalizeSettings({
        preferredLanguage: state.settings.preferredLanguage,
        preferredTimezone: state.settings.preferredTimezone,
        autoTranslationEnabled: enabled,
        preferredTranslationDisplay: state.settings.preferredTranslationDisplay,
        preferredTimeFormat: state.settings.preferredTimeFormat,
        ...serverTranslationSettings(state.settings),
      }),
    }));
    try {
      const { data } = await api.patch("/auth/me", { autoTranslationEnabled: enabled });
      useAuthStore.setState((state) => ({ user: state.user ? { ...state.user, ...data } : data }));
      set((state) => ({
        settings: normalizeSettings({
          preferredLanguage: state.settings.preferredLanguage,
          preferredTimezone: state.settings.preferredTimezone,
          autoTranslationEnabled: data?.autoTranslationEnabled ?? enabled,
          preferredTranslationDisplay: state.settings.preferredTranslationDisplay,
          preferredTimeFormat: state.settings.preferredTimeFormat,
          ...serverTranslationSettings(state.settings),
        }),
      }));
    } catch (error) {
      set((state) => ({
        settings: normalizeSettings({
          preferredLanguage: state.settings.preferredLanguage,
          preferredTimezone: state.settings.preferredTimezone,
          autoTranslationEnabled: previous,
          preferredTranslationDisplay: state.settings.preferredTranslationDisplay,
          preferredTimeFormat: state.settings.preferredTimeFormat,
          ...serverTranslationSettings(state.settings),
        }),
      }));
      throw error;
    }
  },

  updatePreferredTranslationDisplay: async (display) => {
    const previous = get().settings.preferredTranslationDisplay;
    const nextDisplay = normalizePreferredTranslationDisplay(display);
    set((state) => ({
      settings: normalizeSettings({
        preferredLanguage: state.settings.preferredLanguage,
        preferredTimezone: state.settings.preferredTimezone,
        autoTranslationEnabled: state.settings.autoTranslationEnabled,
        preferredTranslationDisplay: nextDisplay,
        preferredTimeFormat: state.settings.preferredTimeFormat,
        ...serverTranslationSettings(state.settings),
      }),
    }));
    try {
      const { data } = await api.patch("/auth/me", { preferredTranslationDisplay: nextDisplay });
      useAuthStore.setState((state) => ({ user: state.user ? { ...state.user, ...data } : data }));
      set((state) => ({
        settings: normalizeSettings({
          preferredLanguage: state.settings.preferredLanguage,
          preferredTimezone: state.settings.preferredTimezone,
          autoTranslationEnabled: state.settings.autoTranslationEnabled,
          preferredTranslationDisplay: data?.preferredTranslationDisplay ?? nextDisplay,
          preferredTimeFormat: state.settings.preferredTimeFormat,
          ...serverTranslationSettings(state.settings),
        }),
      }));
    } catch (error) {
      set((state) => ({
        settings: normalizeSettings({
          preferredLanguage: state.settings.preferredLanguage,
          preferredTimezone: state.settings.preferredTimezone,
          autoTranslationEnabled: state.settings.autoTranslationEnabled,
          preferredTranslationDisplay: previous,
          preferredTimeFormat: state.settings.preferredTimeFormat,
          ...serverTranslationSettings(state.settings),
        }),
      }));
      throw error;
    }
  },

  updateServerTranslationEnabled: async (enabled) => {
    const serverId = get().settingsServerId;
    if (!serverId) return;

    const previous = get().settings.serverTranslationEnabled;
    set((state) => ({
      settings: normalizeSettings({
        preferredLanguage: state.settings.preferredLanguage,
        preferredTimezone: state.settings.preferredTimezone,
        autoTranslationEnabled: state.settings.autoTranslationEnabled,
        preferredTranslationDisplay: state.settings.preferredTranslationDisplay,
        preferredTimeFormat: state.settings.preferredTimeFormat,
        translationEnabled: enabled,
        translationAvailable: state.settings.providerAvailable,
        canManageTranslation: state.settings.canManageServerTranslation,
      }),
    }));
    try {
      const { data } = await api.patch(`/servers/${serverId}/translation-settings`, { translationEnabled: enabled });
      set((state) => ({
        settings: normalizeSettings({
          preferredLanguage: state.settings.preferredLanguage,
          preferredTimezone: state.settings.preferredTimezone,
          autoTranslationEnabled: state.settings.autoTranslationEnabled,
          preferredTranslationDisplay: state.settings.preferredTranslationDisplay,
          preferredTimeFormat: state.settings.preferredTimeFormat,
          translationEnabled: data?.translationEnabled ?? enabled,
          translationAvailable: data?.translationAvailable ?? state.settings.providerAvailable,
          canManageTranslation: data?.canManageTranslation ?? state.settings.canManageServerTranslation,
        }),
      }));
    } catch (error) {
      set((state) => ({
        settings: normalizeSettings({
          preferredLanguage: state.settings.preferredLanguage,
          preferredTimezone: state.settings.preferredTimezone,
          autoTranslationEnabled: state.settings.autoTranslationEnabled,
          preferredTranslationDisplay: state.settings.preferredTranslationDisplay,
          preferredTimeFormat: state.settings.preferredTimeFormat,
          translationEnabled: previous,
          translationAvailable: state.settings.providerAvailable,
          canManageTranslation: state.settings.canManageServerTranslation,
        }),
      }));
      throw error;
    }
  },

  updatePreferredTimeFormat: async (timeFormat) => {
    const previous = get().settings.preferredTimeFormat;
    const nextTimeFormat = normalizeTimeFormatPreference(timeFormat);
    set((state) => ({
      settings: normalizeSettings({
        preferredLanguage: state.settings.preferredLanguage,
        preferredTimezone: state.settings.preferredTimezone,
        autoTranslationEnabled: state.settings.autoTranslationEnabled,
        preferredTranslationDisplay: state.settings.preferredTranslationDisplay,
        preferredTimeFormat: nextTimeFormat,
        ...serverTranslationSettings(state.settings),
      }),
    }));
    try {
      const { data } = await api.patch("/auth/me", { preferredTimeFormat: nextTimeFormat });
      useAuthStore.setState((state) => ({ user: state.user ? { ...state.user, ...data } : data }));
      set((state) => ({
        settings: normalizeSettings({
          preferredLanguage: state.settings.preferredLanguage,
          preferredTimezone: state.settings.preferredTimezone,
          autoTranslationEnabled: state.settings.autoTranslationEnabled,
          preferredTranslationDisplay: state.settings.preferredTranslationDisplay,
          preferredTimeFormat: data?.preferredTimeFormat ?? nextTimeFormat,
          ...serverTranslationSettings(state.settings),
        }),
      }));
    } catch (error) {
      set((state) => ({
        settings: normalizeSettings({
          preferredLanguage: state.settings.preferredLanguage,
          preferredTimezone: state.settings.preferredTimezone,
          autoTranslationEnabled: state.settings.autoTranslationEnabled,
          preferredTranslationDisplay: state.settings.preferredTranslationDisplay,
          preferredTimeFormat: previous,
          ...serverTranslationSettings(state.settings),
        }),
      }));
      throw error;
    }
  },

  requestTranslations: async (messages, options) => {
    const targetLanguage = options.targetLanguage;
    if (!targetLanguage) return;
    const now = Date.now();
    const state = get();
    const candidates = messages.filter((message) => {
      if (shouldSkipClientSide(message, options.viewerUserId)) return false;
      const existing = state.entries[message.id];
      if (!existing) return true;
      if (existing.originalContent && existing.originalContent !== message.content) return true;
      if (options.force) return true;
      return false;
    });
    if (candidates.length === 0) return;
    const messageIds = candidates.map((message) => message.id).slice(0, 200);
    const batchKey = `${targetLanguage}:${[...messageIds].sort().join(",")}:${options.force ? "force" : "normal"}`;
    if (state.inFlightBatchKeys[batchKey]) return;

    const candidateById = new Map(candidates.map((message) => [message.id, message]));
    const originalById = new Map(candidates.map((message) => [message.id, message.content]));
    set((current) => {
      const entries = { ...current.entries };
      for (const messageId of messageIds) {
        const message = candidateById.get(messageId);
        if (!message) continue;
        entries[message.id] = {
          messageId: message.id,
          status: "pending",
          targetLanguage,
          originalContent: message.content,
          pendingSince: now,
        };
      }
      return {
        entries,
        inFlightBatchKeys: { ...current.inFlightBatchKeys, [batchKey]: true },
      };
    });
    schedulePendingTimeout(messageIds);

    try {
      const { data } = await api.post("/message-translations:batch", {
        messageIds,
        targetLanguage,
        mode: options.force ? "manual" : "auto",
      });
      const rawResults = data?.results ?? data?.translations ?? data?.items ?? [];
      set((current) => {
        const entries = { ...current.entries };
        for (const raw of rawResults) {
          if (!raw?.messageId) continue;
          entries[String(raw.messageId)] = normalizeEntry(raw, originalById.get(String(raw.messageId)));
        }
        for (const messageId of messageIds) {
          if (!rawResults.some((raw: any) => String(raw?.messageId) === messageId)) {
            entries[messageId] = {
              messageId,
              status: "not_found",
              reason: "not_found",
              originalContent: originalById.get(messageId),
            };
          }
        }
        const { [batchKey]: _removed, ...inFlightBatchKeys } = current.inFlightBatchKeys;
        return { entries, inFlightBatchKeys };
      });
    } catch (error: any) {
      set((current) => {
        const entries = { ...current.entries };
        if (isApiUnavailable(error)) {
          for (const messageId of messageIds) delete entries[messageId];
          const { [batchKey]: _removed, ...inFlightBatchKeys } = current.inFlightBatchKeys;
          return {
            entries,
            inFlightBatchKeys,
            settings: { ...current.settings, available: false },
          };
        }
        for (const messageId of messageIds) {
          const message = candidateById.get(messageId);
          if (!message) continue;
          entries[message.id] = {
            messageId: message.id,
            status: "failed",
            reason: error?.response?.data?.reason ?? "provider",
            targetLanguage,
            originalContent: message.content,
          };
        }
        const { [batchKey]: _removed, ...inFlightBatchKeys } = current.inFlightBatchKeys;
        return { entries, inFlightBatchKeys };
      });
    }
  },

  retryMessage: async (message, options) => {
    await get().requestTranslations([message], { ...options, force: true });
  },

  setShowOriginal: (messageId, showOriginal) => {
    set((state) => {
      const entry = state.entries[messageId];
      if (!entry) return state;
      return {
        entries: {
          ...state.entries,
          [messageId]: { ...entry, showOriginal },
        },
      };
    });
  },
}));
