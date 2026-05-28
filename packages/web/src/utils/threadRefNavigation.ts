import type { FollowedThread, ThreadSummary } from "../store/threadStore";

type ThreadRefFollowedThread = Pick<FollowedThread, "parentMessageId" | "parentChannelId">;

interface ResolveThreadRefOptions {
  parentChannelId: string;
  shortId: string;
  summaries: Record<string, ThreadSummary>;
  followedThreads: ThreadRefFollowedThread[];
  loadContext: (parentChannelId: string, shortId: string) => Promise<{
    targetMessageId?: string | null;
    canonicalTarget?: {
      kind?: string;
      messageId?: string;
      threadParentMessageId?: string;
    } | null;
  }>;
}

export interface ResolvedThreadRefTarget {
  parentMessageId: string;
  focusedMessageId?: string | null;
}

export function findThreadParentMessageIdByShortId({
  parentChannelId,
  shortId,
  summaries,
  followedThreads,
}: Pick<ResolveThreadRefOptions, "parentChannelId" | "shortId" | "summaries" | "followedThreads">): string | null {
  const normalizedShortId = shortId.toLowerCase();
  const matches = new Set<string>();

  for (const parentMessageId of Object.keys(summaries)) {
    if (parentMessageId.toLowerCase().startsWith(normalizedShortId)) {
      matches.add(parentMessageId);
    }
  }

  for (const thread of followedThreads) {
    if (
      thread.parentChannelId === parentChannelId &&
      thread.parentMessageId.toLowerCase().startsWith(normalizedShortId)
    ) {
      matches.add(thread.parentMessageId);
    }
  }

  return matches.size === 1 ? [...matches][0] : null;
}

export async function resolveThreadParentMessageIdByShortId({
  parentChannelId,
  shortId,
  summaries,
  followedThreads,
  loadContext,
}: ResolveThreadRefOptions): Promise<string | null> {
  const target = await resolveThreadTargetByShortId({
    parentChannelId,
    shortId,
    summaries,
    followedThreads,
    loadContext,
  });
  return target?.parentMessageId ?? null;
}

export async function resolveThreadTargetByShortId({
  parentChannelId,
  shortId,
  summaries,
  followedThreads,
  loadContext,
}: ResolveThreadRefOptions): Promise<ResolvedThreadRefTarget | null> {
  const localParentMessageId = findThreadParentMessageIdByShortId({
    parentChannelId,
    shortId,
    summaries,
    followedThreads,
  });
  if (localParentMessageId) return { parentMessageId: localParentMessageId };

  try {
    const context = await loadContext(parentChannelId, shortId);
    if (
      context.canonicalTarget?.kind === "thread"
      && typeof context.canonicalTarget.threadParentMessageId === "string"
    ) {
      return {
        parentMessageId: context.canonicalTarget.threadParentMessageId,
        focusedMessageId: context.targetMessageId ?? context.canonicalTarget.messageId ?? null,
      };
    }
    return context.targetMessageId ? { parentMessageId: context.targetMessageId } : null;
  } catch {
    return null;
  }
}
