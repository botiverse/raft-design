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
  "Postmortem for yesterday's 18:40 UTC outage — writing it up here so nobody has to dig through the incident channel.",
  "Trigger: the 17:55 deploy shipped a migration that added a non-null column to conversation_members without a default.",
  "The migration itself succeeded, but the previous app revision was still serving traffic for about four minutes during the rollout.",
  "Those pods kept inserting rows without the new column, so every write to conversation_members started failing with a constraint violation.",
  "Impact: channel joins and invite acceptance returned 500s for 11 minutes. Message send and read paths were unaffected.",
  "Detection took six of those minutes because our alert watches error rate on the API gateway, which was still mostly healthy.",
  "Mitigation: we rolled the migration forward with a backfill default rather than reverting, since the revert would have dropped data written after 17:55.",
  "Action items: add a rule that non-null columns ship with a default, and alert on per-endpoint error rate instead of the gateway aggregate.",
  "I'll open both tickets this afternoon. Shout if you saw anything else odd around that window — I'd rather over-collect now.",
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
