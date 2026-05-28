import type http from "node:http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { verifyToken } from "../middleware/auth.js";
import { isRedisAvailable, getRedisPub, getRedisSub } from "../redis.js";
import * as serverService from "../services/serverService.js";
import * as channelService from "../services/channelService.js";
import * as messageService from "../services/messageService.js";
import { socketConnectedClients, socketDisconnects, syncResumeTotal } from "../metrics.js";

const HEARTBEAT_INTERVAL_MS = 15_000;
const RESUME_LIMIT = 500;

export function requiresSocketChannelAccessCheck(channelType: string): boolean {
  return ["private", "joint", "dm", "thread"].includes(channelType);
}

export function stripSocketTraceMetadata(value: unknown, depth = 0): unknown {
  if (depth > 20) return value;
  if (Array.isArray(value)) {
    return value.map((item) => stripSocketTraceMetadata(item, depth + 1));
  }
  if (!value || typeof value !== "object") {
    return value;
  }

  const input = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(input)) {
    if (key === "_trace") continue;
    output[key] = stripSocketTraceMetadata(child, depth + 1);
  }
  return output;
}

export function setupSocket(server: http.Server, corsOrigin: string | string[]) {
  const io = new Server(server, {
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
  });

  // Use Redis adapter for multi-replica broadcast when Redis is available
  if (isRedisAvailable()) {
    io.adapter(createAdapter(getRedisPub(), getRedisSub()));
    console.log("[Socket] Redis adapter enabled — multi-replica broadcasts active");
  }

  // Auth middleware — verify JWT + server membership
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    const serverId = socket.handshake.auth.serverId;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const payload = verifyToken(token);
      if (payload.type !== "access") {
        return next(new Error("Invalid token type"));
      }

      socket.data.userId = payload.sub;
      socket.data.serverId = serverId;

      // Verify server membership if serverId provided
      if (serverId) {
        const member = await serverService.isMember(serverId, payload.sub);
        if (!member) {
          return next(new Error("Not a member of this server"));
        }
      }

      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    socket.use((packet, next) => {
      for (let idx = 1; idx < packet.length; idx += 1) {
        packet[idx] = stripSocketTraceMetadata(packet[idx]);
      }
      next();
    });

    const transport = socket.conn.transport.name; // "websocket" or "polling"
    socketConnectedClients.labels(transport).inc();

    // Track transport upgrades (polling → websocket)
    socket.conn.on("upgrade", (newTransport: { name: string }) => {
      socketConnectedClients.labels(transport).dec();
      socketConnectedClients.labels(newTransport.name).inc();
    });

    const { userId, serverId } = socket.data;

    // Join per-user room for targeted cross-replica operations (e.g. socketsJoin for new DMs/threads)
    socket.join(`user:${userId}`);

    // Auto-join server room + all user's channel/DM rooms
    if (serverId) {
      socket.join(`server:${serverId}`);

      // Join all channels and DMs so the client receives message:new for unread tracking
      (async () => {
        try {
          const [chans, dms] = await Promise.all([
            channelService.listChannels(serverId, userId),
            channelService.listDMChannels(serverId, userId),
          ]);
          for (const ch of [...chans, ...dms]) {
            socket.join(`channel:${ch.id}`);
          }
        } catch (err) {
          console.error("[Socket] Failed to join channel rooms:", err);
        }
        // Signal client that room setup is complete — safe to gap-sync
        socket.emit("rooms:joined");
      })();
    }

    // P0: Session resume — client sends last known seq, server replays missed messages
    socket.on("sync:resume", async ({ lastSeq }: { lastSeq: number }) => {
      if (!lastSeq || lastSeq <= 0) return;
      if (!serverId) return;

      try {
        const missed = await messageService.syncMessages(
          lastSeq,
          undefined, // all channels
          RESUME_LIMIT,
          serverId,
          undefined,
          userId,
        );

        const currentSeq = missed.length > 0
          ? Math.max(...missed.map(m => m.seq))
          : lastSeq;

        const hasMore = missed.length >= RESUME_LIMIT;
        syncResumeTotal.labels(hasMore ? "has_more" : "ok").inc();
        socket.emit("sync:resume:response", { messages: missed, currentSeq, hasMore });
      } catch (err) {
        syncResumeTotal.labels("error").inc();
        console.error("[Socket] sync:resume failed:", err);
      }
    });

    // P2: Application-layer heartbeat with current max seq. Redis sync is kept
    // once per replica/server instead of once per connected socket.
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    if (serverId) {
      messageService.startMaxSeqRedisSync(serverId);
      heartbeatTimer = setInterval(() => {
        socket.emit("heartbeat", { seq: messageService.getMaxSeq(serverId), ts: Date.now() });
      }, HEARTBEAT_INTERVAL_MS);
    }

    socket.on("join:channel", async (channelId: string) => {
      const channel = await channelService.getChannel(channelId);
      if (!channel || channel.serverId !== socket.data.serverId) return;
      if (requiresSocketChannelAccessCheck(channel.type)) {
        const hasAccess = await channelService.canUserAccessChannel(channelId, socket.data.userId, socket.data.serverId);
        if (!hasAccess) return;
      }
      socket.join(`channel:${channelId}`);
    });

    socket.on("leave:channel", (channelId: string) => {
      socket.leave(`channel:${channelId}`);
    });

    socket.on("disconnect", (reason) => {
      socketConnectedClients.labels(socket.conn.transport.name).dec();
      socketDisconnects.labels(reason).inc();
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
      if (serverId) {
        messageService.stopMaxSeqRedisSync(serverId);
      }
    });
  });

  return io;
}
