import { CSV_PREVIEW_MAX_FILE_SIZE_BYTES, type CsvAttachmentPreviewData } from "@slock-ai/shared";
import type { AttachmentPreviewProvider } from "../types.js";

export const CSV_PREVIEW_BYTE_LIMIT = 128 * 1024;
export const CSV_PREVIEW_PAYLOAD_BYTE_LIMIT = 32 * 1024;
export const CSV_PREVIEW_MAX_ROWS = 200;
export const CSV_PREVIEW_MAX_COLUMNS = 12;

const CSV_MIME_TYPES = new Set([
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
]);

export function isCsvAttachment(filename: string, mimeType: string | null | undefined): boolean {
  const lowerName = filename.toLowerCase();
  const normalizedMime = mimeType?.toLowerCase().split(";", 1)[0]?.trim() ?? "";
  return lowerName.endsWith(".csv") || CSV_MIME_TYPES.has(normalizedMime);
}

function detectDelimiter(sample: string): string {
  const firstLine = sample.split(/\r?\n/, 1)[0] ?? "";
  const candidates = [",", "\t", ";"];
  return candidates
    .map((delimiter) => ({ delimiter, count: firstLine.split(delimiter).length - 1 }))
    .sort((a, b) => b.count - a.count)[0]?.delimiter ?? ",";
}

export function parseCsvRows(text: string, delimiter = detectDelimiter(text)): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === delimiter) {
      row.push(field);
      field = "";
      continue;
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }
    if (char === "\r") {
      continue;
    }
    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => cell.trim().length > 0));
}

export function buildCsvPreview(text: string): CsvAttachmentPreviewData | null {
  const delimiter = detectDelimiter(text);
  const parsed = parseCsvRows(text, delimiter);
  if (parsed.length === 0) return null;

  const columnCount = Math.max(...parsed.map((row) => row.length));
  if (columnCount < 2) return null;

  const headers = parsed[0].slice(0, CSV_PREVIEW_MAX_COLUMNS);
  const rows = parsed.slice(1, CSV_PREVIEW_MAX_ROWS + 1).map((row) => row.slice(0, CSV_PREVIEW_MAX_COLUMNS));

  return {
    kind: "csv",
    delimiter,
    headers,
    rows,
    rowCount: Math.max(0, parsed.length - 1),
    columnCount,
  };
}

export const csvPreviewProvider: AttachmentPreviewProvider<CsvAttachmentPreviewData> = {
  kind: "csv",
  trustLevel: "data",
  streamByteCap: CSV_PREVIEW_BYTE_LIMIT,
  payloadByteCap: CSV_PREVIEW_PAYLOAD_BYTE_LIMIT,
  canPreview: (attachment) => (
    isCsvAttachment(attachment.filename, attachment.mimeType)
    && attachment.sizeBytes <= CSV_PREVIEW_MAX_FILE_SIZE_BYTES
  ),
  async buildPreview({ buffer }) {
    return buildCsvPreview(buffer.toString("utf8"));
  },
};
