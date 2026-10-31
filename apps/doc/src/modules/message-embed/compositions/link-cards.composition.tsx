import { ArrowUpRight } from "lucide-react";
import {
  MessageEmbed,
  MessageEmbedContent,
  MessageEmbedFooter,
  MessageEmbedHeader,
  PanelAction,
} from "@botiverse/raft-ui";
import { MESSAGE_FIXTURE_IMAGE_SRC } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageEmbedLinkCardsComposition() {
  return (
    <div className="grid w-full max-w-[440px] gap-3">
      {/* Opens as a whole: the title link's ::after covers the card, so the card is interactive. */}
      <MessageEmbed interactive className="relative">
        <MessageEmbedContent>
          <img
            src={MESSAGE_FIXTURE_IMAGE_SRC}
            alt=""
            className="block aspect-16/10 max-h-48 w-full border-b border-line-hairline object-cover object-top"
          />
        </MessageEmbedContent>
        <MessageEmbedHeader className="flex min-w-0 items-start gap-2">
          <div className="grid min-w-0 flex-1 gap-0.5">
            <a
              href="#launch-plan"
              className="line-clamp-2 min-w-0 text-subhead font-bold text-foreground no-underline outline-none after:absolute after:inset-0 after:rounded-container focus-visible:after:shadow-focus"
            >
              Launch plan for the October release
            </a>
            <p className="truncate text-footnote text-foreground-muted">Document · 6 sections</p>
          </div>
          <PanelAction
            className="relative z-10 -mt-1 -mr-1"
            nativeButton={false}
            render={
              <a
                href="#launch-plan"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open in New Page"
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

      {/* Shows content only, such as a link preview: not interactive, so it doesn't hover. */}
      <MessageEmbed>
        <MessageEmbedHeader className="grid min-w-0 gap-0.5">
          <span className="truncate text-subhead font-bold text-foreground">
            Design review notes
          </span>
          <span className="truncate text-footnote text-foreground-muted">
            raft.build · 4 min read
          </span>
        </MessageEmbedHeader>
      </MessageEmbed>
    </div>
  );
}
