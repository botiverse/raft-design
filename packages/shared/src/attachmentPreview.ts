export const CSV_PREVIEW_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export interface DiffAttachmentPreviewData {
  kind: "diff";
  stats: {
    files: number;
    hunks: number;
    additions: number;
    deletions: number;
  };
}

export interface CsvAttachmentPreviewData {
  kind: "csv";
  delimiter: string;
  headers: string[];
  rows: string[][];
  rowCount: number;
  columnCount: number;
}

export interface MarkdownAttachmentPreviewData {
  kind: "markdown";
  markdown: string;
}

export interface PdfAttachmentPreviewData {
  kind: "pdf";
}

export interface TextAttachmentPreviewData {
  kind: "text";
  text: string;
}

export type AttachmentPreviewData =
  | DiffAttachmentPreviewData
  | CsvAttachmentPreviewData
  | MarkdownAttachmentPreviewData
  | PdfAttachmentPreviewData
  | TextAttachmentPreviewData;

export type AttachmentPreviewResponse =
  | { status: "ok"; data: AttachmentPreviewData; truncated?: boolean }
  | { status: "unsupported" };
