import type { Options } from "react-markdown";
import { defaultSchema, type Options as RehypeSanitizeOptions } from "rehype-sanitize";
import rehypeSanitize from "rehype-sanitize";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { remarkAutolinkBareUrls } from "./remark-autolink-bare-urls.ts";

export type MarkdownPluginList = NonNullable<Options["remarkPlugins"]>;

/** Base sanitize policy. Consumers extend it when their remark plugins add attributes. */
export const markdownSanitizeSchema: RehypeSanitizeOptions = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    ol: [...(defaultSchema.attributes?.ol ?? []), "start"],
  },
};

/** GFM, bare-URL autolinking, and single-newline hard breaks. */
export const MARKDOWN_REMARK_PLUGINS: MarkdownPluginList = [
  remarkGfm,
  remarkAutolinkBareUrls,
  remarkBreaks,
];

export function createMarkdownRehypePlugins(
  sanitizeSchema: RehypeSanitizeOptions,
): NonNullable<Options["rehypePlugins"]> {
  return [[rehypeSanitize, sanitizeSchema]];
}
