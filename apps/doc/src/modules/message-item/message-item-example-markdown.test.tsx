import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";
import { ThemeProvider } from "@botiverse/raft-ui";

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
    expect(markup).toContain('href="#channel-northstar"');
  });

  it("marks Atlas as read with the online light and a check, and no one else", () => {
    const markup = renderToStaticMarkup(
      <ThemeProvider syncDom={false}>
        <MessageItemExampleMarkdown />
      </ThemeProvider>,
    );

    expect(markup.match(/data-slot="message-reference-read-mark"/g)).toHaveLength(1);
    expect(markup).toContain('<span class="sr-only">Read</span>');
    expect(markup).not.toContain('data-slot="message-reference-indicator"');
    expect(markup.match(/data-slot="status"/g)).toHaveLength(1);
  });
});
