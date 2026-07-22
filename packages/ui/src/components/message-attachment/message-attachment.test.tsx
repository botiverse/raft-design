import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";

import {
  MessageAttachmentAction,
  MessageAttachmentCard,
  MessageAttachmentFrame,
} from "./message-attachment";

describe("message attachment frame", () => {
  it("keeps primary and secondary actions as sibling buttons", () => {
    const markup = renderToStaticMarkup(
      <MessageAttachmentFrame>
        <MessageAttachmentCard render={<button type="button" />}>Preview</MessageAttachmentCard>
        <MessageAttachmentAction>Download</MessageAttachmentAction>
      </MessageAttachmentFrame>,
    );

    expect(markup.match(/<button\b/g)).toHaveLength(2);
    expect(markup).toMatch(/<button\b[^>]*>Preview<\/button><button\b[^>]*>Download<\/button>/);
  });
});
