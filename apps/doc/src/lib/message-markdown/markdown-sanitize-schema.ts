import { defaultSchema, type Options as RehypeSanitizeOptions } from "rehype-sanitize";

export const orderedListMarkdownAttributes = [...(defaultSchema.attributes?.ol ?? []), "start"];
export const anchorMarkdownAttributes = [
  ...(defaultSchema.attributes?.a ?? []),
  "dataMarkdownReference",
];

export const markdownSanitizeSchema: RehypeSanitizeOptions = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: anchorMarkdownAttributes,
    ol: orderedListMarkdownAttributes,
  },
};
