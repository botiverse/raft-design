import { useState } from "react";
import {
  MessageItem,
  MessageItemBody,
  MessageItemCollapsibleContent,
  MessageItemCollapsibleContentPanel,
  MessageItemCollapsibleContentTrigger,
  MessageItemContent,
} from "raft-ui/wip";

const PARAGRAPHS = [
  "A long message stays readable without pushing every later message out of view.",
  "The collapse boundary is a layout concern, so the row measures rendered content instead of guessing from character count.",
  "This composition controls expanded state to show the generic coordination seam; production decides whether a message is eligible.",
  "The trigger remains plain consumer content, which keeps localization and product wording outside the UI package.",
  "Keyboard focus that reaches clipped content expands the panel before the focused element becomes inaccessible.",
  "Message content can include paragraphs, code, links, or attachments without changing the collapse behavior contract.",
  "The same primitive can therefore be used by a timeline, an inbox, or another content surface with its own policy.",
  "Only the visual measurement, clipping, fade, and expanded state live here.",
  "This final paragraph deliberately makes the rendered example taller than the source-compatible threshold.",
] as const;

export function MessageCollapsibleContentComposition() {
  const [expanded, setExpanded] = useState(false);

  return (
    <MessageItem>
      <MessageItemContent>
        <MessageItemCollapsibleContent expanded={expanded} onExpandedChange={setExpanded}>
          <MessageItemCollapsibleContentPanel>
            <MessageItemBody>
              <div className="space-y-3">
                {PARAGRAPHS.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </MessageItemBody>
          </MessageItemCollapsibleContentPanel>
          <MessageItemCollapsibleContentTrigger>
            {({ expanded: isExpanded }) => (isExpanded ? "Collapse" : "Show more")}
          </MessageItemCollapsibleContentTrigger>
        </MessageItemCollapsibleContent>
      </MessageItemContent>
    </MessageItem>
  );
}
