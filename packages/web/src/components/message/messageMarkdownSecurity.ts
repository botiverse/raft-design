import { defaultSchema, type Options as RehypeSanitizeOptions } from "rehype-sanitize";

export const MESSAGE_MARKDOWN_ALLOWED_TAGS = [
  "a",
  "blockquote",
  "br",
  "code",
  "del",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "img",
  "input",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "span",
  "strong",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "ul",
];

const MESSAGE_MARKDOWN_GLOBAL_ATTRIBUTES = [
  "ariaDescribedBy",
  "ariaLabel",
  "ariaLabelledBy",
  "alt",
  "height",
  "title",
  "width",
];

// Chat messages need rehypeRaw only for controlled anchors/spans that we inject
// after preprocessing (@mentions, #channels, task refs, reminders). Do not allow
// arbitrary GitHub-style raw HTML elements from user-authored message text.
export const messageMarkdownSanitizeSchema: RehypeSanitizeOptions = {
  ...defaultSchema,
  tagNames: MESSAGE_MARKDOWN_ALLOWED_TAGS,
  attributes: {
    "*": MESSAGE_MARKDOWN_GLOBAL_ATTRIBUTES,
    a: [
      ...(defaultSchema.attributes?.a || []),
      "dataMention", "dataMentionType", "dataMentionId",
      "dataChannel",
      "dataTaskRef",
      "dataThreadRef", "dataThreadParent",
    ],
    code: [
      ...(defaultSchema.attributes?.code || []),
    ],
    img: [
      ...(defaultSchema.attributes?.img || []),
    ],
    input: [
      ...(defaultSchema.attributes?.input || []),
    ],
    span: [
      ...(defaultSchema.attributes?.span || []),
      "dataReminderFireAt",
    ],
  },
};

const MARKDOWN_AUTOLINK_PATTERN =
  /<([A-Za-z][A-Za-z0-9+.-]{1,31}:[^\s<>]*|[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})>/g;

export function escapeUserRawHtmlForMessageMarkdown(source: string): string {
  const autolinks: string[] = [];
  const protectedSource = source.replace(MARKDOWN_AUTOLINK_PATTERN, (match) => {
    const index = autolinks.length;
    autolinks.push(match);
    return `\x00AUTOLINK${index}\x00`;
  });

  return protectedSource
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/\x00AUTOLINK(\d+)\x00/g, (_match, index) => autolinks[Number(index)] ?? "");
}
