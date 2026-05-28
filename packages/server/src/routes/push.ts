import { Router, type Router as RouterType } from "express";
import { requireAuth, requireVerified } from "../middleware/auth.js";
import { getDb } from "../db/index.js";
import { webPushPromptEvents } from "../db/schema.js";
import { getVapidPublicKey, isPushEnabled, removeSubscription, saveSubscription, sendPushToUsers } from "../services/pushService.js";
import * as serverService from "../services/serverService.js";

export const pushRouter: RouterType = Router();
const PUSH_PROMPT_EVENTS = new Set([
  "web_push_prompt_shown",
  "web_push_native_result",
  "web_push_subscription_saved",
  "web_push_subscription_failed",
]);
const MAX_EVENT_FIELD_LENGTH = 128;

function cleanEventField(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, MAX_EVENT_FIELD_LENGTH) : null;
}

// The VAPID public key is intentionally unauthenticated: browsers need it before
// a user-specific subscription exists, and it is safe to expose by design.
pushRouter.get("/vapid-key", (_req, res) => {
  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    res.status(503).json({ error: "Push notifications not configured" });
    return;
  }
  res.json({ publicKey });
});

pushRouter.post("/prompt-events", requireAuth, async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const event = cleanEventField(req.body?.event);
  const trigger = cleanEventField(req.body?.trigger);
  if (!event || !PUSH_PROMPT_EVENTS.has(event) || !trigger) {
    res.status(400).json({ error: "Invalid push prompt event" });
    return;
  }

  const headerServerId = typeof req.headers["x-server-id"] === "string"
    ? req.headers["x-server-id"]
    : null;
  let serverId: string | null = null;
  if (headerServerId && await serverService.isMember(headerServerId, userId)) {
    serverId = headerServerId;
  }

  try {
    await getDb().insert(webPushPromptEvents).values({
      userId,
      serverId,
      event,
      trigger,
      result: cleanEventField(req.body?.result),
      permissionBefore: cleanEventField(req.body?.permissionBefore),
      permissionAfter: cleanEventField(req.body?.permissionAfter),
      detail: cleanEventField(req.body?.detail),
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("[Push] Failed to record prompt event:", err);
    res.status(500).json({ error: "Failed to record prompt event" });
  }
});

pushRouter.post("/subscribe", requireAuth, requireVerified, async (req, res) => {
  if (!isPushEnabled()) {
    res.status(503).json({ error: "Push notifications not configured" });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { endpoint, keys } = req.body ?? {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    res.status(400).json({ error: "Missing endpoint or subscription keys" });
    return;
  }

  try {
    await saveSubscription(userId, endpoint, keys.p256dh, keys.auth);
    res.json({ ok: true });
  } catch (err) {
    console.error("[Push] Failed to save subscription:", err);
    res.status(500).json({ error: "Failed to save subscription" });
  }
});

pushRouter.delete("/subscribe", requireAuth, requireVerified, async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { endpoint } = req.body ?? {};
  if (!endpoint) {
    res.status(400).json({ error: "Missing endpoint" });
    return;
  }

  try {
    await removeSubscription(userId, endpoint);
    res.json({ ok: true });
  } catch (err) {
    console.error("[Push] Failed to remove subscription:", err);
    res.status(500).json({ error: "Failed to remove subscription" });
  }
});

pushRouter.post("/test", requireAuth, requireVerified, async (req, res) => {
  if (!isPushEnabled()) {
    res.status(503).json({ error: "Push notifications not configured" });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const sentAt = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "UTC",
    });
    const result = await sendPushToUsers([userId], {
      title: "Slock test notification",
      body: `Direct web push delivered at ${sentAt} UTC`,
      tag: `push-test:${Date.now()}`,
      url: "/settings?pushTest=1",
      alwaysShow: true,
    });

    if (result.attempted === 0) {
      res.status(409).json({ error: "No push subscription found for this user on this server" });
      return;
    }

    if (result.delivered === 0) {
      res.status(502).json({ error: "Push delivery failed for all subscriptions", ...result });
      return;
    }

    res.json({ ok: true, ...result });
  } catch (err) {
    console.error("[Push] Failed to send test push:", err);
    res.status(500).json({ error: "Failed to send test push" });
  }
});
