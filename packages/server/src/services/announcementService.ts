import { and, desc, eq, notExists, sql } from "drizzle-orm";
import { getDb } from "../db/index.js";
import { announcements, userAnnouncementDismissals } from "../db/schema.js";
import type { Announcement, AnnouncementPage } from "@slock-ai/shared";

export type { Announcement, AnnouncementPage };

function toAnnouncement(row: typeof announcements.$inferSelect): Announcement {
  return {
    id: row.id,
    title: row.title,
    pages: row.pages,
    publishedAt: row.publishedAt.toISOString(),
  };
}

/**
 * Returns at most one announcement: the most recently published row, but only
 * if the user has not dismissed it. The `Announcement[]` shape is preserved
 * for client compatibility — array length is always 0 or 1 in v0.
 */
export async function listUndismissedForUser(userId: string): Promise<Announcement[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(announcements)
    .where(
      notExists(
        db
          .select({ one: sql`1` })
          .from(userAnnouncementDismissals)
          .where(
            and(
              eq(userAnnouncementDismissals.announcementId, announcements.id),
              eq(userAnnouncementDismissals.userId, userId),
            ),
          ),
      ),
    )
    .orderBy(desc(announcements.publishedAt))
    .limit(1);
  return rows.map(toAnnouncement);
}

export async function dismiss(userId: string, announcementId: string): Promise<boolean> {
  const db = getDb();
  const [exists] = await db
    .select({ id: announcements.id })
    .from(announcements)
    .where(eq(announcements.id, announcementId))
    .limit(1);
  if (!exists) return false;
  await db
    .insert(userAnnouncementDismissals)
    .values({ userId, announcementId })
    .onConflictDoNothing();
  return true;
}

export async function publish(params: { title: string; pages: AnnouncementPage[] }): Promise<Announcement> {
  if (typeof params.title !== "string") {
    throw new Error("title must be a string");
  }
  if (!Array.isArray(params.pages)) {
    throw new Error("pages must be an array");
  }
  // Empty pages array is allowed: it's the "clear current campaign" signal —
  // it becomes the newest row, takes over the latest-only surface, and the
  // client renders nothing for it (stays out of view until the next real
  // publish supersedes it).
  for (const p of params.pages) {
    if (typeof p.body !== "string" || p.body.length === 0) {
      throw new Error("each page needs a non-empty body");
    }
  }
  const db = getDb();
  const [row] = await db
    .insert(announcements)
    .values({ title: params.title, pages: params.pages })
    .returning();
  return toAnnouncement(row);
}

export async function getById(id: string): Promise<Announcement | null> {
  const db = getDb();
  const [row] = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
  return row ? toAnnouncement(row) : null;
}

/**
 * Latest announcement regardless of dismissal — used by socket broadcast paths
 * that just need the freshest publish event. Most queries should go through
 * listUndismissedForUser.
 */
export async function getLatest(): Promise<Announcement | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(announcements)
    .orderBy(desc(announcements.publishedAt))
    .limit(1);
  return row ? toAnnouncement(row) : null;
}
