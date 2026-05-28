import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export interface SavedDraft {
  content: string;
  attachmentIds: string[];
  savedAt: number;
  reholdCount: number;
  seenUpToSeq?: number;
}

interface DraftStateFile {
  targets?: Record<string, string | SavedDraft>;
}

const DEFAULT_LOCAL_DRAFT_TTL_MS = 10 * 60 * 1000;

function stateFilePath(agentId: string): string {
  return path.join(process.env.SLOCK_CLI_DRAFT_STATE_DIR ?? os.tmpdir(), "slock-cli-attested-send", agentId, "continue-state.json");
}

function readState(agentId: string): DraftStateFile {
  const filePath = stateFilePath(agentId);
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as DraftStateFile;
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function writeState(agentId: string, state: DraftStateFile): void {
  const filePath = stateFilePath(agentId);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(state), "utf8");
}

export function getSavedDraft(agentId: string, target: string): SavedDraft | null {
  const state = readState(agentId);
  const draft = state.targets?.[target];
  if (!draft || typeof draft === "string") return null;
  if (typeof draft.content !== "string") return null;
  const attachmentIds = Array.isArray(draft.attachmentIds)
    ? draft.attachmentIds.filter((item): item is string => typeof item === "string")
    : [];
  const savedAt = Number.isFinite(draft.savedAt) ? draft.savedAt : Date.now();
  const reholdCount = Number.isFinite(draft.reholdCount) ? draft.reholdCount : 0;
  const seenUpToSeq = Number.isFinite(draft.seenUpToSeq) ? draft.seenUpToSeq : undefined;
  if (Date.now() - savedAt > DEFAULT_LOCAL_DRAFT_TTL_MS) {
    clearSavedDraft(agentId, target);
    return null;
  }
  return {
    content: draft.content,
    attachmentIds,
    savedAt,
    reholdCount,
    seenUpToSeq,
  };
}

export function setSavedDraft(agentId: string, target: string, draft: SavedDraft): void {
  const state = readState(agentId);
  const targets = state.targets ?? {};
  targets[target] = {
    content: draft.content,
    attachmentIds: draft.attachmentIds,
    savedAt: draft.savedAt,
    reholdCount: draft.reholdCount,
    ...(draft.seenUpToSeq !== undefined ? { seenUpToSeq: draft.seenUpToSeq } : {}),
  };
  writeState(agentId, { targets });
}

export function clearSavedDraft(agentId: string, target: string): void {
  const state = readState(agentId);
  if (!state.targets || !(target in state.targets)) return;
  delete state.targets[target];
  writeState(agentId, state);
}
