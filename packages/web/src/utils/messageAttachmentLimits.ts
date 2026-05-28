export const MAX_MESSAGE_ATTACHMENTS = 5;
export const MAX_MESSAGE_ATTACHMENT_SIZE_BYTES = 50 * 1024 * 1024;
export const MAX_MESSAGE_ATTACHMENT_SIZE_LABEL = "50MB";

export interface AttachmentLimitInput {
  size: number;
}

export interface MessageAttachmentLimitResult<T extends AttachmentLimitInput> {
  accepted: T[];
  rejectedForCount: T[];
  rejectedForEmpty: T[];
  rejectedForSize: T[];
}

export function applyMessageAttachmentLimits<T extends AttachmentLimitInput>(
  existingCount: number,
  candidates: T[],
): MessageAttachmentLimitResult<T> {
  const accepted: T[] = [];
  const rejectedForCount: T[] = [];
  const rejectedForEmpty: T[] = [];
  const rejectedForSize: T[] = [];
  let remainingSlots = Math.max(MAX_MESSAGE_ATTACHMENTS - existingCount, 0);

  for (const candidate of candidates) {
    if (candidate.size === 0) {
      rejectedForEmpty.push(candidate);
      continue;
    }
    if (candidate.size > MAX_MESSAGE_ATTACHMENT_SIZE_BYTES) {
      rejectedForSize.push(candidate);
      continue;
    }
    if (remainingSlots <= 0) {
      rejectedForCount.push(candidate);
      continue;
    }
    accepted.push(candidate);
    remainingSlots -= 1;
  }

  return { accepted, rejectedForCount, rejectedForEmpty, rejectedForSize };
}

export function formatMessageAttachmentLimitError(result: Pick<MessageAttachmentLimitResult<AttachmentLimitInput>, "rejectedForCount" | "rejectedForEmpty" | "rejectedForSize">): string {
  const parts: string[] = [];
  if (result.rejectedForCount.length > 0) {
    parts.push(
      `Only ${MAX_MESSAGE_ATTACHMENTS} attachments per message. ${result.rejectedForCount.length} extra file${result.rejectedForCount.length === 1 ? "" : "s"} skipped.`,
    );
  }
  if (result.rejectedForEmpty.length > 0) {
    parts.push(
      `${result.rejectedForEmpty.length} empty file${result.rejectedForEmpty.length === 1 ? "" : "s"} skipped.`,
    );
  }
  if (result.rejectedForSize.length > 0) {
    const largestRejected = Math.max(...result.rejectedForSize.map((file) => file.size));
    parts.push(
      `Max ${MAX_MESSAGE_ATTACHMENT_SIZE_LABEL} per file. Current largest file is ${formatBytes(largestRejected)}.`,
    );
  }
  return parts.join(" ");
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0B";
  const units = ["B", "KB", "MB", "GB"] as const;
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)}${units[unitIndex]}`;
}
