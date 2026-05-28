import { Router, type Router as RouterType } from "express";
import * as taskService from "../services/taskService.js";
import * as channelService from "../services/channelService.js";
import * as messageService from "../services/messageService.js";
import * as userService from "../services/userService.js";
import type { Server as SocketServer } from "socket.io";
import type { AgentOrchestrator } from "../services/agentOrchestrator.js";
import { hasServerCapability, type TaskStatus } from "@slock-ai/shared";
import { getServerRole } from "../lib/serverPermissions.js";
import { emitTaskCreated, emitTaskDeleted, emitTaskUpdated } from "../services/taskRealtimeEvents.js";

export const taskRouter: RouterType = Router();

async function rejectIfNoTaskReadAccess(channelId: string, userId: string, serverId: string, res: any): Promise<boolean> {
  const canAccess = await channelService.canUserAccessChannel(channelId, userId, serverId);
  if (!canAccess) {
    res.status(404).json({ error: "Channel not found" });
    return true;
  }
  return false;
}

// List tasks for a channel
taskRouter.get("/channel/:channelId", async (req, res) => {
  try {
    const channel = await channelService.getChannel(req.params.channelId);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (await rejectIfNoTaskReadAccess(req.params.channelId, req.userId!, req.serverId!, res)) return;
    const statusFilter = req.query.status as TaskStatus | undefined;
    const tasks = await taskService.listTasks(req.params.channelId, statusFilter);
    res.json({ tasks });
  } catch {
    res.status(500).json({ error: "Failed to list tasks" });
  }
});

// Resolve a task reference by channel + task number (message-based or legacy)
taskRouter.get("/channel/:channelId/number/:taskNumber", async (req, res) => {
  try {
    const channel = await channelService.getChannel(req.params.channelId);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (await rejectIfNoTaskReadAccess(req.params.channelId, req.userId!, req.serverId!, res)) return;

    const taskNumber = Number(req.params.taskNumber);
    if (!Number.isInteger(taskNumber) || taskNumber <= 0) {
      res.status(400).json({ error: "Invalid task number" });
      return;
    }

    const task = await taskService.getTaskByNumber(req.params.channelId, taskNumber);
    if (task) {
      const enriched = await taskService.enrichSingleTask(task);
      res.json({ task: enriched });
      return;
    }

    const legacyTask = await taskService.getLegacyTaskByNumber(req.params.channelId, taskNumber);
    if (legacyTask) {
      const enriched = await taskService.enrichSingleLegacyTask(legacyTask);
      res.json({ task: enriched });
      return;
    }

    res.status(404).json({ error: "Task not found" });
  } catch {
    res.status(500).json({ error: "Failed to resolve task" });
  }
});

// List all channel tasks for the current server
taskRouter.get("/server", async (req, res) => {
  try {
    const statusFilter = req.query.status as TaskStatus | undefined;
    const tasks = await taskService.listServerTasks(req.serverId!, statusFilter);
    res.json({ tasks });
  } catch {
    res.status(500).json({ error: "Failed to list server tasks" });
  }
});

// Create tasks (batch)
taskRouter.post("/channel/:channelId", async (req, res) => {
  try {
    const channel = await channelService.getChannel(req.params.channelId);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (channel.type === "thread") {
      res.status(409).json({ error: "Thread messages cannot become tasks" });
      return;
    }
    if (channel.type === "joint") {
      res.status(409).json({ error: "Joint channel tasks are not supported yet", code: "joint_channel_tasks_unsupported" });
      return;
    }
    if (await rejectIfNoTaskWriteAccess(req.params.channelId, req.userId!, res)) return;
    if (await rejectIfArchived(req.params.channelId, res)) return;

    const { tasks: items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "tasks array is required" });
      return;
    }
    if (items.length > 50) {
      res.status(400).json({ error: "Cannot create more than 50 tasks at once" });
      return;
    }

    for (const item of items) {
      if (!item.title || typeof item.title !== "string" || item.title.trim().length === 0) {
        res.status(400).json({ error: "Each task must have a non-empty title" });
        return;
      }
    }

    const created = await taskService.createTasks(
      req.params.channelId,
      "user",
      req.userId!,
      items.map((i: any) => ({ title: i.title.trim(), description: i.description?.trim() })),
    );

    const io: SocketServer = req.app.get("io");
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;

    // Broadcast each task as both a message:new (chat flow) and task:created (task board)
    for (const t of created) {
      io.to(`channel:${req.params.channelId}`).emit("message:new", { ...t, senderName: t.createdByName || "Unknown" });
      messageService.deliverMessageToAgents(agentOrchestrator, t as any, t.createdByName || "Unknown").catch(() => {});
    }
    emitTaskCreated(io, {
      channelId: channel.id,
      channelType: channel.type,
      serverId: channel.serverId,
    }, {
      channelId: req.params.channelId,
      tasks: created,
    });

    // Emit system message to chat (visible to humans + agents, counts as unread)
    const taskList = created.map((t: any) => `#${t.taskNumber} "${messageService.summarizeForSystemMessage(t.title)}"`).join(", ");
    const sysContent = `📋 ${created.length} new task${created.length > 1 ? "s" : ""} created: ${taskList}`;
    messageService.broadcastSystemMessage(io, agentOrchestrator, req.params.channelId, sysContent).catch(() => {});

    res.json({ tasks: created });
  } catch {
    res.status(500).json({ error: "Failed to create tasks" });
  }
});

/** Normalized task fields shared between message-based and legacy tasks. */
interface ResolvedTask {
  id: string;
  channelId: string;
  channelType: "channel" | "private" | "joint" | "dm" | "thread";
  taskNumber: number;
  title: string;           // content (message) or title (legacy)
  creatorType: string;     // senderType or createdByType
  creatorId: string;       // senderId or createdById
  isLegacy: boolean;
  /**
   * True when the task's parent channel has been soft-deleted. Mutations
   * on these tasks are restricted to terminal-only verbs (status →
   * done/closed) so users can clear orphans from their Tasks panel without
   * resurrecting work in a dead channel. See `rejectIfOrphanNonTerminal`.
   */
  isOrphan: boolean;
  raw: any;                // original row for service calls
}

/** Reject mutations on archived channels. Returns true if blocked (response already sent). */
async function rejectIfArchived(channelId: string, res: any): Promise<boolean> {
  if (await channelService.isChannelArchived(channelId)) {
    res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
    return true;
  }
  return false;
}

/** Public channels may be readable without membership, but task mutations require write authority. */
async function rejectIfNoTaskWriteAccess(channelId: string, userId: string, res: any): Promise<boolean> {
  const canPost = await channelService.canUserPostToChannel(channelId, userId);
  if (!canPost) {
    res.status(403).json({ error: "You must join this channel to modify tasks" });
    return true;
  }
  return false;
}

/**
 * Reject mutations on orphaned tasks unless they target a terminal status.
 * Orphans live in soft-deleted channels — `requireTaskInServer` resolved them
 * with `includeDeleted: true` so they're visible to the user, but only
 * terminal verbs (`done`, `closed`) are permitted to drain them from the
 * panel without re-opening work in a dead channel.
 *
 * Returns `true` if the request is blocked (response already sent).
 */
function rejectIfOrphanNonTerminal(task: ResolvedTask, intent: "terminal" | "non_terminal", res: any): boolean {
  if (!task.isOrphan) return false;
  if (intent === "terminal") return false;
  res.status(409).json({
    error: "This channel was deleted; only mark-done or mark-closed are allowed on the task",
    code: "channel_deleted_terminal_only",
  });
  return true;
}

/** Skip channel access / archive / write checks when the channel is soft-deleted (orphan path). */
async function rejectIfNoChannelWriteAccess(task: ResolvedTask, userId: string, res: any): Promise<boolean> {
  if (task.isOrphan) return false; // membership and archive checks don't apply on a deleted channel
  if (await rejectIfNoTaskWriteAccess(task.channelId, userId, res)) return true;
  if (await rejectIfArchived(task.channelId, res)) return true;
  return false;
}

/** Validate task exists and belongs to current server. Checks both message-based and legacy tasks.
 *
 * If the task's parent channel has been soft-deleted, we still resolve it
 * (with `includeDeleted: true`) and mark `isOrphan = true`. Routes can then
 * call `rejectIfOrphanNonTerminal` to allow only terminal-only mutations
 * (mark done/closed) so users can clear stale tasks from their panel without
 * resurrecting work in a dead channel.
 *
 * Channel-archived (different state from deleted) and access checks still
 * run normally — orphan handling only relaxes the deletedAt filter.
 */
async function requireTaskInServer(req: any, res: any): Promise<ResolvedTask | null> {
  const task = await taskService.getTask(req.params.taskId);
  if (task) {
    const channel = await channelService.getChannel(task.channelId, { includeDeleted: true });
    if (!channel || channel.serverId !== req.serverId) { res.status(404).json({ error: "Task not found" }); return null; }
    if (!await channelService.canUserAccessChannel(task.channelId, req.userId!, req.serverId, { includeDeleted: true })) { res.status(404).json({ error: "Task not found" }); return null; }
    return { id: task.id, channelId: task.channelId, channelType: channel.type, taskNumber: task.taskNumber!, title: task.content, creatorType: task.senderType, creatorId: task.senderId, isLegacy: false, isOrphan: channel.deletedAt != null, raw: task };
  }

  const legacy = await taskService.getLegacyTask(req.params.taskId);
  if (legacy) {
    const channel = await channelService.getChannel(legacy.channelId, { includeDeleted: true });
    if (!channel || channel.serverId !== req.serverId) { res.status(404).json({ error: "Task not found" }); return null; }
    if (!await channelService.canUserAccessChannel(legacy.channelId, req.userId!, req.serverId, { includeDeleted: true })) { res.status(404).json({ error: "Task not found" }); return null; }
    return { id: legacy.id, channelId: legacy.channelId, channelType: channel.type, taskNumber: legacy.taskNumber, title: legacy.title, creatorType: legacy.createdByType, creatorId: legacy.createdById, isLegacy: true, isOrphan: channel.deletedAt != null, raw: legacy };
  }

  res.status(404).json({ error: "Task not found" });
  return null;
}

/** Enrich and emit socket events for a task mutation result. */
async function emitTaskUpdate(req: any, task: ResolvedTask, result: any) {
  const enriched = task.isLegacy
    ? await taskService.enrichSingleLegacyTask(result)
    : await taskService.enrichSingleTask(result);
  const io: SocketServer = req.app.get("io");
  if (!task.isLegacy) {
    io.to(`channel:${task.channelId}`).emit("message:updated", { ...result, senderName: enriched.createdByName || "Unknown" });
  }
  emitTaskUpdated(io, {
    channelId: task.channelId,
    channelType: task.channelType,
    serverId: req.serverId!,
  }, { channelId: task.channelId, task: enriched });
  return enriched;
}

/**
 * Post a task lifecycle system message ("📌 X claimed", "✅ Y moved to Done", …)
 * into the task's own thread channel — never the parent channel.
 *
 * stdrc 2026-05-07 #proj-task:5f016c34 e1c404b6:
 *   "task 的状态变化是要更新到 task thread 的，但是不应该更新到它所在的 channel 里"
 *
 * The contract:
 *   - parent channel: stays clean (PR #1242 removed all channel-side broadcasts)
 *   - task thread: gets the system message, fan-out reaches everyone who
 *     follows that thread (which by construction = people who care about
 *     this task's lifecycle)
 *
 * Legacy tasks are skipped — they have no real `messageId` to anchor a thread
 * on. They predate threads and we're letting them age out without retrofit.
 *
 * The thread is lazy-created if it doesn't exist yet (channelService.
 * getOrCreateThread). Errors are swallowed — a failed lifecycle notice must
 * never block the actual task mutation, which has already committed by the
 * time we get here.
 */
async function postTaskLifecycleToThread(
  req: any,
  task: ResolvedTask,
  actorUserId: string,
  content: string,
): Promise<void> {
  if (task.isLegacy) return;
  try {
    const thread = await channelService.getOrCreateThread(task.id, actorUserId, "user");
    const io: SocketServer = req.app.get("io");
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    await messageService.broadcastSystemMessage(io, agentOrchestrator, thread.id, content);
  } catch (err) {
    console.error("Failed to post task lifecycle system message to thread:", err);
  }
}

// Claim a task
taskRouter.patch("/:taskId/claim", async (req, res) => {
  try {
    const task = await requireTaskInServer(req, res);
    if (!task) return;
    if (task.channelType === "thread") {
      res.status(409).json({ error: "Thread messages cannot be claimed as tasks" });
      return;
    }
    if (rejectIfOrphanNonTerminal(task, "non_terminal", res)) return;
    if (await rejectIfNoChannelWriteAccess(task, req.userId!, res)) return;

    const result = task.isLegacy
      ? await taskService.claimLegacyTask(task.id, "user", req.userId!)
      : await taskService.claimTask(task.id, "user", req.userId!);
    if (typeof result === "string") { res.status(409).json({ error: result }); return; }

    const enriched = await emitTaskUpdate(req, task, result);
    // Lifecycle notice goes to the task's own thread, not the parent channel.
    // (stdrc 2026-05-07 #proj-task:5f016c34 msg=e1c404b6)
    postTaskLifecycleToThread(
      req,
      task,
      req.userId!,
      `📌 ${enriched.claimedByName || "Someone"} claimed #${task.taskNumber} "${messageService.summarizeForSystemMessage(task.title)}"`,
    ).catch(() => {});

    res.json({ task: enriched });
  } catch {
    res.status(500).json({ error: "Failed to claim task" });
  }
});

// Convert a message into a task (unclaimed, status: todo)
taskRouter.post("/convert-message", async (req, res) => {
  try {
    const { messageId } = req.body;
    if (!messageId) {
      res.status(400).json({ error: "messageId is required" });
      return;
    }

    // Verify the message belongs to a channel in this server
    const msg = await messageService.getMessage(messageId);
    if (!msg) {
      res.status(404).json({ error: "Message not found" });
      return;
    }
    const channel = await channelService.getChannel(msg.channelId);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Message not found" });
      return;
    }
    if (await rejectIfNoTaskReadAccess(msg.channelId, req.userId!, req.serverId!, res)) return;
    if (channel.type === "thread") {
      res.status(409).json({ error: "Thread messages cannot be claimed as tasks" });
      return;
    }
    if (channel.type === "joint") {
      res.status(409).json({ error: "Joint channel tasks are not supported yet", code: "joint_channel_tasks_unsupported" });
      return;
    }
    if (await rejectIfNoTaskWriteAccess(msg.channelId, req.userId!, res)) return;
    if (await rejectIfArchived(msg.channelId, res)) return;

    const result = await taskService.convertMessageToTask(messageId, "user", req.userId!);
    if (typeof result === "string") {
      res.status(409).json({ error: result });
      return;
    }

    const enriched = await taskService.enrichSingleTask(result);
    const io: SocketServer = req.app.get("io");
    // Update the message in chat flow with task fields, and add to task board
    io.to(`channel:${result.channelId}`).emit("message:updated", { ...result, senderName: enriched.createdByName || "Unknown" });
    emitTaskCreated(io, {
      channelId: result.channelId,
      channelType: channel.type,
      serverId: channel.serverId,
    }, {
      channelId: result.channelId,
      tasks: [enriched],
    });

    // Deliver the converted task message to agents (so they see it with msg ID + task fields)
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    messageService.deliverMessageToAgents(agentOrchestrator, result, enriched.createdByName || "Unknown").catch(() => {});

    // Emit system message with both task number and message ID for agent reference
    const converterName = enriched.createdByName || "Someone";
    const sysContent = `📋 ${converterName} converted a message to task #${result.taskNumber} "${messageService.summarizeForSystemMessage(result.content)}"`;
    messageService.broadcastSystemMessage(io, agentOrchestrator, result.channelId, sysContent).catch(() => {});

    res.json({ task: enriched });
  } catch {
    res.status(500).json({ error: "Failed to convert message to task" });
  }
});

// Unclaim a task
taskRouter.patch("/:taskId/unclaim", async (req, res) => {
  try {
    const task = await requireTaskInServer(req, res);
    if (!task) return;
    if (rejectIfOrphanNonTerminal(task, "non_terminal", res)) return;
    if (await rejectIfNoChannelWriteAccess(task, req.userId!, res)) return;

    const result = task.isLegacy
      ? await taskService.unclaimLegacyTask(task.id, req.userId!)
      : await taskService.unclaimTask(task.id, req.userId!);
    if (typeof result === "string") { res.status(409).json({ error: result }); return; }

    const enriched = await emitTaskUpdate(req, task, result);
    // Lifecycle notice goes to the task's own thread, not the parent channel.
    // (stdrc 2026-05-07 #proj-task:5f016c34 msg=e1c404b6)
    const user = await userService.getUser(req.userId!);
    const userName = user?.displayName || user?.name || "Someone";
    postTaskLifecycleToThread(
      req,
      task,
      req.userId!,
      `🔓 ${userName} released #${task.taskNumber} "${messageService.summarizeForSystemMessage(task.title)}"`,
    ).catch(() => {});

    res.json({ task: enriched });
  } catch {
    res.status(500).json({ error: "Failed to unclaim task" });
  }
});

// Update task status (assignee or admin/owner)
taskRouter.patch("/:taskId/status", async (req, res) => {
  try {
    const task = await requireTaskInServer(req, res);
    if (!task) return;

    const { status } = req.body;
    if (!status || !["todo", "in_progress", "in_review", "done", "closed"].includes(status)) {
      res.status(400).json({ error: "valid status is required (todo, in_progress, in_review, done, closed)" });
      return;
    }

    // Orphan tasks (channel deleted) only allow terminal verbs
    const isTerminal = status === "done" || status === "closed";
    if (rejectIfOrphanNonTerminal(task, isTerminal ? "terminal" : "non_terminal", res)) return;
    if (await rejectIfNoChannelWriteAccess(task, req.userId!, res)) return;

    // Try normal update, then admin force-override if denied.
    // Orphan tasks always go through force-override (the original assignee
    // may be a deleted agent, and membership checks don't apply).
    let result: any;
    if (task.isOrphan) {
      const callerRole = await getServerRole(req.serverId!, req.userId!);
      if (!hasServerCapability(callerRole, "manageServer")) {
        res.status(403).json({ error: "Only server admins can close tasks in deleted channels" });
        return;
      }
      result = task.isLegacy
        ? await taskService.forceUpdateLegacyTaskStatus(task.id, status)
        : await taskService.forceUpdateTaskStatus(task.id, status);
    } else {
      result = task.isLegacy
        ? await taskService.updateLegacyTaskStatus(task.id, status, req.userId!)
        : await taskService.updateTaskStatus(task.id, status, req.userId!);

      if (typeof result === "string" && result !== "task not found") {
        const callerRole = await getServerRole(req.serverId!, req.userId!);
        if (hasServerCapability(callerRole, "manageServer")) {
          result = task.isLegacy
            ? await taskService.forceUpdateLegacyTaskStatus(task.id, status)
            : await taskService.forceUpdateTaskStatus(task.id, status);
        }
      }
    }
    if (typeof result === "string") { res.status(409).json({ error: result }); return; }

    const enriched = await emitTaskUpdate(req, task, result);
    // Lifecycle notice goes to the task's own thread, not the parent channel.
    // (stdrc 2026-05-07 #proj-task:5f016c34 msg=e1c404b6)
    const STATUS_EMOJI: Record<string, string> = { todo: "📝", in_progress: "🔄", in_review: "👀", done: "✅", closed: "🚫" };
    const STATUS_LABEL: Record<string, string> = { todo: "Todo", in_progress: "In Progress", in_review: "In Review", done: "Done", closed: "Closed" };
    const user = await userService.getUser(req.userId!);
    const userName = user?.displayName || user?.name || "Someone";
    postTaskLifecycleToThread(
      req,
      task,
      req.userId!,
      `${STATUS_EMOJI[status] || "📝"} ${userName} moved #${task.taskNumber} "${messageService.summarizeForSystemMessage(task.title)}" to ${STATUS_LABEL[status] || status}`,
    ).catch(() => {});

    res.json({ task: enriched });
  } catch {
    res.status(500).json({ error: "Failed to update task status" });
  }
});

// Delete a task (creator or admin/owner).
// Orphan tasks (channel deleted) are also deletable here — DELETE is a
// terminal cleanup action. The creator can delete their own orphan task;
// non-creators need admin (manageServer) capability. This is intentional:
// the user who created the task should be able to clean it up even after
// the channel is gone, without requiring admin escalation.
taskRouter.delete("/:taskId", async (req, res) => {
  try {
    const task = await requireTaskInServer(req, res);
    if (!task) return;
    // Orphan tasks can be deleted (terminal cleanup action)
    if (await rejectIfNoChannelWriteAccess(task, req.userId!, res)) return;

    const isCreator = task.creatorType === "user" && task.creatorId === req.userId;
    if (!isCreator) {
      const callerRole = await getServerRole(req.serverId!, req.userId!);
      if (!hasServerCapability(callerRole, "manageServer")) {
        res.status(403).json({ error: "Only the task creator or server admins can delete" });
        return;
      }
    }

    if (task.isLegacy) {
      await taskService.deleteLegacyTask(task.id);
    } else {
      await taskService.deleteTask(task.id);
    }

    const io: SocketServer = req.app.get("io");
    emitTaskDeleted(io, {
      channelId: task.channelId,
      channelType: task.channelType,
      serverId: req.serverId!,
    }, { channelId: task.channelId, taskId: task.id });

    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    const user = await userService.getUser(req.userId!);
    const userName = user?.displayName || user?.name || "Someone";
    messageService.broadcastSystemMessage(io, agentOrchestrator, task.channelId,
      `🗑 ${userName} deleted #${task.taskNumber} "${messageService.summarizeForSystemMessage(task.title)}"`).catch(() => {});

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete task" });
  }
});
