import { markdownSanitizeSchema } from "#/lib/markdown/markdown-plugins.ts";

/** The reference transform marks anchors, so the sanitize policy has to keep that attribute. */
export const markdownReferenceSanitizeSchema = {
  ...markdownSanitizeSchema,
  attributes: {
    ...markdownSanitizeSchema.attributes,
    a: [...(markdownSanitizeSchema.attributes?.a ?? []), "dataMarkdownReference"],
  },
};
