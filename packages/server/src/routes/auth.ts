import { Router, type Router as RouterType } from "express";
import type { Server as SocketServer } from "socket.io";
import multer from "multer";
import * as userService from "../services/userService.js";
import * as sessionService from "../services/sessionService.js";
import * as inviteService from "../services/inviteService.js";
import * as onboardingService from "../services/onboardingService.js";
import * as legalAcceptanceService from "../services/legalAcceptanceService.js";
import * as serverAgreementService from "../services/serverAgreementService.js";
import type { AgentOrchestrator } from "../services/agentOrchestrator.js";
import { signAccessToken, requireAuth, respondInvalidOrExpiredToken } from "../middleware/auth.js";
import { normalizeTimeFormatPreference, normalizeTranslationLanguageCode, validateName, type TimeFormatPreference } from "@slock-ai/shared";
import { getRegistrationBlockedReason } from "../services/registrationPolicy.js";
import {
  createAvatarUpload,
  MAX_PROFILE_AVATAR_BYTES,
  PROFILE_AVATAR_BAD_FORMAT_MESSAGE,
  PROFILE_AVATAR_TOO_LARGE_MESSAGE,
  runSingleAvatarUpload,
  storeUserAvatar,
} from "../services/avatarService.js";
import {
  buildAuthorizationUrl,
  buildSocialAuthCallbackUrl,
  buildStateCookie,
  clearStateCookie,
  createSocialAuthCompletion,
  createSocialAuthNonce,
  exchangeProviderCode,
  exchangeSocialAuthCompletion,
  fetchSocialAuthProfile,
  getSocialAuthCompletion,
  getSocialAuthProvider,
  isSocialAuthProviderConfigured,
  readStateCookie,
  sanitizeReturnTo,
  signSocialAuthState,
  validateSocialAuthCallbackState,
  verifySocialAuthState,
} from "../services/socialAuthService.js";
import type { SocialAuthProfile } from "../services/socialAuthService.js";

export const authRouter: RouterType = Router();
const MAX_USER_DESCRIPTION_LENGTH = 3000;
const MAX_PREFERRED_TIMEZONE_LENGTH = 128;
const AUTO_TRANSLATION_TARGET_LANGUAGE = "en";
const userAvatarUpload = createAvatarUpload();
const REFERRAL_SOURCE_OPTIONS = new Set([
  "twitter_x",
  "linkedin",
  "friend_colleague",
  "search",
  "hn_reddit",
  "podcast_blog_newsletter",
  "other",
]);

function getProviderParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function parsePreferredLanguage(raw: unknown): string | null | undefined {
  if (raw === undefined) return undefined;
  if (raw === null) return null;
  if (typeof raw !== "string") {
    throw new Error("preferredLanguage must be a string or null");
  }
  const value = raw.trim();
  if (!value) return null;
  const normalized = normalizeTranslationLanguageCode(value);
  if (!normalized) {
    throw new Error("preferredLanguage must be a supported language tag");
  }
  if (normalized !== AUTO_TRANSLATION_TARGET_LANGUAGE) {
    throw new Error("preferredLanguage currently supports English only");
  }
  return normalized;
}

function parsePreferredTimezone(raw: unknown): string | null | undefined {
  if (raw === undefined) return undefined;
  if (raw === null) return null;
  if (typeof raw !== "string") {
    throw new Error("preferredTimezone must be a string or null");
  }
  const value = raw.trim();
  if (!value) return null;
  if (value.length > MAX_PREFERRED_TIMEZONE_LENGTH) {
    throw new Error("preferredTimezone must be at most 128 characters");
  }
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
  } catch {
    throw new Error("preferredTimezone must be an IANA timezone");
  }
  return value;
}

function parseAutoTranslationEnabled(raw: unknown): boolean | undefined {
  if (raw === undefined) return undefined;
  if (typeof raw !== "boolean") {
    throw new Error("autoTranslationEnabled must be a boolean");
  }
  return raw;
}

type PreferredTranslationDisplay = "translated" | "original";

function parsePreferredTranslationDisplay(raw: unknown): PreferredTranslationDisplay | undefined {
  if (raw === undefined) return undefined;
  if (typeof raw !== "string") {
    throw new Error("preferredTranslationDisplay must be translated or original");
  }
  const value = raw.trim().toLowerCase();
  if (value !== "translated" && value !== "original") {
    throw new Error("preferredTranslationDisplay must be translated or original");
  }
  return value;
}

function parsePreferredTimeFormat(raw: unknown): TimeFormatPreference | null | undefined {
  if (raw === undefined) return undefined;
  if (raw === null) return null;
  if (typeof raw !== "string") {
    throw new Error("preferredTimeFormat must be 12h, 24h, or null");
  }
  const normalized = normalizeTimeFormatPreference(raw);
  if (!normalized) {
    throw new Error("preferredTimeFormat must be 12h, 24h, or null");
  }
  return normalized;
}

type MessageBodyFontSizePreference = "sm" | "md" | "lg";

function parsePreferredMessageBodyFontSize(raw: unknown): MessageBodyFontSizePreference | null | undefined {
  if (raw === undefined) return undefined;
  if (raw === null) return null;
  if (typeof raw !== "string") {
    throw new Error("preferredMessageBodyFontSize must be sm, md, lg, or null");
  }
  const value = raw.trim().toLowerCase();
  if (!value) return null;
  if (value !== "sm" && value !== "md" && value !== "lg") {
    throw new Error("preferredMessageBodyFontSize must be sm, md, lg, or null");
  }
  return value;
}

function parseLegalAcceptance(raw: any): legalAcceptanceService.LegalAcceptanceInput {
  return {
    acceptTerms: raw?.acceptTerms === true,
    termsVersion: typeof raw?.termsVersion === "string" ? raw.termsVersion : undefined,
    privacyVersion: typeof raw?.privacyVersion === "string" ? raw.privacyVersion : undefined,
  };
}

function parseEmailAccountCreationSource(raw: any): "signup" | "invite" {
  return raw?.legalAcceptanceSource === "invite" ? "invite" : "signup";
}

function parseSocialAccountCreationSource(raw: any): "oauth" | "invite" {
  return raw?.legalAcceptanceSource === "invite" ? "invite" : "oauth";
}

function getAgreementRequestMetadata(req: { ip?: string; get: (name: string) => string | undefined }) {
  return {
    ipAddress: req.ip ?? null,
    userAgent: req.get("user-agent") ?? null,
  };
}

function socialProfileFromCompletion(provider: NonNullable<ReturnType<typeof getSocialAuthProvider>>, completion: {
  providerUserId?: string;
  providerEmail?: string;
  providerDisplayName?: string;
  providerAvatarUrl?: string;
}): SocialAuthProfile {
  if (!completion.providerUserId || !completion.providerEmail) {
    throw new Error(`${provider.label} sign-in is missing required identity fields`);
  }
  return {
    provider: provider.id,
    providerUserId: completion.providerUserId,
    email: completion.providerEmail,
    emailVerified: true,
    displayName: completion.providerDisplayName ?? null,
    avatarUrl: completion.providerAvatarUrl ?? null,
  };
}

// Register
authRouter.post("/register", async (req, res) => {
  const registrationBlockedReason = getRegistrationBlockedReason();
  if (registrationBlockedReason) {
    res.status(403).json({ error: registrationBlockedReason });
    return;
  }
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: "Email, password, and name are required" });
      return;
    }
    const nameError = validateName(name, "Name", 5);
    if (nameError) {
      res.status(400).json({ error: nameError });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    const user = await userService.createUser(
      email,
      password,
      name.trim(),
      parseLegalAcceptance(req.body),
      legalAcceptanceService.getRequestLegalMetadata(req),
      parseEmailAccountCreationSource(req.body),
    );
    const accessToken = signAccessToken(user.id);
    const { refreshToken } = await sessionService.createSession(user.id);

    res.json({ user, accessToken, refreshToken });
  } catch (err: any) {
    const legalResponse = legalAcceptanceService.legalAcceptanceErrorResponse(err);
    if (legalResponse) {
      res.status(legalResponse.status).json(legalResponse.body);
      return;
    }
    const msg = err?.message || "";
    if (msg.includes("already registered") || msg.includes("already taken")) {
      res.status(409).json({ error: msg });
    } else {
      console.error("Register error:", err);
      res.status(500).json({ error: "Registration failed" });
    }
  }
});

authRouter.get("/providers", (_req, res) => {
  const providers = ["google", "github"]
    .map((providerId) => getSocialAuthProvider(providerId))
    .filter((provider): provider is NonNullable<typeof provider> => !!provider)
    .map((provider) => ({
      id: provider.id,
      label: provider.label,
      enabled: isSocialAuthProviderConfigured(provider.id),
    }));

  res.json({ providers });
});

authRouter.get("/identities", requireAuth, async (req, res) => {
  try {
    const identities = await userService.listUserAuthIdentities(req.userId!);
    res.json({ identities });
  } catch (err) {
    console.error("List auth identities error:", err);
    res.status(500).json({ error: "Failed to load linked accounts" });
  }
});

authRouter.get("/:provider/start", (req, res, next) => {
  const provider = getSocialAuthProvider(getProviderParam(req.params.provider));
  if (!provider) {
    next();
    return;
  }

  if (!isSocialAuthProviderConfigured(provider.id)) {
    res.status(404).json({ error: `${provider.label} sign-in is not configured` });
    return;
  }

  const returnTo = sanitizeReturnTo(req.query.returnTo);
  const nonce = createSocialAuthNonce();
  const state = signSocialAuthState({
    provider: provider.id,
    mode: "login",
    nonce,
    returnTo,
  });

  res.setHeader("Set-Cookie", buildStateCookie(provider.id, nonce));
  res.redirect(buildAuthorizationUrl(provider.id, state, "login"));
});

authRouter.post("/:provider/link/start", requireAuth, (req, res, next) => {
  const provider = getSocialAuthProvider(getProviderParam(req.params.provider));
  if (!provider) {
    next();
    return;
  }

  if (!isSocialAuthProviderConfigured(provider.id)) {
    res.status(404).json({ error: `${provider.label} sign-in is not configured` });
    return;
  }

  const returnTo = sanitizeReturnTo(req.body?.returnTo);
  const nonce = createSocialAuthNonce();
  const state = signSocialAuthState({
    provider: provider.id,
    mode: "link",
    nonce,
    linkUserId: req.userId!,
    returnTo,
  });

  res.setHeader("Set-Cookie", buildStateCookie(provider.id, nonce));
  res.json({ url: buildAuthorizationUrl(provider.id, state, "link") });
});

authRouter.get("/:provider/callback", async (req, res, next) => {
  const provider = getSocialAuthProvider(getProviderParam(req.params.provider));
  if (!provider) {
    next();
    return;
  }

  let state = null as ReturnType<typeof verifySocialAuthState> | null;
  let returnTo = "/";

  try {
    const stateToken = typeof req.query.state === "string" ? req.query.state : "";
    const validated = validateSocialAuthCallbackState(provider.id, stateToken, req.headers.cookie);
    state = validated.state;
    returnTo = validated.returnTo;
  } catch {
    res.setHeader("Set-Cookie", clearStateCookie(provider.id));
    res.redirect(buildSocialAuthCallbackUrl({
      provider: provider.id,
      mode: "login",
      error: "This sign-in link is invalid or expired. Please try again.",
    }));
    return;
  }

  try {
    res.setHeader("Set-Cookie", clearStateCookie(provider.id));

    const code = typeof req.query.code === "string" ? req.query.code : "";
    if (!code) {
      const providerError = typeof req.query.error === "string" ? req.query.error : `${provider.label} sign-in was cancelled`;
      res.redirect(buildSocialAuthCallbackUrl({
        provider: provider.id,
        mode: state.mode,
        returnTo,
        error: providerError,
      }));
      return;
    }

    const { accessToken } = await exchangeProviderCode(provider.id, code);
    const profile = await fetchSocialAuthProfile(provider.id, accessToken);

    if (state.mode === "link") {
      if (!state.linkUserId) {
        throw new Error(`${provider.label} link flow is missing a target user`);
      }

      await userService.linkSocialIdentity(state.linkUserId, profile);
      const completionCode = await createSocialAuthCompletion({
        provider: provider.id,
        mode: "link",
        intendedAction: "link",
        userId: state.linkUserId,
        providerUserId: profile.providerUserId,
        providerEmail: profile.email,
        returnTo,
      });

      res.redirect(buildSocialAuthCallbackUrl({
        provider: provider.id,
        mode: "link",
        returnTo,
        code: completionCode,
      }));
      return;
    }

    const user = await userService.findExistingSocialLoginUser(profile);
    const completionCode = await createSocialAuthCompletion({
      provider: provider.id,
      mode: "login",
      intendedAction: "login",
      userId: user?.id,
      providerUserId: profile.providerUserId,
      providerEmail: profile.email,
      providerDisplayName: profile.displayName,
      providerAvatarUrl: profile.avatarUrl,
      returnTo,
    });

    res.redirect(buildSocialAuthCallbackUrl({
      provider: provider.id,
      mode: "login",
      returnTo,
      code: completionCode,
    }));
  } catch (err: any) {
    console.error(`${provider.label} auth callback error:`, err);
    res.redirect(buildSocialAuthCallbackUrl({
      provider: provider.id,
      mode: state.mode,
      returnTo,
      error: err?.message || `${provider.label} sign-in failed`,
    }));
  }
});

authRouter.post("/:provider/complete", async (req, res, next) => {
  const provider = getSocialAuthProvider(getProviderParam(req.params.provider));
  if (!provider) {
    next();
    return;
  }

  try {
    const { code } = req.body;
    if (!code) {
      res.status(400).json({ error: "Sign-in completion code is required" });
      return;
    }

    const pendingCompletion = await getSocialAuthCompletion(provider.id, code);
    if (pendingCompletion.mode === "login" && !pendingCompletion.userId) {
      legalAcceptanceService.requireCurrentLegalAcceptance(parseLegalAcceptance(req.body));
    }

    const completion = await exchangeSocialAuthCompletion(provider.id, code);
    if (!completion.userId) {
      const profile = socialProfileFromCompletion(provider, completion);
      const user = await userService.createSocialUser(
        profile,
        parseLegalAcceptance(req.body),
        legalAcceptanceService.getRequestLegalMetadata(req),
        parseSocialAccountCreationSource(req.body),
      );
      const accessToken = signAccessToken(user.id);
      const { refreshToken } = await sessionService.createSession(user.id);
      res.json({
        provider: completion.provider,
        mode: completion.mode,
        returnTo: completion.returnTo,
        accessToken,
        refreshToken,
      });
      return;
    }

    if (completion.mode === "login") {
      const accessToken = signAccessToken(completion.userId);
      const { refreshToken } = await sessionService.createSession(completion.userId);
      res.json({
        provider: completion.provider,
        mode: completion.mode,
        returnTo: completion.returnTo,
        accessToken,
        refreshToken,
      });
      return;
    }

    res.json({
      provider: completion.provider,
      mode: completion.mode,
      returnTo: completion.returnTo,
    });
  } catch (err: any) {
    const legalResponse = legalAcceptanceService.legalAcceptanceErrorResponse(err);
    if (legalResponse) {
      res.status(legalResponse.status).json(legalResponse.body);
      return;
    }
    const message = err?.message || "";
    if (message.includes("Invalid") || message.includes("expired") || message.includes("mismatch")) {
      res.status(400).json({ error: message });
      return;
    }
    console.error(`${provider.label} auth completion error:`, err);
    res.status(500).json({ error: "Failed to complete sign-in" });
  }
});

// Login
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await userService.authenticateUser(email, password);
    const accessToken = signAccessToken(user.id);
    const { refreshToken } = await sessionService.createSession(user.id);

    res.json({ user, accessToken, refreshToken });
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg.includes("Invalid email or password")) {
      res.status(401).json({ code: "AUTH_INVALID_CREDENTIALS", error: msg });
    } else {
      console.error("Login error:", err);
      res.status(500).json({ error: "Login failed" });
    }
  }
});

// Refresh token
authRouter.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token is required" });
      return;
    }

    const session = await sessionService.validateSession(refreshToken);
    if (!session) {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }

    const rotated = await sessionService.rotateSession(refreshToken, session.userId);
    if (!rotated) {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }
    const { refreshToken: newRefreshToken } = rotated;
    const accessToken = signAccessToken(session.userId);

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch {
    res.status(500).json({ error: "Token refresh failed" });
  }
});

// Get current user
authRouter.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await userService.getUser(req.userId!);
    if (!user) {
      respondInvalidOrExpiredToken(res);
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Update current user profile
authRouter.patch("/me", requireAuth, async (req, res) => {
  try {
    const {
      displayName,
      description,
      avatarUrl,
      currentPassword,
      newPassword,
      referralSource,
      referralSourceOther,
      referralSourceSkipped,
    } = req.body;

    // Password change
    if (currentPassword && newPassword) {
      if (newPassword.length < 8) {
        res.status(400).json({ error: "New password must be at least 8 characters" });
        return;
      }
      await userService.changePassword(req.userId!, currentPassword, newPassword);
      // Revoke all sessions to force re-login with new password
      await sessionService.revokeAllUserSessions(req.userId!);
    }

    // Profile update (name is immutable — set at registration only)
    const profileFields: {
      displayName?: string;
      description?: string | null;
      avatarUrl?: string | null;
      preferredLanguage?: string | null;
      preferredTimezone?: string | null;
      autoTranslationEnabled?: boolean;
      preferredTranslationDisplay?: PreferredTranslationDisplay;
      preferredTimeFormat?: TimeFormatPreference | null;
      preferredMessageBodyFontSize?: MessageBodyFontSizePreference | null;
      referralSource?: string | null;
      referralSourceOther?: string | null;
      referralSourceSkippedAt?: Date | null;
    } = {};
    if (displayName !== undefined) profileFields.displayName = displayName;
    if (description !== undefined) {
      if (description !== null && (typeof description !== "string" || description.length > MAX_USER_DESCRIPTION_LENGTH)) {
        res.status(400).json({ error: `Description must be a string of at most ${MAX_USER_DESCRIPTION_LENGTH} characters` });
        return;
      }
      profileFields.description = typeof description === "string" ? (description.trim() || null) : null;
    }
    if (avatarUrl !== undefined) profileFields.avatarUrl = avatarUrl;
    try {
      const preferredLanguage = parsePreferredLanguage(req.body?.preferredLanguage);
      if (preferredLanguage !== undefined) profileFields.preferredLanguage = preferredLanguage;
      const preferredTimezone = parsePreferredTimezone(req.body?.preferredTimezone);
      if (preferredTimezone !== undefined) profileFields.preferredTimezone = preferredTimezone;
      const autoTranslationEnabled = parseAutoTranslationEnabled(req.body?.autoTranslationEnabled);
      if (autoTranslationEnabled !== undefined) profileFields.autoTranslationEnabled = autoTranslationEnabled;
      const preferredTranslationDisplay = parsePreferredTranslationDisplay(req.body?.preferredTranslationDisplay);
      if (preferredTranslationDisplay !== undefined) profileFields.preferredTranslationDisplay = preferredTranslationDisplay;
      const preferredTimeFormat = parsePreferredTimeFormat(req.body?.preferredTimeFormat);
      if (preferredTimeFormat !== undefined) profileFields.preferredTimeFormat = preferredTimeFormat;
      const preferredMessageBodyFontSize = parsePreferredMessageBodyFontSize(req.body?.preferredMessageBodyFontSize);
      if (preferredMessageBodyFontSize !== undefined) profileFields.preferredMessageBodyFontSize = preferredMessageBodyFontSize;
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Invalid account preference" });
      return;
    }
    if (referralSource !== undefined) {
      if (referralSource !== null && (typeof referralSource !== "string" || !REFERRAL_SOURCE_OPTIONS.has(referralSource))) {
        res.status(400).json({ error: "Invalid referralSource" });
        return;
      }
      profileFields.referralSource = referralSource;
      profileFields.referralSourceOther = referralSource === "other" && typeof referralSourceOther === "string"
        ? referralSourceOther.trim().slice(0, 200) || null
        : null;
      profileFields.referralSourceSkippedAt = null;
    } else if (referralSourceOther !== undefined) {
      res.status(400).json({ error: "referralSource is required when referralSourceOther is provided" });
      return;
    }
    if (referralSourceSkipped !== undefined) {
      if (typeof referralSourceSkipped !== "boolean") {
        res.status(400).json({ error: "referralSourceSkipped must be a boolean" });
        return;
      }
      if (referralSourceSkipped) {
        profileFields.referralSourceSkippedAt = new Date();
      }
    }

    let user;
    if (Object.keys(profileFields).length > 0) {
      user = await userService.updateUser(req.userId!, profileFields);
    } else {
      user = await userService.getUser(req.userId!);
    }

    if (!user) {
      respondInvalidOrExpiredToken(res);
      return;
    }

    res.json(user);
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg.includes("Current password is incorrect")) {
      res.status(401).json({ code: "AUTH_CURRENT_PASSWORD_INCORRECT", error: msg });
    } else {
      console.error("Update profile error:", err);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
});

// Upload current user's avatar
authRouter.post("/me/avatar", requireAuth, async (req, res) => {
  try {
    const currentUser = await userService.getUser(req.userId!);
    if (!currentUser) {
      respondInvalidOrExpiredToken(res);
      return;
    }

    const uploaded = await runSingleAvatarUpload(userAvatarUpload, req);
    if (!uploaded) {
      res.status(400).json({ error: "No avatar file provided" });
      return;
    }

    const avatarUrl = await storeUserAvatar(currentUser.avatarUrl, uploaded.buffer);
    const user = await userService.updateUser(req.userId!, { avatarUrl });
    if (!user) {
      respondInvalidOrExpiredToken(res);
      return;
    }

    res.json(user);
  } catch (err: any) {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        error: PROFILE_AVATAR_TOO_LARGE_MESSAGE,
        errorCode: "PROFILE_AVATAR_TOO_LARGE",
        maxBytes: MAX_PROFILE_AVATAR_BYTES,
      });
      return;
    }
    if (err.message?.includes(PROFILE_AVATAR_BAD_FORMAT_MESSAGE)) {
      res.status(400).json({
        error: err.message,
        errorCode: "PROFILE_AVATAR_BAD_FORMAT",
      });
      return;
    }
    console.error("User avatar upload error:", err);
    res.status(500).json({ error: "Failed to upload avatar" });
  }
});

// Verify email
authRouter.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ error: "Token is required" });
      return;
    }

    const success = await userService.verifyEmail(token);
    if (!success) {
      res.status(400).json({ error: "Invalid or expired verification token" });
      return;
    }

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Email verification failed" });
  }
});

// Resend verification email
authRouter.post("/resend-verification", requireAuth, async (req, res) => {
  try {
    await userService.resendVerificationEmail(req.userId!);
    res.json({ ok: true });
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg.includes("already verified")) {
      res.status(400).json({ error: msg });
    } else if (msg.includes("Too many") || msg.includes("Please wait")) {
      res.status(429).json({ error: msg });
    } else {
      console.error("Resend verification error:", err);
      res.status(500).json({ error: "Failed to resend verification email" });
    }
  }
});

// Forgot password — request reset
authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    await userService.requestPasswordReset(email);
    // Always return success, don't reveal whether user exists
    res.json({ ok: true, message: "If an account exists with that email, a reset link has been sent." });
  } catch {
    // Still return success to not reveal user existence
    res.json({ ok: true, message: "If an account exists with that email, a reset link has been sent." });
  }
});

// Reset password with token
authRouter.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      res.status(400).json({ error: "Token and password are required" });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    const result = await userService.resetPassword(token, password);
    if (!result.success) {
      res.status(400).json({ error: "Invalid or expired reset token" });
      return;
    }

    // Revoke all sessions to force re-login with new password
    if (result.userId) {
      await sessionService.revokeAllUserSessions(result.userId);
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Password reset failed" });
  }
});

// Accept invite (authenticated user joins a server)
authRouter.post("/accept-invite", requireAuth, async (req, res) => {
  try {
    const { token, agreementId } = req.body;
    if (!token) {
      res.status(400).json({ error: "Invite token is required" });
      return;
    }

    const result = await inviteService.acceptInvite(token, req.userId!, {
      agreementId: typeof agreementId === "string" ? agreementId : null,
      ...getAgreementRequestMetadata(req),
    });
    const io = req.app.get("io") as SocketServer | undefined;
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator | undefined;
    if (io) {
      io.to(`server:${result.serverId}`).emit("server:member-added", {
        serverId: result.serverId,
        userId: req.userId!,
      });
      if (agentOrchestrator) {
        void onboardingService.triggerNewMemberOnboarding(io, agentOrchestrator, result.serverId, req.userId!).catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`[Onboarding] Failed to trigger member onboarding after invite accept for ${req.userId}: ${msg}`);
        });
      }
    }
    res.json(result);
  } catch (err: any) {
    const agreementResponse = serverAgreementService.agreementErrorResponse(err);
    if (agreementResponse) {
      res.status(agreementResponse.status).json(agreementResponse.body);
      return;
    }
    const msg = err?.message || "";
    if (
      msg.includes("Invalid")
      || msg.includes("expired")
      || msg.includes("already")
      || msg.includes("revoked")
      || msg.includes("usage limit")
      || msg.includes("different email")
    ) {
      res.status(400).json({ error: msg });
    } else {
      console.error("Accept invite error:", err);
      res.status(500).json({ error: "Failed to accept invite" });
    }
  }
});

// Get invite info (public — for showing server name before login/register)
authRouter.get("/invite-info", async (req, res) => {
  try {
    const token = req.query.token as string;
    if (!token) {
      res.status(400).json({ error: "Token is required" });
      return;
    }

    const info = await inviteService.getInviteInfo(token);
    if (!info) {
      res.status(404).json({ error: "Invalid or expired invite" });
      return;
    }

    res.json(info);
  } catch {
    res.status(500).json({ error: "Failed to get invite info" });
  }
});

// Logout
authRouter.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await sessionService.revokeSession(refreshToken);
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Logout failed" });
  }
});
