import { describe, expect, it } from "vite-plus/test";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  MessageCodeBlock,
  MessageInlineCode,
  MessageMarkdown,
  MessageMarkdownTableScroll,
} from "./message-markdown";
import { renderToStaticMarkup } from "react-dom/server";

describe("MessageMarkdown", () => {
  it("styles pre-parsed Markdown structure without owning parsing", () => {
    const markup = renderToStaticMarkup(
      <ThemeProvider theme="elegant" syncDom={false}>
        <MessageMarkdown>
          <p>
            Inline <MessageInlineCode>code</MessageInlineCode>
          </p>
          <MessageMarkdownTableScroll>
            <table>
              <tbody>
                <tr>
                  <td>Cell</td>
                </tr>
              </tbody>
            </table>
          </MessageMarkdownTableScroll>
          <MessageCodeBlock>
            <code>const theme = "elegant";</code>
          </MessageCodeBlock>
        </MessageMarkdown>
      </ThemeProvider>,
    );

    expect(markup).toContain('data-slot="message-markdown"');
    expect(markup).toContain('data-slot="inline-code"');
    expect(markup).toContain('data-slot="message-markdown-table-scroll"');
    expect(markup).toContain('data-slot="message-code-block"');
  });
});
