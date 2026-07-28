import type { Components } from "react-markdown";
import type { Options as RehypeSanitizeOptions } from "rehype-sanitize";
import { memo, useMemo, type ComponentPropsWithRef } from "react";
import ReactMarkdown from "react-markdown";
import { MarkdownCodeFence } from "./markdown-code-fence.tsx";
import { MARKDOWN_COMPONENTS } from "./markdown-components.tsx";
import {
  createMarkdownRehypePlugins,
  markdownSanitizeSchema,
  MARKDOWN_REMARK_PLUGINS,
  type MarkdownPluginList,
} from "./markdown-plugins.ts";

export type MarkdownProps = Omit<ComponentPropsWithRef<"div">, "children"> & {
  /** Extra remark transforms appended to the GFM defaults. */
  additionalRemarkPlugins?: MarkdownPluginList;
  /** Markdown source. */
  children: string;
  /** Node overrides layered over the default part mapping. */
  components?: Components;
  /** Sanitize policy. Extend the exported default when plugins add attributes. */
  sanitizeSchema?: RehypeSanitizeOptions;
};

/** Renders Markdown source into styled parts. Parsing defaults to GFM with sanitized HTML. */
export const Markdown = memo(function Markdown({
  additionalRemarkPlugins,
  children,
  components,
  sanitizeSchema = markdownSanitizeSchema,
  ...rootProps
}: MarkdownProps) {
  const markdownComponents = useMemo(
    () => ({ ...MARKDOWN_COMPONENTS, pre: MarkdownCodeFence, ...components }),
    [components],
  );
  const remarkPlugins = useMemo(
    () =>
      additionalRemarkPlugins
        ? [...MARKDOWN_REMARK_PLUGINS, ...additionalRemarkPlugins]
        : MARKDOWN_REMARK_PLUGINS,
    [additionalRemarkPlugins],
  );
  const rehypePlugins = useMemo(
    () => createMarkdownRehypePlugins(sanitizeSchema),
    [sanitizeSchema],
  );

  return (
    <div data-slot="markdown" {...rootProps}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={markdownComponents}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
});
