import { CSV_PREVIEW_MAX_FILE_SIZE_BYTES, type AttachmentPreviewData, type AttachmentPreviewResponse, type CsvAttachmentPreviewData, type DiffAttachmentPreviewData } from "@slock-ai/shared";
import type { MessageAttachment } from "../../store/messageStore";

export type DiffAttachmentPreview = DiffAttachmentPreviewData;
export type CsvAttachmentPreview = CsvAttachmentPreviewData;
export type DocumentAttachmentPreview = Extract<AttachmentPreviewData, { kind: "csv" | "markdown" | "pdf" | "text" }>;
export type AttachmentPreview = AttachmentPreviewResponse;

export function isDiffPatchAttachment(att: Pick<MessageAttachment, "filename" | "mimeType">): boolean {
  const filename = att.filename.toLowerCase();
  const mimeType = att.mimeType.toLowerCase().split(";", 1)[0]?.trim() ?? "";
  return filename.endsWith(".diff") || filename.endsWith(".patch") || mimeType === "text/x-diff" || mimeType === "text/x-patch" || mimeType === "application/x-patch";
}

export function formatDiffPatchStats(preview: DiffAttachmentPreview): string {
  const { files, hunks, additions, deletions } = preview.stats;
  const fileLabel = files === 1 ? "file" : "files";
  const hunkLabel = hunks === 1 ? "hunk" : "hunks";
  return `${files} ${fileLabel} · ${hunks} ${hunkLabel} · +${additions} -${deletions}`;
}


export function isCsvAttachment(att: Pick<MessageAttachment, "filename" | "mimeType" | "sizeBytes">): boolean {
  const filename = att.filename.toLowerCase();
  const mimeType = att.mimeType.toLowerCase().split(";", 1)[0]?.trim() ?? "";
  const isCsv = filename.endsWith(".csv") || mimeType === "text/csv" || mimeType === "application/csv" || mimeType === "application/vnd.ms-excel";
  return isCsv && (typeof att.sizeBytes !== "number" || att.sizeBytes <= CSV_PREVIEW_MAX_FILE_SIZE_BYTES);
}

export function isMarkdownAttachment(att: Pick<MessageAttachment, "filename" | "mimeType">): boolean {
  const filename = att.filename.toLowerCase();
  const mimeType = att.mimeType.toLowerCase().split(";", 1)[0]?.trim() ?? "";
  return filename.endsWith(".md") || filename.endsWith(".markdown") || mimeType === "text/markdown" || mimeType === "text/x-markdown";
}

export function isTextAttachment(att: Pick<MessageAttachment, "filename" | "mimeType">): boolean {
  const filename = att.filename.toLowerCase();
  const mimeType = att.mimeType.toLowerCase().split(";", 1)[0]?.trim() ?? "";
  return filename.endsWith(".txt") || filename.endsWith(".text") || mimeType === "text/plain";
}

export function isPdfAttachment(att: Pick<MessageAttachment, "filename" | "mimeType">): boolean {
  const filename = att.filename.toLowerCase();
  const mimeType = att.mimeType.toLowerCase().split(";", 1)[0]?.trim() ?? "";
  return filename.endsWith(".pdf") || mimeType === "application/pdf";
}

export function isMp4Attachment(att: Pick<MessageAttachment, "filename" | "mimeType">): boolean {
  const filename = att.filename.toLowerCase();
  const mimeType = att.mimeType.toLowerCase().split(";", 1)[0]?.trim() ?? "";
  return filename.endsWith(".mp4") || mimeType === "video/mp4";
}

export function isDocumentPreviewAttachment(att: Pick<MessageAttachment, "filename" | "mimeType" | "sizeBytes">): boolean {
  return isCsvAttachment(att) || isMarkdownAttachment(att) || isPdfAttachment(att) || isTextAttachment(att);
}

export function documentPreviewLabel(kind: DocumentAttachmentPreview["kind"]): string {
  if (kind === "csv") return "CSV preview";
  if (kind === "markdown") return "Markdown preview";
  if (kind === "text") return "Text preview";
  return "PDF preview";
}
