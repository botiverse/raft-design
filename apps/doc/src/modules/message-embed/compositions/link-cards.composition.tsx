import { ArrowUpRight } from "lucide-react";
import {
  MessageEmbed,
  MessageEmbedContent,
  MessageEmbedFooter,
  MessageEmbedHeader,
  PanelAction,
  messageCard,
} from "@botiverse/raft-ui";
import { MESSAGE_FIXTURE_IMAGE_SRC } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageEmbedLinkCardsComposition() {
  const { title, heading, meta } = messageCard();
  return (
    <div className="grid w-full gap-3">
      {/* Opens one thing, so it is an item card. Opens as a whole: the title link's ::after covers the card, so the card is interactive. */}
      <MessageEmbed size="item" interactive className="relative">
        <MessageEmbedContent>
          <img
            src={MESSAGE_FIXTURE_IMAGE_SRC}
            alt=""
            className="block aspect-16/10 max-h-48 w-full border-b border-line-hairline object-cover object-top"
          />
        </MessageEmbedContent>
        <MessageEmbedHeader className="flex min-w-0 items-start gap-2">
          <div className="grid min-w-0 flex-1 gap-0.5">
            <p className={title()}>
              <a
                href="#launch-plan"
                className="no-underline after:absolute after:inset-0 after:rounded-container focus-visible:after:shadow-focus"
              >
                Launch plan for the October release
              </a>
            </p>
            <p className={meta()}>Document · 6 sections</p>
          </div>
          <PanelAction
            className="relative z-10 -mt-1 -mr-1"
            nativeButton={false}
            render={
              <a
                href="#launch-plan"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open in new page"
              />
            }
          >
            <ArrowUpRight aria-hidden />
          </PanelAction>
        </MessageEmbedHeader>
        <MessageEmbedFooter className="font-mono text-mono-meta text-foreground-hint">
          Updated 2 hours ago
        </MessageEmbedFooter>
      </MessageEmbed>

      {/* Shows content only, such as a forwarded bundle: a content card. It opens nothing as a whole, so it doesn't hover. */}
      <MessageEmbed size="content">
        <MessageEmbedHeader className="grid min-w-0 gap-0.5">
          <span className={heading({ className: "truncate" })}>Forwarded from #design-review</span>
          <span className={meta()}>3 messages</span>
        </MessageEmbedHeader>
      </MessageEmbed>
    </div>
  );
}
