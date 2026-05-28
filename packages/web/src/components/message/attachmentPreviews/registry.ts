import type { AttachmentPreviewData } from "@slock-ai/shared";

export interface AttachmentPreviewRendererModule {
  kind: AttachmentPreviewData["kind"];
}

export const attachmentPreviewRenderers = {
  diff: () => import("./renderers/diff"),
  csv: () => import("./renderers/csv"),
  markdown: () => import("./renderers/markdown"),
  pdf: () => import("./renderers/pdf"),
  text: () => import("./renderers/text"),
} satisfies Record<AttachmentPreviewData["kind"], () => Promise<AttachmentPreviewRendererModule>>;

export async function loadAttachmentPreviewRenderer(kind: AttachmentPreviewData["kind"]): Promise<AttachmentPreviewRendererModule | null> {
  return attachmentPreviewRenderers[kind]?.() ?? null;
}
