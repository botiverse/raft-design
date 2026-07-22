import type { SystemMessageSlice } from "./system-message.fixtures.ts";

export type SystemMessageRenderState =
  | { kind: "hide"; groupId: string }
  | { kind: "summary"; content: string; groupId: string; messageIndexes: number[] };

type SystemMessageCategory = "taskUpdate" | "system";

function stripLeadingStatusGlyph(content: string) {
  const trimmed = content.trim();
  const firstSpace = trimmed.indexOf(" ");
  if (firstSpace <= 0) return trimmed;
  const firstToken = trimmed.slice(0, firstSpace);

  return /^[^\p{L}\p{N}@#]+$/u.test(firstToken) ? trimmed.slice(firstSpace + 1).trim() : trimmed;
}

function classifySystemMessage(message: SystemMessageSlice): SystemMessageCategory {
  const content = stripLeadingStatusGlyph(message.content);
  return /\b(?:new tasks? created|converted a message to task #\d+|claimed #\d+|released #\d+|moved #\d+|deleted #\d+)\b/iu.test(
    content,
  )
    ? "taskUpdate"
    : "system";
}

function formatCount(count: number, singular: string) {
  if (count === 0) return null;
  return `${count} ${count === 1 ? singular : `${singular}s`}`;
}

function formatSummary(categories: readonly SystemMessageCategory[]) {
  const taskUpdates = categories.filter((category) => category === "taskUpdate").length;
  const systemMessages = categories.length - taskUpdates;
  const parts = [
    formatCount(taskUpdates, "task update"),
    formatCount(systemMessages, "system message"),
  ].filter((part): part is string => part !== null);

  if (parts.length === 1) return `There are ${parts[0]}`;
  return `There are ${categories.length} system updates: ${parts.join(", ")}`;
}

/**
 * Docs-owned projection of Slock's adjacent system-message grouping. Product
 * parsing stays out of raft-ui; the UI package only owns the disclosure parts.
 */
export function buildSystemMessageRenderStates(
  messages: readonly SystemMessageSlice[],
): Array<SystemMessageRenderState | null> {
  const states: Array<SystemMessageRenderState | null> = Array.from(
    { length: messages.length },
    () => null,
  );

  for (let index = 0; index < messages.length; index += 1) {
    let end = index + 1;
    while (end < messages.length) end += 1;

    if (end - index > 1) {
      const groupId = `system-group:${messages[index].id}:${messages[end - 1].id}`;
      const messageIndexes = Array.from({ length: end - index }, (_, offset) => index + offset);
      states[index] = {
        kind: "summary",
        content: formatSummary(
          messageIndexes.map((messageIndex) => classifySystemMessage(messages[messageIndex])),
        ),
        groupId,
        messageIndexes,
      };
      for (let hiddenIndex = index + 1; hiddenIndex < end; hiddenIndex += 1) {
        states[hiddenIndex] = { kind: "hide", groupId };
      }
    }

    index = end - 1;
  }

  return states;
}
