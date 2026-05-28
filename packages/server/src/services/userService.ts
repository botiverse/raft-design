import { eq, and, gt } from "drizzle-orm";
import argon2 from "argon2";
import { createHash, randomBytes } from "node:crypto";
import { getDb } from "../db/index.js";
import type { DatabaseExecutor } from "../db/index.js";
import { users, emailVerifications, passwordResets, userAuthIdentities } from "../db/schema.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "./emailService.js";
import { normalizeEmail } from "./emailNormalization.js";
import { syncNewsletterSignup } from "./newsletterService.js";
import { assertRegistrationEnabled } from "./registrationPolicy.js";
import type { SocialAuthProfile, SocialAuthProvider } from "./socialAuthService.js";
import * as legalAcceptanceService from "./legalAcceptanceService.js";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function toPublicUser(user: {
  id: string;
  email: string;
  name: string;
  displayName: string | null;
  description: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  preferredLanguage?: string | null;
  preferredTimezone?: string | null;
  autoTranslationEnabled?: boolean | null;
  preferredTranslationDisplay?: "translated" | "original" | null;
  preferredTimeFormat?: "12h" | "24h" | null;
  preferredMessageBodyFontSize?: "sm" | "md" | "lg" | null;
  referralSource?: string | null;
  referralSourceOther?: string | null;
  referralSourceSkippedAt?: Date | null;
}) {
  return {
    id: user.id,
    email: user.email,
    gravatarHash: createHash("sha256").update(user.email.trim().toLowerCase()).digest("hex"),
    name: user.name,
    displayName: user.displayName,
    description: user.description,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
    preferredLanguage: user.preferredLanguage ?? null,
    preferredTimezone: user.preferredTimezone ?? null,
    autoTranslationEnabled: user.autoTranslationEnabled ?? true,
    preferredTranslationDisplay: user.preferredTranslationDisplay ?? "translated",
    preferredTimeFormat: user.preferredTimeFormat ?? null,
    preferredMessageBodyFontSize: user.preferredMessageBodyFontSize ?? null,
    referralSource: user.referralSource ?? null,
    referralSourceOther: user.referralSourceOther ?? null,
    referralSourceSkippedAt: user.referralSourceSkippedAt ?? null,
  };
}

type PublicUser = ReturnType<typeof toPublicUser>;

function isUniqueViolation(err: unknown): boolean {
  return !!err && typeof err === "object" && "code" in err && (err as { code?: string }).code === "23505";
}

function getProviderLabel(provider: SocialAuthProvider): string {
  switch (provider) {
    case "google":
      return "Google";
    case "github":
      return "GitHub";
    default:
      return provider;
  }
}

function slugifyUserName(seed: string): string {
  const normalized = seed
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const withLetterPrefix = /^[a-z]/.test(normalized) ? normalized : `user-${normalized}`;
  const compact = withLetterPrefix.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  const fallback = compact || "user-account";
  return fallback.length >= 5 ? fallback : `${fallback}-user`;
}

async function generateAvailableUserName(seed: string, database: DatabaseExecutor): Promise<string> {
  const base = slugifyUserName(seed);

  for (let suffix = 0; suffix < 100; suffix++) {
    const candidate = suffix === 0 ? base : `${base}-${suffix + 1}`;
    const [existingUser] = await database.select({ id: users.id }).from(users).where(eq(users.name, candidate));
    if (!existingUser) return candidate;
  }

  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `${base}-${randomBytes(2).toString("hex")}`;
    const [existingUser] = await database.select({ id: users.id }).from(users).where(eq(users.name, candidate));
    if (!existingUser) return candidate;
  }

  throw new Error("Failed to allocate a unique username");
}

function assertUsableSocialProfile(profile: SocialAuthProfile): asserts profile is SocialAuthProfile & {
  email: string;
  providerUserId: string;
} {
  if (!profile.email || !profile.providerUserId) {
    throw new Error(`${getProviderLabel(profile.provider)} profile is missing required identity fields`);
  }
  if (!profile.emailVerified) {
    throw new Error(`${getProviderLabel(profile.provider)} account email is not verified`);
  }
}

// ── User CRUD ──

export async function createUser(
  email: string,
  password: string,
  name: string,
  legalAcceptance: legalAcceptanceService.LegalAcceptanceInput,
  legalMetadata: legalAcceptanceService.LegalAcceptanceMetadata = {},
  legalSource: Extract<legalAcceptanceService.LegalAcceptanceSource, "signup" | "invite"> = "signup",
) {
  const db = getDb();
  const normalizedEmail = normalizeEmail(email);

  const [existingEmail] = await db.select({ id: users.id }).from(users).where(eq(users.email, normalizedEmail));
  if (existingEmail) {
    throw new Error("Email is already registered");
  }

  const [existingName] = await db.select({ id: users.id }).from(users).where(eq(users.name, name));
  if (existingName) {
    throw new Error("Username is already taken");
  }

  const passwordHash = await argon2.hash(password);

  const token = randomBytes(32).toString("hex");

  const publicUser = await db.transaction(async (transaction) => {
    legalAcceptanceService.requireCurrentLegalAcceptance(legalAcceptance);

    const [user] = await transaction.insert(users).values({
      email: normalizedEmail,
      name,
      displayName: name,
      passwordHash,
    }).returning();

    await legalAcceptanceService.insertUserLegalAcceptance(transaction, user.id, legalSource, legalMetadata);
    await transaction.insert(emailVerifications).values({
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    });

    return toPublicUser(user);
  });

  await sendVerificationEmail(normalizedEmail, name, token);

  await syncNewsletterSignup(publicUser);

  return publicUser;
}

export async function authenticateUser(email: string, password: string) {
  const db = getDb();

  const [user] = await db.select().from(users).where(eq(users.email, normalizeEmail(email)));
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const valid = await argon2.verify(user.passwordHash, password);
  if (!valid) {
    throw new Error("Invalid email or password");
  }

  return toPublicUser(user);
}

export async function getUser(userId: string) {
  const db = getDb();
  const [user] = await db.select({
    id: users.id,
    email: users.email,
    name: users.name,
    displayName: users.displayName,
    description: users.description,
    avatarUrl: users.avatarUrl,
    emailVerified: users.emailVerified,
    preferredLanguage: users.preferredLanguage,
    preferredTimezone: users.preferredTimezone,
    autoTranslationEnabled: users.autoTranslationEnabled,
    preferredTranslationDisplay: users.preferredTranslationDisplay,
    preferredTimeFormat: users.preferredTimeFormat,
    preferredMessageBodyFontSize: users.preferredMessageBodyFontSize,
    referralSource: users.referralSource,
    referralSourceOther: users.referralSourceOther,
    referralSourceSkippedAt: users.referralSourceSkippedAt,
  }).from(users).where(eq(users.id, userId));
  return user ? toPublicUser(user) : null;
}

export async function getUserByEmail(email: string) {
  const db = getDb();
  const [user] = await db.select({
    id: users.id,
    email: users.email,
    name: users.name,
    displayName: users.displayName,
    description: users.description,
    avatarUrl: users.avatarUrl,
    emailVerified: users.emailVerified,
    preferredLanguage: users.preferredLanguage,
    preferredTimezone: users.preferredTimezone,
    autoTranslationEnabled: users.autoTranslationEnabled,
    preferredTranslationDisplay: users.preferredTranslationDisplay,
    preferredTimeFormat: users.preferredTimeFormat,
    preferredMessageBodyFontSize: users.preferredMessageBodyFontSize,
    referralSource: users.referralSource,
    referralSourceOther: users.referralSourceOther,
    referralSourceSkippedAt: users.referralSourceSkippedAt,
  }).from(users).where(eq(users.email, normalizeEmail(email)));
  return user ? toPublicUser(user) : null;
}

export async function updateUser(userId: string, fields: {
  displayName?: string;
  description?: string | null;
  avatarUrl?: string | null;
  preferredLanguage?: string | null;
  preferredTimezone?: string | null;
  autoTranslationEnabled?: boolean;
  preferredTranslationDisplay?: "translated" | "original";
  preferredTimeFormat?: "12h" | "24h" | null;
  preferredMessageBodyFontSize?: "sm" | "md" | "lg" | null;
  referralSource?: string | null;
  referralSourceOther?: string | null;
  referralSourceSkippedAt?: Date | null;
}) {
  const db = getDb();
  await db.update(users).set({
    ...fields,
    updatedAt: new Date(),
  }).where(eq(users.id, userId));
  return getUser(userId);
}

export async function listUserAuthIdentities(userId: string) {
  const db = getDb();
  return db.select({
    provider: userAuthIdentities.provider,
    providerEmail: userAuthIdentities.providerEmail,
  }).from(userAuthIdentities).where(eq(userAuthIdentities.userId, userId));
}

async function getPublicUserByIdTx(database: DatabaseExecutor, userId: string) {
  const [user] = await database.select({
    id: users.id,
    email: users.email,
    name: users.name,
    displayName: users.displayName,
    description: users.description,
    avatarUrl: users.avatarUrl,
    emailVerified: users.emailVerified,
    preferredLanguage: users.preferredLanguage,
    preferredTimezone: users.preferredTimezone,
    autoTranslationEnabled: users.autoTranslationEnabled,
    preferredTranslationDisplay: users.preferredTranslationDisplay,
    preferredTimeFormat: users.preferredTimeFormat,
    preferredMessageBodyFontSize: users.preferredMessageBodyFontSize,
    referralSource: users.referralSource,
    referralSourceOther: users.referralSourceOther,
    referralSourceSkippedAt: users.referralSourceSkippedAt,
  }).from(users).where(eq(users.id, userId));

  return user ? toPublicUser(user) : null;
}

async function upsertSocialIdentityTx(
  database: DatabaseExecutor,
  userId: string,
  profile: SocialAuthProfile,
) {
  const normalizedEmail = normalizeEmail(profile.email);
  const [existingIdentity] = await database.select({
    id: userAuthIdentities.id,
    userId: userAuthIdentities.userId,
  }).from(userAuthIdentities).where(and(
    eq(userAuthIdentities.provider, profile.provider),
    eq(userAuthIdentities.providerUserId, profile.providerUserId),
  ));

  if (existingIdentity && existingIdentity.userId !== userId) {
    throw new Error(`This ${getProviderLabel(profile.provider)} account is already linked to another Slock account`);
  }

  if (existingIdentity) {
    await database.update(userAuthIdentities).set({
      providerEmail: normalizedEmail,
      updatedAt: new Date(),
    }).where(eq(userAuthIdentities.id, existingIdentity.id));
    return;
  }

  await database.insert(userAuthIdentities).values({
    userId,
    provider: profile.provider,
    providerUserId: profile.providerUserId,
    providerEmail: normalizedEmail,
  });
}

export async function linkSocialIdentity(userId: string, profile: SocialAuthProfile) {
  const db = getDb();
  assertUsableSocialProfile(profile);

  try {
    const linkedUser = await db.transaction(async (transaction) => {
      const [user] = await transaction.select({
        id: users.id,
        email: users.email,
        avatarUrl: users.avatarUrl,
        emailVerified: users.emailVerified,
      }).from(users).where(eq(users.id, userId));

      if (!user) {
        throw new Error("User not found");
      }

      const normalizedEmail = normalizeEmail(profile.email);
      const [existingEmailUser] = await transaction.select({
        id: users.id,
      }).from(users).where(eq(users.email, normalizedEmail));

      if (existingEmailUser && existingEmailUser.id !== userId) {
        throw new Error(`This ${getProviderLabel(profile.provider)} account email belongs to another Slock account`);
      }

      await upsertSocialIdentityTx(transaction, userId, profile);

      const shouldVerifyEmail = normalizeEmail(user.email) === normalizedEmail;
      await transaction.update(users).set({
        avatarUrl: user.avatarUrl || profile.avatarUrl || null,
        emailVerified: shouldVerifyEmail ? true : user.emailVerified,
        updatedAt: new Date(),
      }).where(eq(users.id, userId));

      return getPublicUserByIdTx(transaction, userId);
    });

    if (!linkedUser) {
      throw new Error("Failed to link social account");
    }

    return linkedUser;
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new Error(`This ${getProviderLabel(profile.provider)} account was linked concurrently. Please try again.`);
    }
    throw err;
  }
}

export async function findExistingSocialLoginUser(profile: SocialAuthProfile): Promise<PublicUser | null> {
  const db = getDb();
  assertUsableSocialProfile(profile);
  const normalizedEmail = normalizeEmail(profile.email);

  const [existingIdentity] = await db.select({
    userId: userAuthIdentities.userId,
  }).from(userAuthIdentities).where(and(
    eq(userAuthIdentities.provider, profile.provider),
    eq(userAuthIdentities.providerUserId, profile.providerUserId),
  ));

  if (existingIdentity) {
    await upsertSocialIdentityTx(db, existingIdentity.userId, profile);
    const linkedUser = await getPublicUserByIdTx(db, existingIdentity.userId);
    if (!linkedUser) {
      throw new Error("Linked user not found");
    }
    return linkedUser;
  }

  const [existingEmailUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, normalizedEmail));
  if (existingEmailUser) {
    throw new Error(`An account with this email already exists. Sign in with email and password first, then connect ${getProviderLabel(profile.provider)} in Settings.`);
  }

  assertRegistrationEnabled();
  return null;
}

export async function createSocialUser(
  profile: SocialAuthProfile,
  legalAcceptance: legalAcceptanceService.LegalAcceptanceInput,
  legalMetadata: legalAcceptanceService.LegalAcceptanceMetadata = {},
  legalSource: Extract<legalAcceptanceService.LegalAcceptanceSource, "oauth" | "invite"> = "oauth",
) {
  const db = getDb();
  assertUsableSocialProfile(profile);
  const normalizedEmail = normalizeEmail(profile.email);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const user = await db.transaction(async (transaction) => {
        legalAcceptanceService.requireCurrentLegalAcceptance(legalAcceptance);

        const [existingEmailUser] = await transaction.select({ id: users.id }).from(users).where(eq(users.email, normalizedEmail));
        if (existingEmailUser) {
          throw new Error(`An account with this email already exists. Sign in with email and password first, then connect ${getProviderLabel(profile.provider)} in Settings.`);
        }

        assertRegistrationEnabled();

        const nameSeed = profile.displayName?.trim() || normalizedEmail.split("@")[0] || "user";
        const userName = await generateAvailableUserName(nameSeed, transaction);
        const passwordHash = await argon2.hash(randomBytes(32).toString("hex"));

        const [newUser] = await transaction.insert(users).values({
          email: normalizedEmail,
          name: userName,
          displayName: profile.displayName?.trim() || userName,
          avatarUrl: profile.avatarUrl || null,
          passwordHash,
          emailVerified: true,
        }).returning();

        await transaction.insert(userAuthIdentities).values({
          userId: newUser.id,
          provider: profile.provider,
          providerUserId: profile.providerUserId,
          providerEmail: normalizedEmail,
        });

        await legalAcceptanceService.insertUserLegalAcceptance(transaction, newUser.id, legalSource, legalMetadata);
        return toPublicUser(newUser);
      });

      await syncNewsletterSignup(user);
      return user;
    } catch (err) {
      if (attempt === 0 && isUniqueViolation(err)) {
        continue;
      }
      throw err;
    }
  }

  throw new Error("Social sign-in conflicted with another concurrent account change. Please try again.");
}

// ── Email Verification ──

export async function verifyEmail(token: string): Promise<boolean> {
  const db = getDb();
  const tokenHash = hashToken(token);

  const [record] = await db.select().from(emailVerifications)
    .where(eq(emailVerifications.tokenHash, tokenHash));

  if (!record) return false;
  if (new Date(record.expiresAt) < new Date()) {
    await db.delete(emailVerifications).where(eq(emailVerifications.id, record.id));
    return false;
  }

  // Mark user verified + delete token
  await db.update(users).set({ emailVerified: true, updatedAt: new Date() })
    .where(eq(users.id, record.userId));
  await db.delete(emailVerifications).where(eq(emailVerifications.userId, record.userId));

  return true;
}

export async function resendVerificationEmail(userId: string): Promise<void> {
  const db = getDb();

  const user = await getUser(userId);
  if (!user) throw new Error("User not found");
  if (user.emailVerified) throw new Error("Email is already verified");

  // Rate limit: check tokens created in the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentTokens = await db.select({ id: emailVerifications.id, createdAt: emailVerifications.createdAt })
    .from(emailVerifications)
    .where(and(
      eq(emailVerifications.userId, userId),
      gt(emailVerifications.createdAt, oneHourAgo),
    ));

  if (recentTokens.length >= 5) {
    throw new Error("Too many verification emails. Please try again later.");
  }

  // 60-second cooldown
  if (recentTokens.length > 0) {
    const latest = recentTokens.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    const elapsed = Date.now() - new Date(latest.createdAt).getTime();
    if (elapsed < 60_000) {
      throw new Error("Please wait before requesting another verification email.");
    }
  }

  // Delete old tokens and create new one
  await db.delete(emailVerifications).where(eq(emailVerifications.userId, userId));

  const token = randomBytes(32).toString("hex");
  await db.insert(emailVerifications).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
  });

  await sendVerificationEmail(user.email, user.name, token);
}

// ── Password Reset ──

export async function requestPasswordReset(email: string): Promise<void> {
  const db = getDb();
  const normalizedEmail = normalizeEmail(email);

  const [user] = await db.select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.email, normalizedEmail));
  if (!user) return; // Don't reveal whether user exists

  // Rate limit: 5 per hour per user
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentTokens = await db.select({ id: passwordResets.id })
    .from(passwordResets)
    .where(and(
      eq(passwordResets.userId, user.id),
      gt(passwordResets.createdAt, oneHourAgo),
    ));

  if (recentTokens.length >= 5) return; // Silently fail, don't reveal rate limit

  // Delete old tokens and create new one
  await db.delete(passwordResets).where(eq(passwordResets.userId, user.id));

  const token = randomBytes(32).toString("hex");
  await db.insert(passwordResets).values({
    userId: user.id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1h
  });

  await sendPasswordResetEmail(user.email, user.name, token);
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; userId?: string }> {
  const db = getDb();
  const tokenHash = hashToken(token);

  const [record] = await db.select().from(passwordResets)
    .where(eq(passwordResets.tokenHash, tokenHash));

  if (!record) return { success: false };
  if (new Date(record.expiresAt) < new Date()) {
    await db.delete(passwordResets).where(eq(passwordResets.id, record.id));
    return { success: false };
  }

  // Update password
  const passwordHash = await argon2.hash(newPassword);
  await db.update(users).set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, record.userId));

  // Delete all password reset tokens for this user
  await db.delete(passwordResets).where(eq(passwordResets.userId, record.userId));

  return { success: true, userId: record.userId };
}

// ── Password Change (authenticated) ──

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  const db = getDb();

  const [user] = await db.select({ passwordHash: users.passwordHash })
    .from(users).where(eq(users.id, userId));
  if (!user) throw new Error("User not found");

  const valid = await argon2.verify(user.passwordHash, currentPassword);
  if (!valid) throw new Error("Current password is incorrect");

  const passwordHash = await argon2.hash(newPassword);
  await db.update(users).set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, userId));
}
