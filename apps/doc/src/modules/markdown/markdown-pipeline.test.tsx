import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";
import type { Components } from "react-markdown";
import { ThemeProvider } from "@botiverse/raft-ui";
import { Markdown } from "#/lib/markdown/markdown.tsx";

function renderMarkdown(source: string, components?: Components) {
  return renderToStaticMarkup(
    <ThemeProvider syncDom={false}>
      <Markdown components={components}>{source}</Markdown>
    </ThemeProvider>,
  );
}

describe("Markdown docs pipeline", () => {
  it("parses source Markdown and maps its nodes to UI primitives", () => {
    const markup = renderMarkdown(`
# Heading

Inline \`code\` and https://example.com/path，后续。

2. resumed item

- [x] completed item
- [ ] open item

| Token | Surface |
| --- | --- |
| layer-panel | panel |

\`\`\`ts
const mode = "dark";
\`\`\`

\`\`\`
plain block
\`\`\`
`);

    expect(markup).toContain('data-slot="markdown-heading"');
    expect(markup).toContain(">Heading</h1>");
    expect(markup).toContain('href="https://example.com/path"');
    expect(markup).toContain(">https://example.com/path</a>，后续。");
    expect(markup).toContain('start="2"');
    expect(markup.match(/data-slot="checkbox"/g)).toHaveLength(2);
    expect(markup).toContain('data-slot="markdown-table-scroll"');
    expect(markup.match(/data-slot="code-block"/g)).toHaveLength(2);
    expect(markup.match(/data-slot="inline-code"/g)).toHaveLength(1);
  });

  it("wraps a message's code blocks, each with its own unpressed wrap toggle", () => {
    const markup = renderMarkdown(`
\`\`\`bash
curl -X POST https://api.raft.chat/v1/channels/launch-crew/messages -H "Authorization: Bearer $RAFT_TOKEN"
\`\`\`

\`\`\`
plain block
\`\`\`
`);

    expect(markup.match(/data-wrap=""/g)).toHaveLength(2);
    expect(markup.match(/data-slot="code-block-wrap-toggle"/g)).toHaveLength(2);
    expect(markup.match(/aria-pressed="false"/g)).toHaveLength(2);
    expect(markup.match(/aria-label="Don&#x27;t Wrap Lines"/g)).toHaveLength(2);
    expect(markup.match(/whitespace-pre-wrap wrap-anywhere/g)).toHaveLength(2);
  });

  it("sanitizes raw user HTML before it reaches the UI primitives", () => {
    const markup = renderMarkdown('<script>alert("unsafe")</script>');

    expect(markup).not.toContain("<script");
    expect(markup).not.toContain("alert");
  });

  it("lets a consumer replace a node with a domain component", () => {
    const markup = renderMarkdown("[Task](https://example.com/task)", {
      a: ({ children }) => <span data-slot="task-reference">{children}</span>,
    });

    expect(markup).toContain('data-slot="task-reference"');
    expect(markup).not.toContain('href="https://example.com/task"');
  });
});
