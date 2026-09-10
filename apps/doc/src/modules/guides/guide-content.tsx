import { Children, isValidElement } from "react";
import type { ReactNode } from "react";
import { MarkdownHeading, MarkdownLink } from "raft-ui";
import { Markdown } from "#/lib/markdown/markdown.tsx";
import type { MarkdownProps } from "#/lib/markdown/markdown.tsx";

function headingId(children: ReactNode): string {
  const text = Children.toArray(children)
    .map((child): string => {
      if (isValidElement<{ children?: ReactNode }>(child)) return headingId(child.props.children);
      return typeof child === "string" || typeof child === "number" ? String(child) : "";
    })
    .join("");
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

const components: MarkdownProps["components"] = {
  a: ({ node: _node, ...props }) => <MarkdownLink {...props} />,
  h2: ({ node: _node, children, ...props }) => (
    <MarkdownHeading level={2} id={headingId(children)} {...props}>
      {children}
    </MarkdownHeading>
  ),
  h3: ({ node: _node, children, ...props }) => (
    <MarkdownHeading level={3} id={headingId(children)} {...props}>
      {children}
    </MarkdownHeading>
  ),
};

export function GuideContent({ children }: { children: string }) {
  return <Markdown components={components}>{children}</Markdown>;
}
