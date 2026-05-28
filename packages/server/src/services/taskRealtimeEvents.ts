import type { Server as SocketServer } from "socket.io";

type TaskRealtimeTarget = {
  channelId: string;
  channelType: "channel" | "private" | "joint" | "dm" | "thread";
  serverId: string;
};

function taskAudience(io: SocketServer, target: TaskRealtimeTarget) {
  const channelAudience = io.to(`channel:${target.channelId}`);
  if (target.channelType !== "channel") return channelAudience;
  return channelAudience.to(`server:${target.serverId}`);
}

export function emitTaskCreated(
  io: SocketServer,
  target: TaskRealtimeTarget,
  payload: { channelId: string; tasks: unknown[] },
) {
  taskAudience(io, target).emit("task:created", payload);
}

export function emitTaskUpdated(
  io: SocketServer,
  target: TaskRealtimeTarget,
  payload: { channelId: string; task: unknown },
) {
  taskAudience(io, target).emit("task:updated", payload);
}

export function emitTaskDeleted(
  io: SocketServer,
  target: TaskRealtimeTarget,
  payload: { channelId: string; taskId: string },
) {
  taskAudience(io, target).emit("task:deleted", payload);
}
