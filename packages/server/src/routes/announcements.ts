import { Router, type Router as RouterType } from "express";
import type { Server as SocketServer } from "socket.io";
import { requireAuth, requireVerified } from "../middleware/auth.js";
import * as announcementService from "../services/announcementService.js";

export const announcementRouter: RouterType = Router();

/**
 * Publish an announcement and broadcast it to every connected socket.
 * Broadcast is account-level (global) — announcements are not server-scoped,
 * so we emit to the whole io server rather than to a room. Clients filter
 * on their own dismissal state.
 *
 * v0 has no authenticated publish endpoint. To create a campaign, INSERT
 * directly into the `announcements` table via DB GUI / SQL. The table is
 * intentionally FK-free so it can be edited in isolation. New rows are
 * picked up the next time a client calls GET /active (page load / refresh);
 * a future admin tool can call this helper to also push the
 * `announcement:new` socket event for live delivery.
 */
export async function publishAndBroadcast(
  io: SocketServer,
  params: { title: string; pages: announcementService.AnnouncementPage[] },
): Promise<announcementService.Announcement> {
  const announcement = await announcementService.publish(params);
  io.emit("announcement:new", announcement);
  return announcement;
}

announcementRouter.get("/active", requireAuth, requireVerified, async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const items = await announcementService.listUndismissedForUser(userId);
  res.json({ announcements: items });
});

announcementRouter.post("/:id/dismiss", requireAuth, requireVerified, async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const ok = await announcementService.dismiss(userId, req.params.id as string);
  if (!ok) {
    res.status(404).json({ error: "Announcement not found" });
    return;
  }
  res.json({ ok: true });
});
