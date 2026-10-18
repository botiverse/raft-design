import { Children, isValidElement } from "react";
import type { ComponentProps, ComponentType, ReactNode } from "react";
import { MarkdownHeading, MarkdownLink } from "raft-ui";

import { Markdown } from "#/lib/markdown/markdown.tsx";
import type { MarkdownProps } from "#/lib/markdown/markdown.tsx";
import { MarkdownCodeFence } from "#/lib/markdown/markdown-code-fence.tsx";

import { slugifyHeading } from "./doc-source.ts";
import { ExampleBlock } from "./example-block.tsx";
import { TokensBlock } from "./tokens-block.tsx";

function textOf(children: ReactNode): string {
  return Children.toArray(children)
    .map((child): string => {
      if (isValidElement<{ children?: ReactNode }>(child)) return textOf(child.props.children);
      return typeof child === "string" || typeof child === "number" ? String(child) : "";
    })
    .join("");
}

function fenceOf(children: ReactNode) {
  const code = Children.toArray(children).find(isValidElement) as
    | { props: { className?: string; children?: ReactNode } }
    | undefined;
  const language = code?.props.className?.match(/language-(\S+)/)?.[1] ?? null;
  return { language, text: textOf(code?.props.children).trim() };
}

// `Components["pre"]` also admits an intrinsic tag name; this one is a function.
const CodeFence = MarkdownCodeFence as ComponentType<ComponentProps<"pre">>;

const components: MarkdownProps["components"] = {
  a: ({ node: _node, ...props }) => <MarkdownLink {...props} />,
  h2: ({ node: _node, children, ...props }) => (
    <MarkdownHeading
      level={2}
      id={slugifyHeading(textOf(children))}
      className="scroll-mt-20"
      {...props}
    >
      {children}
    </MarkdownHeading>
  ),
  h3: ({ node: _node, children, ...props }) => (
    <MarkdownHeading
      level={3}
      id={slugifyHeading(textOf(children))}
      className="scroll-mt-20"
      {...props}
    >
      {children}
    </MarkdownHeading>
  ),
  // The two block types the authoring guide adds to Markdown. Everything
  // else stays a highlighted code fence.
  pre: (props) => {
    const { language, text } = fenceOf(props.children);
    if (language === "example") return <ExampleBlock path={text} />;
    if (language === "tokens") return <TokensBlock group={text} />;
    return <CodeFence {...props} />;
  },
};

export function DocMarkdown({ children }: { children: string }) {
  return <Markdown components={components}>{children}</Markdown>;
}
