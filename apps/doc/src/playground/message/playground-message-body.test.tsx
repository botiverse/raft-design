import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "raft-ui";
import { PlaygroundMessageBody } from "./playground-message-body.tsx";
import type { PlaygroundActorId, PlaygroundMentionReadState } from "../mock/index.ts";

function renderMessageBody(
  content: string,
  {
    mentionReadStates,
    searchQuery,
  }: {
    mentionReadStates?: Readonly<Partial<Record<PlaygroundActorId, PlaygroundMentionReadState>>>;
    searchQuery?: string;
  } = {},
) {
  return renderToStaticMarkup(
    <ThemeProvider theme="elegant" syncDom={false}>
      <PlaygroundMessageBody
        content={content}
        mentionReadStates={mentionReadStates}
        searchQuery={searchQuery}
      />
    </ThemeProvider>,
  );
}

describe("PlaygroundMessageBody", () => {
  it("highlights every case-insensitive inline-code match without marking fenced code", () => {
    const markup = renderMessageBody(
      "Run `Release release`.\n\n```txt\nRelease\n```\n\n```\nrelease\n```",
      { searchQuery: " RELEASE " },
    );

    expect(markup.match(/data-slot="message-item-search-match"/g)).toHaveLength(2);
    expect(markup.match(/data-slot="inline-code"/g)).toHaveLength(1);
    expect(markup.match(/data-slot="code-block"/g)).toHaveLength(2);
  });

  it("renders explicit agent read states and leaves unknown or human mentions unmarked", () => {
    const readMarkup = renderMessageBody("@Atlas", {
      mentionReadStates: { atlas: "read" },
    });
    const unreadMarkup = renderMessageBody("@Atlas", {
      mentionReadStates: { atlas: "unread" },
    });
    const unknownMarkup = renderMessageBody("@Atlas");
    const humanMarkup = renderMessageBody("@Samira", {
      mentionReadStates: { samira: "read" },
    });

    expect(readMarkup.match(/data-slot="message-reference-indicator"/g)).toHaveLength(1);
    expect(readMarkup).toContain('aria-label="Read"');
    expect(readMarkup).toContain('title="Read"');
    expect(readMarkup).toContain('data-variant="success"');

    expect(unreadMarkup.match(/data-slot="message-reference-indicator"/g)).toHaveLength(1);
    expect(unreadMarkup).toContain('aria-label="Not read yet"');
    expect(unreadMarkup).toContain('title="Not read yet"');
    expect(unreadMarkup).toContain('data-variant="default"');

    expect(unknownMarkup).not.toContain('data-slot="message-reference-indicator"');
    expect(humanMarkup).not.toContain('data-slot="message-reference-indicator"');
  });

  it("renders channel and thread references with the current compound parts", () => {
    const markup = renderMessageBody("See #v2-4-release-control and #v2-4-release-control:reply.");

    expect(markup.match(/data-slot="message-reference-badge"/g)).toHaveLength(2);
    expect(markup.match(/data-slot="message-reference-label"/g)).toHaveLength(2);
    expect(markup).toContain(">channel</span>");
    expect(markup).toContain(">thread</span>");
  });
});
