import type { Components } from "react-markdown";
import type { Options as RehypeSanitizeOptions } from "rehype-sanitize";
import { memo, useMemo, type ComponentPropsWithRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  createMarkdownComponents,
  type MarkdownCodeRenderer,
} from "./create-markdown-components.tsx";
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
  /** Replaces the fenced code frame, for highlighting or header actions. */
  renderCode?: MarkdownCodeRenderer;
  /** Sanitize policy. Extend the exported default when plugins add attributes. */
  sanitizeSchema?: RehypeSanitizeOptions;
};

/** Renders Markdown source into styled parts. Parsing defaults to GFM with sanitized HTML. */
export const Markdown = memo(function Markdown({
  additionalRemarkPlugins,
  children,
  components,
  renderCode,
  sanitizeSchema = markdownSanitizeSchema,
  ...rootProps
}: MarkdownProps) {
  const markdownComponents = useMemo(() => {
    const defaults = createMarkdownComponents(renderCode);
    return components ? { ...defaults, ...components } : defaults;
  }, [components, renderCode]);
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
