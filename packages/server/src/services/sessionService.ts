import { and, eq, gt, lt } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import { getDb } from "../db/index.js";
import { sessions } from "../db/schema.js";

let getDbForService = getDb;

export function __setSessionServiceDbForTests(mockGetDb: typeof getDb) {
  getDbForService = mockGetDb;
}

export function __resetSessionServiceDbForTests() {
  getDbForService = getDb;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<{ refreshToken: string; expiresAt: Date }> {
  const db = getDbForService();
  const refreshToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.insert(sessions).values({
    userId,
    tokenHash,
    expiresAt,
  });

  return { refreshToken, expiresAt };
}

export async function validateSession(refreshToken: string) {
  const db = getDbForService();
  const tokenHash = hashToken(refreshToken);

  const [session] = await db.select().from(sessions)
    .where(eq(sessions.tokenHash, tokenHash));

  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    // Expired — clean up
    await db.delete(sessions).where(eq(sessions.id, session.id));
    return null;
  }

  return session;
}

export async function revokeSession(refreshToken: string) {
  const db = getDbForService();
  const tokenHash = hashToken(refreshToken);
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}

export async function revokeAllUserSessions(userId: string) {
  const db = getDbForService();
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

/**
 * Rotate refresh token: atomically consume old, create new.
 * Returns null if another request already consumed the old token.
 */
export async function rotateSession(oldRefreshToken: string, userId: string): Promise<{ refreshToken: string; expiresAt: Date } | null> {
  const db = getDbForService();
  const oldTokenHash = hashToken(oldRefreshToken);

  return db.transaction(async (tx) => {
    const [consumed] = await tx
      .delete(sessions)
      .where(and(
        eq(sessions.tokenHash, oldTokenHash),
        eq(sessions.userId, userId),
        gt(sessions.expiresAt, new Date()),
      ))
      .returning({ userId: sessions.userId });

    if (!consumed) return null;

    const refreshToken = randomBytes(32).toString("hex");
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await tx.insert(sessions).values({
      userId,
      tokenHash,
      expiresAt,
    });

    return { refreshToken, expiresAt };
  });
}

export async function cleanupExpiredSessions() {
  const db = getDbForService();
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}
