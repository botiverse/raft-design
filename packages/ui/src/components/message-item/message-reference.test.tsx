import { describe, expect, it } from "vite-plus/test";
import { renderToStaticMarkup } from "react-dom/server";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  MessageReferenceChip,
  MessageReferencePending,
  MessageReferenceText,
  MessageReferenceUnavailable,
} from "./message-reference";

describe("MessageReference primitives", () => {
  it("keeps text, chips, and resolved-state fallbacks as explicit parts", () => {
    const markup = renderToStaticMarkup(
      <ThemeProvider theme="elegant" syncDom={false}>
        <MessageReferenceText>@will</MessageReferenceText>
        <MessageReferenceChip tone="primary">@you</MessageReferenceChip>
        <MessageReferencePending>Loading task</MessageReferencePending>
        <MessageReferenceUnavailable>Unavailable task</MessageReferenceUnavailable>
      </ThemeProvider>,
    );

    expect(markup.match(/data-slot="message-reference"/g)).toHaveLength(4);
  });
});
