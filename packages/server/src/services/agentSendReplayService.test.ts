import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import {
  __resetAgentSendReplayDbForTests,
  __setAgentSendReplayDbForTests,
  createOrReplayAgentSend,
} from "./agentSendReplayService.js";
import { attachments, messages } from "../db/schema.js";

type InsertCapture = {
  table?: unknown;
  values?: Record<string, unknown>;
};

type UpdateCapture = {
  table?: unknown;
  setValues?: Record<string, unknown>;
};

function makeInsertBuilder(result: unknown[], capture?: InsertCapture) {
  return {
    values(values: Record<string, unknown>) {
      if (capture) capture.values = values;
      return {
        onConflictDoNothing() {
          return {
            returning() {
              return Promise.resolve(result);
            },
          };
        },
      };
    },
  };
}

function makeUpdateBuilder(result: unknown[], capture?: UpdateCapture) {
  return {
    set(values: Record<string, unknown>) {
      if (capture) capture.setValues = values;
      return {
        where() {
          return {
            returning() {
              return Promise.resolve(result);
            },
          };
        },
      };
    },
  };
}

function makeSelectBuilder(result: unknown[]) {
  const afterWhere: any = {
    limit() {
      return Promise.resolve(result);
    },
    then(resolve: (value: unknown[]) => unknown, reject?: (reason: unknown) => unknown) {
      return Promise.resolve(result).then(resolve, reject);
    },
  };

  return {
    from() {
      return {
        where() {
          return afterWhere;
        },
      };
    },
  };
}

function makeDb(options: {
  insertResults: unknown[][];
  updateResults: unknown[][];
  selectResults: unknown[][];
  insertCaptures?: InsertCapture[];
  updateCaptures?: UpdateCapture[];
}) {
  const insertResults = [...options.insertResults];
  const updateResults = [...options.updateResults];
  const selectResults = [...options.selectResults];
  const insertCaptures = [...(options.insertCaptures ?? [])];
  const updateCaptures = [...(options.updateCaptures ?? [])];

  return {
    transaction: async (fn: (tx: any) => Promise<unknown>) => {
      const tx = {
        insert(table: unknown) {
          const result = insertResults.shift();
          if (!result) throw new Error("Unexpected insert");
          const capture = insertCaptures.shift();
          if (capture) capture.table = table;
          return makeInsertBuilder(result, capture);
        },
        update(table: unknown) {
          const result = updateResults.shift();
          if (!result) throw new Error("Unexpected update");
          const capture = updateCaptures.shift();
          if (capture) capture.table = table;
          return makeUpdateBuilder(result, capture);
        },
        select() {
          const result = selectResults.shift();
          if (!result) throw new Error("Unexpected select");
          return makeSelectBuilder(result);
        },
      };

      return fn(tx);
    },
  };
}

afterEach(() => {
  __resetAgentSendReplayDbForTests();
});

test("createOrReplayAgentSend persists a new agent message on first send", async () => {
  const insertCapture: InsertCapture = {};
  const updateCapture: UpdateCapture = {};
  const createdAt = new Date("2026-04-16T00:00:00.000Z");
  const db = makeDb({
    insertResults: [[{
      id: "msg-1",
      seq: 42,
      channelId: "channel-1",
      senderType: "agent",
      senderId: "agent-1",
      agentSendKey: "send-1",
      messageType: "chat",
      content: "hello",
      searchText: "hello",
      searchVector: null,
      threadId: null,
      taskStatus: null,
      taskNumber: null,
      taskAssigneeType: null,
      taskAssigneeId: null,
      taskClaimedAt: null,
      taskCompletedAt: null,
      createdAt,
      updatedAt: createdAt,
    }]],
    updateResults: [[{
      id: "att-1",
      filename: "report.png",
      mimeType: "image/png",
      sizeBytes: 1234,
      width: 100,
      height: 50,
      thumbnailKey: "thumb-1",
    }]],
    selectResults: [],
    insertCaptures: [insertCapture],
    updateCaptures: [updateCapture],
  });
  __setAgentSendReplayDbForTests(() => db as any);

  const result = await createOrReplayAgentSend({
    channelId: "channel-1",
    senderId: "agent-1",
    content: "hello",
    agentSendKey: "send-1",
    attachmentIds: ["att-1"],
  });

  assert.equal(result.replayed, false);
  assert.equal(result.message.id, "msg-1");
  assert.equal(result.attachments.length, 1);
  assert.equal(insertCapture.table, messages);
  assert.equal(insertCapture.values?.agentSendKey, "send-1");
  assert.equal(updateCapture.table, attachments);
  assert.equal(updateCapture.setValues?.messageId, "msg-1");
});

test("createOrReplayAgentSend replays the original successful send instead of inserting a duplicate", async () => {
  const insertCapture: InsertCapture = {};
  const createdAt = new Date("2026-04-16T00:00:00.000Z");
  const db = makeDb({
    insertResults: [[]],
    updateResults: [],
    selectResults: [
      [{
        id: "msg-1",
        seq: 42,
        channelId: "channel-1",
        senderType: "agent",
        senderId: "agent-1",
        agentSendKey: "send-1",
        messageType: "chat",
        content: "hello",
        searchText: "hello",
        searchVector: null,
        threadId: null,
        taskStatus: null,
        taskNumber: null,
        taskAssigneeType: null,
        taskAssigneeId: null,
        taskClaimedAt: null,
        taskCompletedAt: null,
        createdAt,
        updatedAt: createdAt,
      }],
      [{
        id: "att-1",
        filename: "report.png",
        mimeType: "image/png",
        sizeBytes: 1234,
        width: 100,
        height: 50,
        thumbnailKey: "thumb-1",
      }],
    ],
    insertCaptures: [insertCapture],
  });
  __setAgentSendReplayDbForTests(() => db as any);

  const result = await createOrReplayAgentSend({
    channelId: "channel-1",
    senderId: "agent-1",
    content: "hello",
    agentSendKey: "send-1",
    attachmentIds: ["att-1"],
  });

  assert.equal(result.replayed, true);
  assert.equal(result.message.id, "msg-1");
  assert.equal(result.attachments.length, 1);
  assert.equal(result.attachments[0]?.filename, "report.png");
  assert.equal(insertCapture.table, messages);
});
