/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";

import { MessageEmbed } from "./message-embed";
import { messageEmbed } from "./message-embed.recipe";

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
