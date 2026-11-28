/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";

import { MessageEmbed } from "./message-embed";
import { messageCard, messageEmbed } from "./message-embed.recipe";

afterEach(cleanup);

// #proj-raft-ui:#177 (stdrc): an Artifact card, which opens as a whole, didn't
// react to the pointer while a file card did. A card that opens something
// hovers with the subtle tier and presses with the medium tier; a card that
// only shows content (an action card, a forwarded bundle) doesn't.
describe("MessageEmbed interactive", () => {
  it("marks a card that opens something, and only that card", () => {
    render(
      <>
        <MessageEmbed interactive data-testid="opens">
          Artifact
        </MessageEmbed>
        <MessageEmbed data-testid="shows">Link preview</MessageEmbed>
      </>,
    );
    expect(screen.getByTestId("opens").getAttribute("data-interactive")).toBe("true");
    expect(screen.getByTestId("shows").hasAttribute("data-interactive")).toBe(false);
  });

  it("hovers and presses like a file card only when interactive", () => {
    const root = messageEmbed().root();
    expect(root).toContain("data-[interactive=true]:hover:overlay-subtle");
    expect(root).toContain("data-[interactive=true]:active:overlay-medium");
    expect(root).not.toMatch(/(^|\s)hover:overlay-subtle/);
  });
});

// #proj-mobile:#440 (artin, sindresorhus): a card with a preview puts its
// details (author · time · comments) in one small line at its foot.
describe("messageCard metaLine", () => {
  it("is one small, muted line that never wraps", () => {
    const line = messageCard().metaLine();
    expect(line).toContain("whitespace-nowrap");
    expect(line).toContain("text-caption");
    expect(line).toContain("text-foreground-muted");
    expect(line).not.toContain("flex-wrap");
  });
});
