import { and, eq, inArray } from "drizzle-orm";
import webpush from "web-push";
import { getDb } from "../db/index.js";
import { pushSubscriptions } from "../db/schema.js";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:push@slock.ai";
const DEFAULT_PUSH_TTL_SECONDS = 60 * 60;

let pushEnabled = false;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  pushEnabled = true;
} else {
  console.warn("[PushService] VAPID keys not configured — web push disabled");
}

export interface PushPayload {
  title: string;
  body: string;
  tag: string;
  url: string;
  alwaysShow?: boolean;
}

export function isPushEnabled(): boolean {
  return pushEnabled;
}

export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}

export async function saveSubscription(userId: string, endpoint: string, p256dh: string, auth: string) {
  const db = getDb();
  await db
    .insert(pushSubscriptions)
    .values({ userId, endpoint, p256dh, auth })
    .onConflictDoUpdate({
      target: [pushSubscriptions.userId, pushSubscriptions.endpoint],
      set: { p256dh, auth, updatedAt: new Date() },
    });
}

export async function removeSubscription(userId: string, endpoint: string) {
  const db = getDb();
  await db.delete(pushSubscriptions).where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint)));
}

export async function sendPushToUsers(userIds: string[], payload: PushPayload) {
  if (!pushEnabled || userIds.length === 0) {
    return { attempted: 0, delivered: 0, failed: 0 };
  }

  const db = getDb();
  const subscriptions = await db
    .select()
    .from(pushSubscriptions)
    .where(inArray(pushSubscriptions.userId, userIds));

  if (subscriptions.length === 0) {
    return { attempted: 0, delivered: 0, failed: 0 };
  }

  const body = JSON.stringify(payload);
  const results = await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          body,
          { TTL: DEFAULT_PUSH_TTL_SECONDS },
        );
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, subscription.id)).catch(() => {});
        }
        throw err;
      }
    }),
  );

  const failed = results.filter((result) => result.status === "rejected");
  if (failed.length > 0) {
    console.warn(`[PushService] ${failed.length}/${subscriptions.length} push deliveries failed`);
  }

  return {
    attempted: subscriptions.length,
    delivered: subscriptions.length - failed.length,
    failed: failed.length,
  };
}

export async function sendPushNotifications(targets: Array<{ userId: string; payload: PushPayload }>) {
  if (!pushEnabled || targets.length === 0) return;

  const byPayload = new Map<string, { payload: PushPayload; userIds: string[] }>();
  for (const target of targets) {
    const key = JSON.stringify(target.payload);
    const bucket = byPayload.get(key);
    if (bucket) {
      bucket.userIds.push(target.userId);
    } else {
      byPayload.set(key, { payload: target.payload, userIds: [target.userId] });
    }
  }

  await Promise.all(
    [...byPayload.values()].map(({ userIds, payload }) => sendPushToUsers(userIds, payload)),
  );
}
