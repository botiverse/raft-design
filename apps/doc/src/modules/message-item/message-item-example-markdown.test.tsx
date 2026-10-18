import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";
import { ThemeProvider } from "raft-ui";

import { MessageItemExampleMarkdown } from "./message-item-example-markdown.tsx";

describe("MessageItemExampleMarkdown", () => {
  it("renders channel and joint-channel references with compound parts", () => {
    const markup = renderToStaticMarkup(
      <ThemeProvider syncDom={false}>
        <MessageItemExampleMarkdown />
      </ThemeProvider>,
    );

    expect(markup.match(/data-slot="message-reference-label"/g)).toHaveLength(2);
    expect(markup).toContain('aria-label="Open joint channel #northstar-launch-handoff"');
    expect(markup).toContain('href="/playground/s/raft/channel/partner-ops"');
  });

  it("renders Atlas with an explicit read state", () => {
    const markup = renderToStaticMarkup(
      <ThemeProvider syncDom={false}>
        <MessageItemExampleMarkdown />
      </ThemeProvider>,
    );

    expect(markup.match(/data-slot="message-reference-indicator"/g)).toHaveLength(1);
    expect(markup).toContain('aria-label="Read"');
    expect(markup).toContain('data-variant="success"');
  });
});
