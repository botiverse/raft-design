import { type ReactNode } from "react";
import ReactMarkdown, { type Components, type Options } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

type PluggableList = NonNullable<Options["remarkPlugins"]>;
import { transparentImageBackgroundClass } from "../../utils/imagePreviewStyles";
import CopyableCodeBlock from "./CopyableCodeBlock";
import MermaidDiagram from "./MermaidDiagram";
import { readMermaidSource } from "./mermaidSource";

/** Shared dark code-block wrapper — the canonical look for every fenced block
 *  across chat body + attachment preview. Extracted so the mermaid-aware
 *  `pre` can reuse it verbatim for the non-mermaid path. */
function BaseCodePre({ children }: { children?: ReactNode }) {
  return (
    <CopyableCodeBlock className="overflow-x-auto border-2 border-black bg-gray-900 p-3 pr-12 text-sm text-white font-mono [&>code]:border-0 [&>code]:bg-transparent [&>code]:p-0">
      {children}
    </CopyableCodeBlock>
  );
}

/**
 * Single source of truth for the visual styling of every markdown surface in
 * the app — chat message body, markdown attachment preview, anywhere else
 * we'd otherwise hand-roll a `<ReactMarkdown components={...}>` setup.
 *
 * Surfaces that need extra behavior (chat-body @mentions, channel refs, task
 * refs, slock permalinks, reminder receipts) spread this object and override
 * the elements they care about.
 *
 * stdrc 2026-05-08 #proj-uiux:6110c1ce (task #137):
 *   "markdown 或相关文件 attachment 的预览，需要和消息正文用同样的样式预览，
 *    这需要复用组件"
 *
 * Before this consolidation, MarkdownPreviewPane (modal) and renderContent()
 * (chat body) had two diverged components maps. Notable drifts:
 *   - code blocks: chat body uses `bg-gray-900` dark; preview used `bg-brutal-cream`
 *   - inline code: chat body uses `bg-brutal-yellow/40`; preview used `bg-brutal-cream`
 *   - lists / headings / table-th bg / blockquote: each diverged independently
 *
 * Chat body's styling is canonical (it's what users see most of the time);
 * preview adopts it.
 */

/** Shared blockquote base — border / color / text / italic tokens shared
 *  across every markdown render surface (chat body, attachment preview,
 *  AgentWorkspace .md preview). Per-callsite vertical margin is appended
 *  by the caller (`my-1` for chat density, `my-2` for document density).
 *  Centralizing this keeps tuning like #proj-uiux task #299 single-source
 *  — stdrc 2026-05-24 audit follow-up. */
export const MARKDOWN_BLOCKQUOTE_BASE_CLASS =
  "border-l-2 border-black/40 pl-3 italic text-black/70";

export const BASE_MARKDOWN_COMPONENTS: Components = {
  pre: ({ children }) => <BaseCodePre>{children}</BaseCodePre>,
  code: ({ children, className }) => {
    // Inline code (no language class)
    if (!className) {
      return (
        <code className="border border-black bg-brutal-yellow/40 px-1 text-sm font-mono [overflow-wrap:anywhere]">
          {children}
        </code>
      );
    }
    // Code inside <pre> (block) — render plain so the parent <pre> styling wins
    return <code className={className}>{children}</code>;
  },
  p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
  ul: ({ children, className, ...props }) => (
    <ul {...props} className={[className, "mb-1 pl-5 list-disc"].filter(Boolean).join(" ")}>{children}</ul>
  ),
  ol: ({ children, className, ...props }) => (
    <ol {...props} className={[className, "mb-1 pl-5 list-decimal"].filter(Boolean).join(" ")}>{children}</ol>
  ),
  li: ({ children, className, ...props }) => (
    <li {...props} className={[className, "mb-0.5"].filter(Boolean).join(" ")}>{children}</li>
  ),
  blockquote: ({ children }) => (
    // Keep the no-fill blockquote shape restored after PR #1834, but use a
    // lighter left accent per #proj-uiux task #299.
    <blockquote className={`${MARKDOWN_BLOCKQUOTE_BASE_CLASS} my-1`}>{children}</blockquote>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="border-collapse border-2 border-black text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-2 border-black bg-brutal-cyan px-2 py-1 text-left font-bold whitespace-nowrap">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-black px-2 py-1">{children}</td>
  ),
  h1: ({ children }) => <h1 className="text-lg font-bold mt-3 mb-1">{children}</h1>,
  h2: ({ children }) => <h2 className="text-base font-bold mt-2 mb-1">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>,
  h4: ({ children }) => <h4 className="text-sm font-bold mt-1 mb-0.5">{children}</h4>,
  h5: ({ children }) => <h5 className="text-sm font-bold mt-1 mb-0.5">{children}</h5>,
  h6: ({ children }) => <h6 className="text-sm font-bold mt-1 mb-0.5 text-black/70">{children}</h6>,
  hr: () => <hr className="my-2 border-t-2 border-black" />,
  img: ({ src, alt }) => (
    <img src={src} alt={alt || ""} className={`my-2 max-w-full border-2 border-black ${transparentImageBackgroundClass}`} />
  ),
  // Default link renderer — opens in a new tab. Chat surface overrides this
  // to handle @mention / #channel / task / thread / slock permalink markup.
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-700 underline decoration-2 underline-offset-2 hover:text-brutal-pink select-text"
    >
      {children}
    </a>
  ),
};

const DOCUMENT_MARKDOWN_COMPONENTS: Components = {
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  ul: ({ children, className, ...props }) => (
    <ul {...props} className={[className, "mb-3 pl-6 list-disc"].filter(Boolean).join(" ")}>{children}</ul>
  ),
  ol: ({ children, className, ...props }) => (
    <ol {...props} className={[className, "mb-3 pl-6 list-decimal"].filter(Boolean).join(" ")}>{children}</ol>
  ),
  li: ({ children, className, ...props }) => (
    <li {...props} className={[className, "mb-1"].filter(Boolean).join(" ")}>{children}</li>
  ),
  // Document density follows mainstream markdown reader hierarchy: with a
  // 16px body, h1/h2/h3 need a visible 2em-ish / 1.5em / 1.25em scale. Inline code,
  // blockquote, tables, and code blocks intentionally stay in the BASE map so
  // document preview keeps Slock markdown tokens instead of inventing another
  // prose skin.
  h1: ({ children }) => <h1 className="text-3xl font-bold mt-6 mb-3 leading-tight">{children}</h1>,
  h2: ({ children }) => <h2 className="text-2xl font-bold mt-5 mb-2.5 leading-tight">{children}</h2>,
  h3: ({ children }) => <h3 className="text-xl font-bold mt-4 mb-2 leading-tight">{children}</h3>,
};

// Mermaid is opt-in and scoped to the markdown *attachment preview* surface
// only (task #268, xxchan #proj-uiux:df4d393b). Chat message bodies
// deliberately do NOT render mermaid: per-message arbitrary diagram rendering
// is an unrequested perf/safety surface. Intercepting in `pre` (not `code`)
// keeps the SVG out of the dark code wrapper entirely; non-mermaid blocks
// fall back to the identical BaseCodePre.
const MERMAID_MARKDOWN_COMPONENTS: Components = {
  pre: ({ children }) => {
    const mermaidSource = readMermaidSource(children);
    if (mermaidSource !== null) {
      return <MermaidDiagram code={mermaidSource} />;
    }
    return <BaseCodePre>{children}</BaseCodePre>;
  },
};

export type MarkdownDensity = "compact" | "document";

export function getMarkdownComponents(
  density: MarkdownDensity,
  enableMermaid = false,
): Components {
  let components: Components =
    density === "document"
      ? { ...BASE_MARKDOWN_COMPONENTS, ...DOCUMENT_MARKDOWN_COMPONENTS }
      : BASE_MARKDOWN_COMPONENTS;
  if (enableMermaid) {
    components = { ...components, ...MERMAID_MARKDOWN_COMPONENTS };
  }
  return components;
}

export interface MarkdownContentProps {
  /** The markdown source string. */
  source: string;
  /** `compact` matches chat density; `document` is for fullscreen reading surfaces. */
  density?: MarkdownDensity;
  /** Defaults to `[remarkGfm, remarkBreaks]`. */
  remarkPlugins?: PluggableList;
  /**
   * Defaults to `[rehypeSanitize]`. Surfaces that allow `dangerouslySetInnerHTML`
   * markup (e.g. chat body's `data-mention*` placeholders) pass
   * `[rehypeRaw, [rehypeSanitize, customSchema]]`.
   */
  rehypePlugins?: PluggableList;
  /**
   * Per-element overrides spread on top of `BASE_MARKDOWN_COMPONENTS`. Use
   * this to keep the visual baseline shared while specializing chat-only
   * link / span / etc. behavior.
   */
  components?: Components;
  /**
   * Render ```mermaid fenced blocks as diagrams (beautiful-mermaid). Opt-in,
   * used by the markdown attachment preview only — chat message bodies leave
   * this off so they never render arbitrary per-message diagrams.
   */
  enableMermaid?: boolean;
}

export default function MarkdownContent({
  source,
  density = "compact",
  remarkPlugins = [remarkGfm, remarkBreaks],
  rehypePlugins = [rehypeSanitize],
  components,
  enableMermaid = false,
}: MarkdownContentProps) {
  const baseComponents = getMarkdownComponents(density, enableMermaid);
  return (
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      components={components ? { ...baseComponents, ...components } : baseComponents}
    >
      {source}
    </ReactMarkdown>
  );
}
