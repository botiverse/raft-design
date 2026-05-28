import { formatHistory } from "./message/_format.js";

export interface FreshnessHoldOutputData {
  heldMessages?: any[];
  newMessageCount?: number;
  shownMessageCount?: number;
  omittedMessageCount?: number;
  mentionAnnotation?: { formalMentionCount: number };
  continueAnywaySuggested?: boolean;
}

export function isFreshnessHeldResponse(data: unknown): data is FreshnessHoldOutputData & { state: "held" } {
  return Boolean(data && typeof data === "object" && (data as { state?: unknown }).state === "held");
}

export function formatFreshnessHoldOutput(
  target: string,
  data: FreshnessHoldOutputData,
  opts: {
    heldAction: string;
    draftInstructions?: string;
    continueAnywayInstruction?: string;
  },
): string {
  const newMessageCount = data.newMessageCount ?? 0;
  const shownMessageCount = data.shownMessageCount ?? data.heldMessages?.length ?? 0;
  const omittedMessageCount = data.omittedMessageCount ?? Math.max(0, newMessageCount - shownMessageCount);
  const heldHistory = data.heldMessages && data.heldMessages.length > 0
    ? `\n\n${formatHistory(target, { messages: data.heldMessages })}`
    : "";
  const mentionNote = (data.mentionAnnotation?.formalMentionCount ?? 0) > 0
    ? `\n\nNote: ${data.mentionAnnotation!.formalMentionCount} of these messages formally @mention you.`
    : "";
  const omittedNote = omittedMessageCount > 0
    ? ` ${omittedMessageCount} earlier same-target message${omittedMessageCount === 1 ? "" : "s"} omitted from this notice and no longer block this action; use slock message read explicitly if you need earlier context.`
    : "";
  const continueAnyway = data.continueAnywaySuggested && opts.continueAnywayInstruction
    ? opts.continueAnywayInstruction
    : "";

  return (
    `Freshness hold: showing latest ${shownMessageCount} of ${newMessageCount} newer message${newMessageCount === 1 ? "" : "s"}.` +
    `${omittedNote}\n` +
    `${opts.heldAction} Review the bounded context shown here, then choose one path.${mentionNote}${heldHistory}\n\n` +
    (opts.draftInstructions ?? "") +
    continueAnyway
  );
}
