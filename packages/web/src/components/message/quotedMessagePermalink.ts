import { parseSlockPermalink, type ParsedSlockPermalink } from "@slock-ai/shared";
import type { MessageAttachment } from "../../store/messageStore";

const CJK_URL_BOUNDARY_PUNCTUATION = "，。、；：！？）》」』】》〉”’（《「『【〈“‘";
const URL_PATTERN = new RegExp(`https?:\\/\\/[^\\s<>"'${CJK_URL_BOUNDARY_PUNCTUATION}]+`, "g");
const TRAILING_PUNCTUATION = /[),.!?;:，。！？；：]+$/;
const FENCED_CODE_PATTERN = /```[\s\S]*?```/g;
const INLINE_CODE_PATTERN = /``[^`]+``|`[^`]+`/g;

interface ProtectedMarkdownCode {
  text: string;
  restore: (value: string) => string;
}

export interface ExtractedQuotedMessagePermalink {
  rawUrl: string;
  parsed: ParsedSlockPermalink;
}

function protectMarkdownCode(text: string): ProtectedMarkdownCode {
  const placeholders: string[] = [];
  const protect = (pattern: RegExp, value: string) =>
    value.replace(pattern, (match) => {
      const index = placeholders.length;
      placeholders.push(match);
      return `\x00CODE${index}\x00`;
    });

  const protectedText = protect(INLINE_CODE_PATTERN, protect(FENCED_CODE_PATTERN, text));

  return {
    text: protectedText,
    restore: (value: string) =>
      value.replace(/\x00CODE(\d+)\x00/g, (_match, index) => placeholders[Number(index)] ?? ""),
  };
}

export function extractFirstQuotedMessagePermalink(
  content: string,
  currentHostname: string | undefined,
  currentServerSlug: string | undefined,
): ExtractedQuotedMessagePermalink | null {
  if (!content.includes("http") || !currentServerSlug) return null;

  const protectedMarkdown = protectMarkdownCode(content);
  for (const match of protectedMarkdown.text.matchAll(URL_PATTERN)) {
    const raw = match[0];
    const start = match.index ?? -1;
    if (start < 0) continue;

    // Skip markdown links like [text](https://...)
    if (start > 0 && protectedMarkdown.text[start - 1] === "(") continue;

    const trailing = raw.match(TRAILING_PUNCTUATION)?.[0] ?? "";
    const candidate = trailing ? raw.slice(0, -trailing.length) : raw;
    const parsed = parseSlockPermalink(candidate, currentHostname);
    if (!parsed || parsed.serverSlug !== currentServerSlug) continue;

    return {
      rawUrl: candidate,
      parsed,
    };
  }

  return null;
}

export function buildQuotedMessageAttachmentLabel(attachments: MessageAttachment[] | undefined): string | null {
  if (!attachments || attachments.length === 0) return null;

  const imageCount = attachments.filter((attachment) => attachment.mimeType.startsWith("image/")).length;
  if (attachments.length === 1) {
    return imageCount === 1 ? "1 image" : "1 file";
  }
  if (imageCount === attachments.length) {
    return `${imageCount} images`;
  }
  return `${attachments.length} attachments`;
}
