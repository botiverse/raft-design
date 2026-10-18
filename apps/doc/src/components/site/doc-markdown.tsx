import { Children, createContext, isValidElement, useCallback, useContext, useMemo } from "react";
import type { ComponentProps, ComponentType, MouseEvent, ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MarkdownHeading, MarkdownLink } from "@botiverse/raft-ui";

import { resolveDocLink } from "#/lib/content/links.ts";
import { headingSlug } from "#/lib/content/slug.ts";
import { Markdown } from "#/lib/markdown/markdown.tsx";
import type { MarkdownProps } from "#/lib/markdown/markdown.tsx";
import { MarkdownCodeFence } from "#/lib/markdown/markdown-code-fence.tsx";

import { ExampleBlock } from "./example-block.tsx";
import { TokensBlock } from "./tokens-block.tsx";

/** The repository path of the page being rendered, to resolve its relative links. */
const SourcePathContext = createContext("design/README.md");

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

/** A link in a doc: relative Markdown paths become site URLs; site links navigate in place. */
export function DocMarkdownLink({ href = "", ...props }: ComponentProps<"a">) {
  const sourcePath = useContext(SourcePathContext);
  const navigate = useNavigate();
  const resolved = resolveDocLink(sourcePath, href);
  const internal = resolved.startsWith("/") || resolved.startsWith("#");

  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (!internal || resolved.startsWith("#")) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
        return;
      event.preventDefault();
      const [to, hash] = resolved.split("#", 2);
      void navigate({ to, hash });
    },
    [internal, navigate, resolved],
  );

  return (
    <MarkdownLink
      {...props}
      href={resolved}
      onClick={handleClick}
      {...(internal ? {} : { target: "_blank", rel: "noreferrer" })}
    />
  );
}

// `Components["pre"]` also admits an intrinsic tag name; this one is a function.
const CodeFence = MarkdownCodeFence as ComponentType<ComponentProps<"pre">>;

const components: MarkdownProps["components"] = {
  a: ({ node: _node, ...props }) => <DocMarkdownLink {...props} />,
  h2: ({ node: _node, children, ...props }) => (
    <MarkdownHeading
      level={2}
      id={headingSlug(textOf(children))}
      className="scroll-mt-6"
      {...props}
    >
      {children}
    </MarkdownHeading>
  ),
  h3: ({ node: _node, children, ...props }) => (
    <MarkdownHeading
      level={3}
      id={headingSlug(textOf(children))}
      className="scroll-mt-6"
      {...props}
    >
      {children}
    </MarkdownHeading>
  ),
  h4: ({ node: _node, children, ...props }) => (
    <MarkdownHeading
      level={4}
      id={headingSlug(textOf(children))}
      className="scroll-mt-6"
      {...props}
    >
      {children}
    </MarkdownHeading>
  ),
  // The two block types the authoring guide adds to Markdown; any other fence
  // is a highlighted code block.
  pre: (props) => {
    const { language, text } = fenceOf(props.children);
    if (language === "example") return <ExampleBlock path={text} />;
    if (language === "tokens") return <TokensBlock group={text} />;
    return <CodeFence {...props} />;
  },
};

/** Renders a doc's Markdown body. `sourcePath` is its repository path. */
export function DocMarkdown({ children, sourcePath }: { children: string; sourcePath: string }) {
  const content = useMemo(
    () => <Markdown components={components}>{children}</Markdown>,
    [children],
  );
  return <SourcePathContext.Provider value={sourcePath}>{content}</SourcePathContext.Provider>;
}
