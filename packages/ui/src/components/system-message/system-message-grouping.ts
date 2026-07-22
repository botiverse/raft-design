export type SystemMessageSlice = {
  id: string;
  messageType: string;
  content: string;
};

export type SystemMessageRenderState =
  | { kind: "hide"; groupId: string }
  | { kind: "summary"; content: string; groupId: string; messageIndexes: number[] };

type TaskSystemEvent = {
  taskNumber: number;
  title: string;
  actor: string;
  kind: "converted" | "claimed" | "released" | "moved" | "deleted";
  status?: string;
};

function stripLeadingStatusGlyph(content: string): string {
  const trimmed = content.trim();
  const firstSpace = trimmed.indexOf(" ");
  if (firstSpace <= 0) return trimmed;
  const firstToken = trimmed.slice(0, firstSpace);
  if (/^[^\p{L}\p{N}@#]+$/u.test(firstToken)) {
    return trimmed.slice(firstSpace + 1).trim();
  }
  return trimmed;
}

function parseTaskSystemEvent(message: SystemMessageSlice): TaskSystemEvent | null {
  if (message.messageType !== "system") return null;

  const content = stripLeadingStatusGlyph(message.content);

  const converted = content.match(/^(.+?) converted a message to task #(\d+)\s+"([^"]*)"/u);
  if (converted) {
    return {
      actor: converted[1],
      kind: "converted",
      taskNumber: Number(converted[2]),
      title: converted[3],
    };
  }

  const claimed = content.match(/^(.+?) claimed #(\d+)\s+"([^"]*)"/u);
  if (claimed) {
    return {
      actor: claimed[1],
      kind: "claimed",
      taskNumber: Number(claimed[2]),
      title: claimed[3],
    };
  }

  const released = content.match(/^(.+?) released #(\d+)\s+"([^"]*)"/u);
  if (released) {
    return {
      actor: released[1],
      kind: "released",
      taskNumber: Number(released[2]),
      title: released[3],
    };
  }

  const moved = content.match(/^(.+?) moved #(\d+)\s+"([^"]*)" to (.+)$/u);
  if (moved) {
    return {
      actor: moved[1],
      kind: "moved",
      status: moved[4],
      taskNumber: Number(moved[2]),
      title: moved[3],
    };
  }

  const deleted = content.match(/^(.+?) deleted #(\d+)\s+"([^"]*)"/u);
  if (deleted) {
    return {
      actor: deleted[1],
      kind: "deleted",
      taskNumber: Number(deleted[2]),
      title: deleted[3],
    };
  }

  return null;
}

type SystemMessageCategory = "taskUpdate" | "reminder" | "system";

function classifySystemMessage(message: SystemMessageSlice): SystemMessageCategory | null {
  if (message.messageType !== "system") return null;
  const content = stripLeadingStatusGlyph(message.content);

  if (parseTaskSystemEvent(message)) return "taskUpdate";
  if (
    /\b(?:new tasks? created|converted a message to task #\d+|claimed #\d+|released #\d+|moved #\d+|deleted #\d+)\b/iu.test(
      content,
    )
  ) {
    return "taskUpdate";
  }

  if (
    /^(?:Reminder\s+#\w+|Reminder(?: \([^)]+\))?:|.+?\s+(?:scheduled|canceled|cancelled)\s+(?:a\s+)?reminder\b)/iu.test(
      content,
    )
  ) {
    return "reminder";
  }

  return "system";
}

function formatCount(count: number, singular: string, plural = `${singular}s`): string | null {
  if (count === 0) return null;
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatSystemMessageBlockSummary(categories: readonly SystemMessageCategory[]): string {
  const taskUpdates = categories.filter((category) => category === "taskUpdate").length;
  const reminders = categories.filter((category) => category === "reminder").length;
  const systemMessages = categories.filter((category) => category === "system").length;
  const parts = [
    formatCount(taskUpdates, "task update"),
    formatCount(reminders, "reminder update"),
    formatCount(systemMessages, "system message"),
  ].filter((part): part is string => part !== null);

  if (parts.length === 1) {
    const verb = categories.length === 1 ? "is" : "are";
    return `There ${verb} ${parts[0]}`;
  }

  if (systemMessages === 0) {
    return `There are ${parts.join(", ")}`;
  }

  return `There are ${categories.length} system updates: ${parts.join(", ")}`;
}

/**
 * Render-only grouping for adjacent system-message runs.
 * The underlying message list stays untouched so history and scroll anchoring remain exact.
 *
 * @deprecated Product-specific grouping belongs in the consumer composition layer. This helper
 * remains exported for backwards compatibility.
 */
export function buildSystemMessageRenderStates(
  messages: readonly SystemMessageSlice[],
): Array<SystemMessageRenderState | null> {
  const categories = messages.map(classifySystemMessage);
  const states: Array<SystemMessageRenderState | null> = Array.from(
    { length: messages.length },
    () => null,
  );

  for (let i = 0; i < messages.length; i += 1) {
    if (!categories[i]) continue;

    let end = i + 1;
    while (end < messages.length && categories[end]) {
      end += 1;
    }

    const runLength = end - i;
    if (runLength > 1) {
      const groupCategories = categories
        .slice(i, end)
        .filter((category): category is SystemMessageCategory => category !== null);
      const groupId = `system-group:${messages[i].id}:${messages[end - 1].id}`;
      states[i] = {
        kind: "summary",
        content: formatSystemMessageBlockSummary(groupCategories),
        groupId,
        messageIndexes: Array.from({ length: runLength }, (_value, offset) => i + offset),
      };
      for (let j = i + 1; j < end; j += 1) {
        states[j] = { kind: "hide", groupId };
      }
    }

    i = end - 1;
  }

  return states;
}
