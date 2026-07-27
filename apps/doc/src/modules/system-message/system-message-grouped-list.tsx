import { useMemo, useState } from "react";
import {
  SystemMessage,
  SystemMessageContent,
  SystemMessageGroup,
  SystemMessageGroupChevron,
  SystemMessageGroupDisclosure,
  SystemMessageGroupHeader,
  SystemMessageGroupPanel,
  SystemMessageGroupSummary,
  SystemMessageTime,
} from "raft-ui/wip";

import type { SystemMessageSlice } from "./system-message.fixtures.ts";
import { buildSystemMessageRenderStates } from "./system-message-grouping.ts";

export function SystemMessageGroupedList({
  messages,
}: {
  messages: readonly SystemMessageSlice[];
}) {
  const states = useMemo(() => buildSystemMessageRenderStates(messages), [messages]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set());

  return (
    <div className="w-full max-w-3xl">
      {messages.map((message, index) => {
        const state = states[index];
        if (state?.kind === "hide") return null;

        if (state?.kind === "summary") {
          const open = expandedGroups.has(state.groupId);
          return (
            <SystemMessageGroup
              key={state.groupId}
              open={open}
              onOpenChange={(nextOpen) => {
                setExpandedGroups((current) => {
                  const next = new Set(current);
                  if (nextOpen) next.add(state.groupId);
                  else next.delete(state.groupId);
                  return next;
                });
              }}
            >
              <SystemMessageGroupHeader>
                <SystemMessageGroupDisclosure>
                  <SystemMessageGroupSummary>{state.content}</SystemMessageGroupSummary>
                  <SystemMessageGroupChevron />
                </SystemMessageGroupDisclosure>
              </SystemMessageGroupHeader>
              <SystemMessageGroupPanel>
                {state.messageIndexes.map((messageIndex) => {
                  const grouped = messages[messageIndex];
                  if (!grouped) return null;
                  return (
                    <SystemMessage key={grouped.id}>
                      <SystemMessageTime>
                        {messageIndex === 0
                          ? "2:18 PM"
                          : messageIndex === 1
                            ? "2:19 PM"
                            : "2:20 PM"}
                      </SystemMessageTime>
                      <SystemMessageContent>{grouped.content}</SystemMessageContent>
                    </SystemMessage>
                  );
                })}
              </SystemMessageGroupPanel>
            </SystemMessageGroup>
          );
        }

        return (
          <SystemMessage key={message.id}>
            <SystemMessageTime>2:18 PM</SystemMessageTime>
            <SystemMessageContent>{message.content}</SystemMessageContent>
          </SystemMessage>
        );
      })}
    </div>
  );
}
