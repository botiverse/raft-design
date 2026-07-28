import type { ReorderAttachment } from "./composer-attachments-reorder.types.ts";

export const WRAP_REORDER_ATTACHMENTS: readonly ReorderAttachment[] = [
  { id: "shot", kind: "image", name: "screenshot.png" },
  { id: "mood", kind: "image", name: "moodboard.png" },
  { id: "release", kind: "file", name: "release-notes.pdf" },
  { id: "design", kind: "file", name: "design-spec.pdf" },
  { id: "research", kind: "file", name: "research-notes.pdf" },
  { id: "api", kind: "file", name: "api-contract.pdf" },
  { id: "brief", kind: "file", name: "product-brief.pdf" },
  { id: "audit", kind: "file", name: "audit-log.pdf" },
  { id: "plan", kind: "file", name: "rollout-plan.pdf" },
  { id: "qa", kind: "file", name: "qa-checklist.pdf" },
];

export const SCROLL_REORDER_ATTACHMENTS: readonly ReorderAttachment[] = [
  { id: "shot", kind: "image", name: "screenshot.png" },
  { id: "release", kind: "file", name: "release-notes.pdf" },
  { id: "design", kind: "file", name: "design-spec.pdf" },
  { id: "research", kind: "file", name: "research-notes.pdf" },
  { id: "api", kind: "file", name: "api-contract.pdf" },
  { id: "brief", kind: "file", name: "product-brief.pdf" },
  { id: "audit", kind: "file", name: "audit-log.pdf" },
  { id: "plan", kind: "file", name: "rollout-plan.pdf" },
  { id: "qa", kind: "file", name: "qa-checklist.pdf" },
  { id: "notes", kind: "file", name: "meeting-notes.pdf" },
];
