import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";
import type { Components } from "react-markdown";
import { ThemeProvider } from "raft-ui";
import { Markdown } from "#/lib/markdown/markdown.tsx";

function renderMarkdown(source: string, components?: Components) {
  return renderToStaticMarkup(
    <ThemeProvider theme="elegant" syncDom={false}>
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
const theme = "elegant";
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
