import assert from "node:assert/strict";
import test from "node:test";
import { emitTaskCreated, emitTaskDeleted, emitTaskUpdated } from "./taskRealtimeEvents.js";

function createIoRecorder() {
  const emissions: Array<{ rooms: string[]; event: string; payload: unknown }> = [];
  const io = {
    rooms: [] as string[],
    to(room: string) {
      this.rooms.push(room);
      return this;
    },
    emit(event: string, payload: unknown) {
      emissions.push({ rooms: [...this.rooms], event, payload });
      this.rooms = [];
      return true;
    },
  };
  return { io: io as any, emissions };
}

test("public channel task events fan out to channel and server rooms", () => {
  const { io, emissions } = createIoRecorder();
  const target = { channelId: "channel-1", channelType: "channel" as const, serverId: "server-1" };

  emitTaskCreated(io, target, { channelId: "channel-1", tasks: [{ id: "task-1" }] });
  emitTaskUpdated(io, target, { channelId: "channel-1", task: { id: "task-1", status: "done" } });
  emitTaskDeleted(io, target, { channelId: "channel-1", taskId: "task-1" });

  assert.deepEqual(emissions.map((item) => item.event), [
    "task:created",
    "task:updated",
    "task:deleted",
  ]);
  assert.deepEqual(emissions.map((item) => item.rooms), [
    ["channel:channel-1", "server:server-1"],
    ["channel:channel-1", "server:server-1"],
    ["channel:channel-1", "server:server-1"],
  ]);
});

test("private task events stay channel-scoped", () => {
  const { io, emissions } = createIoRecorder();

  emitTaskUpdated(io, {
    channelId: "private-1",
    channelType: "private",
    serverId: "server-1",
  }, {
    channelId: "private-1",
    task: { id: "task-1", status: "done" },
  });

  assert.deepEqual(emissions, [{
    rooms: ["channel:private-1"],
    event: "task:updated",
    payload: { channelId: "private-1", task: { id: "task-1", status: "done" } },
  }]);
});
