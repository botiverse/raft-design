import { useState, useEffect, useMemo, type FormEvent } from "react";
import {
  Settings,
  ChevronRight,
  Check,
  Copy,
  Plus,
  Bot,
  User,
  Users,
  Mail,
  Shield,
  Bell,
  Building2,
  Clock,
  Languages,
  X,
  CreditCard,
  AlertTriangle,
  Link2,
  Trash2,
  LogOut,
  Upload,
  FileText,
  Type,
  Pencil,
} from "lucide-react";
import { PLAN_CONFIG, DISPLAY_PLAN_CONFIG, DISPLAY_PLANS, DOWNGRADE_GRACE_PERIOD_DAYS, isTrialActive, getTrialEndDate, getEffectiveLimits, type ServerPlan, type ServerRole, type TimeFormatPreference } from "@slock-ai/shared";
import { useAuthStore } from "../../store/authStore";
import { useServerStore } from "../../store/serverStore";
import { useAgentStore } from "../../store/agentStore";
import { requestServerSelection } from "../../App";
import { useMobileBack } from "../../hooks/useAppNavigate";
import { useServerPermissions } from "../../hooks/useServerPermissions";
import { useTimeFormatter } from "../../hooks/useTimeFormatter";
import ConfirmDialog from "../ConfirmDialog";
import Modal from "../Modal";
import Banner from "../ui/Banner";
import api from "../../api/client";
import {
  disablePushNotifications,
  enablePushNotifications,
  getPushPermissionState,
  isPushServerConfigured,
  isPushSubscribed,
  sendTestPushNotification,
} from "../../utils/pushNotifications";
import Select from "../Select";
import Checkbox from "../ui/Checkbox";
import Textarea from "../ui/Textarea";
import PanelHeader from "../ui/PanelHeader";
import SectionEyebrow from "../ui/SectionEyebrow";
import SectionHeader from "../ui/SectionHeader";
import ExperimentalBadge from "../ui/ExperimentalBadge";
import FormField from "../ui/FormField";
import AvatarSlot from "../ui/AvatarSlot";
import AvatarListRow from "../ui/AvatarListRow";
import SegmentedControl from "../ui/SegmentedControl";
import SlugInput from "../ui/SlugInput";
import MessageItem, { type MentionEntry } from "../message/MessageItem";
import { PwaInstallSettingsCard } from "../pwa/PwaInstallPrompt";
import { useAuthProviders, type AuthProvider } from "../../hooks/useAuthProviders";
import type { SocialAuthProviderId } from "../../hooks/useAuthProviders";
import type { Message } from "../../store/messageStore";
import type { Agent } from "../../store/agentStore";
import type { Channel } from "../../store/channelStore";
import { canRemoveAdminMember, getAdminCandidateMembers, getAdminMembers, getAdminRoleOptions, getMemberLabel } from "../../utils/serverAdminSettings";
import { getTimezoneOptions, getTranslationLanguageOptions, useTranslationStore } from "../../store/translationStore";
import AgreementBody from "../server/AgreementBody";
import {
  MESSAGE_BODY_FONT_SIZE_OPTIONS,
  useAppearanceStore,
} from "../../store/appearanceStore";

const MAX_AGREEMENT_BODY_CHARS = 500;

const APPEARANCE_PREVIEW_AGENT: Agent = {
  id: "appearance-preview-agent",
  name: "cindy-preview",
  displayName: "Cindy",
  avatarUrl: "pixel:random:cindy-preview",
  description: null,
  status: "active",
  model: "preview",
  runtime: "preview",
  reasoningEffort: null,
  executionMode: "cloud",
  envVars: null,
  machineId: null,
  runtimeProfile: null,
  creatorType: null,
  creatorId: null,
  creator: null,
  createdAgents: [],
  deletedAt: null,
  createdAt: "2026-05-19T00:00:00.000Z",
};

const APPEARANCE_PREVIEW_CHANNEL: Channel = {
  id: "appearance-preview-channel",
  name: "proj-uiux",
  description: null,
  type: "channel",
  createdAt: "2026-05-19T00:00:00.000Z",
};

const APPEARANCE_PREVIEW_MENTION_MAP = new Map<string, MentionEntry>([
  ["joy", { displayName: "Joy", type: "user", id: "appearance-preview-joy" }],
]);

function characterLength(value: string) {
  return Array.from(value).length;
}

// ── Account Section ──

function GoogleLogo({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} shrink-0`}>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.3-.9 2.4-1.9 3.2l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.4-.2-2H12Z"
      />
      <path
        fill="#34A853"
        d="M12 21.6c2.6 0 4.9-.9 6.5-2.4l-3.1-2.4c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.1l-3.2 2.5c1.6 3.2 4.9 5.5 8.8 5.5Z"
      />
      <path
        fill="#4285F4"
        d="M6.4 13.6c-.2-.6-.3-1.1-.3-1.7s.1-1.2.3-1.7L3.2 7.7C2.4 9.2 2 10.5 2 12s.4 2.8 1.2 4.3l3.2-2.7Z"
      />
      <path
        fill="#FBBC05"
        d="M12 6.2c1.4 0 2.7.5 3.7 1.4l2.8-2.8C16.8 3.2 14.6 2.4 12 2.4c-3.9 0-7.2 2.2-8.8 5.4l3.2 2.5C7.2 7.9 9.4 6.2 12 6.2Z"
      />
    </svg>
  );
}

function GitHubLogo({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} shrink-0 fill-current`}>
      <path d="M12 .5C5.6.5.5 5.7.5 12.2c0 5.2 3.4 9.7 8.1 11.2.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.7-2.7-.3-5.5-1.4-5.5-6 0-1.3.5-2.5 1.3-3.3-.1-.3-.6-1.6.1-3.2 0 0 1.1-.4 3.5 1.3a11.8 11.8 0 0 1 6.4 0c2.4-1.7 3.5-1.3 3.5-1.3.7 1.6.2 2.9.1 3.2.8.9 1.3 2 1.3 3.3 0 4.7-2.8 5.7-5.6 6 .5.4.8 1.2.8 2.3v3.4c0 .3.2.8.8.6 4.7-1.5 8.1-5.9 8.1-11.2C23.5 5.7 18.4.5 12 .5Z" />
    </svg>
  );
}

function SocialProviderIcon({ providerId }: { providerId: SocialAuthProviderId }) {
  if (providerId === "google") {
    return (
      <span className="inline-flex size-[18px] shrink-0 items-center justify-center">
        <GoogleLogo />
      </span>
    );
  }
  return (
    <span className="inline-flex size-[18px] shrink-0 items-center justify-center text-black">
      <GitHubLogo />
    </span>
  );
}

function AccountSection() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const uploadAvatar = useAuthStore((s) => s.uploadAvatar);
  const { enabledProviders } = useAuthProviders();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [savedDisplayName, setSavedDisplayName] = useState(user?.displayName || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [linkedIdentities, setLinkedIdentities] = useState<Record<string, { providerEmail: string | null }>>({});
  const [linkingProviderId, setLinkingProviderId] = useState<SocialAuthProviderId | null>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);

  // Password change
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    const nextDisplayName = user?.displayName || "";
    setDisplayName(nextDisplayName);
    setSavedDisplayName(nextDisplayName);
    setSaved(false);
  }, [user?.id, user?.displayName]);

  useEffect(() => {
    let cancelled = false;

    async function loadIdentities() {
      if (enabledProviders.length === 0) return;
      try {
        const { data } = await api.get("/auth/identities");
        if (cancelled) return;
        const next: Record<string, { providerEmail: string | null }> = {};
        for (const identity of data.identities ?? []) {
          if (identity?.provider) {
            next[identity.provider] = { providerEmail: identity.providerEmail ?? null };
          }
        }
        setLinkedIdentities(next);
      } catch {
        if (!cancelled) setLinkedIdentities({});
      }
    }

    void loadIdentities();

    return () => {
      cancelled = true;
    };
  }, [enabledProviders.length]);

  const handleConnectProvider = async (provider: AuthProvider) => {
    setError("");
    setLinkingProviderId(provider.id);
    try {
      const { data } = await api.post(`/auth/${provider.id}/link/start`, {
        returnTo: `${window.location.pathname}${window.location.search}`,
      });
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to start ${provider.label} account connection`);
      setLinkingProviderId(null);
    }
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({ displayName });
      setSavedDisplayName(displayName);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const profileDirty = displayName !== savedDisplayName;

  const handleUploadAvatar = async (file: File) => {
    setError("");
    setAvatarSaving(true);
    try {
      await uploadAvatar(file);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to upload avatar");
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setSaving(true);
    setPasswordSaved(false);
    try {
      await updateProfile({ currentPassword, newPassword });
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordChange(false);
      setTimeout(() => setPasswordSaved(false), 2000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="mb-6">
      <SectionHeader
        className="mb-3"
        icon={<User size={16} />}
        label="Account"
      />

      <div className="border-2 border-black bg-white shadow-brutal-sm p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center">
            <label
              className={`group relative flex size-14 shrink-0 items-center justify-center ${
                avatarSaving ? "cursor-not-allowed opacity-70" : ""
              }`}
              title={avatarSaving ? "Uploading avatar" : "Upload image"}
              aria-label={avatarSaving ? "Uploading avatar" : "Upload image"}
            >
              <AvatarSlot context="account-tile" type="human" humanAvatarUrl={user?.avatarUrl} email={user?.email} />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Upload size={18} className="text-white" />
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={avatarSaving}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.currentTarget.value = "";
                  if (file) void handleUploadAvatar(file);
                }}
              />
            </label>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-black">{user?.displayName || user?.name}</div>
            <div className="mt-0.5 text-xs text-black/50">@{user?.name}</div>
          </div>
        </div>

        {/* Profile form */}
        <form onSubmit={handleSaveProfile} className="space-y-3">
          <FormField label="Name" labelStyle="plain" size="compact">
            <div className="w-full border-2 border-black/30 bg-gray-50 p-2 text-sm font-mono text-black/60">
              {user?.name}
            </div>
          </FormField>
          <FormField label="Display Name" labelStyle="plain" size="compact">
            <input
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setSaved(false);
              }}
              className="w-full border-2 border-black p-2 text-sm shadow-brutal-sm focus:shadow-brutal focus:outline-none"
            />
          </FormField>
          <FormField label="Email" labelStyle="plain" size="compact">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{user?.email}</span>
              {user?.emailVerified ? (
                <span className="inline-flex items-center gap-1 border border-black bg-brutal-lime px-1.5 text-[10px] font-bold uppercase">
                  <Shield size={10} /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 border border-black bg-brutal-orange/30 px-1.5 text-[10px] font-bold uppercase">
                  Unverified
                </span>
              )}
            </div>
          </FormField>

          {error && (
            <Banner intent="warning" density="sm" className="font-bold">{error}</Banner>
          )}

          <button
            type="submit"
            disabled={!profileDirty || saving}
            className="btn-brutal bg-brutal-pink px-3 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : saved ? (
              <><Check size={14} /> Saved</>
            ) : "Save Profile"}
          </button>
        </form>

        {/* Divider */}
        <div className="border-t-2 border-black" />

        {enabledProviders.length > 0 && (
          <>
            <div>
              <div className="mb-2 text-sm font-bold">Connected accounts</div>
              <div className="space-y-2">
                {enabledProviders.map((provider) => {
                  const identity = linkedIdentities[provider.id];
                  return (
                    <div
                      key={provider.id}
                      className="relative flex items-start justify-between gap-3 border-2 border-black/30 bg-white p-3 text-left transition-colors hover:border-black hover:shadow-brutal-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2 text-xs">
                          <SocialProviderIcon providerId={provider.id} />
                          <span className="font-bold text-black">{provider.label}</span>
                        </div>
                        <div className="truncate text-xs text-black/50">
                          {identity?.providerEmail
                            ? `Connected as ${identity.providerEmail}`
                            : "Not connected"}
                        </div>
                      </div>
                      {!identity && (
                        <button
                          type="button"
                          onClick={() => handleConnectProvider(provider)}
                          disabled={linkingProviderId === provider.id}
                          className="btn-brutal-sm shrink-0 bg-white px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {linkingProviderId === provider.id ? "Connecting…" : "Connect"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t-2 border-black" />
          </>
        )}

        {/* Password change */}
        <div>
          <button
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            className="flex items-center gap-2 text-sm font-bold"
          >
            <ChevronRight
              size={14}
              className={`transition-transform ${showPasswordChange ? "rotate-90" : ""}`}
            />
            Change Password
          </button>

          {showPasswordChange && (
            <form onSubmit={handleChangePassword} className="mt-3 space-y-3">
              <FormField label="Current Password" labelStyle="plain" size="compact">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border-2 border-black p-2 text-sm shadow-brutal-sm focus:shadow-brutal focus:outline-none"
                  required
                />
              </FormField>
              <FormField label="New Password" labelStyle="plain" size="compact">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border-2 border-black p-2 text-sm shadow-brutal-sm focus:shadow-brutal focus:outline-none"
                  placeholder="Min 8 characters"
                  required
                />
              </FormField>
              <FormField label="Confirm Password" labelStyle="plain" size="compact">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border-2 border-black p-2 text-sm shadow-brutal-sm focus:shadow-brutal focus:outline-none"
                  required
                />
              </FormField>

              {passwordError && (
                <Banner intent="warning" density="sm" className="font-bold">{passwordError}</Banner>
              )}

              {passwordSaved && (
                <div className="border-2 border-black bg-brutal-lime/30 p-2 text-xs font-bold">Password updated!</div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="btn-brutal bg-brutal-pink px-3 py-1.5 text-xs"
              >
                {saving ? "Updating…" : "Change Password"}
              </button>
            </form>
          )}
        </div>
      </div>
      </div>

      {/* Sign out — sibling section so it gets its own mb-6 spacing and
          renders at the same indent level as Account / Browser / Server. */}
      <AccountSignOutSection />
    </>
  );
}

function AccountSignOutSection() {
  const logout = useAuthStore((s) => s.logout);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="mb-6">
      <SectionHeader
        className="mb-3"
        icon={<LogOut size={16} />}
        label="Session"
      />

      <div className="border-2 border-black bg-white shadow-brutal-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-black">Log out</div>
            <p className="text-xs text-black/60 mt-0.5">
              Sign out of this browser. Your account and data stay; you can sign back in any time.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            data-testid="account-logout"
            className="btn-brutal bg-brutal-orange px-4 py-2 [@media(max-height:600px)]:py-1 text-sm font-bold flex items-center gap-1.5 shrink-0 ml-4"
          >
            Log out
          </button>
        </div>
      </div>

      {showConfirm && (
        <ConfirmDialog
          title="Log out"
          message="Sign out of this browser? Your account and data are kept; you can log back in any time."
          confirmLabel="Log out"
          loadingLabel="Signing out…"
          confirmColor="bg-brutal-orange"
          confirmTestId="account-logout-confirm-button"
          onConfirm={() => { logout(); }}
          onClose={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}

function NotificationsTabContent() {
  return (
    <>
      <PwaInstallSettingsCard />
      <NotificationsSection />
    </>
  );
}

function LanguageRegionSection() {
  const currentServer = useServerStore((s) => s.current);
  const settings = useTranslationStore((s) => s.settings);
  const settingsLoading = useTranslationStore((s) => s.settingsLoading);
  const settingsError = useTranslationStore((s) => s.settingsError);
  const loadSettings = useTranslationStore((s) => s.loadSettings);
  const updatePreferredLanguage = useTranslationStore((s) => s.updatePreferredLanguage);
  const updatePreferredTimezone = useTranslationStore((s) => s.updatePreferredTimezone);
  const updatePreferredTranslationDisplay = useTranslationStore((s) => s.updatePreferredTranslationDisplay);
  const updatePreferredTimeFormat = useTranslationStore((s) => s.updatePreferredTimeFormat);
  const [savingLanguageRegion, setSavingLanguageRegion] = useState(false);
  const [savingDateTime, setSavingDateTime] = useState(false);
  const [languageError, setLanguageError] = useState("");
  const [timezoneError, setTimezoneError] = useState("");
  const [translationDisplayError, setTranslationDisplayError] = useState("");
  const [timeFormatError, setTimeFormatError] = useState("");
  const savedLanguageBucket = settings.effectiveLanguage === "en" ? "en" : "other";
  const savedTimezone = settings.preferredTimezone ?? "";
  const savedTimeFormat = settings.effectiveTimeFormat === "24h" ? "24h" : "12h";
  const [languageBucket, setLanguageBucket] = useState<"en" | "other">(savedLanguageBucket);
  const [translationDisplay, setTranslationDisplay] = useState(settings.preferredTranslationDisplay);
  const [timezone, setTimezone] = useState(savedTimezone);
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">(savedTimeFormat);
  const [languageRegionSaved, setLanguageRegionSaved] = useState(false);
  const [dateTimeSaved, setDateTimeSaved] = useState(false);

  useEffect(() => {
    void loadSettings(currentServer?.id);
  }, [currentServer?.id, loadSettings]);

  useEffect(() => {
    setLanguageBucket(savedLanguageBucket);
    setTranslationDisplay(settings.preferredTranslationDisplay);
    setLanguageRegionSaved(false);
  }, [currentServer?.id, savedLanguageBucket, settings.preferredTranslationDisplay]);

  useEffect(() => {
    setTimezone(savedTimezone);
    setTimeFormat(savedTimeFormat);
    setDateTimeSaved(false);
  }, [currentServer?.id, savedTimezone, savedTimeFormat]);

  const languageOptions = useMemo(
    () => getTranslationLanguageOptions(settings.effectiveLanguage),
    [settings.effectiveLanguage],
  );
  const timezoneOptions = useMemo(
    () => getTimezoneOptions(settings.effectiveTimezone),
    [settings.effectiveTimezone],
  );
  const hiddenTimezoneOptionValues = useMemo(
    () => [
      "",
      ...(!settings.preferredTimezone && settings.effectiveTimezone ? [settings.effectiveTimezone] : []),
    ],
    [settings.effectiveTimezone, settings.preferredTimezone],
  );

  const languageRegionDirty =
    languageBucket !== savedLanguageBucket
    || translationDisplay !== settings.preferredTranslationDisplay;
  const dateTimeDirty = timezone !== savedTimezone || timeFormat !== savedTimeFormat;

  const handleSaveLanguageRegion = async (event: FormEvent) => {
    event.preventDefault();
    if (!languageRegionDirty) return;
    setSavingLanguageRegion(true);
    setLanguageError("");
    setTranslationDisplayError("");
    setLanguageRegionSaved(false);
    try {
      if (languageBucket !== savedLanguageBucket) {
        await updatePreferredLanguage(languageBucket === "en" ? "en" : null);
      }
      if (translationDisplay !== settings.preferredTranslationDisplay) {
        await updatePreferredTranslationDisplay(translationDisplay);
      }
      setLanguageRegionSaved(true);
      window.setTimeout(() => setLanguageRegionSaved(false), 1500);
    } catch (err: any) {
      setLanguageError(err.response?.data?.error || "Failed to update language preferences");
    } finally {
      setSavingLanguageRegion(false);
    }
  };

  const handleSaveDateTime = async (event: FormEvent) => {
    event.preventDefault();
    if (!dateTimeDirty) return;
    setSavingDateTime(true);
    setTimezoneError("");
    setTimeFormatError("");
    setDateTimeSaved(false);
    try {
      if (timezone !== savedTimezone) {
        await updatePreferredTimezone(timezone || null);
      }
      if (timeFormat !== savedTimeFormat) {
        await updatePreferredTimeFormat(timeFormat as TimeFormatPreference);
      }
      setDateTimeSaved(true);
      window.setTimeout(() => setDateTimeSaved(false), 1500);
    } catch (err: any) {
      setTimezoneError(err.response?.data?.error || "Failed to update date and time preferences");
    } finally {
      setSavingDateTime(false);
    }
  };

  if (!currentServer) return null;

  return (
    <>
      <div className="mb-6">
        <SectionHeader
          className="mb-3"
          icon={<Languages size={16} />}
          label="Language"
        />

        <form onSubmit={handleSaveLanguageRegion} className="border-2 border-black bg-white shadow-brutal-sm p-4 space-y-4">
          <div className="space-y-3">
            <div>
              <div className="text-sm font-bold text-black">Preferred language</div>
              <div className="text-xs text-black/60 mt-0.5">
                Your account language preference. Message translation uses it in servers where an owner or admin has turned translation on.
              </div>
            </div>
            <Select
              value={languageBucket}
              onChange={(next) => {
                setLanguageRegionSaved(false);
                setLanguageError("");
                setLanguageBucket(next === "en" ? "en" : "other");
              }}
              disabled={savingLanguageRegion || settingsLoading}
              options={languageOptions}
              className="max-w-sm"
              hideSelectedOption
            />
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-sm font-bold text-black">Message display</div>
              <div className="text-xs text-black/60 mt-0.5">
                Translated asks for translated text when this server supports it. Original keeps messages in their source language.
              </div>
            </div>
            <SegmentedControl<"translated" | "original">
              value={translationDisplay}
              ariaLabel="Message translation display"
              onChange={(next) => {
                setLanguageRegionSaved(false);
                setTranslationDisplayError("");
                setTranslationDisplay(next);
              }}
              disabled={savingLanguageRegion || settingsLoading}
              options={[
                { value: "translated", label: "Translated", testId: "translation-display-translated" },
                { value: "original", label: "Original", testId: "translation-display-original" },
              ]}
            />
          </div>

          {(settingsError || languageError || translationDisplayError) && (
            <Banner intent="warning" density="sm" className="font-bold">
              {translationDisplayError || languageError || settingsError}
            </Banner>
          )}
          <button
            type="submit"
            disabled={!languageRegionDirty || savingLanguageRegion || settingsLoading}
            className="btn-brutal bg-brutal-pink px-3 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingLanguageRegion ? "Saving…" : languageRegionSaved ? (
              <><Check size={14} /> Saved</>
            ) : "Save"}
          </button>
        </form>
      </div>

      <div className="mb-6">
        <SectionHeader
          className="mb-3"
          icon={<Clock size={16} />}
          label="Date & Time"
        />

        <form onSubmit={handleSaveDateTime} className="border-2 border-black bg-white shadow-brutal-sm p-4 space-y-4">
          <div className="space-y-3">
            <div>
              <div className="text-sm font-bold text-black">Timezone</div>
              <div className="text-xs text-black/60 mt-0.5">
                Used for local timestamps and scheduling defaults.
              </div>
            </div>
            <Select
              value={timezone}
              onChange={(next) => {
                setDateTimeSaved(false);
                setTimezoneError("");
                setTimezone(next);
              }}
              disabled={savingDateTime || settingsLoading}
              options={timezoneOptions}
              className="max-w-sm"
              hideSelectedOption
              hiddenOptionValues={hiddenTimezoneOptionValues}
            />
            <div>
              <div className="text-sm font-bold text-black">Time format</div>
              <div className="text-xs text-black/60 mt-0.5">
                Display only. Does not affect agent behavior.
              </div>
            </div>
            <SegmentedControl<"12h" | "24h">
              value={timeFormat}
              ariaLabel="Time format"
              onChange={(next) => {
                setDateTimeSaved(false);
                setTimeFormatError("");
                setTimeFormat(next);
              }}
              disabled={savingDateTime || settingsLoading}
              options={[
                { value: "12h", label: "12-hour", testId: "time-format-12h" },
                { value: "24h", label: "24-hour", testId: "time-format-24h" },
              ]}
            />
          </div>

          {(settingsError || timezoneError || timeFormatError) && (
            <Banner intent="warning" density="sm" className="font-bold">
              {timezoneError || timeFormatError || settingsError}
            </Banner>
          )}
          <button
            type="submit"
            disabled={!dateTimeDirty || savingDateTime || settingsLoading}
            className="btn-brutal bg-brutal-pink px-3 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingDateTime ? "Saving…" : dateTimeSaved ? (
              <><Check size={14} /> Saved</>
            ) : "Save"}
          </button>
        </form>
      </div>
    </>
  );
}

function NotificationsSection() {
  const currentServer = useServerStore((s) => s.current);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);
  const [muting, setMuting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  const [serverConfigured, setServerConfigured] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [serverPushMuted, setServerPushMuted] = useState(false);
  const [savedServerPushMuted, setSavedServerPushMuted] = useState(false);

  const refreshState = async () => {
    setLoading(true);
    setPermission(getPushPermissionState());
    const [configured, currentSubscribed, notificationSettings] = await Promise.all([
      isPushServerConfigured(),
      isPushSubscribed(),
      currentServer
        ? api.get(`/servers/${currentServer.id}/notification-settings`).then((res) => res.data as { serverPushMuted: boolean }).catch(() => null)
        : Promise.resolve(null),
    ]);
    setServerConfigured(configured);
    setSubscribed(currentSubscribed);
    if (notificationSettings) {
      const nextServerPushMuted = !!notificationSettings.serverPushMuted;
      setServerPushMuted(nextServerPushMuted);
      setSavedServerPushMuted(nextServerPushMuted);
    }
    setLoading(false);
  };

  useEffect(() => {
    void refreshState();
  }, [currentServer?.id]);

  const handleEnable = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    const result = await enablePushNotifications();
    if (result === "unavailable") {
      setError("Push notifications are not configured on this server yet.");
    } else if (result === "denied") {
      setError("Browser notification permission was denied.");
    } else if (result === "error") {
      setError("Failed to enable push notifications.");
    }
    await refreshState();
    setBusy(false);
  };

  const handleDisable = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    const ok = await disablePushNotifications();
    if (!ok) {
      setError("Failed to disable push notifications.");
    }
    await refreshState();
    setBusy(false);
  };

  const handleSendTest = async () => {
    setTesting(true);
    setError("");
    setMessage("");
    const result = await sendTestPushNotification();
    if (result === "ok") {
      setMessage("Test push sent. You should see a notification even if this Settings tab is focused.");
    } else if (result === "unavailable") {
      setError("Push notifications are not configured on this server yet.");
    } else if (result === "not_subscribed") {
      setError("This browser does not have an active push subscription yet. Re-enable push notifications and try again.");
    } else if (result === "error") {
      setError("Failed to send test push.");
    }
    await refreshState();
    setTesting(false);
  };

  const handleSaveServerMute = async (event: FormEvent) => {
    event.preventDefault();
    if (!currentServer) return;
    setMuting(true);
    setError("");
    setMessage("");
    try {
      const { data } = await api.patch(`/servers/${currentServer.id}/notification-settings`, {
        serverPushMuted,
      });
      const nextServerPushMuted = !!data.serverPushMuted;
      setServerPushMuted(nextServerPushMuted);
      setSavedServerPushMuted(nextServerPushMuted);
      setMessage(nextServerPushMuted
        ? `Notifications from ${currentServer.name} are muted.`
        : `Notifications from ${currentServer.name} are unmuted.`);
    } catch {
      setError("Failed to update server notification setting.");
    }
    setMuting(false);
  };

  const statusLabel = loading
    ? "Checking…"
    : permission === "unsupported"
      ? "Unsupported"
      : !serverConfigured
        ? "Unavailable"
        : subscribed
          ? "Enabled"
          : permission === "granted"
            ? "Ready to enable"
            : permission === "denied"
              ? "Denied"
              : "Disabled";

  return (
    <div>
      <SectionHeader
        className="mb-3"
        icon={<Bell size={16} />}
        label="Push Notifications"
      />

      <div className="border-2 border-black bg-white shadow-brutal-sm p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-black">DMs, direct mentions, and followed thread replies</div>
            <div className="text-xs text-black/60 mt-0.5">
              Uses web push so notifications can still arrive when the tab is in the background.
            </div>
          </div>
          <span className="inline-flex shrink-0 border-2 border-black bg-brutal-yellow px-2 py-1 text-[10px] font-bold uppercase">
            {statusLabel}
          </span>
        </div>

        {permission === "unsupported" && (
          <div className="text-xs text-black/60">
            This browser does not support service worker push notifications.
          </div>
        )}

        {permission !== "unsupported" && !serverConfigured && !loading && (
          <div className="text-xs text-black/60">
            Push notifications are not configured on this server yet.
          </div>
        )}

        {permission === "denied" && (
          <div className="text-xs text-black/60">
            Browser permission is denied. Re-enable notifications in browser site settings, then come back here.
          </div>
        )}

        {error && (
          <Banner intent="warning" density="sm" className="font-bold">{error}</Banner>
        )}

        {message && (
          <div className="border-2 border-black bg-brutal-lime/30 p-2 text-xs font-bold">{message}</div>
        )}

        <div className="flex gap-2">
          {subscribed ? (
            <>
              <button
                onClick={handleDisable}
                disabled={busy || testing}
                className="btn-brutal bg-white px-3 py-1.5 text-xs"
              >
                {busy ? "Disabling…" : "Disable Push Notifications"}
              </button>
              <button
                onClick={handleSendTest}
                disabled={busy || testing || permission === "unsupported" || !serverConfigured}
                className="btn-brutal bg-brutal-lime px-3 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testing ? "Sending…" : "Send Test Push"}
              </button>
            </>
          ) : (
            <button
              onClick={handleEnable}
              disabled={busy || testing || permission === "unsupported" || !serverConfigured}
              className="btn-brutal bg-brutal-pink px-3 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? "Enabling…" : "Enable Push Notifications"}
            </button>
          )}
        </div>

        {currentServer && (
          <div className="border-t-2 border-black/20 pt-3">
            <form onSubmit={handleSaveServerMute} className="space-y-3">
              <label className={`flex items-start gap-3 ${loading || busy || testing || muting ? "opacity-60" : ""}`}>
                <Checkbox
                  size="md"
                  checked={serverPushMuted}
                  disabled={loading || busy || testing || muting}
                  onChange={(event) => {
                    setServerPushMuted(event.currentTarget.checked);
                    setMessage("");
                    setError("");
                  }}
                  className="mt-0.5"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-black">Mute this server</span>
                  <span className="block text-xs text-black/60 mt-0.5">
                    Stops web push notifications from {currentServer.name} for your account. Other servers are unchanged.
                  </span>
                </span>
              </label>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={serverPushMuted === savedServerPushMuted || loading || busy || testing || muting}
                  className="btn-brutal bg-brutal-pink px-3 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {muting ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Invites Section ──

interface PendingInvite {
  id: string;
  invitedEmail: string;
  createdAt: string;
}

interface JoinLinkRecord {
  id: string;
  token: string;
  createdAt: string;
  expiresAt: string | null;
  maxUses: number | null;
  useCount: number;
  revokedAt: string | null;
}

interface OAuthClientRecord {
  id: string;
  serverId: string;
  clientId: string;
  name: string;
  description: string | null;
  homepageUrl: string | null;
  returnUrl: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

function ProfileSection() {
  const server = useServerStore((s) => s.current);
  const updateServerProfile = useServerStore((s) => s.updateServerProfile);
  const { capabilities } = useServerPermissions();
  const canEdit = capabilities.manageServer;

  const [name, setName] = useState(server?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(server?.name ?? "");
  }, [server?.id, server?.name]);

  if (!server) return null;

  const dirty =
    name.trim().length > 0
    && name.trim() !== server.name;

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      await updateServerProfile({
        name: name.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update server");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-6">
      <SectionHeader
        className="mb-3"
        icon={<Building2 size={16} />}
        label="Profile"
      />

      <form onSubmit={handleSave} className="border-2 border-black bg-white shadow-brutal-sm p-4 space-y-3">
        <FormField label="Name" labelStyle="plain" size="compact">
          {canEdit ? (
            <input
              data-testid="server-profile-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className="w-full border-2 border-black p-2 text-sm shadow-brutal-sm focus:shadow-brutal focus:outline-none"
            />
          ) : (
            <div
              data-testid="server-profile-name-readonly"
              className="w-full border-2 border-black/30 bg-gray-50 p-2 text-sm font-mono text-black/60"
            >
              {server.name}
            </div>
          )}
        </FormField>

        <FormField label="Slug" labelStyle="plain" size="compact">
          <div className="w-full border-2 border-black/30 bg-gray-50 p-2 text-sm font-mono text-black/60">
            {server.slug}
          </div>
        </FormField>

        {error && (
          <Banner intent="warning" density="sm" className="font-bold">{error}</Banner>
        )}

        {canEdit && (
          <button
            data-testid="server-profile-save-button"
            type="submit"
            disabled={!dirty || saving}
            className="btn-brutal bg-brutal-pink px-3 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : saved ? (
              <><Check size={14} /> Saved</>
            ) : "Save Profile"}
          </button>
        )}
      </form>
    </div>
  );
}

function AdminsSection() {
  const members = useServerStore((s) => s.members);
  const loadMembers = useServerStore((s) => s.loadMembers);
  const updateMemberRole = useServerStore((s) => s.updateMemberRole);
  const { role, capabilities } = useServerPermissions();

  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedRole, setSelectedRole] = useState<Extract<ServerRole, "owner" | "admin">>("admin");
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const canManageAdminRoles = capabilities.changeMemberRoles;
  const admins = useMemo(() => getAdminMembers(members), [members]);
  const candidates = useMemo(() => getAdminCandidateMembers(members, role), [members, role]);
  const selectedCandidate = candidates.find((member) => member.userId === selectedMemberId) ?? null;
  const selectedRoleOptions = selectedCandidate ? getAdminRoleOptions(role, selectedCandidate) : [];
  const ownerCount = members.filter((member) => member.role === "owner").length;

  useEffect(() => {
    if (canManageAdminRoles) void loadMembers();
  }, [canManageAdminRoles, loadMembers]);

  useEffect(() => {
    if (selectedMemberId && !candidates.some((member) => member.userId === selectedMemberId)) {
      setSelectedMemberId("");
    }
  }, [candidates, selectedMemberId]);

  useEffect(() => {
    if (!selectedCandidate) {
      setSelectedRole("admin");
      return;
    }
    const options = getAdminRoleOptions(role, selectedCandidate);
    if (!options.includes(selectedRole)) {
      setSelectedRole(options[0] ?? "admin");
    }
  }, [role, selectedCandidate, selectedRole]);

  if (!canManageAdminRoles) return null;

  const handlePromote = async () => {
    if (!selectedCandidate) return;
    setSavingUserId(selectedCandidate.userId);
    setError("");
    try {
      await updateMemberRole(selectedCandidate.userId, selectedRole);
      setSelectedMemberId("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update role");
    } finally {
      setSavingUserId(null);
    }
  };

  const handleDemote = async (userId: string) => {
    setSavingUserId(userId);
    setError("");
    try {
      await updateMemberRole(userId, "member");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to remove role");
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <div className="mb-6">
      <SectionHeader
        className="mb-3"
        icon={<Shield size={16} />}
        label="Owners & Admins"
        count={admins.length}
      />

      <div className="border-2 border-black bg-white shadow-brutal-sm p-4 space-y-4">
        <div>
          <div className="mb-2 text-xs font-bold text-black/60">Add owner/admin</div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              value={selectedMemberId}
              onChange={setSelectedMemberId}
              options={[
                { value: "", label: candidates.length > 0 ? "Select member…" : "No members to promote", disabled: true },
                ...candidates.map((member) => ({
                  value: member.userId,
                  label: member.email ? `${getMemberLabel(member)} · ${member.email}` : getMemberLabel(member),
                })),
              ]}
              disabled={candidates.length === 0 || savingUserId != null}
              className="min-w-0 flex-1"
            />
            <Select
              value={selectedRole}
              onChange={(value) => setSelectedRole(value as Extract<ServerRole, "owner" | "admin">)}
              options={[
                { value: "owner", label: "Owner", disabled: !selectedRoleOptions.includes("owner") },
                { value: "admin", label: "Admin", disabled: !selectedRoleOptions.includes("admin") },
              ]}
              disabled={!selectedCandidate || selectedRoleOptions.length === 0 || savingUserId != null}
              className="min-w-[120px]"
            />
            <button
              type="button"
              onClick={handlePromote}
              disabled={!selectedCandidate || selectedRoleOptions.length === 0 || savingUserId != null}
              className="btn-brutal bg-brutal-pink px-3 py-2 [@media(max-height:600px)]:py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedCandidate && savingUserId === selectedCandidate.userId ? "Saving…" : "Update Role"}
            </button>
          </div>
        </div>

        <div className="border-t-2 border-black pt-4">
          {admins.length > 0 ? (
            <div className="space-y-2">
              {admins.map((admin) => {
                const canRemove = canRemoveAdminMember(role, admin, ownerCount);
                const label = getMemberLabel(admin);
                return (
                  <AvatarListRow
                    key={admin.userId}
                    avatar={
                      // stdrc #wg-theme:7470ca2a: admin avatar pins to the
                      // top of the row (so the avatar lines up with the
                      // first line — the name) while the Remove button on
                      // the right stays vertically centered. self-start on
                      // the avatar achieves that without disrupting the
                      // shared row alignment.
                      <AvatarSlot
                        context="surface-list"
                        type="human"
                        humanAvatarUrl={admin.avatarUrl}
                        gravatarHash={admin.gravatarHash}
                        email={admin.email}
                        className="self-start"
                      />
                    }
                    name={label}
                    subtitle={admin.email ? `${admin.email} · ${admin.role}` : admin.role}
                    rightContent={
                      canRemove ? (
                        <button
                          type="button"
                          onClick={() => handleDemote(admin.userId)}
                          disabled={savingUserId != null}
                          className="btn-brutal-sm shrink-0 bg-white px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {savingUserId === admin.userId ? "Saving…" : admin.role === "owner" ? "Remove Owner" : "Remove Admin"}
                        </button>
                      ) : (
                        <span className="shrink-0 text-[10px] font-mono text-black/40">
                          {admin.role === "owner" && ownerCount <= 1 ? "Last owner" : "Owner only"}
                        </span>
                      )
                    }
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-black/40 italic">
              No owners or admins yet.
            </div>
          )}
        </div>

        {error && (
          <Banner intent="warning" density="sm" className="font-bold">{error}</Banner>
        )}
      </div>
    </div>
  );
}

function InvitesSection() {
  const current = useServerStore((s) => s.current);
  const { capabilities } = useServerPermissions();

  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<PendingInvite | null>(null);

  const canInvite = capabilities.manageMembers;

  useEffect(() => {
    if (current && canInvite) {
      loadInvites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, canInvite]);

  const loadInvites = async () => {
    if (!current) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/servers/${current.id}/invites`);
      setInvites(data);
    } catch {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (inviteId: string) => {
    if (!current) return;
    try {
      await api.delete(`/servers/${current.id}/invites/${inviteId}`);
      await loadInvites();
    } catch {
      // Ignore
    }
  };

  if (!canInvite) return null;

  return (
    <div className="mb-6">
      <SectionHeader
        className="mb-3"
        icon={<Mail size={16} />}
        label="Pending Invites"
        count={invites.length > 0 ? invites.length : null}
      />

      <div className="border-2 border-black bg-white shadow-brutal-sm p-4">
        {invites.length > 0 ? (
          <div className="space-y-1.5">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center gap-2 border-2 border-black/30 px-3 py-2"
              >
                <span className="flex-1 font-mono text-xs text-black truncate">
                  {invite.invitedEmail}
                </span>
                <span className="text-[10px] text-black/40 font-mono shrink-0">
                  {new Date(invite.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <button
                  onClick={() => setRevokeTarget(invite)}
                  className="shrink-0 btn-brutal-sm bg-white p-1"
                  title="Revoke invite"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : !loading ? (
          <div className="text-xs text-black/40 italic">
            No pending invites.
          </div>
        ) : null}
      </div>

      {revokeTarget && (
        <ConfirmDialog
          title="Revoke Invite"
          message={`Are you sure you want to revoke the invite to ${revokeTarget.invitedEmail}? They will no longer be able to join using this invite link.`}
          confirmLabel="Revoke Invite"
          loadingLabel="Revoking…"
          onConfirm={() => handleRevoke(revokeTarget.id)}
          onClose={() => setRevokeTarget(null)}
        />
      )}
    </div>
  );
}

function JoinLinksSection() {
  const current = useServerStore((s) => s.current);
  const { capabilities } = useServerPermissions();
  const { formatShortDateTime } = useTimeFormatter();

  const [links, setLinks] = useState<JoinLinkRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [revokeTarget, setRevokeTarget] = useState<JoinLinkRecord | null>(null);

  const canManageLinks = capabilities.manageMembers;

  useEffect(() => {
    if (current && canManageLinks) {
      loadLinks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, canManageLinks]);

  const loadLinks = async () => {
    if (!current) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/servers/${current.id}/join-links`);
      setLinks(data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!current) return;
    setCreating(true);
    setCreateError("");
    try {
      const { data } = await api.post(`/servers/${current.id}/join-links`, {
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      });
      setLinks((prev) => [data.link, ...prev]);
    } catch (err: any) {
      setCreateError(err.response?.data?.error || "Failed to create join link");
    } finally {
      setCreating(false);
    }
  };

  const buildJoinLinkUrl = (token: string) => `${window.location.origin}/join/${token}`;

  const handleCopy = async (linkId: string, token: string) => {
    await navigator.clipboard.writeText(buildJoinLinkUrl(token));
    setCopiedLinkId(linkId);
    window.setTimeout(() => setCopiedLinkId((current) => current === linkId ? null : current), 1500);
  };

  const handleRevoke = async (linkId: string) => {
    if (!current) return;
    try {
      await api.delete(`/servers/${current.id}/join-links/${linkId}`);
      setLinks((prev) => prev.filter((link) => link.id !== linkId));
    } catch {
      // Ignore
    }
  };

  if (!canManageLinks) return null;

  return (
    <div className="mb-6">
      <SectionHeader
        className="mb-3"
        icon={<Link2 size={16} />}
        label="Join Links"
        count={links.length > 0 ? links.length : null}
      />

      <div className="border-2 border-black bg-white shadow-brutal-sm p-4">
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Max Uses" labelStyle="plain" size="compact" htmlFor="join-link-max-uses">
              <input
                id="join-link-max-uses"
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Unlimited"
                className="w-full border-2 border-black p-2 text-sm shadow-brutal-sm focus:shadow-brutal focus:outline-none"
              />
            </FormField>

            <FormField label="Expires At" labelStyle="plain" size="compact" htmlFor="join-link-expires-at">
              <input
                id="join-link-expires-at"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full border-2 border-black p-2 text-sm shadow-brutal-sm focus:shadow-brutal focus:outline-none"
              />
            </FormField>
          </div>

          {createError && (
            <Banner intent="warning" density="sm" className="font-bold">
              {createError}
            </Banner>
          )}

          <button
            type="submit"
            disabled={creating}
            className="btn-brutal bg-brutal-pink px-3 py-1.5 text-xs flex items-center gap-1.5"
          >
            <Plus size={14} />
            {creating ? "Creating…" : "Create Join Link"}
          </button>
        </form>

        <div className="mt-4 border-t-2 border-black pt-4">
          {links.length > 0 ? (
            <div className="space-y-2">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="border-2 border-black/30 px-3 py-2.5 space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1 border-2 border-black bg-white px-2 py-1 font-mono text-[11px] truncate select-all">
                      {buildJoinLinkUrl(link.token)}
                    </div>
                    <button
                      onClick={() => handleCopy(link.id, link.token)}
                      className="btn-brutal-sm shrink-0 bg-white p-1.5"
                      title="Copy join link"
                    >
                      {copiedLinkId === link.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={() => setRevokeTarget(link)}
                      className="btn-brutal-sm shrink-0 bg-white p-1.5"
                      title="Revoke join link"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="text-[11px] text-black/50 font-mono">
                    {link.maxUses != null ? `${link.useCount}/${link.maxUses} uses` : `${link.useCount} uses`}
                    {" · "}
                    {link.expiresAt
                      ? `expires ${formatShortDateTime(link.expiresAt)}`
                      : "no expiry"}
                  </div>
                </div>
              ))}
            </div>
          ) : !loading ? (
            <div className="text-xs text-black/40 italic">
              No active join links.
            </div>
          ) : null}
        </div>
      </div>

      {revokeTarget && (
        <ConfirmDialog
          title="Revoke Join Link"
          message="Revoke this join link? Anyone who still has the URL will stop being able to join with it."
          confirmLabel="Revoke Link"
          loadingLabel="Revoking…"
          onConfirm={() => handleRevoke(revokeTarget.id)}
          onClose={() => setRevokeTarget(null)}
        />
      )}
    </div>
  );
}

function OnboardingAgentSection() {
  const current = useServerStore((s) => s.current);
  const allAgents = useAgentStore((s) => s.agents);
  const agents = useMemo(() => allAgents.filter((agent) => !agent.deletedAt), [allAgents]);
  const { capabilities, isAdminOrOwner } = useServerPermissions();

  const [onboardingAgentId, setOnboardingAgentId] = useState("");
  const [agentAllChannelGreetingEnabled, setAgentAllChannelGreetingEnabled] = useState(true);
  const [savedOnboardingAgentId, setSavedOnboardingAgentId] = useState("");
  const [savedAgentAllChannelGreetingEnabled, setSavedAgentAllChannelGreetingEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const canManageLinks = capabilities.manageMembers;

  useEffect(() => {
    if (!current || !canManageLinks) return;
    setLoading(true);
    setError("");
    void api
      .get(`/servers/${current.id}/onboarding-settings`)
      .then(({ data }) => {
        const nextOnboardingAgentId = data.onboardingAgentId || "";
        const nextAgentAllChannelGreetingEnabled = data.agentAllChannelGreetingEnabled !== false;
        setOnboardingAgentId(nextOnboardingAgentId);
        setAgentAllChannelGreetingEnabled(nextAgentAllChannelGreetingEnabled);
        setSavedOnboardingAgentId(nextOnboardingAgentId);
        setSavedAgentAllChannelGreetingEnabled(nextAgentAllChannelGreetingEnabled);
        setSaved(false);
      })
      .catch(() => {
        setError("Failed to load onboarding settings");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [canManageLinks, current?.id]);

  const dirty =
    onboardingAgentId !== savedOnboardingAgentId
    || agentAllChannelGreetingEnabled !== savedAgentAllChannelGreetingEnabled;

  const handleSave = async () => {
    if (!current || !isAdminOrOwner) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await api.patch(`/servers/${current.id}/onboarding-settings`, {
        onboardingAgentId: onboardingAgentId || null,
        agentAllChannelGreetingEnabled,
      });
      setSavedOnboardingAgentId(onboardingAgentId);
      setSavedAgentAllChannelGreetingEnabled(agentAllChannelGreetingEnabled);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save onboarding agent");
    } finally {
      setSaving(false);
    }
  };

  if (!canManageLinks) return null;

  return (
    <div className="mb-6">
      <SectionHeader
        className="mb-3"
        icon={<Bot size={16} />}
        label="Onboarding"
      />

      <div className="border-2 border-black bg-white shadow-brutal-sm p-4">
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 pr-0 sm:pr-4">
              <div className="text-xs font-bold text-black">
                Human Onboarding Agent
              </div>
              <div className="mt-1 text-[11px] leading-snug text-black/60">
                Select one agent for member onboarding flows, or disable automatic onboarding.
              </div>
            </div>
            <Select
              value={onboardingAgentId}
              onChange={(value) => {
                setOnboardingAgentId(value);
                setSaved(false);
              }}
              disabled={!isAdminOrOwner || saving || loading}
              options={[
                { value: "", label: "Disabled (no automatic onboarding)" },
                ...agents.map((agent) => ({
                  value: agent.id,
                  label: `@${agent.name}${agent.displayName ? ` (${agent.displayName})` : ""}`,
                })),
              ]}
              className="w-full shrink-0 sm:w-80"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 pr-0 sm:pr-4">
              <div className="text-xs font-bold text-black">
                New Agent Greeting
              </div>
              <div className="mt-1 text-[11px] leading-snug text-black/60">
                When enabled, a newly started agent posts a short self-introduction in #all. Existing agents are not affected.
              </div>
            </div>
            <Select
              value={agentAllChannelGreetingEnabled ? "yes" : "no"}
              onChange={(value) => {
                setAgentAllChannelGreetingEnabled(value === "yes");
                setSaved(false);
              }}
              disabled={!isAdminOrOwner || saving || loading}
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              className="w-full shrink-0 sm:w-28"
            />
          </div>
        </div>

        {error && (
          <Banner intent="warning" density="sm" className="mt-2 font-bold">
            {error}
          </Banner>
        )}

        <div className="mt-2 flex items-center justify-between">
          {!isAdminOrOwner && (
            <div className="text-[11px] text-black/50">Only server owners and admins can change onboarding agent.</div>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!isAdminOrOwner || !dirty || saving || loading}
            className="btn-brutal bg-brutal-pink px-3 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MemberPermissionsSection() {
  const server = useServerStore((s) => s.current);
  const updateServerProfile = useServerStore((s) => s.updateServerProfile);
  const { capabilities } = useServerPermissions();
  const canEdit = capabilities.manageServer;

  const [hideHumansFromMembers, setHideHumansFromMembers] = useState(server?.hideHumansFromMembers ?? false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setHideHumansFromMembers(server?.hideHumansFromMembers ?? false);
    setSaved(false);
    setError("");
  }, [server?.id, server?.hideHumansFromMembers]);

  if (!server) return null;

  const dirty = hideHumansFromMembers !== server.hideHumansFromMembers;

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await updateServerProfile({ hideHumansFromMembers });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update member permissions");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-6">
      <SectionHeader
        className="mb-3"
        icon={<Users size={16} />}
        label="Member Permissions"
      />

      <form onSubmit={handleSave} className="border-2 border-black bg-white shadow-brutal-sm p-4 space-y-3">
        <label className={`flex items-start gap-3 ${canEdit ? "" : "opacity-60"}`}>
          <Checkbox
            size="md"
            checked={hideHumansFromMembers}
            disabled={!canEdit || saving}
            onChange={(event) => setHideHumansFromMembers(event.currentTarget.checked)}
            className="mt-0.5"
          />
          <span className="min-w-0">
            <span className="block text-sm font-bold text-black">Hide human directory and counts from members</span>
            <span className="block text-xs text-black/60 mt-0.5">
              Member role users cannot see server-wide human lists, graph surfaces, or human counts.
            </span>
          </span>
        </label>

        {error && (
          <Banner intent="warning" density="sm" className="font-bold">{error}</Banner>
        )}

        {canEdit && (
          <button
            type="submit"
            disabled={!dirty || saving}
            className="btn-brutal bg-brutal-pink px-3 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : saved ? (
              <><Check size={14} /> Saved</>
            ) : "Save"}
          </button>
        )}
      </form>
    </div>
  );
}

function ServerTranslationSection() {
  const currentServer = useServerStore((s) => s.current);
  const settings = useTranslationStore((s) => s.settings);
  const settingsLoading = useTranslationStore((s) => s.settingsLoading);
  const settingsError = useTranslationStore((s) => s.settingsError);
  const loadSettings = useTranslationStore((s) => s.loadSettings);
  const updateServerTranslationEnabled = useTranslationStore((s) => s.updateServerTranslationEnabled);

  const [enabled, setEnabled] = useState(settings.serverTranslationEnabled);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadSettings(currentServer?.id);
  }, [currentServer?.id, loadSettings]);

  useEffect(() => {
    setEnabled(settings.serverTranslationEnabled);
    setSaved(false);
    setError("");
  }, [settings.serverTranslationEnabled]);

  if (!currentServer) return null;

  const dirty = enabled !== settings.serverTranslationEnabled;
  const showProviderWarning = enabled && !settings.providerAvailable;

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await updateServerTranslationEnabled(enabled);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update server translation setting");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-6">
      <SectionHeader
        className="mb-3"
        icon={<Languages size={16} />}
        label="Translation"
      />

      <form onSubmit={handleSave} className="border-2 border-black bg-white shadow-brutal-sm p-4 space-y-3">
        <label className={`flex items-start gap-3 ${settingsLoading || !settings.canManageServerTranslation ? "opacity-60" : ""}`}>
          <Checkbox
            size="md"
            checked={enabled}
            disabled={saving || settingsLoading || !settings.canManageServerTranslation}
            onChange={(event) => setEnabled(event.currentTarget.checked)}
            className="mt-0.5"
          />
          <span className="min-w-0">
            <span className="block text-sm font-bold text-black">Enable message translation for this server</span>
            <span className="block text-xs text-black/60 mt-0.5">
              Turn on message translation for this server. When this is off, members' language and display preferences will not translate messages here.
            </span>
          </span>
        </label>

        {showProviderWarning && (
          <Banner intent="warning" density="sm" className="font-bold">
            Translation is enabled for this server, but no translation provider is configured.
          </Banner>
        )}

        {(settingsError || error) && (
          <Banner intent="warning" density="sm" className="font-bold">{error || settingsError}</Banner>
        )}

        {settings.canManageServerTranslation && (
          <button
            type="submit"
            disabled={!dirty || saving || settingsLoading}
            className="btn-brutal bg-brutal-pink px-3 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : saved ? (
              <><Check size={14} /> Saved</>
            ) : "Save"}
          </button>
        )}
      </form>
    </div>
  );
}

// ── Plan & Billing Section ──

function UsageBar({ current, max, label }: { current: number; max: number; label: string }) {
  const unlimited = max === -1;
  const pct = unlimited ? 0 : Math.min((current / max) * 100, 100);
  const atLimit = !unlimited && current >= max;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-black">{label}</span>
        <span className="text-xs font-mono text-black/60">
          {current} / {unlimited ? "\u221E" : max}
        </span>
      </div>
      <div className="h-3 border-2 border-black bg-white">
        <div
          className={`h-full transition-all ${atLimit ? "bg-brutal-orange" : "bg-brutal-lime"}`}
          style={{ width: unlimited ? "0%" : `${pct}%` }}
        />
      </div>
    </div>
  );
}

function DowngradeWarningCard({ server, usage }: { server: { planDowngradedAt: string | null }; usage: { agents: number; machines: number; channels?: number } | null }) {
  if (!server.planDowngradedAt) return null;

  const downgradedAt = new Date(server.planDowngradedAt);
  const graceEnd = new Date(downgradedAt);
  graceEnd.setDate(graceEnd.getDate() + DOWNGRADE_GRACE_PERIOD_DAYS);
  const now = new Date();
  const graceExpired = now >= graceEnd;
  const daysLeft = graceExpired
    ? 0
    : Math.ceil((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const limits = getEffectiveLimits("free");
  const agentCount = usage?.agents ?? 0;
  const machineCount = usage?.machines ?? 0;
  const channelCount = usage?.channels ?? 0;
  const excessAgents = Math.max(0, agentCount - limits.maxAgents);
  const excessMachines = Math.max(0, machineCount - limits.maxMachines);
  const excessChannels = limits.maxChannels !== -1 ? Math.max(0, channelCount - limits.maxChannels) : 0;

  return (
    <div className="mb-4 border-2 border-black bg-brutal-orange/20 shadow-brutal-sm p-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={16} className="text-black" />
        <span className="text-sm font-bold">
          {graceExpired ? "Grace Period Expired" : "Plan Downgraded"}
        </span>
      </div>
      {graceExpired ? (
        <p className="text-xs text-black/60 font-mono">
          The grace period has ended. Excess agents have been stopped. Upgrade to reactivate them.
        </p>
      ) : (
        <>
          <p className="text-xs text-black/60 font-mono mb-2">
            <span className="font-bold text-black">{daysLeft} {daysLeft === 1 ? "day" : "days"}</span> remaining in grace period.
            {excessAgents === 0 && excessMachines === 0 && excessChannels === 0
              ? " All resources are within free limits."
              : " After the grace period, excess agents will be stopped automatically."}
          </p>
          {(excessAgents > 0 || excessMachines > 0 || excessChannels > 0) && (
            <div className="space-y-1">
              {excessAgents > 0 && (
                <div className="text-xs font-mono">
                  <span className="font-bold text-brutal-orange">{excessAgents}</span> {excessAgents === 1 ? "agent" : "agents"} over limit ({agentCount}/{limits.maxAgents})
                </div>
              )}
              {excessMachines > 0 && (
                <div className="text-xs font-mono">
                  <span className="font-bold text-brutal-orange">{excessMachines}</span> {excessMachines === 1 ? "computer" : "computers"} over limit ({machineCount}/{limits.maxMachines})
                </div>
              )}
              {excessChannels > 0 && (
                <div className="text-xs font-mono">
                  <span className="font-bold text-brutal-orange">{excessChannels}</span> {excessChannels === 1 ? "channel" : "channels"} over limit ({channelCount}/{limits.maxChannels})
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PlanSection() {
  const server = useServerStore((s) => s.current);
  const usage = useServerStore((s) => s.usage);
  const loadUsage = useServerStore((s) => s.loadUsage);

  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  const plan = (server?.plan || "free") as ServerPlan;
  const config = PLAN_CONFIG[plan];
  const limits = getEffectiveLimits(plan);
  const trialActive = isTrialActive();

  const agentCount = usage?.agents ?? 0;

  return (
    <div className="mb-6">
      <SectionHeader
        className="mb-3"
        icon={<CreditCard size={16} />}
        label="Plan & Billing"
      />

      {/* Downgrade warning */}
      {server?.planDowngradedAt && (
        <DowngradeWarningCard server={server} usage={usage} />
      )}

      {/* Free trial notice */}
      {plan === "free" && trialActive && (
        <div className="mb-4 border-2 border-black bg-brutal-lime/30 shadow-brutal-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold">Free Trial Active</span>
          </div>
          <p className="text-xs text-black/60 font-mono">
            All features unlocked until {getTrialEndDate().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}. Enjoy unlimited computers, agents, channels, and message history.
          </p>
        </div>
      )}

      {/* Founder plan notice */}
      {plan === "founder" && (
        <div className="mb-4 border-2 border-black bg-brutal-yellow/30 shadow-brutal-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold">Founder Plan</span>
          </div>
          <p className="text-xs text-black/60 font-mono">
            Thank you for being an early supporter! You have permanent free unlimited access to all features.
          </p>
        </div>
      )}

      {/* Current plan card */}
      <div className="mb-6 border-2 border-black bg-white shadow-brutal-sm p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-sm font-bold text-black">Current Plan:</span>
          <span className="inline-block border-2 border-black bg-brutal-yellow px-3 py-0.5 text-sm font-bold uppercase">
            {config.displayName}
          </span>
        </div>

        <div className="space-y-3">
          {limits.maxMachines === -1 ? (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-black">Computers</span>
              <span className="text-xs font-mono text-black/60">{usage?.machines ?? 0} (Unlimited)</span>
            </div>
          ) : (
            <UsageBar current={usage?.machines ?? 0} max={limits.maxMachines} label="Computers" />
          )}
          {limits.maxAgents === -1 ? (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-black">Agents</span>
              <span className="text-xs font-mono text-black/60">{agentCount} (Unlimited)</span>
            </div>
          ) : (
            <UsageBar current={agentCount} max={limits.maxAgents} label="Agents" />
          )}
          {limits.maxChannels === -1 ? (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-black">Channels</span>
              <span className="text-xs font-mono text-black/60">{usage?.channels ?? 0} (Unlimited)</span>
            </div>
          ) : (
            <UsageBar current={usage?.channels ?? 0} max={limits.maxChannels} label="Channels" />
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black">History</span>
            <span className="text-xs font-mono text-black/60">
              {limits.messageHistoryDays === -1 ? "Unlimited" : `${limits.messageHistoryDays} days`}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing comparison */}
      <SectionEyebrow as="div" className="mb-3">
        Plans
      </SectionEyebrow>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {DISPLAY_PLANS.map((p) => {
          const cfg = DISPLAY_PLAN_CONFIG[p];
          const isCurrent = p === plan;
          return (
            <div
              key={p}
              className={`flex flex-col border-2 border-black bg-white p-4 ${
                isCurrent ? "shadow-brutal" : cfg.comingSoon ? "shadow-brutal-sm opacity-60" : "shadow-brutal-sm"
              }`}
            >
              <div className="mb-1">
                <span className="text-base font-bold uppercase">{cfg.displayName}</span>
              </div>
              {!cfg.comingSoon && (
                <div className="mb-3">
                  <span className="text-lg font-bold">
                    {cfg.price === 0 ? "$0" : `$${cfg.price}`}
                  </span>
                  <span className="text-xs text-black/60 font-mono">/mo</span>
                </div>
              )}
              {p === "free" ? (
                <div className="flex-1 space-y-2 text-xs text-black/60 font-mono mb-4">
                  {trialActive ? (
                    <>
                      <div><span className="line-through">{cfg.limits.maxMachines} computers</span> <span className="font-bold text-black">Unlimited (limited time)</span></div>
                      <div><span className="line-through">{cfg.limits.maxAgents} agents</span> <span className="font-bold text-black">Unlimited (limited time)</span></div>
                      <div><span className="line-through">{cfg.limits.maxChannels} channels</span> <span className="font-bold text-black">Unlimited (limited time)</span></div>
                      <div><span className="line-through">{cfg.limits.messageHistoryDays} days history</span> <span className="font-bold text-black">Unlimited (limited time)</span></div>
                    </>
                  ) : (
                    <>
                      <div>{cfg.limits.maxMachines} computers</div>
                      <div>{cfg.limits.maxAgents} agents</div>
                      <div>{cfg.limits.maxChannels} channels</div>
                      <div>{cfg.limits.messageHistoryDays} days history</div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex-1 mb-4" />
              )}
              {isCurrent ? (
                <div className="border-2 border-black bg-brutal-lime px-3 py-1.5 text-xs font-bold text-center uppercase">
                  Current Plan
                </div>
              ) : cfg.comingSoon ? (
                <div className="border-2 border-dashed border-black/40 bg-gray-100 px-3 py-1.5 text-xs font-bold text-center uppercase text-black/40">
                  Coming Soon
                </div>
              ) : (
                <div className="border-2 border-black/30 bg-gray-50 px-3 py-1.5 text-xs font-bold text-center uppercase text-black/40">
                  Not Available
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Danger Zone Section ──
// Owner sees Delete Server (destructive).
// Admin/member see Leave Server (non-destructive, warning level).

function DangerZoneSection() {
  const server = useServerStore((s) => s.current);
  const deleteServer = useServerStore((s) => s.deleteServer);
  const leaveServer = useServerStore((s) => s.leaveServer);
  const { isOwner, role } = useServerPermissions();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmSlug, setConfirmSlug] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  if (!server) return null;
  const canLeave = role === "admin" || role === "member";

  const handleDelete = async () => {
    setDeleteError("");
    setDeleting(true);
    try {
      requestServerSelection();
      await deleteServer();
    } catch (err: any) {
      setDeleteError(err.response?.data?.error || "Failed to delete server");
      setDeleting(false);
    }
  };

  const handleCloseDelete = () => {
    setShowDeleteConfirm(false);
    setConfirmSlug("");
    setDeleteError("");
  };

  return (
    <div className="mb-6">
      <SectionHeader
        className="mb-3"
        icon={<AlertTriangle size={16} />}
        label="Danger Zone"
      />

      {canLeave && (
        <div className="border-2 border-black bg-white shadow-brutal-sm p-4 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-black">Leave Server</div>
              <p className="text-xs text-black/60 mt-0.5">
                You will lose access to this server's channels and DMs. You can rejoin if invited again.
              </p>
            </div>
            <button
              data-testid="server-danger-leave-button"
              onClick={() => setShowLeaveConfirm(true)}
              className="btn-brutal bg-brutal-orange px-4 py-2 [@media(max-height:600px)]:py-1 text-sm font-bold flex items-center gap-1.5 shrink-0 ml-4"
            >
              Leave Server
            </button>
          </div>
        </div>
      )}

      {isOwner && (
        <div className="border-2 border-black bg-white shadow-brutal-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-black">Delete Server</div>
              <p className="text-xs text-black/60 mt-0.5">
                Permanently remove this server and all its data. This cannot be undone.
              </p>
            </div>
            <button
              data-testid="server-danger-delete-button"
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-brutal bg-brutal-red px-4 py-2 [@media(max-height:600px)]:py-1 text-sm font-bold flex items-center gap-1.5 shrink-0 ml-4"
            >
              <Trash2 size={14} />
              Delete Server
            </button>
          </div>
        </div>
      )}

      {showLeaveConfirm && (
        <ConfirmDialog
          title="Leave Server"
          message={`You'll lose access to ${server.name} and all of its channels. You can be re-invited later.`}
          confirmLabel="Leave Server"
          loadingLabel="Leaving…"
          confirmColor="bg-brutal-orange"
          confirmTestId="server-leave-confirm-button"
          onConfirm={async () => {
            requestServerSelection();
            await leaveServer();
          }}
          onClose={() => setShowLeaveConfirm(false)}
        />
      )}

      {showDeleteConfirm && (
        <Modal onClose={handleCloseDelete}>
          <div className="w-full max-w-sm card-brutal p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold uppercase">Delete Server</h2>
              <button onClick={handleCloseDelete} className="btn-brutal-sm bg-white p-1">
                <X size={20} />
              </button>
            </div>

            <Banner intent="destructive" withIcon className="mb-5">
              This will permanently delete <span className="font-bold">{server.name}</span> and all its data (agents, channels, messages). This cannot be undone.
            </Banner>

            <p className="text-sm text-black/60 mb-2">
              Type <span className="font-mono font-bold text-black">{server.slug}</span> to confirm:
            </p>
            <SlugInput
              data-testid="server-delete-slug-input"
              type="text"
              value={confirmSlug}
              onChange={(e) => setConfirmSlug(e.target.value)}
              className="mb-5"
              inputClassName="text-sm font-mono"
              placeholder={server.slug}
              autoFocus
            />

            {deleteError && (
              <Banner intent="warning" className="mb-4">{deleteError}</Banner>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseDelete}
                className="btn-brutal bg-white px-3 py-1.5 text-xs"
              >
                Cancel
              </button>
              <button
                data-testid="server-delete-confirm-button"
                onClick={handleDelete}
                disabled={confirmSlug !== server.slug || deleting}
                className="btn-brutal bg-brutal-red px-3 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting…" : "Delete Server"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function IntegrationsSection() {
  const current = useServerStore((s) => s.current);
  const { capabilities } = useServerPermissions();
  const canManage = capabilities.manageServer;
  const connectedAppsLabel = (
    <span className="inline-flex items-center gap-2">
      <span>Connected Apps</span>
      <ExperimentalBadge />
    </span>
  );

  const [clients, setClients] = useState<OAuthClientRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientDescription, setClientDescription] = useState("");
  const [clientHomepageUrl, setClientHomepageUrl] = useState("");
  const [clientReturnUrl, setClientReturnUrl] = useState("");
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [editClientName, setEditClientName] = useState("");
  const [editClientDescription, setEditClientDescription] = useState("");
  const [editClientHomepageUrl, setEditClientHomepageUrl] = useState("");
  const [editClientReturnUrl, setEditClientReturnUrl] = useState("");
  const [savingClientId, setSavingClientId] = useState<string | null>(null);

  const load = async () => {
    if (!current || !canManage) return;
    setLoading(true);
    setError("");
    try {
      const clientsRes = await api.get("/integrations/clients");
      setClients(clientsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load integrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, canManage]);

  const handleCreateClient = async (e: FormEvent) => {
    e.preventDefault();
    if (!current) return;
    setSubmitting(true);
    setError("");
    setCreatedSecret(null);
    try {
      const { data } = await api.post("/integrations/clients", {
        name: clientName,
        clientId: clientId || undefined,
        description: clientDescription || undefined,
        homepageUrl: clientHomepageUrl || undefined,
        returnUrl: clientReturnUrl || undefined,
      });
      setClientName("");
      setClientId("");
      setClientDescription("");
      setClientHomepageUrl("");
      setClientReturnUrl("");
      setCreatedSecret(data.clientSecret);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create integration client");
    } finally {
      setSubmitting(false);
    }
  };

  const beginEditClient = (client: OAuthClientRecord) => {
    setEditingClientId(client.id);
    setEditClientName(client.name);
    setEditClientDescription(client.description ?? "");
    setEditClientHomepageUrl(client.homepageUrl ?? "");
    setEditClientReturnUrl(client.returnUrl ?? "");
    setError("");
  };

  const handleUpdateClient = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingClientId) return;
    setSavingClientId(editingClientId);
    setError("");
    try {
      const { data } = await api.patch(`/integrations/clients/${editingClientId}`, {
        name: editClientName,
        description: editClientDescription || null,
        homepageUrl: editClientHomepageUrl || null,
        returnUrl: editClientReturnUrl || null,
      });
      setClients((items) => items.map((item) => item.id === editingClientId ? data : item));
      setEditingClientId(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update integration client");
    } finally {
      setSavingClientId(null);
    }
  };

  if (!current) return null;

  if (!canManage) {
    return (
      <div className="mb-6">
        <SectionHeader
          className="mb-3"
          icon={<Link2 size={16} />}
          label={connectedAppsLabel}
        />
        <div className="border-2 border-black bg-white shadow-brutal-sm p-4 text-sm text-black/60">
          Only server owners and admins can manage connected apps.
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-4">
      <SectionHeader
        icon={<Link2 size={16} />}
        label={connectedAppsLabel}
      />

      {error && (
        <Banner intent="warning" density="sm" className="font-bold">{error}</Banner>
      )}

      {createdSecret && (
        <div className="border-2 border-black bg-brutal-lime/20 p-3 space-y-2">
          <SectionEyebrow as="div">Client Secret</SectionEyebrow>
          <div className="text-sm text-black">This secret is only shown once. Copy it now.</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 border-2 border-black bg-white p-2 font-mono text-xs break-all">{createdSecret}</div>
            <button
              onClick={() => navigator.clipboard.writeText(createdSecret)}
              className="btn-brutal bg-brutal-yellow px-3 py-1.5 text-xs"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="border-2 border-black bg-white shadow-brutal-sm p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-black">Registered Apps</div>
            <div className="text-xs text-black/60">Create and manage client credentials for external apps</div>
          </div>
          {loading && <div className="text-xs font-bold text-black/50">Loading…</div>}
        </div>
        <form onSubmit={handleCreateClient} className="space-y-3">
          <FormField label="App Name" labelStyle="plain" size="compact">
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full border-2 border-black p-2 text-sm shadow-brutal-sm focus:shadow-brutal focus:outline-none"
              placeholder="db9 Cloud Drive"
              required
            />
          </FormField>
          <FormField label="Client ID" labelStyle="plain" size="compact">
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full border-2 border-black p-2 text-sm font-mono shadow-brutal-sm focus:shadow-brutal focus:outline-none"
              placeholder="optional; auto-generated if empty"
            />
          </FormField>
          <FormField label="Homepage URL" labelStyle="plain" size="compact">
            <input
              type="url"
              value={clientHomepageUrl}
              onChange={(e) => setClientHomepageUrl(e.target.value)}
              className="w-full border-2 border-black p-2 text-sm shadow-brutal-sm focus:shadow-brutal focus:outline-none"
              placeholder="https://example.com"
            />
          </FormField>
          <FormField label="Return URL" labelStyle="plain" size="compact">
            <input
              type="url"
              value={clientReturnUrl}
              onChange={(e) => setClientReturnUrl(e.target.value)}
              className="w-full border-2 border-black p-2 text-sm shadow-brutal-sm focus:shadow-brutal focus:outline-none"
              placeholder="https://example.com/login/callback"
            />
          </FormField>
          <FormField label="Description" labelStyle="plain" size="compact">
            <textarea
              value={clientDescription}
              onChange={(e) => setClientDescription(e.target.value)}
              className="w-full border-2 border-black p-2 text-sm shadow-brutal-sm focus:shadow-brutal focus:outline-none resize-none"
              rows={3}
              placeholder="What this integration is for"
            />
          </FormField>
          <button type="submit" disabled={submitting} className="btn-brutal bg-brutal-pink px-3 py-1.5 text-xs">
            {submitting ? "Creating…" : "Create App"}
          </button>
        </form>

        {clients.length > 0 && (
          <div className="space-y-2 border-t-2 border-black pt-3">
            {clients.map((client) => (
              <div key={client.id} className="border-2 border-black bg-white p-3">
                {editingClientId === client.id ? (
                  <form onSubmit={handleUpdateClient} className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-mono text-xs text-black/60">{client.clientId}</div>
                        <div className="text-xs text-black/50">Client ID cannot be changed after registration.</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingClientId(null)}
                        className="btn-brutal bg-white px-2 py-1 text-xs"
                        aria-label="Cancel editing app"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <FormField label="App Name" labelStyle="plain" size="compact">
                      <input
                        type="text"
                        value={editClientName}
                        onChange={(e) => setEditClientName(e.target.value)}
                        className="w-full border-2 border-black p-2 text-sm shadow-brutal-sm focus:shadow-brutal focus:outline-none"
                        required
                      />
                    </FormField>
                    <FormField label="Homepage URL" labelStyle="plain" size="compact">
                      <input
                        type="url"
                        value={editClientHomepageUrl}
                        onChange={(e) => setEditClientHomepageUrl(e.target.value)}
                        className="w-full border-2 border-black p-2 text-sm shadow-brutal-sm focus:shadow-brutal focus:outline-none"
                        placeholder="https://example.com"
                      />
                    </FormField>
                    <FormField label="Return URL" labelStyle="plain" size="compact">
                      <input
                        type="url"
                        value={editClientReturnUrl}
                        onChange={(e) => setEditClientReturnUrl(e.target.value)}
                        className="w-full border-2 border-black p-2 text-sm shadow-brutal-sm focus:shadow-brutal focus:outline-none"
                        placeholder="https://example.com/login/callback"
                      />
                    </FormField>
                    <FormField label="Description" labelStyle="plain" size="compact">
                      <textarea
                        value={editClientDescription}
                        onChange={(e) => setEditClientDescription(e.target.value)}
                        className="w-full border-2 border-black p-2 text-sm shadow-brutal-sm focus:shadow-brutal focus:outline-none resize-none"
                        rows={3}
                      />
                    </FormField>
                    <button
                      type="submit"
                      disabled={savingClientId === client.id}
                      className="btn-brutal bg-brutal-lime px-3 py-1.5 text-xs"
                    >
                      <Check size={14} />
                      {savingClientId === client.id ? "Saving…" : "Save Changes"}
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-black">{client.name}</div>
                        <div className="font-mono text-xs text-black/60">{client.clientId}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => beginEditClient(client)}
                        className="btn-brutal bg-white px-2 py-1 text-xs"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                    </div>
                    {client.homepageUrl && <div className="mt-1 break-all font-mono text-xs text-black/60">{client.homepageUrl}</div>}
                    {client.returnUrl && <div className="mt-1 break-all font-mono text-xs text-black/60">{client.returnUrl}</div>}
                    {client.description && <div className="mt-1 text-sm text-black/70">{client.description}</div>}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PreJoinAgreementSection() {
  const currentServer = useServerStore((s) => s.current);
  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState("");
  const [bodyMarkdown, setBodyMarkdown] = useState("");
  const [savedEnabled, setSavedEnabled] = useState(false);
  const [savedTitle, setSavedTitle] = useState("");
  const [savedBodyMarkdown, setSavedBodyMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const bodyChars = characterLength(bodyMarkdown);
  const bodyTooLong = bodyChars > MAX_AGREEMENT_BODY_CHARS;

  useEffect(() => {
    if (!currentServer) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    void api
      .get(`/servers/${currentServer.id}/agreement`)
      .then(({ data }) => {
        if (cancelled) return;
        const nextEnabled = !!data.enabled;
        const nextTitle = data.agreement?.title ?? "";
        const nextBodyMarkdown = data.agreement?.bodyMarkdown ?? "";
        setEnabled(nextEnabled);
        setTitle(nextTitle);
        setBodyMarkdown(nextBodyMarkdown);
        setSavedEnabled(nextEnabled);
        setSavedTitle(nextTitle);
        setSavedBodyMarkdown(nextBodyMarkdown);
        setSaved(false);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(err.response?.data?.error || "Failed to load pre-join agreement");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentServer?.id]);

  if (!currentServer) return null;

  const dirty =
    enabled !== savedEnabled
    || title !== savedTitle
    || bodyMarkdown !== savedBodyMarkdown;

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const { data } = await api.put(`/servers/${currentServer.id}/agreement`, {
        enabled,
        title,
        bodyMarkdown,
      });
      const nextEnabled = !!data.enabled;
      const nextTitle = data.agreement?.title ?? title;
      const nextBodyMarkdown = data.agreement?.bodyMarkdown ?? bodyMarkdown;
      setEnabled(nextEnabled);
      setTitle(nextTitle);
      setBodyMarkdown(nextBodyMarkdown);
      setSavedEnabled(nextEnabled);
      setSavedTitle(nextTitle);
      setSavedBodyMarkdown(nextBodyMarkdown);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save pre-join agreement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-6">
      <SectionHeader
        className="mb-3"
        icon={<FileText size={16} />}
        label="Pre-join Agreement"
      />

      <div className="border-2 border-black bg-white shadow-brutal-sm p-4 space-y-4">
        <label className={`flex items-start gap-3 ${saving || loading ? "opacity-60" : ""}`}>
          <Checkbox
            size="md"
            checked={enabled}
            disabled={saving || loading}
            onChange={(event) => {
              setEnabled(event.currentTarget.checked);
              setSaved(false);
            }}
            className="mt-0.5"
          />
          <span className="min-w-0">
            <span className="block text-sm font-bold text-black">Require agreement before joining</span>
            <span className="block text-xs text-black/60 mt-0.5">
              New invite-link and community joins must accept the current version before membership is created.
            </span>
          </span>
        </label>

        {enabled && (
          <>
            <FormField label="Title" labelStyle="plain" size="compact">
              <input
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setSaved(false);
                }}
                maxLength={160}
                disabled={saving || loading}
                className="w-full border-2 border-black p-2 text-sm shadow-brutal-sm focus:shadow-brutal focus:outline-none disabled:opacity-60"
              />
            </FormField>
            <FormField label="Body" labelStyle="plain" size="compact">
              <Textarea
                value={bodyMarkdown}
                onChange={(event) => {
                  setBodyMarkdown(event.target.value);
                  setSaved(false);
                }}
                rows={7}
                disabled={saving || loading}
                showCounter
                limit={MAX_AGREEMENT_BODY_CHARS}
                getLength={characterLength}
                error={bodyTooLong ? "Agreement body must be 500 characters or fewer." : undefined}
                className="resize-y font-mono text-xs disabled:opacity-60"
              />
            </FormField>
            {bodyTooLong && (
              <Banner intent="warning" density="sm" className="font-bold">
                Agreement body is over the 500 character limit. Shorten it before saving.
              </Banner>
            )}
            <div className="border-2 border-black/30 bg-brutal-cream p-3">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-black/50">Preview</div>
              <div className="text-sm">
                <AgreementBody source={bodyMarkdown} />
              </div>
            </div>
          </>
        )}

        {error && (
          <Banner intent="warning" density="sm" className="font-bold">
            {error}
          </Banner>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] text-black/50">
            Saving creates a new version; previous accepted versions remain auditable.
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving || loading || (enabled && bodyTooLong)}
            className="btn-brutal bg-brutal-pink px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving…" : saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ServerTabContent() {
  return (
    <>
      <ProfileSection />
      <DangerZoneSection />
    </>
  );
}

function BillingTabContent() {
  const { capabilities } = useServerPermissions();
  if (!capabilities.manageServer) {
    return (
      <div className="mb-6">
        <SectionHeader
          className="mb-3"
          icon={<CreditCard size={16} />}
          label="Billing"
        />
        <div className="border-2 border-black bg-white p-4 text-sm text-black/60 shadow-brutal-sm">
          Only server owners and admins can manage billing.
        </div>
      </div>
    );
  }
  return (
    <>
      <PlanSection />
    </>
  );
}

function AdministrationTabContent() {
  const { capabilities, isOwner } = useServerPermissions();
  return (
    <>
      {capabilities.changeMemberRoles && <AdminsSection />}
      <InvitesSection />
      <JoinLinksSection />
      {isOwner && <PreJoinAgreementSection />}
      <OnboardingAgentSection />
      <ServerTranslationSection />
      <MemberPermissionsSection />
    </>
  );
}

function AppearanceSection() {
  const persistedMessageBodyFontSize = useAuthStore((s) => s.user?.preferredMessageBodyFontSize ?? null);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const messageBodyFontSize = useAppearanceStore((s) => s.messageBodyFontSize);
  const hydrateMessageBodyFontSize = useAppearanceStore((s) => s.hydrateMessageBodyFontSize);
  const setMessageBodyFontSize = useAppearanceStore((s) => s.setMessageBodyFontSize);
  const [savingMessageBodyFontSize, setSavingMessageBodyFontSize] = useState(false);
  const [savedMessageBodyFontSize, setSavedMessageBodyFontSize] = useState(false);
  const [messageBodyFontSizeError, setMessageBodyFontSizeError] = useState("");
  const previewMessage = useMemo<Message>(() => ({
    id: "appearance-preview-message",
    channelId: APPEARANCE_PREVIEW_CHANNEL.id,
    senderType: "agent",
    senderId: APPEARANCE_PREVIEW_AGENT.id,
    senderName: APPEARANCE_PREVIEW_AGENT.displayName ?? APPEARANCE_PREVIEW_AGENT.name,
    messageType: "chat",
    content: "@Joy #proj-uiux love the new design — doing a `git pull` now to try it locally.",
    createdAt: new Date().toISOString(),
    attachments: [],
    reactions: [],
  }), []);

  useEffect(() => {
    hydrateMessageBodyFontSize(persistedMessageBodyFontSize);
  }, [hydrateMessageBodyFontSize, persistedMessageBodyFontSize]);

  const handleMessageBodyFontSizeSave = async (event: FormEvent) => {
    event.preventDefault();
    setMessageBodyFontSizeError("");
    setSavedMessageBodyFontSize(false);
    setSavingMessageBodyFontSize(true);
    try {
      await updateProfile({ preferredMessageBodyFontSize: messageBodyFontSize });
      setSavedMessageBodyFontSize(true);
      setTimeout(() => setSavedMessageBodyFontSize(false), 2000);
    } catch (err: any) {
      setMessageBodyFontSizeError(err?.response?.data?.error || "Failed to update message font size");
    } finally {
      setSavingMessageBodyFontSize(false);
    }
  };

  const persistedFontSize = persistedMessageBodyFontSize ?? "md";
  const messageBodyFontSizeDirty = messageBodyFontSize !== persistedFontSize;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Type size={16} className="text-black/60" />
        <span className="text-xs font-bold uppercase text-black/60 tracking-widest">
          Appearance
        </span>
      </div>

      <form onSubmit={handleMessageBodyFontSizeSave} className="border-2 border-black bg-white shadow-brutal-sm p-4 space-y-4">
        <div>
          <div className="text-sm font-bold text-black">Message font size</div>
          <p className="mt-1 text-xs text-black/55">
            Adjust message body text only. Buttons, labels, sidebar, and code blocks keep their fixed UI sizes.
          </p>
        </div>

        <SegmentedControl
          value={messageBodyFontSize}
          ariaLabel="Message font size"
          disabled={savingMessageBodyFontSize}
          onChange={(next) => {
            setSavedMessageBodyFontSize(false);
            setMessageBodyFontSizeError("");
            setMessageBodyFontSize(next);
          }}
          options={MESSAGE_BODY_FONT_SIZE_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
            testId: `message-font-size-${option.value}`,
          }))}
        />

        {messageBodyFontSizeError && (
          <Banner intent="warning" density="sm" className="font-bold">
            {messageBodyFontSizeError}
          </Banner>
        )}

        <button
          type="submit"
          disabled={!messageBodyFontSizeDirty || savingMessageBodyFontSize}
          className="btn-brutal bg-brutal-pink px-3 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {savingMessageBodyFontSize ? "Saving…" : savedMessageBodyFontSize ? (
            <><Check size={14} /> Saved</>
          ) : "Save"}
        </button>

        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-black/50">
            Preview
          </div>
          <div className="pointer-events-none -mx-2" aria-label="Message font size preview">
            <MessageItem
              message={previewMessage}
              mentionMap={APPEARANCE_PREVIEW_MENTION_MAP}
              channels={[APPEARANCE_PREVIEW_CHANNEL]}
              previewSenderAgent={APPEARANCE_PREVIEW_AGENT}
              hideThreadActions
            />
          </div>
        </div>
      </form>
    </div>
  );
}

// ── Settings Tabs ──

const SETTINGS_TABS = [
  { id: "account", label: "Account", icon: User },
  { id: "language-region", label: "Language & Region", icon: Languages },
  { id: "appearance", label: "Appearance", icon: Type },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "server", label: "Server Profile", icon: Building2 },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "administration", label: "Administration", icon: Shield },
  { id: "integrations", label: "Connected Apps", icon: Link2 },
] as const;

const SETTINGS_LABEL_BY_ID: Record<string, string> = {
  account: "Account",
  "language-region": "Language & Region",
  appearance: "Appearance",
  notifications: "Notifications",
  server: "Server Profile",
  billing: "Plan & Billing",
  administration: "Administration",
  integrations: "Connected Apps",
};

// Icon per settings tab — used in the desktop panel header so each sub-page
// carries the same yellow-square glyph pattern as other canonical panels.
// Hidden on mobile (`hidden md:flex`) because the mobile NavBar is intentionally
// icon-less per @stdrc msg 8fbd7ecb / 8a1cbe5f 2026-05-01 `#proj-uiux:c8711d2a`.
// Re-added per @stdrc msg 5d7f386a 2026-05-01 after the icons were dropped for
// mobile parity leaked onto desktop.
const SETTINGS_ICON_BY_ID: Record<string, typeof User> = {
  account: User,
  "language-region": Languages,
  appearance: Type,
  notifications: Bell,
  server: Building2,
  billing: CreditCard,
  administration: Shield,
  integrations: Link2,
};

export default function SettingsPanel({ tab: tabProp }: { tab?: string }) {
  const validTabs = SETTINGS_TABS.map((t) => t.id) as readonly string[];
  const normalizedTab = tabProp === "browser" ? "notifications" : tabProp;
  const settingsTab = normalizedTab && validTabs.includes(normalizedTab) ? normalizedTab : "account";
  const activeLabel = SETTINGS_LABEL_BY_ID[settingsTab] ?? "Settings";
  const ActiveIcon = SETTINGS_ICON_BY_ID[settingsTab] ?? Settings;
  const serverSlug = useServerStore((s) => s.current?.slug);
  // Mobile back: Settings sub-pages (account / browser / server) are
  // level-2 views inside the Settings tab. Per iOS NavigationView model
  // (@stdrc 2026-04-30 #proj-uiux:c8711d2a), every level-2+ view must
  // cover the tab bar and show a top-left back button — so we pop back
  // to the Settings tab home here.
  const onMobileBack = useMobileBack(serverSlug ? `/s/${serverSlug}/settings` : "/");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelHeader
        title={activeLabel}
        icon={<ActiveIcon size={18} />}
        iconBg="bg-brutal-yellow text-black"
        onMobileBack={onMobileBack}
        mobileBackProps={{ "data-testid": "settings-mobile-back", title: "Back" }}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white px-5 py-4">
        {settingsTab === "account" && <AccountSection />}
        {settingsTab === "language-region" && <LanguageRegionSection />}
        {settingsTab === "appearance" && <AppearanceSection />}
        {settingsTab === "notifications" && <NotificationsTabContent />}
        {settingsTab === "server" && <ServerTabContent />}
        {settingsTab === "billing" && <BillingTabContent />}
        {settingsTab === "administration" && <AdministrationTabContent />}
        {settingsTab === "integrations" && <IntegrationsSection />}
      </div>
    </div>
  );
}
