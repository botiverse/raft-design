import assert from "node:assert/strict";
import test from "node:test";
import { CSV_PREVIEW_MAX_FILE_SIZE_BYTES } from "@slock-ai/shared";
import { buildCsvPreview, csvPreviewProvider, isCsvAttachment, parseCsvRows } from "./providers/csv.js";
import { buildMarkdownPreview, isMarkdownAttachment, markdownPreviewProvider } from "./providers/markdown.js";
import { isPdfAttachment, pdfPreviewProvider } from "./providers/pdf.js";
import { buildTextPreview, decodeUtf8Text, isTextAttachment, textPreviewProvider } from "./providers/text.js";

test("CSV provider classifies by extension and MIME", () => {
  assert.equal(isCsvAttachment("metrics.csv", "application/octet-stream"), true);
  assert.equal(isCsvAttachment("metrics", "text/csv; charset=utf-8"), true);
  assert.equal(isCsvAttachment("notes.md", "text/markdown"), false);
});

test("CSV parser handles quoted fields", () => {
  assert.deepEqual(parseCsvRows('name,count\n"hello, world",2\n"escaped ""quote""",3\n'), [
    ["name", "count"],
    ["hello, world", "2"],
    ['escaped "quote"', "3"],
  ]);
});

test("CSV preview returns bounded headers and rows", () => {
  const preview = buildCsvPreview("name,count,owner\nalpha,1,koda\nbeta,2,martin\n");
  assert.deepEqual(preview, {
    kind: "csv",
    delimiter: ",",
    headers: ["name", "count", "owner"],
    rows: [["alpha", "1", "koda"], ["beta", "2", "martin"]],
    rowCount: 2,
    columnCount: 3,
  });
});

test("CSV preview refuses files above the hard size threshold", () => {
  assert.equal(csvPreviewProvider.canPreview({
    filename: "metrics.csv",
    mimeType: "text/csv",
    sizeBytes: CSV_PREVIEW_MAX_FILE_SIZE_BYTES,
  } as never), true);
  assert.equal(csvPreviewProvider.canPreview({
    filename: "metrics.csv",
    mimeType: "text/csv",
    sizeBytes: CSV_PREVIEW_MAX_FILE_SIZE_BYTES + 1,
  } as never), false);
});

test("Markdown provider classifies and preserves raw markdown as data", async () => {
  assert.equal(isMarkdownAttachment("README.md", "text/plain"), true);
  assert.equal(isMarkdownAttachment("README", "text/markdown"), true);
  assert.deepEqual(buildMarkdownPreview("# Title\n\n<script>alert(1)</script>"), {
    kind: "markdown",
    markdown: "# Title\n\n<script>alert(1)</script>",
  });
  assert.deepEqual(await markdownPreviewProvider.buildPreview({ attachment: { filename: "x.md", mimeType: "text/markdown" } as never, buffer: Buffer.from("hello"), truncated: false }), {
    kind: "markdown",
    markdown: "hello",
  });
});

test("PDF provider classifies by type but only previews real PDF signatures", async () => {
  assert.equal(isPdfAttachment("paper.pdf", "application/octet-stream"), true);
  assert.equal(isPdfAttachment("paper", "application/pdf"), true);
  assert.deepEqual(await pdfPreviewProvider.buildPreview({ attachment: { filename: "paper.pdf", mimeType: "application/pdf" } as never, buffer: Buffer.from("%PDF"), truncated: true }), { kind: "pdf" });
  assert.equal(await pdfPreviewProvider.buildPreview({ attachment: { filename: "paper.pdf", mimeType: "application/pdf" } as never, buffer: Buffer.from("nope"), truncated: false }), null);
});

test("Text provider classifies txt/plain attachments and preserves plain text", async () => {
  assert.equal(isTextAttachment("notes.txt", "application/octet-stream"), true);
  assert.equal(isTextAttachment("notes", "text/plain; charset=utf-8"), true);
  assert.equal(isTextAttachment("notes.md", "text/markdown"), false);
  assert.deepEqual(buildTextPreview("hello\nworld"), {
    kind: "text",
    text: "hello\nworld",
  });
  assert.deepEqual(await textPreviewProvider.buildPreview({ attachment: { filename: "x.txt", mimeType: "text/plain" } as never, buffer: Buffer.from("hello"), truncated: false }), {
    kind: "text",
    text: "hello",
  });
});

test("Text provider refuses invalid UTF-8 and empty text", () => {
  assert.equal(decodeUtf8Text(Buffer.from([0xff, 0xfe, 0xfd])), null);
  assert.equal(buildTextPreview(" \n\t"), null);
});

test("document providers expose resource and trust contracts", () => {
  assert.equal(csvPreviewProvider.trustLevel, "data");
  assert.equal(markdownPreviewProvider.trustLevel, "data");
  assert.equal(pdfPreviewProvider.trustLevel, "sandbox");
  assert.equal(textPreviewProvider.trustLevel, "data");
});
