import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";
import { ThemeProvider } from "raft-ui";

import { MessageItemExampleMarkdown } from "./message-item-example-markdown.tsx";

describe("MessageItemExampleMarkdown", () => {
  it("renders channel and joint-channel references with compound parts", () => {
    const markup = renderToStaticMarkup(
      <ThemeProvider theme="elegant" syncDom={false}>
        <MessageItemExampleMarkdown />
      </ThemeProvider>,
    );

    expect(markup.match(/data-slot="message-reference-badge"/g)).toHaveLength(2);
    expect(markup.match(/data-slot="message-reference-label"/g)).toHaveLength(2);
    expect(markup).toContain(">channel</span>");
    expect(markup).toContain(">joint</span>");
    expect(markup).toContain('href="/playground/s/raft/channel/partner-ops"');
  });

  it("renders Atlas with an explicit read state", () => {
    const markup = renderToStaticMarkup(
      <ThemeProvider theme="elegant" syncDom={false}>
        <MessageItemExampleMarkdown />
      </ThemeProvider>,
    );

    expect(markup.match(/data-slot="message-reference-indicator"/g)).toHaveLength(1);
    expect(markup).toContain('aria-label="Read"');
    expect(markup).toContain('data-variant="success"');
  });
});
